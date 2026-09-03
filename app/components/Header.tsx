import {Suspense, useState, useEffect} from 'react';
import {Await, NavLink, useAsyncValue, Form} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { type, close } = useAside();
  const isMobileMenuOpen = type === 'mobile';

  return (
    <>
      <header className={`sticky top-0 z-50 flex flex-col w-full transition-all duration-500 border-b ${isScrolled ? 'bg-white/95 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-slate-200/60' : 'bg-white shadow-none border-transparent'}`}>
        {/* Trust Signal Bar (Premium Marquee) */}
        <div className="w-full bg-gradient-to-r from-[#172A66] via-[#1E3A8A] to-[#172A66] py-2.5 overflow-hidden flex whitespace-nowrap pointer-events-none border-b border-white/10 shadow-inner">
          <div className="flex w-max" style={{ animation: 'marquee 80s linear infinite' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center">
                {[
                  "PREMIUM NFC HARDWARE",
                  "COMPATIBLE WITH MOST MODERN SMARTPHONES",
                  "NO APP REQUIRED",
                  "EDITABLE ANYTIME"
                ].map((statement, j) => (
                  <div key={j} className="flex items-center">
                    <span className="text-[11px] font-bold text-white tracking-widest uppercase drop-shadow-md">{statement}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] mx-6 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 md:py-4 flex items-center justify-between w-full relative">
          <NavLink prefetch="intent" to="/" className="flex items-center gap-3 relative z-10" onClick={close}>
            <img src="/logo-transparent.png" alt="FlashBind Logo" className="h-16 md:h-20 object-contain" />
          </NavLink>
          <div className="hidden md:flex md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10">
            <HeaderMenu
              menu={menu}
              viewport="desktop"
              primaryDomainUrl={header.shop.primaryDomain.url}
              publicStoreDomain={publicStoreDomain}
            />
          </div>
          <div className="relative z-10">
            <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} setIsAccountOpen={setIsAccountOpen} />
          </div>
        </div>
      </header>

      {/* Account Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isAccountOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsAccountOpen(false)}
        aria-hidden="true"
      />

      {/* Account Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-[100vh] w-full sm:w-[400px] max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isAccountOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-8 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-medium text-slate-900">Account</h2>
            <button 
              onClick={() => setIsAccountOpen(false)}
              className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Suspense fallback={<div className="text-center text-slate-500 py-8">Loading...</div>}>
            <Await resolve={isLoggedIn}>
              {(isLoggedIn) => (
                isLoggedIn ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <NavLink to="/dashboard" onClick={() => setIsAccountOpen(false)} className="py-3 text-lg text-slate-700 hover:text-black transition-colors block">My Account</NavLink>
                      <NavLink to="/account/orders" onClick={() => setIsAccountOpen(false)} className="py-3 text-lg text-slate-700 hover:text-black transition-colors block">Order History</NavLink>
                    </div>
                    <Form method="post" action="/logout" className="mt-4">
                      <button type="submit" onClick={() => setIsAccountOpen(false)} className="border border-slate-300 text-slate-900 rounded-full py-3 text-center w-full font-semibold hover:bg-slate-50 transition-colors">
                        Log Out
                      </button>
                    </Form>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                      <a href="/login" className="bg-slate-900 text-white rounded-full py-3 text-center w-full block font-semibold hover:bg-[#1E3A8A] transition-colors">
                        Log In
                      </a>
                      <a href="/register" className="border border-slate-300 text-slate-900 rounded-full py-3 text-center w-full block font-semibold hover:bg-slate-50 transition-colors">
                        Create an Account
                      </a>
                    </div>
                    
                    <div className="flex flex-col">
                      <NavLink to="/dashboard" onClick={() => setIsAccountOpen(false)} className="py-3 text-lg text-slate-700 hover:text-black transition-colors block">My Account</NavLink>
                      <NavLink to="/account/orders" onClick={() => setIsAccountOpen(false)} className="py-3 text-lg text-slate-700 hover:text-black transition-colors block">Order History</NavLink>
                    </div>
                  </div>
                )
              )}
            </Await>
          </Suspense>

          <div className="mt-auto pb-6">
            <p className="text-sm text-gray-400 text-center">Guest checkout is always available.</p>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      <div 
        className={`md:hidden fixed top-[108px] left-0 w-full bg-white shadow-xl border-b border-slate-100 transition-all duration-300 z-40 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 flex flex-col overflow-y-auto max-h-[85vh]">
          {/* Mobile Search Bar */}
          <div className="mb-8">
            <Form method="get" action="/search" className="relative flex items-center" onSubmit={close}>
              <input 
                type="search" 
                name="q" 
                placeholder="Search products..." 
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                required
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Form>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1">
            <NavLink to="/products" onClick={close} className="text-lg font-semibold text-slate-900 hover:text-[#1E3A8A] py-3 border-b border-slate-50">
              All Products
            </NavLink>
            <NavLink to="/services" onClick={close} className="text-lg font-semibold text-slate-900 hover:text-[#1E3A8A] py-3 border-b border-slate-50">
              Custom Solutions
            </NavLink>
            <NavLink to="/blog" onClick={close} className="text-lg font-semibold text-slate-900 hover:text-[#1E3A8A] py-3">
              Blog
            </NavLink>
          </div>

          {/* Account & Login Links */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
            <Suspense fallback={<div className="h-20" />}>
              <Await resolve={isLoggedIn}>
                {(isLoggedIn) => (
                  isLoggedIn ? (
                    <>
                      <NavLink to="/dashboard" onClick={close} className="text-base font-medium text-slate-600 hover:text-[#1E3A8A] py-1">My Account</NavLink>
                      <NavLink to="/account/orders" onClick={close} className="text-base font-medium text-slate-600 hover:text-[#1E3A8A] py-1">Order History</NavLink>
                      <Form method="post" action="/logout" className="mt-2">
                        <button type="submit" onClick={close} className="w-full bg-slate-50 text-slate-600 rounded-xl py-3 text-center font-medium hover:bg-slate-100 transition-colors">
                          Log Out
                        </button>
                      </Form>
                    </>
                  ) : (
                    <>
                      <NavLink to="/login" onClick={close} className="w-full bg-[#1E3A8A] text-white rounded-xl py-3 text-center font-bold hover:bg-[#172A66] transition-colors shadow-md">
                        Log In
                      </NavLink>
                      <NavLink to="/register" onClick={close} className="w-full border border-slate-300 text-slate-800 rounded-xl py-3 text-center font-bold hover:bg-slate-50 transition-colors">
                        Create an Account
                      </NavLink>
                    </>
                  )
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 top-[108px]" 
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();

  const NFC_HEADER_MENU = {
    items: [
      { id: 'nav-1', title: 'All Products', url: '/products' },
      { 
        id: 'nav-b2b', 
        title: 'For Business', 
        url: '#',
        subItems: [
          { id: 'sub-1', title: 'All Products', url: '/business' },
          { id: 'sub-2', title: 'Custom Solutions', url: '/services' },
        ]
      },
      { id: 'nav-b2c', title: 'For Individuals', url: '/personal' },

      { id: 'nav-5', title: 'Blog', url: '/blog' },
    ]
  };

  return (
    <nav className={viewport === 'mobile' ? 'flex flex-col gap-4 text-left' : 'flex items-center gap-6'} role="navigation">
      {NFC_HEADER_MENU.items.map((item, index) => {
        if (item.subItems) {
          return (
            <div key={item.id} className={viewport === 'mobile' ? 'flex flex-col gap-2' : 'relative group px-3 py-2'} style={viewport === 'desktop' ? { animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` } : {}}>
              {viewport === 'mobile' ? (
                <>
                  <span className="text-lg font-bold text-slate-400 uppercase tracking-widest text-[11px] mb-1">{item.title}</span>
                  {item.subItems.map((sub) => (
                    <NavLink
                      key={sub.id}
                      to={sub.url}
                      onClick={close}
                      className={({isActive}) =>
                        `text-lg font-semibold transition-colors py-1 ${
                          isActive 
                            ? 'text-[#1E3A8A]' 
                            : 'text-slate-800 hover:text-[#1E3A8A]'
                        }`
                      }
                    >
                      {sub.title}
                    </NavLink>
                  ))}
                </>
              ) : (
                <>
                  <button className="text-[15px] font-sans font-semibold text-slate-600 tracking-wide transition-all duration-300 group-hover:text-[#1E3A8A] flex items-center gap-1.5 focus:outline-none">
                    {item.title}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span className="absolute bottom-1 left-3 w-[calc(100%-24px)] h-[1.5px] bg-[#1E3A8A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="flex flex-col gap-1">
                      {item.subItems.map((sub) => (
                        <NavLink
                          key={sub.id}
                          to={sub.url}
                          onClick={close}
                          className={({isActive}) =>
                            `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                              isActive 
                                ? 'bg-[#1E3A8A]/5 text-[#1E3A8A]' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A]'
                            }`
                          }
                        >
                          {sub.title}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        }

        return (
          <NavLink
            className={({isActive}) => 
              viewport === 'mobile'
                ? `text-lg font-semibold transition-colors py-1 ${isActive ? 'text-[#1E3A8A]' : 'text-slate-800 hover:text-[#1E3A8A]'}`
                : `relative group px-3 py-2 text-[15px] font-sans tracking-wide transition-all duration-300 no-underline hover:no-underline ${isActive ? 'text-slate-900 font-bold' : 'text-slate-600 font-semibold hover:text-[#1E3A8A] hover:drop-shadow-[0_0_8px_rgba(30,58,138,0.2)]'}`
            }
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={item.url}
            style={viewport === 'desktop' ? { animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` } : {}}
          >
            {item.title}
            {viewport === 'desktop' && (
              <span className="absolute bottom-1 left-3 w-[calc(100%-24px)] h-[1.5px] bg-[#1E3A8A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
  setIsAccountOpen,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'> & { setIsAccountOpen: (open: boolean) => void }) {
  return (
    <nav className="flex items-center gap-3" role="navigation">
      <HeaderMenuMobileToggle />
      
      {/* Social Icons */}
      <div className="hidden md:flex items-center gap-4 border-r border-slate-200 pr-6 mr-2">
        <a href="https://www.instagram.com/flashbind_nfc/" target="_blank" rel="noreferrer" className="flex items-center text-slate-600 hover:text-[#1E3A8A] transition-colors" title="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        </a>
        <a href="https://www.tiktok.com/@flashbind" target="_blank" rel="noreferrer" className="flex items-center text-slate-600 hover:text-[#1E3A8A] transition-colors" title="TikTok">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </a>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <NavbarSearch />
        
        <NavLink prefetch="intent" to="/contact" className="flex items-center text-slate-600 hover:text-[#1E3A8A] transition-colors" title="Contact Us">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </NavLink>
      </div>

      <button 
        onClick={() => setIsAccountOpen(true)}
        className="hidden md:flex items-center text-slate-600 hover:text-[#1E3A8A] transition-colors py-2" 
        title="Account"
      >
        <Suspense fallback={<UserIcon />}>
          <Await resolve={isLoggedIn} errorElement={<UserIcon />}>
            {(isLoggedIn) => <UserIcon />}
          </Await>
        </Suspense>
      </button>

      <CartToggle cart={cart} />
      
      {/* Premium CTA */}
      <NavLink to="/#recommended-products" className="hidden lg:flex ml-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-[#1E3A8A] hover:scale-105 hover:shadow-[0_0_25px_rgba(30,58,138,0.4)] transition-all duration-300 shadow-md no-underline hover:no-underline">
        Get Started
      </NavLink>
    </nav>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function HeaderMenuMobileToggle() {
  const {open, close, type} = useAside();
  const isMobileMenuOpen = type === 'mobile';
  return (
    <button
      className="md:hidden text-slate-600 hover:text-[#1E3A8A] transition-colors p-2 order-last"
      onClick={() => isMobileMenuOpen ? close() : open('mobile')}
      aria-label="Toggle Mobile Menu"
    >
      {isMobileMenuOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}

function NavbarSearch() {
  return (
    <NavLink prefetch="intent" to="/search" className="flex items-center text-slate-600 hover:text-[#1E3A8A] transition-colors" title="Search">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </NavLink>
  );
}

function CartBadge({count}: {count: number}) {
  const {open, type, close} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  const isCartOpen = type === 'cart';

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        if (isCartOpen) {
          close();
        } else {
          open('cart');
          publish('cart_viewed', {
            cart,
            prevCart,
            shop,
            url: window.location.href || '',
          } as CartViewPayload);
        }
      }}
      className="relative flex items-center text-slate-600 hover:text-[#1E3A8A] transition-colors md:mr-4 order-first md:order-none"
      title="Cart"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-2 bg-[#1E3A8A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
          {count}
        </span>
      )}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
