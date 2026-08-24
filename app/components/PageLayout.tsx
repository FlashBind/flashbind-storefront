import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
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
  isLoggedIn: Promise<boolean>;
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
      {/* Trust Signal Bar (Premium Marquee) */}
      <div className="w-full bg-[#F9F9F8] border-b border-[#E5E5E3] py-2.5 overflow-hidden flex whitespace-nowrap pointer-events-none">
        <div className="flex w-max" style={{ animation: 'marquee 50s linear infinite' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center">
              {[
                "500+ businesses powered",
                "Trusted across the EU",
                "Custom branding on every order",
                "Same-day dispatch",
                "Enterprise-grade NFC chips"
              ].map((statement, j) => (
                <div key={j} className="flex items-center">
                  <span className="text-[11px] font-medium text-[#666666] tracking-widest">{statement}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] mx-6"></span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
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
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  return null;
}

