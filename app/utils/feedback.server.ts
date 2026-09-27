/**
 * Google Review "Dual Choice" page and private feedback inbox (SUB-001).
 *
 * Google policy (no review gating): the Dual Choice page always shows both
 * options, equally, with no question or rating before them. Nothing here
 * decides which option a visitor sees.
 *
 * Multi-branch businesses: one FlashBind account owns one review stand per
 * branch. Each stand has its own Google review link, location label, alert
 * email and Dual Choice switch (in tags.settings). The business name and logo
 * are account-level (business_entitlements).
 */
import {escapeHtml} from '~/utils/email.server';
import {getFormText, hashRateLimitIdentifier, normalizeEmail, normalizeTrustedClientIp} from '~/utils/requestSecurity.server';

export const FEEDBACK_MESSAGE_MAX = 2000;
export const LOCATION_LABEL_MAX = 80;
export const BUSINESS_NAME_MAX = 120;
/** Daily email alerts per stand; feedback beyond this is still saved. */
export const DAILY_ALERT_CAP = 20;
/** Feedback accepted per stand per hour, from all visitors together. */
export const TAG_HOURLY_LIMIT = 30;
/** Feedback accepted per visitor IP per stand, per 10 minutes. */
export const IP_WINDOW_LIMIT = 3;
export const IP_WINDOW_MINUTES = 10;
export const LOGO_MAX_CHARS = 700_000;
/** Links in alert emails always point at the live site, never at a request's Host header. */
export const SITE_ORIGIN = 'https://flashbind.com';

export type ReviewStandSettings = {
  locationLabel: string;
  alertEmail: string;
  dualChoiceEnabled: boolean;
};

/** Owner-side settings of a review stand, from the raw tags.settings JSON. */
export function reviewStandSettings(settings: unknown): ReviewStandSettings {
  const raw = (typeof settings === 'object' && settings !== null && !Array.isArray(settings)
    ? settings
    : {}) as Record<string, unknown>;
  return {
    locationLabel: typeof raw.location_label === 'string' ? raw.location_label.slice(0, LOCATION_LABEL_MAX) : '',
    alertEmail: normalizeEmail(raw.alert_email) ?? '',
    dualChoiceEnabled: raw.dual_choice_enabled === true,
  };
}

export type Entitlement = {
  status: string;
  current_period_end: string | null;
};

export function isEntitlementActive(row: Entitlement | null | undefined, now: Date = new Date()): boolean {
  if (!row || row.status !== 'active') return false;
  if (!row.current_period_end) return true;
  const end = new Date(row.current_period_end);
  return !Number.isNaN(end.getTime()) && end.getTime() > now.getTime();
}

export async function getEntitlement(admin: any, ownerEmail: string) {
  const {data, error} = await admin
    .from('business_entitlements')
    .select('owner_email, plan, status, source, current_period_end, business_name, logo_data_url')
    .eq('owner_email', ownerEmail)
    .maybeSingle();
  if (error) {
    console.error('[FEEDBACK] entitlement lookup failed', error.code || 'unknown');
    return null;
  }
  return data as
    | (Entitlement & {owner_email: string; plan: string; source: string; business_name: string | null; logo_data_url: string | null})
    | null;
}

/** What the public Dual Choice page may show. Never includes emails. */
export type DualChoiceView = {
  businessName: string;
  logo: string | null;
  locationLabel: string;
};

/**
 * Returns the Dual Choice view for a claimed google_review tag, or null when
 * the stand should keep redirecting straight to Google (no subscription, the
 * switch is off for this stand, or there's no valid Google link).
 */
export async function getDualChoiceView(
  admin: any,
  tag: {owner_email: string | null; settings: unknown},
  googleUrl: string | null,
): Promise<DualChoiceView | null> {
  if (!tag.owner_email || !googleUrl) return null;
  const stand = reviewStandSettings(tag.settings);
  if (!stand.dualChoiceEnabled) return null;
  const entitlement = await getEntitlement(admin, tag.owner_email);
  if (!isEntitlementActive(entitlement)) return null;
  return {
    businessName: entitlement?.business_name ?? '',
    logo: entitlement?.logo_data_url ?? null,
    locationLabel: stand.locationLabel,
  };
}

export type ParsedFeedback = {
  message: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactConsent: boolean;
};

/** Validates the public feedback form. Contact details need the consent tick. */
export function parseFeedbackForm(formData: FormData): {value: ParsedFeedback} | {error: string} {
  const rawMessage = formData.get('message');
  const message = typeof rawMessage === 'string' ? rawMessage.trim() : '';
  if (!message) return {error: 'Please write a message.'};
  if (message.length > FEEDBACK_MESSAGE_MAX) {
    return {error: `Please keep your message under ${FEEDBACK_MESSAGE_MAX.toLocaleString('en')} characters.`};
  }

  const contactName = getFormText(formData, 'contact_name', 100);
  const rawEmail = formData.get('contact_email');
  const hasEmail = typeof rawEmail === 'string' && rawEmail.trim() !== '';
  const contactEmail = hasEmail ? normalizeEmail(rawEmail) : null;
  if (hasEmail && !contactEmail) return {error: 'Please check the email address, or leave it empty.'};
  const contactPhone = getFormText(formData, 'contact_phone', 40);
  if (contactPhone && !/^[+\d][\d\s().-]{4,39}$/.test(contactPhone)) {
    return {error: 'Please check the phone number, or leave it empty.'};
  }

  const hasContact = Boolean(contactName || contactEmail || contactPhone);
  const contactConsent = formData.get('contact_consent') === 'yes';
  if (hasContact && !contactConsent) {
    return {error: 'To leave contact details, tick the box so the business may contact you. Or leave them empty.'};
  }

  return {
    value: {
      message,
      contactName: contactConsent ? contactName : null,
      contactEmail: contactConsent ? contactEmail : null,
      contactPhone: contactConsent ? contactPhone : null,
      contactConsent: hasContact && contactConsent,
    },
  };
}

/** A filled hidden field means a bot. */
export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get('website');
  return typeof value === 'string' && value.trim() !== '';
}

/** Rate-limit bucket for a visitor IP, stored hashed (never the raw IP). */
export async function feedbackIpBucket(headers: Pick<Headers, 'get'>): Promise<string | null> {
  const ip = normalizeTrustedClientIp(headers.get('cf-connecting-ip'));
  if (!ip) return null;
  return `fb:${(await hashRateLimitIdentifier(ip)).slice(0, 40)}`;
}

/**
 * Returns true when this submission may go ahead, and records it against the
 * visitor's IP bucket. Fails open on database errors (a lost feedback message
 * is worse than a rare extra one); the per-stand hourly cap still applies.
 */
export async function checkFeedbackRateLimit(admin: any, tagId: string, ipBucket: string | null): Promise<boolean> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const {count, error: countError} = await admin
    .from('private_feedback')
    .select('id', {count: 'exact', head: true})
    .eq('tag_id', tagId)
    .gte('created_at', hourAgo);
  if (!countError && (count ?? 0) >= TAG_HOURLY_LIMIT) return false;

  if (!ipBucket) return true;
  const {data: row} = await admin
    .from('rate_limits')
    .select('id, attempts, last_attempt_at')
    .eq('tag_id', tagId)
    .eq('ip_address', ipBucket)
    .maybeSingle();
  const windowStart = Date.now() - IP_WINDOW_MINUTES * 60 * 1000;
  const inWindow = row && new Date(row.last_attempt_at).getTime() > windowStart;
  if (inWindow && row.attempts >= IP_WINDOW_LIMIT) return false;

  const attempts = inWindow ? row.attempts + 1 : 1;
  if (row) {
    await admin.from('rate_limits').update({attempts, last_attempt_at: new Date().toISOString()}).eq('id', row.id);
  } else {
    await admin.from('rate_limits').insert({tag_id: tagId, ip_address: ipBucket, attempts});
  }
  return true;
}

export async function recordReviewStandEvent(admin: any, tagId: string, event: 'view' | 'google' | 'feedback') {
  try {
    const {error} = await admin.rpc('record_review_stand_event', {p_tag_id: tagId, p_event: event});
    if (error) console.error('[FEEDBACK] stats update failed', error.code || 'unknown');
  } catch {
    console.error('[FEEDBACK] stats update failed');
  }
}

export function buildFeedbackAlertHtml({
  locationLabel,
  businessName,
  feedback,
  inboxUrl,
}: {
  locationLabel: string;
  businessName: string;
  feedback: ParsedFeedback;
  inboxUrl: string;
}): string {
  const where = locationLabel || businessName || 'your review stand';
  let html = `<h2>New private feedback at ${escapeHtml(where)}</h2>`;
  html += `<p style="white-space:pre-wrap">${escapeHtml(feedback.message).replace(/\n/g, '<br/>')}</p>`;
  if (feedback.contactConsent) {
    html += '<p><strong>The customer agreed to be contacted:</strong><br/>';
    if (feedback.contactName) html += `${escapeHtml(feedback.contactName)}<br/>`;
    if (feedback.contactEmail) html += `${escapeHtml(feedback.contactEmail)}<br/>`;
    if (feedback.contactPhone) html += `${escapeHtml(feedback.contactPhone)}<br/>`;
    html += '</p>';
  }
  html += `<p><a href="${escapeHtml(inboxUrl)}">Open your feedback inbox</a></p>`;
  html += '<p style="color:#64748b;font-size:12px">Sent by FlashBind because this address is set to receive alerts for this stand.</p>';
  return html;
}

/**
 * Emails the stand's alert address (or the owner) about new feedback, at most
 * DAILY_ALERT_CAP times per stand per day. Never throws.
 */
export async function sendFeedbackAlert({
  admin,
  env,
  feedbackId,
  tagId,
  to,
  locationLabel,
  businessName,
  feedback,
  origin,
}: {
  admin: any;
  env: Record<string, any>;
  feedbackId: string;
  tagId: string;
  to: string;
  locationLabel: string;
  businessName: string;
  feedback: ParsedFeedback;
  origin: string;
}): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey || !to) return;
  try {
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const {count} = await admin
      .from('private_feedback')
      .select('id', {count: 'exact', head: true})
      .eq('tag_id', tagId)
      .gte('alert_sent_at', dayStart.toISOString());
    if ((count ?? 0) >= DAILY_ALERT_CAP) return;

    const where = locationLabel || businessName || 'your review stand';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        from: 'FlashBind <info@flashbind.com>',
        to,
        ...(feedback.contactConsent && feedback.contactEmail ? {reply_to: feedback.contactEmail} : {}),
        subject: `New private feedback at ${where}`.slice(0, 150),
        html: buildFeedbackAlertHtml({
          locationLabel,
          businessName,
          feedback,
          inboxUrl: `${origin}/dashboard/feedback?stand=${encodeURIComponent(tagId)}`,
        }),
      }),
    });
    if (!response.ok) {
      console.error('[FEEDBACK] alert email failed', response.status);
      return;
    }
    await admin.from('private_feedback').update({alert_sent_at: new Date().toISOString()}).eq('id', feedbackId);
  } catch {
    console.error('[FEEDBACK] alert email failed');
  }
}

// ---- Owner inbox -----------------------------------------------------------

export type InboxView = 'inbox' | 'archived';

/** Lists feedback for one owner. Every query is filtered on owner_email. */
export async function listFeedback(
  admin: any,
  ownerEmail: string,
  {view = 'inbox', standId = null}: {view?: InboxView; standId?: string | null} = {},
) {
  let query = admin
    .from('private_feedback')
    .select('id, tag_id, location_label, message, contact_name, contact_email, contact_phone, contact_consent, read_at, archived_at, created_at')
    .eq('owner_email', ownerEmail)
    .order('created_at', {ascending: false})
    .limit(200);
  query = view === 'archived' ? query.not('archived_at', 'is', null) : query.is('archived_at', null);
  if (standId) query = query.eq('tag_id', standId);
  const {data, error} = await query;
  if (error) {
    console.error('[FEEDBACK] inbox load failed', error.code || 'unknown');
    return null;
  }
  return data as Array<{
    id: string;
    tag_id: string;
    location_label: string | null;
    message: string;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    contact_consent: boolean;
    read_at: string | null;
    archived_at: string | null;
    created_at: string;
  }>;
}

export type InboxOperation = 'read' | 'unread' | 'archive' | 'unarchive' | 'delete';
export const INBOX_OPERATIONS: InboxOperation[] = ['read', 'unread', 'archive', 'unarchive', 'delete'];

/**
 * Applies an inbox action to one message. Filters on both id and owner_email,
 * so an account can never change another account's feedback. Returns false
 * when nothing matched.
 */
export async function applyInboxOperation(
  admin: any,
  ownerEmail: string,
  feedbackId: string,
  operation: InboxOperation,
): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(feedbackId)) return false;
  const now = new Date().toISOString();
  const base =
    operation === 'delete'
      ? admin.from('private_feedback').delete()
      : admin.from('private_feedback').update(
          operation === 'read'
            ? {read_at: now}
            : operation === 'unread'
              ? {read_at: null}
              : operation === 'archive'
                ? {archived_at: now, read_at: now}
                : {archived_at: null},
        );
  const {data, error} = await base.eq('id', feedbackId).eq('owner_email', ownerEmail).select('id');
  if (error) {
    console.error('[FEEDBACK] inbox action failed', error.code || 'unknown');
    return false;
  }
  return Array.isArray(data) && data.length === 1;
}

/** Unread (not archived) feedback per stand for this owner. */
export async function unreadCountsByStand(admin: any, ownerEmail: string): Promise<Record<string, number>> {
  const {data, error} = await admin
    .from('private_feedback')
    .select('tag_id')
    .eq('owner_email', ownerEmail)
    .is('read_at', null)
    .is('archived_at', null)
    .limit(5000);
  if (error || !data) return {};
  const counts: Record<string, number> = {};
  for (const row of data as Array<{tag_id: string}>) counts[row.tag_id] = (counts[row.tag_id] ?? 0) + 1;
  return counts;
}

/** Last-30-day totals per stand, for the inbox's branch overview. */
export async function statsByStand(admin: any, tagIds: string[]) {
  if (!tagIds.length) return {} as Record<string, {views: number; google: number; feedback: number}>;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const {data, error} = await admin
    .from('review_stand_stats')
    .select('tag_id, page_views, google_clicks, feedback_count')
    .in('tag_id', tagIds)
    .gte('day', since);
  const totals: Record<string, {views: number; google: number; feedback: number}> = {};
  if (error || !data) return totals;
  for (const row of data as Array<{tag_id: string; page_views: number; google_clicks: number; feedback_count: number}>) {
    const t = (totals[row.tag_id] ??= {views: 0, google: 0, feedback: 0});
    t.views += row.page_views;
    t.google += row.google_clicks;
    t.feedback += row.feedback_count;
  }
  return totals;
}

/** Validates an uploaded logo (a data: URL made by resizeImageToDataUrl). */
export function parseLogo(value: unknown): {logo: string | null} | {error: string} | null {
  if (typeof value !== 'string' || value === '') return null; // unchanged
  if (value === 'remove') return {logo: null};
  if (!value.startsWith('data:image/jpeg;base64,') && !value.startsWith('data:image/png;base64,')) {
    return {error: 'The logo must be a JPEG or PNG image.'};
  }
  if (value.length > LOGO_MAX_CHARS) return {error: 'The logo is too large. Please choose a smaller image.'};
  return {logo: value};
}
