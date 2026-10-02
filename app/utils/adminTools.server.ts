/**
 * Admin tools for one-off review stands and sales demo pages.
 *
 * - createReviewStand: one unclaimed google_review tag with an activation PIN,
 *   for programming FlashBind's own NFC stickers on custom stands. The PIN is
 *   returned once, to the admin page, and is never logged.
 * - createDemoPage: a demo business account (an active entitlement on a
 *   synthetic email that can't receive mail or log in) owning one claimed
 *   review stand with Dual Choice on and alerts going to the admin.
 */
import {redirect} from 'react-router';
import {generateActivationPin} from '~/utils/tagAdmin.server';
import {BUSINESS_NAME_MAX, LOCATION_LABEL_MAX, parseLogo, SITE_ORIGIN} from '~/utils/feedback.server';
import {normalizeBrandColor} from '~/utils/brandColor';
import {getFormText, normalizeEmail, normalizeHttpUrl} from '~/utils/requestSecurity.server';

/** Demo subscriptions end on their own; extend them on /admin/entitlements. */
export const DEMO_DAYS = 30;
/** Reserved TLD: mail to it is never delivered anywhere. */
export const DEMO_EMAIL_DOMAIN = 'demo.flashbind.invalid';

/** Returns the admin's email, or throws a login redirect / 403. */
export function requireAdminEmail(context: {session: {get(key: string): any}; env: unknown}, path: string): string {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) throw redirect(`/login?redirectTo=${path}`);
  const adminEmail = (context.env as any).ADMIN_EMAIL;
  if (!adminEmail || userEmail !== adminEmail) {
    throw new Response('Not authorized', {status: 403});
  }
  return adminEmail as string;
}

export function standUrl(tagId: string) {
  return `${SITE_ORIGIN}/p/${tagId}`;
}

export type CreatedStand = {tagId: string; url: string; pin: string};

export async function createReviewStand(admin: any): Promise<CreatedStand | {error: string}> {
  const tagId = crypto.randomUUID();
  const pin = generateActivationPin();
  const {error} = await admin.from('tags').insert({
    id: tagId,
    type: 'google_review',
    is_claimed: false,
    owner_email: null,
    settings: {activation_pin: pin},
  });
  if (error) {
    console.error('[ADMIN] review stand insert failed', error.code || 'unknown');
    return {error: 'Could not create the review stand. Please try again.'};
  }
  return {tagId, url: standUrl(tagId), pin};
}

export type DemoInput = {
  businessName: string;
  logo: string | null;
  locationLabel: string;
  brandColor: string | null;
  googleUrl: string;
};

export function parseDemoForm(formData: FormData): {value: DemoInput} | {error: string} {
  const rawName = formData.get('businessName');
  if (typeof rawName === 'string' && rawName.trim().length > BUSINESS_NAME_MAX) {
    return {error: `Please keep the business name under ${BUSINESS_NAME_MAX} characters.`};
  }
  const businessName = getFormText(formData, 'businessName', BUSINESS_NAME_MAX);
  if (!businessName) return {error: 'Enter the business name.'};

  const rawLabel = formData.get('locationLabel');
  if (typeof rawLabel === 'string' && rawLabel.trim().length > LOCATION_LABEL_MAX) {
    return {error: `Please keep the branch name under ${LOCATION_LABEL_MAX} characters.`};
  }
  const locationLabel = getFormText(formData, 'locationLabel', LOCATION_LABEL_MAX) ?? '';

  const rawColor = formData.get('brandColor');
  const hasColor = typeof rawColor === 'string' && rawColor.trim() !== '';
  const brandColor = hasColor ? normalizeBrandColor(rawColor) : null;
  if (hasColor && !brandColor) return {error: 'Enter the brand colour as #RRGGBB, or leave it empty.'};

  const logo = parseLogo(formData.get('logo'));
  if (logo && 'error' in logo) return {error: logo.error};

  const googleUrl = normalizeHttpUrl(formData.get('googleUrl'));
  if (!googleUrl) return {error: "Enter the Google review link (the demo's Google button opens it)."};

  return {value: {businessName, logo: logo?.logo ?? null, locationLabel, brandColor, googleUrl}};
}

export function demoOwnerEmail(): string {
  return `demo-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}@${DEMO_EMAIL_DOMAIN}`;
}

export type CreatedDemo = {tagId: string; url: string; ownerEmail: string; activeUntil: string};

export async function createDemoPage(
  admin: any,
  input: DemoInput,
  alertEmail: string,
  now: Date = new Date(),
): Promise<CreatedDemo | {error: string}> {
  const alertTo = normalizeEmail(alertEmail);
  if (!alertTo) return {error: 'ADMIN_EMAIL is not a valid email address.'};

  const ownerEmail = demoOwnerEmail();
  const activeUntil = new Date(now.getTime() + DEMO_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const {error: entitlementError} = await admin.from('business_entitlements').insert({
    owner_email: ownerEmail,
    plan: 'growth',
    status: 'active',
    source: 'manual',
    current_period_end: activeUntil,
    business_name: input.businessName,
    logo_data_url: input.logo,
    brand_color: input.brandColor,
    notes: 'Demo page (created on /admin/demo-page)',
  });
  if (entitlementError) {
    console.error('[ADMIN] demo entitlement insert failed', entitlementError.code || 'unknown');
    return {error: 'Could not create the demo account. Please try again.'};
  }

  const tagId = crypto.randomUUID();
  const {error: tagError} = await admin.from('tags').insert({
    id: tagId,
    type: 'google_review',
    is_claimed: true,
    owner_email: ownerEmail,
    settings: {
      destination_url: input.googleUrl,
      location_label: input.locationLabel,
      alert_email: alertTo,
      dual_choice_enabled: true,
    },
  });
  if (tagError) {
    console.error('[ADMIN] demo stand insert failed', tagError.code || 'unknown');
    // Don't leave an account without its stand behind.
    await admin.from('business_entitlements').delete().eq('owner_email', ownerEmail);
    return {error: 'Could not create the demo stand. Please try again.'};
  }

  return {tagId, url: standUrl(tagId), ownerEmail, activeUntil};
}
