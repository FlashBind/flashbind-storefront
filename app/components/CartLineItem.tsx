import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  // Use the 2nd image if available (where the user uploaded the clean shot), else fallback to the featured or variant image
  const productImages = (product as any)?.images?.nodes || [];
  const displayImage = productImages.length > 1 ? productImages[1] : (product as any)?.featuredImage || image;

  return (
    <li key={id} className="flex flex-col gap-4 w-full p-5 bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl mb-4 last:mb-0 relative">
      <div className="flex flex-row items-start gap-5 w-full">
        {displayImage && (
          <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <Image
              alt={title}
              aspectRatio="1/1"
              data={displayImage}
              sizes="96px"
              className="w-full h-full object-contain rounded-md"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
          <div>
            <Link
              prefetch="intent"
              to={lineItemUrl}
              onClick={() => {
                if (layout === 'aside') {
                  close();
                }
              }}
              className="no-underline hover:underline block"
            >
              <p className="font-semibold text-slate-900 text-base leading-tight truncate">
                {product.title}
              </p>
            </Link>
            <div className="text-slate-900 font-bold text-sm mt-1">
              <ProductPrice price={line?.cost?.totalAmount} />
            </div>
            
            {/* Hide Defaults: logic to hide the variant title if it strictly equals "Default Title". */}
            {selectedOptions.map((option) => {
              if (option.value === 'Default Title') return null;
              return (
                <div key={option.name} className="text-xs text-slate-500 mt-1.5">
                  {option.name}: <span className="font-medium text-slate-700">{option.value}</span>
                </div>
              );
            })}
          </div>
          
          <CartLineQuantity line={line} />
        </div>
      </div>

      {lineItemChildren ? (
        <div className="w-full">
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="mt-2 ml-16 pl-4 border-l border-gray-100">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex flex-row items-center mt-4">
      {/* Unified Solid Navy Stepper & Trash Pill */}
      <div className="flex flex-row items-center bg-slate-900 rounded-full shadow-sm h-9">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="w-9 h-full flex items-center justify-center text-white hover:bg-slate-800 disabled:opacity-50 transition-colors rounded-l-full"
          >
            &#8722;
          </button>
        </CartLineUpdateButton>
        
        <span className="text-sm font-bold text-white min-w-[20px] text-center select-none">{quantity}</span>
        
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="w-9 h-full flex items-center justify-center text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            &#43;
          </button>
        </CartLineUpdateButton>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-white/20 mx-0.5"></div>

        {/* Trash Icon Inside the Pill */}
        <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
      </div>
    </div>
  );
}

/**
 * A button that removes a line item from the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button 
        disabled={disabled} 
        type="submit"
        className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-slate-800 hover:text-red-400 transition-colors focus:outline-none rounded-r-full"
        aria-label="Remove item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
