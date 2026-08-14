import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections.all';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta: Route.MetaFunction = () => {
  return [{title: `FlashBind | All Products`}];
};

export async function loader({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const [{products}] = await Promise.all([
    context.storefront.query(CATALOG_QUERY, {
      variables: paginationVariables,
    }),
  ]);

  return {products};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-16 text-center">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-sm font-bold tracking-widest uppercase">
            Catalog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">All Products</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Explore our complete range of premium NFC technology for businesses and individuals.</p>
        </div>

        <PaginatedResourceSection
          connection={products}
          resourcesClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {({node: product}) => (
            <TrendingProductCard key={product.id} product={product} />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function TrendingProductCard({ product }: { product: any }) {
  // Format price
  const priceAmount = product.priceRange?.minVariantPrice?.amount;
  const compareAmount = product.compareAtPriceRange?.minVariantPrice?.amount;
  
  const price = priceAmount ? `$${parseFloat(priceAmount).toFixed(2)}` : 'View Price';
  const comparePrice = compareAmount ? `$${parseFloat(compareAmount).toFixed(2)}` : null;
  const isSale = compareAmount && priceAmount && parseFloat(compareAmount) > parseFloat(priceAmount);
  const isSoldOut = product.availableForSale === false;
  const isSellingFast = product.tags?.includes('selling-fast') || product.handle?.includes('pet');

  return (
    <Link to={`/products/${product.handle}`} className="block">
      <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(30,58,138,0.4)] transition-all duration-500 group border-2 border-white/80 hover:border-[#1E3A8A] relative overflow-hidden" style={{ animation: 'fadeIn 0.5s ease-out both' }}>
        <div className="relative z-10">
          <div className="relative z-10 flex flex-col items-start gap-2 absolute top-4 left-4 z-20">
            {isSoldOut ? (
              <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm">
                Sold Out
              </div>
            ) : isSellingFast ? (
              <div className="bg-orange-500 text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                Selling Fast
              </div>
            ) : isSale ? (
              <div className="bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm">
                Sale
              </div>
            ) : null}
          </div>
          <div className="bg-gradient-to-tr from-slate-100/80 to-white/90 border border-white shadow-inner rounded-[2rem] h-64 mb-8 overflow-hidden relative group/image cursor-pointer">
            
            {product.featuredImage ? (
              <img 
                src={product.featuredImage.url} 
                alt={product.featuredImage.altText || product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 transition-opacity duration-500 opacity-100">
                <svg className="w-12 h-12 text-slate-300 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/></svg>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">No Image</span>
              </div>
            )}
          </div>
          
          <h3 className="text-2xl font-sans font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-[#1E3A8A] transition-colors duration-300 line-clamp-1">
            {product.title}
          </h3>
          <p className="font-sans text-slate-500 text-[15px] mb-6 leading-relaxed line-clamp-2">
            {product.description || "View product details for more information."}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Starting at</span>
              {isSale && (
                <span className="text-xs text-slate-400 line-through decoration-slate-300 font-medium mb-0.5">
                  {comparePrice}
                </span>
              )}
              <span className={`text-2xl font-extrabold ${isSale ? 'text-[#1E3A8A]' : 'text-slate-900'}`}>{price}</span>
            </div>
            <button 
              onClick={(e) => {
                // Let the Link navigate normally. The button is just for UI.
              }}
              className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-[#1E3A8A] hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-[0_10px_20px_rgba(30,58,138,0.2)] pointer-events-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

const CATALOG_QUERY = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        id
        title
        handle
        availableForSale
        tags
        description
        featuredImage {
          id
          altText
          url
          width
          height
        }
        priceRange {
          minVariantPrice {
            ...MoneyProductItem
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            ...MoneyProductItem
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
