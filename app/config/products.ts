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

/** Card text for a product: our checked blurb, else a neutral fallback. */
export function productBlurb(handle: string | null | undefined): string {
  return (handle && PRODUCT_INFO[handle]?.blurb) || 'View product details for more information.';
}
