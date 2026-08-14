import {redirect, useLoaderData} from 'react-router';
import {useState, useEffect} from 'react';
import type {Route} from './+types/products.$handle';
import {ProductTutorial} from '~/components/ProductTutorial';
import {BusinessBenefits} from '~/components/BusinessBenefits';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `FlashBind | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const productImages = product.images?.nodes || [];
  
  // Local state for the main displayed image
  const defaultImage = selectedVariant?.image || productImages[0];
  const [activeImage, setActiveImage] = useState(defaultImage);

  // Generate a deterministic random review count based on product ID
  const idStr = product?.id || product?.handle || 'default';
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; 
  }
  const reviewCount = Math.abs(hash % 420) + 80;
  const [activeFeature, setActiveFeature] = useState(0);

  // Update active image if the variant changes
  useEffect(() => {
    if (selectedVariant?.image) {
      setActiveImage(selectedVariant.image);
    }
  }, [selectedVariant?.image]);

  return (
    <>
      <div className="bg-slate-50 min-h-screen pt-8 pb-8">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
            
            {/* Left Column: Image & Thumbnails */}
            <div className="w-full md:w-1/2 flex flex-col gap-6 flex-shrink-0">
              <div className="w-full bg-white rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-100 relative group aspect-square shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
                <div className="w-full h-full transform transition-transform duration-700 ease-out group-hover:scale-105 flex items-center justify-center">
                  <ProductImage image={activeImage} />
                </div>
              </div>
              
              {/* Real Thumbnails */}
              {productImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {productImages.map((img: any, idx: number) => {
                    const isActive = activeImage?.url === img.url;
                    return (
                      <button 
                        key={img.id || idx}
                        onClick={() => setActiveImage(img)}
                        className={`aspect-square bg-white rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all ${
                          isActive 
                            ? 'border-2 border-[#1E3A8A] ring-2 ring-[#1E3A8A]/10 shadow-sm' 
                            : 'border border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <ProductImage image={img} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Right Column: Details Stack */}
            <div className="w-full md:w-1/2 flex flex-col pt-2">
              <div className="text-sm font-black text-blue-600 tracking-[0.2em] uppercase mb-3">
                FlashBind
              </div>
              
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {title}
                </h1>
                {selectedVariant?.compareAtPrice && selectedVariant?.price && parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount) && (
                  <span className="bg-slate-900 text-white text-sm font-extrabold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm whitespace-nowrap mt-2">
                    Sale
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex text-yellow-400 text-sm">
                  â˜…â˜…â˜…â˜…â˜…
                </div>
                <span className="text-sm font-bold text-slate-500 underline decoration-slate-300 underline-offset-4 cursor-pointer hover:text-slate-900 transition-colors">
                  {reviewCount} Reviews
                </span>
              </div>
              
              <div className="text-3xl font-extrabold text-slate-900 mb-8">
                <ProductPrice
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              </div>
              
              <div className="mb-10">
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                />
              </div>
              
              {/* Premium Icon Grid Carousel */}
              <div className="mb-10 relative">
                <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                <div 
                  className="flex sm:grid sm:grid-cols-3 overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onScroll={(e) => {
                    const scrollLeft = e.currentTarget.scrollLeft;
                    const width = e.currentTarget.clientWidth;
                    const index = Math.round(scrollLeft / width);
                    setActiveFeature(index);
                  }}
                >
                  <div className="w-full sm:w-auto flex-shrink-0 snap-center bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300 text-blue-600 group-hover:text-white shadow-sm border border-blue-100 group-hover:border-blue-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Instant Setup</h4>
                    <p className="text-xs text-slate-500">Tap and go</p>
                  </div>
                  
                  <div className="w-full sm:w-auto flex-shrink-0 snap-center bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300 text-blue-600 group-hover:text-white shadow-sm border border-blue-100 group-hover:border-blue-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">No Battery</h4>
                    <p className="text-xs text-slate-500">Never needs charging</p>
                  </div>
                  
                  <div className="w-full sm:w-auto flex-shrink-0 snap-center bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300 text-blue-600 group-hover:text-white shadow-sm border border-blue-100 group-hover:border-blue-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Bank-Grade</h4>
                    <p className="text-xs text-slate-500">Encrypted data</p>
                  </div>
                </div>
                
                {/* Dots indicator for mobile */}
                <div className="flex justify-center gap-2 mt-2 sm:hidden">
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={i} 
                      className={`h-2 rounded-full transition-all duration-300 ${activeFeature === i ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'}`} 
                    />
                  ))}
                </div>
              </div>


              
              {/* Description */}
              <div className="mb-10">
                <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm border-b-2 border-slate-100 pb-4">
                  Product Details
                </h3>
                <div 
                  className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}} 
                />
              </div>

              
            </div>
            
          </div>
          
          {/* Standalone FAQ Section */}
          <div className="mt-16 md:mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-8 text-center tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <details className="group border border-slate-200 rounded-xl bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-bold transition-colors hover:text-blue-600">
                  Does this require an app?
                  <span className="shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed text-base">
                  <p>Absolutely not! The NFC chip communicates directly with the native operating system on almost all modern smartphones. Just tap and go.</p>
                </div>
              </details>
              
              <details className="group border border-slate-200 rounded-xl bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-bold transition-colors hover:text-blue-600">
                  Are there any monthly subscription fees?
                  <span className="shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed text-base">
                  <p>Zero. This is a one-time purchase. You own the hardware and can update the destination link as many times as you like from our free dashboard.</p>
                </div>
              </details>

              <details className="group border border-slate-200 rounded-xl bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-bold transition-colors hover:text-blue-600">
                  How do I change where the product links to?
                  <span className="shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed text-base">
                  <p>When you receive your product, you will tap it to create your account. From then on, you can log in to your dashboard to instantly update the URL destination.</p>
                </div>
              </details>
            </div>
          </div>

        </div>
      </div>
      
      <ProductTutorial productHandle={product.handle} />
      
      {!product.handle.toLowerCase().includes('pet') && (
        <div className="bg-slate-50">
          <BusinessBenefits isProductPage={true} />
        </div>
      )}

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    images(first: 5) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
