import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight text-center">Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <Link 
              key={article.id}
              prefetch="intent" 
              to={articleUrl}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#1E40AF] transition-colors">{article.title}</h3>
              <p className="text-sm text-slate-500 mt-auto flex items-center font-medium">Read article <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span></p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight text-center">Pages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <Link 
              key={page.id}
              prefetch="intent" 
              to={pageUrl}
              className="group bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:bg-white hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <h3 className="text-lg font-semibold text-slate-900">{page.title}</h3>
              <span className="text-[#1E40AF] group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="mb-12 mt-4">
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const compareAtPrice = product?.selectedOrFirstAvailableVariant?.compareAtPrice;
            const isSale = compareAtPrice && price && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
            const isSoldOut = product?.availableForSale === false;
            const isSellingFast = product?.tags?.includes('selling-fast') || product?.handle?.includes('pet');
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <Link
                key={product.id}
                prefetch="intent"
                to={productUrl}
                className="group bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col relative h-full hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 text-left"
              >
                <div className="absolute top-8 left-8 z-10 flex flex-col items-start gap-2">
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
                <div className="w-full aspect-square mb-6 rounded-[1.5rem] bg-[#F4F6F8] flex items-center justify-center relative overflow-hidden group-hover:bg-[#EDF0F4] transition-colors">
                  {image ? (
                    <Image
                      data={image}
                      alt={product.title}
                      aspectRatio="1/1"
                      sizes="(min-width: 45em) 400px, 100vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
                      </svg>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Main Photo</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-[1.35rem] font-bold text-slate-900 mb-1 leading-tight">{product.title}</h3>
                
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="flex flex-col items-start">
                    {isSale && (
                      <span className="text-xs text-slate-400 line-through decoration-slate-300 font-medium mb-0.5">
                        <Money data={compareAtPrice} />
                      </span>
                    )}
                    <span className={`text-2xl font-extrabold tracking-tight ${isSale ? 'text-[#1E3A8A]' : 'text-slate-900'}`}>
                      {price && <Money data={price} />}
                    </span>
                  </div>
                  
                  <div className="w-9 h-9 bg-[#0F172A] text-white rounded-full flex items-center justify-center transition-colors shadow-sm group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          });

          return (
            <div>
              <div className="flex justify-center mb-8">
                <PreviousLink className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full font-medium transition-colors">
                  {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
                </PreviousLink>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {ItemsMarkup}
              </div>
              <div className="flex justify-center mt-12">
                <NextLink className="px-8 py-4 bg-[#0F172A] hover:bg-[#1E40AF] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {isLoading ? 'Loading...' : <span>Load more products ↓</span>}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
    </div>
  );
}

function SearchResultsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">No results found</h3>
      <p className="text-slate-500 max-w-md mx-auto">We couldn't find anything matching your search. Try adjusting your keywords or browse our catalog.</p>
    </div>
  );
}
