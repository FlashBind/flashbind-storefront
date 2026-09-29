import {redirect, type LoaderFunctionArgs} from 'react-router';

// These pages used to be a hard-coded mock-up (dollar prices, invented
// ratings, "Selling Fast" badges, products we don't sell). Each old address
// now sends visitors to the real, Shopify-backed page instead.
const CATEGORY_REDIRECTS: Record<string, string> = {
  'review-stands': '/products/google-review-stand',
  'pet-tags': '/products/smart-pet-collar-tag',
  'wifi-hubs': '/products/guest-wi-fi-hub',
  'business-cards': '/business',
  individuals: '/personal',
};

export async function loader({params}: LoaderFunctionArgs) {
  return redirect(CATEGORY_REDIRECTS[params.handle ?? ''] ?? '/collections/all', 302);
}
