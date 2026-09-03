import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions, CartForm} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {useState} from 'react';

export function ProductForm({
  productOptions,
  selectedVariant,
  productHandle,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  productHandle: string;
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  const [quantity, setQuantity] = useState(1);

  // Format price for button
  const formattedPrice = selectedVariant?.price
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: selectedVariant.price.currencyCode,
      }).format(parseFloat(selectedVariant.price.amount))
    : '';

  return (
    <div className="product-form flex flex-col gap-8">
      {/* Variants */}
      <div className="space-y-6">
        {productOptions.map((option) => {
          // If there is only a single value in the option values, don't display the option
          if (option.optionValues.length === 1) return null;

          return (
            <div className="product-options" key={option.name}>
              <h5 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">{option.name}</h5>
              <div className="flex flex-wrap gap-3">
                {option.optionValues.map((value) => {
                  const {
                    name,
                    handle,
                    variantUriQuery,
                    selected,
                    available,
                    exists,
                    isDifferentProduct,
                    swatch,
                  } = value;

                  const buttonClasses = `px-5 py-2.5 border-2 rounded-lg text-sm font-bold transition-all ${
                    selected 
                      ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 text-[#1E3A8A]' 
                      : 'border-slate-200 text-slate-600 hover:border-slate-400 bg-white'
                  } ${!available ? 'opacity-50 cursor-not-allowed' : ''}`;

                  if (isDifferentProduct) {
                    return (
                      <Link
                        className={buttonClasses}
                        key={option.name + name}
                        prefetch="intent"
                        preventScrollReset
                        replace
                        to={`/products/${handle}?${variantUriQuery}`}
                      >
                        <ProductOptionSwatch swatch={swatch} name={name} />
                      </Link>
                    );
                  } else {
                    return (
                      <button
                        type="button"
                        className={buttonClasses}
                        key={option.name + name}
                        disabled={!exists}
                        onClick={() => {
                          if (!selected) {
                            void navigate(`?${variantUriQuery}`, {
                              replace: true,
                              preventScrollReset: true,
                            });
                          }
                        }}
                      >
                        <ProductOptionSwatch swatch={swatch} name={name} />
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quantity Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-bold uppercase tracking-wider text-slate-700">Quantity</label>
        <div className="flex items-center border-2 border-slate-200 rounded-lg w-fit overflow-hidden bg-white">
          <button 
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
          </button>
          <div className="w-14 h-12 flex items-center justify-center font-bold text-lg text-slate-900 border-x-2 border-slate-200">
            {quantity}
          </div>
          <button 
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-4">
        {/* Mega CTA Button */}
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]
              : []
          }
          className={`w-full text-white font-extrabold uppercase tracking-widest h-14 rounded-xl shadow-lg transition-all duration-300 flex justify-center items-center gap-2 text-sm sm:text-base border-2 border-transparent ${
            selectedVariant?.availableForSale
              ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1'
              : 'bg-slate-400 cursor-not-allowed opacity-80'
          }`}
        >
          {selectedVariant?.availableForSale
            ? <span>ADD TO CART &mdash; {formattedPrice}</span>
            : <span>
                {['nfc-restaurant-menu-stand', 'guest-wi-fi-hub', 'smart-pet-collar-tag'].includes(productHandle)
                  ? 'COMING SOON'
                  : 'SOLD OUT'}
              </span>
          }
        </AddToCartButton>

        {/* Instant Buy Button */}
        <div className="w-full cart-form-wrapper">
          <CartForm
            route="/cart"
            action={CartForm.ACTIONS.LinesAdd}
            inputs={{
              lines: selectedVariant ? [{merchandiseId: selectedVariant.id, quantity}] : [],
            }}
          >
            <input type="hidden" name="redirectTo" value="checkout" />
            <button
              type="submit"
              disabled={!selectedVariant || !selectedVariant.availableForSale}
              style={{ width: '100%' }}
              className={`w-full font-extrabold uppercase tracking-widest h-14 rounded-xl transition-all duration-300 flex justify-center items-center text-sm sm:text-base border-2 ${
                selectedVariant?.availableForSale
                  ? 'border-gray-900 text-gray-900 bg-transparent hover:bg-gray-50 hover:-translate-y-1 hover:shadow-lg'
                  : 'border-slate-400 text-slate-400 cursor-not-allowed opacity-80 hidden'
              }`}
            >
              Buy it now
            </button>
          </CartForm>
        </div>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return <>{name}</>;

  return (
    <div
      aria-label={name}
      className="w-6 h-6 rounded-full inline-block mr-2 align-middle border border-slate-300"
      style={{
        backgroundColor: color || 'transparent',
        backgroundImage: image ? `url(${image})` : 'none',
        backgroundSize: 'cover'
      }}
    />
  );
}
