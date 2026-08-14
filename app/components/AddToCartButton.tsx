import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  className,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div className="w-full cart-form-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .cart-form-wrapper form { display: contents !important; }
      `}} />
      <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
        {(fetcher: FetcherWithComponents<any>) => (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled ?? fetcher.state !== 'idle'}
              className={className}
              style={{ width: '100%' }}
            >
              {children}
            </button>
          </>
        )}
      </CartForm>
    </div>
  );
}
