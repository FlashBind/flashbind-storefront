import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product:
    | ProductItemFragment
    | RecommendedProductFragment
    | any;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  


  const price = product?.priceRange?.minVariantPrice;
  const compareAtPrice = product?.compareAtPriceRange?.minVariantPrice;
  const isSale = compareAtPrice && price && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
  const isSoldOut = product?.availableForSale === false;
  const isComingSoon = isSoldOut && ['nfc-restaurant-menu-stand', 'guest-wi-fi-hub', 'smart-pet-collar-tag'].includes(product?.handle || '');
  const isSellingFast = product?.tags?.includes('selling-fast');


  return (
    <Link
      className="group bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 flex flex-col relative h-full hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:border-[#1E3A8A]/30 transition-all duration-300 text-left"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {/* Badges Container */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-2 items-start">
        {isComingSoon ? (
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm">
            Coming Soon
          </div>
        ) : isSoldOut ? (
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
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading || 'lazy'}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out p-4"
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
      

      
      <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-grow">
        Perfect for your business. Let customers connect instantly with a single tap.
      </p>
      
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex flex-col items-start">
          {isSale && (
            <span className="text-xs text-slate-400 line-through decoration-slate-300 font-medium mb-0.5">
              <Money data={compareAtPrice} />
            </span>
          )}
          <span className={`text-2xl font-extrabold tracking-tight ${isSale ? 'text-[#1E3A8A]' : 'text-slate-900'}`}>
            <Money data={price} />
          </span>
        </div>
        
        <div className="w-9 h-9 bg-[#0F172A] text-white rounded-full flex items-center justify-center transition-colors shadow-sm group-hover:scale-110">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
