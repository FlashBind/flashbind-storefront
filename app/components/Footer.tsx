import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900 mt-20">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                
                {/* Brand & Newsletter */}
                <div className="md:col-span-5">
                  <NavLink prefetch="intent" to="/" className="inline-block mb-6">
                    <img src="/logo-footer.png" alt="FlashBind Logo" className="h-12 md:h-16 object-contain" />
                  </NavLink>
                  <p className="text-slate-400 mb-8 leading-relaxed max-w-sm">
                    Bridging the physical and digital world. Upgrade your business presence in milliseconds with premium NFC technology.
                  </p>
                  <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="Enter your email" className="bg-slate-900 border border-slate-800 rounded-full px-4 py-3 flex-grow text-white focus:outline-none focus:border-blue-500 transition-colors" />
                    <button type="submit" className="bg-[#1E3A8A] text-white font-bold rounded-full px-6 py-3 hover:bg-blue-500 transition-colors">Subscribe</button>
                  </form>
                </div>

                {/* Quick Links */}
                <div className="md:col-span-2 md:col-start-7">
                  <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-sm">Shop</h4>
                  <ul className="space-y-4">
                    <li><NavLink to="/products" className="hover:text-white transition-colors">All Products</NavLink></li>
                    <li><NavLink to="/category/business-cards" className="hover:text-white transition-colors">Business Cards</NavLink></li>
                    <li><NavLink to="/category/review-stands" className="hover:text-white transition-colors">Review Stands</NavLink></li>
                    <li><NavLink to="/category/pet-tags" className="hover:text-white transition-colors">Pet Tags</NavLink></li>
                  </ul>
                </div>

                {/* Legal Menu */}
                <div className="md:col-span-3">
                  <h4 className="text-white font-bold mb-6 tracking-widest uppercase text-sm">Legal</h4>
                  <ul className="space-y-4">
                    <li><NavLink to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</NavLink></li>
                    <li><NavLink to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</NavLink></li>
                    <li><NavLink to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</NavLink></li>
                    <li><NavLink to="/refund-policy" className="hover:text-white transition-colors">Refund/Returns Policy</NavLink></li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 text-sm">© {new Date().getFullYear()} FlashBind. All rights reserved.</p>
                
                {/* Social Icons */}
                <div className="flex items-center gap-4">
                  {/* Instagram */}
                  <a href="https://www.instagram.com/flashbind_nfc/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#1E3A8A] hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  {/* TikTok */}
                  <a href="https://www.tiktok.com/@flashbind" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#1E3A8A] hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </a>
                  {/* Gmail */}
                  <NavLink prefetch="intent" to="/contact" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-[#1E3A8A] hover:text-white transition-all" title="Contact Us">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                  </NavLink>
                </div>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}


