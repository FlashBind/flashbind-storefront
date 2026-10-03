import {Link, type MetaFunction} from 'react-router';
import {pageMeta, SITE_INTRO} from '~/config/seo';
import {PRODUCT_INFO, CUSTOM_STAND_QUOTE, quoteUrl} from '~/config/products';
import {SellerDetails} from '~/components/SellerDetails';

export const meta: MetaFunction = () => pageMeta('about');

// The founder's own words (approved 2026-10-03).
const FOUNDER_WHY =
  'Good experiences should feel effortless. I started FlashBind so that one tap of a phone is all it takes.';

const FACTS = [
  {label: 'Founded by', value: 'Valerij Golovatyj'},
  {label: 'Based in', value: 'Klaipėda, Lithuania'},
  {label: 'Working with', value: 'Businesses and pet owners across Europe'},
];

const PRODUCTS = ['google-review-stand', 'guest-wi-fi-hub', 'nfc-restaurant-menu-stand', 'smart-pet-collar-tag'] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] py-20 md:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[10%] w-[600px] h-[600px] bg-[#F5F4EE] rounded-full blur-[100px] opacity-80" />
        <div className="absolute bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-[#1E3A8A]/5 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <header className="text-center mb-14">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-sm font-bold tracking-widest uppercase">
            About
          </div>
          <h1 className="text-4xl md:text-6xl font-medium text-slate-900 tracking-tighter mb-6">
            One tap. <span className="text-[#1E3A8A] italic font-serif">Real results.</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {SITE_INTRO}
          </p>
        </header>

        <dl className="grid gap-4 sm:grid-cols-3 mb-14">
          {FACTS.map((fact) => (
            <div key={fact.label} className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 text-center">
              <dt className="text-xs font-bold uppercase tracking-widest text-slate-400">{fact.label}</dt>
              <dd className="mt-2 text-lg font-semibold text-slate-900">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <figure className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-12 mb-14">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#1E3A8A] mb-5">Why FlashBind</h2>
          <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-slate-900 tracking-tight">
            &ldquo;{FOUNDER_WHY}&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-slate-500">
            <span className="font-semibold text-slate-900">Valerij Golovatyj</span>, founder
          </figcaption>
        </figure>

        <section className="mb-14">
          <h2 className="text-3xl font-medium text-slate-900 tracking-tighter mb-6 text-center">What we make</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((handle) => (
              <Link
                key={handle}
                to={`/products/${handle}`}
                className="group bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 hover:-translate-y-1 hover:border-[#1E3A8A]/30 transition-all duration-300"
              >
                <h3 className="font-bold text-slate-900 group-hover:text-[#1E3A8A]">{PRODUCT_INFO[handle].name}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{PRODUCT_INFO[handle].blurb}</p>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-center text-slate-600">
            Need your own brand on it? Custom-designed stands with your logo are available on request.{' '}
            <Link to={quoteUrl(CUSTOM_STAND_QUOTE)} className="font-semibold text-[#1E3A8A] underline">
              Request a quote
            </Link>
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 items-stretch">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Company</h2>
            <p className="text-slate-600 mb-3">FlashBind products are sold by:</p>
            <SellerDetails className="text-slate-900 leading-relaxed" />
          </div>
          <div className="bg-slate-900 rounded-3xl p-8 flex flex-col justify-between text-white">
            <div>
              <h2 className="text-2xl font-medium tracking-tight mb-3">Let&apos;s talk</h2>
              <p className="text-slate-300 leading-relaxed">
                Questions, bulk orders or a custom stand: we reply within one business day.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/contact" className="text-center px-6 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-colors">
                Contact us
              </Link>
              <Link to="/quote" className="text-center px-6 py-3 border border-white/30 font-bold rounded-full hover:bg-white/10 transition-colors">
                Request a quote
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
