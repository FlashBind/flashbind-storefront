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
    title: 'Google Review Stand | NFC, Tap to Leave a Review | FlashBind',
    description:
      'NFC Google Review Stand for your counter. Customers tap it with their phone and your Google review page opens. No app needed, and you can change the link anytime.',
  },
  // "NFC menu stand"
  'nfc-restaurant-menu-stand': {
    title: 'Digital Menu Stand | NFC Menu for Restaurants | FlashBind',
    description:
      'Digital Menu Stand with NFC and a QR code for your tables. Guests tap or scan to open your digital menu, no app needed. Update the menu link anytime without reprinting.',
  },
  // "NFC Wi-Fi sign"
  'guest-wi-fi-hub': {
    title: 'Guest Wi-Fi Stand | NFC Wi-Fi Sign for Guests | FlashBind',
    description:
      'Guest Wi-Fi Stand with NFC and a QR code for cafés, hotels and rentals. Guests tap or scan to see your network name and copy the password.',
  },
  // "NFC pet tag"
  'smart-pet-collar-tag': {
    title: 'Smart Pet Tag | NFC Tag to Contact the Owner | FlashBind',
    description:
      'Smart Pet Tag with NFC, in black or white. Anyone who finds your pet can tap it with a phone to see your contact details. No app, battery or subscription.',
  },
};
