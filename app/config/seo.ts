/**
 * Search titles and descriptions for the product pages, keyed by Shopify
 * product handle. Each targets one search phrase. SEO fields filled in
 * Shopify admin take priority over these.
 *
 * Keep titles under ~60 characters and descriptions under ~155, and only
 * state what the product really does.
 */
export const PRODUCT_SEO: Record<string, {title: string; description: string}> = {
  // "NFC Google review stand"
  'google-review-stand': {
    title: 'NFC Google Review Stand | Tap to Leave a Review | FlashBind',
    description:
      'NFC Google review stand for your counter. Customers tap it with their phone and your Google review page opens. No app needed, and you can change the link anytime.',
  },
  // "NFC menu stand"
  'nfc-restaurant-menu-stand': {
    title: 'NFC Menu Stand for Restaurants and Cafés | FlashBind',
    description:
      'NFC menu stand with a QR code for your tables. Guests tap or scan to open your digital menu, no app needed. Update the menu link anytime without reprinting.',
  },
  // "NFC Wi-Fi sign"
  'guest-wi-fi-hub': {
    title: 'NFC Wi-Fi Sign for Guests | Tap or Scan | FlashBind',
    description:
      'NFC Wi-Fi sign with a QR code for cafés, hotels and rentals. Guests tap or scan to get your network details without you spelling out the password.',
  },
  // "NFC pet tag"
  'smart-pet-collar-tag': {
    title: 'NFC Pet Tag | Tap to Contact the Owner | FlashBind',
    description:
      'NFC pet ID tag in black or white. Anyone who finds your pet can tap it with a phone to see your contact details. No app, battery or subscription.',
  },
};
