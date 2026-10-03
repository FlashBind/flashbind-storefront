/**
 * One name and one short card description per product, keyed by Shopify
 * handle. Use these names everywhere on the site (CLAIMS-003). Shopify's own
 * product titles should match; the card text is kept here so a product card
 * never shows an unchecked claim from a Shopify description.
 */
export const PRODUCT_INFO: Record<string, {name: string; blurb: string}> = {
  'google-review-stand': {
    name: 'Google Review Stand',
    blurb: 'Customers tap the stand and your Google review page opens. No app needed.',
  },
  'nfc-restaurant-menu-stand': {
    name: 'Digital Menu Stand',
    blurb: 'Guests tap or scan the stand to open your online menu. Change the link anytime.',
  },
  'guest-wi-fi-hub': {
    name: 'Guest Wi-Fi Stand',
    blurb: 'Guests tap or scan to see your network name and copy the password.',
  },
  'smart-pet-collar-tag': {
    name: 'Smart Pet Tag',
    blurb: 'Anyone who finds your pet can tap the tag to see how to reach you.',
  },
};

/**
 * Answer to the "Will it work with my phone?" FAQ on every product page,
 * confirmed by the owner. Size, material and box contents are still
 * unconfirmed, so they are left out.
 */
export const PHONE_COMPATIBILITY =
  'Yes. It works with iPhone XS and newer and most Android phones with NFC. The QR code works on any phone.';

/** Value of the quote form's product field for a custom-designed stand. */
export const CUSTOM_STAND_QUOTE = 'custom-stand';

/**
 * Products a quote can be requested for: every product, a custom-designed
 * stand with the business's own logo, and anything else. `/quote?product=`
 * takes one of these values and pre-selects it.
 */
export const QUOTE_OPTIONS: Array<{value: string; label: string}> = [
  ...Object.entries(PRODUCT_INFO).map(([handle, info]) => ({value: handle, label: info.name})),
  {value: CUSTOM_STAND_QUOTE, label: 'Custom-designed stand with your logo'},
  {value: 'other', label: 'Something else or a bulk order'},
];

/** The quote option's label, or null when the value isn't one of them. */
export function quoteOptionLabel(value: unknown): string | null {
  return QUOTE_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

/** Link to the quote form with a product pre-selected. */
export function quoteUrl(product: string): string {
  return `/quote?product=${encodeURIComponent(product)}`;
}

/** Card text for a product: our checked blurb, else a neutral fallback. */
export function productBlurb(handle: string | null | undefined): string {
  return (handle && PRODUCT_INFO[handle]?.blurb) || 'View product details for more information.';
}
