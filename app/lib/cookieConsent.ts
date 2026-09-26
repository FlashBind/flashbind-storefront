import type {CustomerPrivacy} from '@shopify/hydrogen';

/**
 * The visitor's cookie choice from our banner, and how it is passed on to
 * Shopify's Customer Privacy API (COOKIE-001). "all" allows analytics,
 * marketing, preferences and sale-of-data cookies; "essential_only" refuses
 * them. With no choice yet, only essential cookies are used.
 */
export const CONSENT_STORAGE_KEY = 'flashbind_cookie_consent';

export type StoredConsent = 'all' | 'essential_only' | null;

function customerPrivacy(): CustomerPrivacy | null {
  if (typeof window === 'undefined') return null;
  const shopify = (window as unknown as {Shopify?: {customerPrivacy?: CustomerPrivacy}}).Shopify;
  return shopify?.customerPrivacy ?? null;
}

export function readStoredConsent(): StoredConsent {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'all' || value === 'essential_only' ? value : null;
  } catch {
    return null;
  }
}

export function storeConsent(value: Exclude<StoredConsent, null>): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Storage blocked: the choice still applies to Shopify for this visit.
  }
}

/**
 * Tells Shopify the visitor's choice. The privacy API loads asynchronously,
 * so if it isn't there yet we retry briefly (up to ~10 s).
 */
export function applyShopifyConsent(allowed: boolean, attempt = 0): void {
  const api = customerPrivacy();
  if (!api) {
    if (attempt < 20) window.setTimeout(() => applyShopifyConsent(allowed, attempt + 1), 500);
    return;
  }
  api.setTrackingConsent(
    {analytics: allowed, marketing: allowed, preferences: allowed, sale_of_data: allowed},
    () => {},
  );
}

/**
 * On a later visit, re-send a stored choice if Shopify's own record of it
 * is missing or different (e.g. its consent cookie expired).
 */
export function syncStoredConsent(stored: Exclude<StoredConsent, null>, attempt = 0): void {
  const api = customerPrivacy();
  if (!api) {
    if (attempt < 20) window.setTimeout(() => syncStoredConsent(stored, attempt + 1), 500);
    return;
  }
  const allowed = stored === 'all';
  if (api.currentVisitorConsent().analytics !== allowed) applyShopifyConsent(allowed);
}

/**
 * Used as Hydrogen's `canTrack`: analytics only when the visitor accepted in
 * our banner AND Shopify has recorded that consent.
 */
export function canTrackWithConsent(): boolean {
  if (typeof window === 'undefined') return false;
  if (readStoredConsent() !== 'all') return false;
  return customerPrivacy()?.analyticsProcessingAllowed() ?? false;
}
