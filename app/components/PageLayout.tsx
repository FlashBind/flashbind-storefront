import {Await, Link} from 'react-router';
import {Suspense, useEffect, useId, useState} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside, useAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: boolean;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  // The cart drawer is hidden (via CSS) until opened, but was still mounting
  // its own <Suspense><Await resolve={cart}> on every page load — a second
  // boundary racing the header's cart-badge boundary for the same promise,
  // which triggered a React hydration error (#421). Deferring the mount
  // until the drawer is actually opened (a client-only interaction, safely
  // after hydration) avoids that without changing what the user sees.
  const {type} = useAside();
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (type === 'cart') setHasOpened(true);
  }, [type]);

  return (
    <Aside type="cart" heading="CART">
      {hasOpened ? (
        <Suspense fallback={<p>Loading cart ...</p>}>
          <Await resolve={cart}>
            {(cart) => {
              return <CartMain cart={cart} layout="aside" />;
            }}
          </Await>
        </Suspense>
      ) : null}
    </Aside>
  );
}

function SearchAside() {
  return null;
}

