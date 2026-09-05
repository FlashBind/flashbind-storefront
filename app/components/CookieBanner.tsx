import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {useAnalytics} from '@shopify/hydrogen';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const {customerPrivacy} = useAnalytics();

  useEffect(() => {
    if (customerPrivacy?.shouldShowBanner()) setIsVisible(true);

    const showPreferences = () => setIsVisible(true);
    window.addEventListener('flashbind:show-cookie-preferences', showPreferences);

    return () => {
      window.removeEventListener('flashbind:show-cookie-preferences', showPreferences);
    };
  }, [customerPrivacy]);

  const saveConsent = (allowOptionalCookies: boolean) => {
    if (!customerPrivacy) {
      setConsentError('Privacy controls are still loading. Please try again.');
      return;
    }

    setIsSaving(true);
    setConsentError(null);
    customerPrivacy.setTrackingConsent(
      {
        analytics: allowOptionalCookies,
        marketing: allowOptionalCookies,
        preferences: allowOptionalCookies,
        sale_of_data: false,
      },
      (result) => {
        setIsSaving(false);
        if (result?.error) {
          setConsentError('We could not save your choice. Please try again.');
          return;
        }

        setIsVisible(false);
      },
    );
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] p-4 md:p-6 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-6 md:p-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-6 md:items-center justify-between pointer-events-auto">
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1E3A8A]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your Privacy, Your Choice</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Essential cookies keep the store and checkout working. With your permission, optional cookies help us understand site usage and improve our marketing. We do not sell personal information.
            Read our <Link to="/cookie-policy" className="text-[#1E3A8A] font-semibold hover:underline">Cookie Policy</Link> or <Link to="/privacy-policy" className="text-[#1E3A8A] font-semibold hover:underline">Privacy Policy</Link> for details.
          </p>
          {consentError && (
            <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
              {consentError}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
          <button 
            onClick={() => saveConsent(false)}
            disabled={isSaving}
            className="px-6 py-3 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            Reject Non-Essential
          </button>
          <button 
            onClick={() => saveConsent(true)}
            disabled={isSaving}
            className="px-6 py-3 rounded-full text-sm font-bold text-white bg-[#1E3A8A] hover:bg-[#172A66] shadow-[0_4px_15px_rgba(30,58,138,0.2)] transition-all whitespace-nowrap"
          >
            Allow Optional Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
