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

/** FlashBind in one sentence: About page, footer and Organization data. */
export const SITE_INTRO =
  'FlashBind makes NFC stands and tags that help businesses get more Google reviews, share Wi-Fi and show menus, and help pet owners get a lost pet home, with one tap.';

/**
 * Search title and description for the site's own pages (not Shopify
 * products). Same rules as above: one page, one topic, only true claims.
 */
export const PAGE_SEO = {
  about: {
    title: 'FlashBind | About',
    description:
      'FlashBind makes NFC stands and tags for businesses and pet owners. One tap of a phone is all it takes.',
  },
  business: {
    title: 'FlashBind | For Business',
    description:
      'NFC stands for cafés, restaurants, salons and shops: Google Review Stand, Digital Menu Stand and Guest Wi-Fi Stand. Custom-branded stands on request.',
  },
  services: {
    title: 'FlashBind | Services',
    description:
      'Custom-branded NFC stands with your logo, bulk orders and setup for restaurant chains and multi-location businesses. Request a quote.',
  },
  demo: {
    title: 'FlashBind | Live Demo',
    description:
      'See what happens when someone taps a FlashBind tag: the page opens instantly in the phone browser, with no app needed.',
  },
  blog: {
    title: 'FlashBind | Blog',
    description:
      'Guides on Google reviews, NFC in hospitality and smart pet tags, with practical tips for businesses and pet owners.',
  },
  contact: {
    title: 'FlashBind | Contact Us',
    description:
      'Questions about FlashBind NFC stands and tags? Send a message or email info@flashbind.com. We reply within one business day.',
  },
  quote: {
    title: 'FlashBind | Request a Quote',
    description:
      'Request a quote for FlashBind NFC stands, custom-designed stands with your logo, or bulk orders. We reply within one business day.',
  },
  warranty: {
    title: 'FlashBind | Warranty',
    description:
      'Warranty for FlashBind products: the 2-year legal guarantee for consumers and a 12-month warranty for business customers.',
  },
  personal: {
    title: 'FlashBind | Personal',
    description:
      'Smart Pet Tag with NFC: anyone who finds your pet can tap the tag with a phone to see how to reach you. No app or battery.',
  },
  privacy: {
    title: 'FlashBind | Privacy Policy',
    description: 'How FlashBind (Cortexa, MB) collects, uses and protects personal data, and your rights under the GDPR.',
  },
  terms: {
    title: 'FlashBind | Terms of Service',
    description: 'Terms for buying FlashBind products and using flashbind.com, for consumers and business customers.',
  },
  cookies: {
    title: 'FlashBind | Cookie Policy',
    description: 'Which cookies flashbind.com uses, what they do, and how to change your cookie choice.',
  },
  refunds: {
    title: 'FlashBind | Returns and Refunds',
    description: 'Returns and refunds for FlashBind orders: 30 days for consumers, including the 14-day EU right of withdrawal.',
  },
  shipping: {
    title: 'FlashBind | Shipping Policy',
    description: 'Where FlashBind ships, delivery times and costs, and what happens if an order arrives damaged.',
  },
} satisfies Record<string, {title: string; description: string}>;

/** Meta tags (title, description, og:title) for one of the pages above. */
export function pageMeta(page: keyof typeof PAGE_SEO) {
  const {title, description} = PAGE_SEO[page];
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
  ];
}
