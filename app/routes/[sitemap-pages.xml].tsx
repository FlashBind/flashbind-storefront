import {JOURNAL_ARTICLES} from '~/config/journal';

/**
 * Sitemap of the site's own pages (not Shopify objects), listed in the
 * sitemap index from [sitemap.xml].tsx. Add a page here when it is created;
 * leave out pages that are noindex (account, dashboard, admin, /p/, /setup).
 */
const PAGES = [
  '/',
  '/business',
  '/personal',
  '/services',
  '/software',
  '/demo',
  '/about',
  '/contact',
  '/quote',
  '/blog',
  '/collections/all',
  '/warranty',
  '/refund-policy',
  '/shipping-policy',
  '/terms-of-service',
  '/privacy-policy',
  '/cookie-policy',
];

export function loader({request}: {request: Request}) {
  const origin = new URL(request.url).origin;
  const urls = [...PAGES, ...JOURNAL_ARTICLES.map((article) => `/blogs/journal/${article.handle}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, {
    headers: {'Content-Type': 'application/xml', 'Cache-Control': `max-age=${60 * 60 * 24}`},
  });
}
