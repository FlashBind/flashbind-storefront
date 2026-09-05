import {redirect} from 'react-router';
import type {LoaderFunctionArgs} from 'react-router';

const CATEGORY_DESTINATIONS: Record<string, string> = {
  'business-cards': '/business',
  'review-stands': '/products/google-review-stand',
  'pet-tags': '/products/smart-pet-collar-tag',
  'wifi-hubs': '/products/guest-wi-fi-hub',
  individuals: '/personal',
};

export function loader({params}: LoaderFunctionArgs) {
  return redirect(CATEGORY_DESTINATIONS[params.handle || ''] || '/products');
}
