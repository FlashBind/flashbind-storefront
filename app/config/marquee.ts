/**
 * Header marquee ("trust bar") text.
 *
 * Only ACTIVE_MARQUEE_ITEMS is displayed. While it is empty, the bar is not
 * rendered at all. Every item must be a claim FlashBind can prove today.
 */
export const ACTIVE_MARQUEE_ITEMS: readonly string[] = [];

/**
 * Previous marquee text, kept for reference only and never displayed.
 * Archived 2026-09-25 because these claims could not be verified.
 */
export const ARCHIVED_MARQUEE_ITEMS: readonly string[] = [
  '500+ businesses powered',
  'Trusted across the EU',
  'Custom branding on every order',
  'Same-day dispatch',
  'Enterprise-grade NFC chips',
];
