import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  const isSale = compareAtPrice && price && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div aria-label="Price" className="flex items-center gap-3 flex-wrap" role="group">
      {isSale ? (
        <>
          <div className="flex flex-col items-start">
            <span className="text-sm md:text-base text-slate-400 line-through decoration-slate-300 font-medium">
              <Money data={compareAtPrice} />
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-[#1E3A8A] tracking-tight">
              <Money data={price} />
            </span>
          </div>
        </>
      ) : price ? (
        <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          <Money data={price} />
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
