import type {Route} from './+types/[sitemap.xml]';
import {getSitemapIndex} from '@shopify/hydrogen';

export async function loader({
  request,
  context: {storefront},
}: Route.LoaderArgs) {
  // Products from Shopify, plus the site's own pages and articles. Shopify
  // pages, collections and blogs are left out: they duplicate our own routes
  // (/pages/contact, /collections/frontpage) or are empty (/blogs/news).
  const response = await getSitemapIndex({
    storefront,
    request,
    types: ['products'],
    customChildSitemaps: ['/sitemap-pages.xml'],
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
