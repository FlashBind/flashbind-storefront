import {Link} from 'react-router';

const PRODUCT_LINKS = [
  {to: '/products/google-review-stand', title: 'Google Review Stand', text: 'Customers tap to leave a review.'},
  {to: '/products/nfc-restaurant-menu-stand', title: 'Menu Stand', text: 'Guests tap or scan to open your menu.'},
  {to: '/products/guest-wi-fi-hub', title: 'Wi-Fi Stand', text: 'Share your network without spelling it out.'},
  {to: '/products/smart-pet-collar-tag', title: 'Smart Pet Tag', text: 'A tap shows your contact details.'},
];

function ErrorShell({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-[70vh] bg-[#FDFCF8] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{background: 'linear-gradient(110deg, rgba(253,252,248,0) 25%, rgba(37,99,235,0.07) 50%, rgba(34,211,238,0.06) 70%, rgba(253,252,248,0) 90%)'}}
      />
      <div className="container mx-auto px-6 max-w-5xl relative z-10 py-20 md:py-28">{children}</div>
    </div>
  );
}

/** Friendly, branded page for addresses that don't exist (404). */
export function NotFoundPage() {
  return (
    <ErrorShell>
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-block mb-6 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-xs md:text-sm font-bold tracking-widest uppercase">
          Error 404
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-5">
          Nothing here to tap.
        </h1>
        <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-10">
          This page doesn&apos;t exist or has moved. Here are a few places that do.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-full bg-[#1E3A8A] text-white font-bold hover:bg-[#172A66] transition-colors">
            Back to the homepage
          </Link>
          <Link to="/contact" className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-full bg-white border border-slate-200 text-slate-900 font-bold hover:border-[#1E3A8A] transition-colors">
            Contact us
          </Link>
        </div>
      </div>

      <h2 className="sr-only">Our products</h2>
      <ul className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRODUCT_LINKS.map((p) => (
          <li key={p.to}>
            <Link to={p.to} className="block h-full bg-white/80 border border-slate-200 rounded-3xl p-6 hover:border-[#1E3A8A] hover:shadow-[0_8px_30px_rgba(30,58,138,0.08)] transition-all">
              <span className="block text-lg font-bold text-slate-900 mb-1">{p.title}</span>
              <span className="block text-sm text-slate-500">{p.text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center">
        <Link to="/collections/all" className="text-[#1E3A8A] font-bold underline">See all products</Link>
      </p>
    </ErrorShell>
  );
}

/**
 * Page for unexpected errors. Technical details are passed in only during
 * development, so internal messages never reach visitors.
 */
export function ServerErrorPage({status, detail}: {status: number; detail?: string}) {
  return (
    <ErrorShell>
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-block mb-6 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-xs md:text-sm font-bold tracking-widest uppercase">
          Error {status}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-5">
          Something went wrong.
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-10">
          Please try again in a moment. If it keeps happening, let us know and we&apos;ll look into it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-full bg-[#1E3A8A] text-white font-bold hover:bg-[#172A66] transition-colors">
            Back to the homepage
          </Link>
          <Link to="/contact" className="inline-flex items-center justify-center min-h-[48px] px-8 rounded-full bg-white border border-slate-200 text-slate-900 font-bold hover:border-[#1E3A8A] transition-colors">
            Contact us
          </Link>
        </div>
        {detail && (
          <pre className="mt-10 text-left text-xs bg-slate-900 text-slate-100 rounded-2xl p-4 overflow-x-auto">{detail}</pre>
        )}
      </div>
    </ErrorShell>
  );
}
