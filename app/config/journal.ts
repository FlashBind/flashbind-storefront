/**
 * The journal articles written into the site (blogs.$blogHandle.$articleHandle
 * renders their text). Shopify blog articles are shown first when they exist;
 * any other handle is a 404, never a placeholder page.
 */
export const JOURNAL_BLOG = 'journal';

export const JOURNAL_ARTICLES = [
  {
    handle: 'google-review-seo',
    title: 'Google Reviews and Local SEO: How a Google Review Stand Helps',
    image: '/seo_blog_featured.png',
    publishedAt: '2026-09-18T00:00:00Z',
    description:
      'Why Google reviews decide who shows up in the local map results, and how a Google Review Stand makes it easy for happy customers to leave one.',
  },
  {
    handle: 'nfc-hospitality',
    title: 'Why NFC is Replacing QR Codes in Hospitality',
    image: '/nfc_blog_featured_new.png',
    publishedAt: '2026-09-24T00:00:00Z',
    description:
      'Why restaurants, cafés and hotels are replacing QR codes with NFC: one tap opens the menu, the Wi-Fi or the review page, with no app needed.',
  },
  {
    handle: 'smart-pet-tags',
    title: 'Why Smart Pet Tags are the New Standard for Pet Safety',
    image: '/pet_tags_blog_featured.png',
    publishedAt: '2026-09-05T00:00:00Z',
    description:
      'How an NFC smart pet tag lets anyone who finds your pet reach you with one tap, and why it beats an engraved metal tag.',
  },
] as const;

export function findJournalArticle(blogHandle: string, articleHandle: string) {
  if (blogHandle !== JOURNAL_BLOG) return null;
  return JOURNAL_ARTICLES.find((article) => article.handle === articleHandle) ?? null;
}
