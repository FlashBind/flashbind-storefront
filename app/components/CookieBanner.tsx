import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  applyShopifyConsent,
  readStoredConsent,
  storeConsent,
  syncStoredConsent,
} from '~/lib/cookieConsent';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = readStoredConsent();
    if (!consent) {
      setIsVisible(true);
    } else {
      // Keep Shopify's consent record in line with the stored choice.
      syncStoredConsent(consent);
    }
  }, []);

  // The choice is passed to Shopify's Customer Privacy API, which controls
  // Shopify's analytics and marketing cookies (COOKIE-001).
  const handleAccept = () => {
    storeConsent('all');
    applyShopifyConsent(true);
    setIsVisible(false);
  };

  const handleReject = () => {
    storeConsent('essential_only');
    applyShopifyConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    // z-[35]: above the page and the menu backdrop (z-30), below the open
    // mobile menu, account panel and cart drawer (z-40/50), so it never covers them.
    <div className="fixed bottom-0 left-0 w-full z-[35] p-3 md:p-6 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-5 md:p-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 md:items-center justify-between pointer-events-auto">
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your Privacy, Your Choice</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Essential cookies keep the site and checkout working. Analytics and marketing cookies are used only if you accept.{' '}
            <Link to="/cookie-policy" className="text-[#1E3A8A] font-semibold hover:underline">Cookie Policy</Link> ·{' '}
            <Link to="/privacy-policy" className="text-[#1E3A8A] font-semibold hover:underline">Privacy Policy</Link>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-fit md:flex">
          <button 
            onClick={handleReject}
            className="px-4 md:px-6 py-3 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            Essential only
          </button>
          <button 
            onClick={handleAccept}
            className="px-4 md:px-6 py-3 rounded-full text-sm font-bold text-white bg-[#1E3A8A] hover:bg-[#172A66] shadow-[0_4px_15px_rgba(30,58,138,0.2)] transition-all whitespace-nowrap"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
