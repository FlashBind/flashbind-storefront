import type {MetaFunction} from 'react-router';
import {Link} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Software & Subscriptions'}];
};

const PRICING_TIERS = [
  {
    id: 'hardware-only',
    name: 'Hardware Only',
    price: 'Included',
    subtitle: 'No monthly fee.',
    features: [
      'FlashBind product activation',
      'Direct link to a website, menu, review page or pet profile',
      'Editable destination',
      'Essential pet profile',
      'Product continues working without a subscription'
    ],
    ctaText: 'Shop Hardware',
    ctaLink: '/products',
    isPopular: false,
  },
  {
    id: 'growth',
    name: 'FlashBind Growth',
    price: '€9.99 / month',
    billingLabel: 'per business location',
    badge: 'MOST POPULAR',
    features: [
      'Everything included with the hardware',
      'Branded smart landing pages',
      'Tap and button-click analytics',
      'Private customer feedback inbox',
      'Email feedback notifications',
      'Manage multiple FlashBind products at one location',
      'Menu, social media and review-page buttons',
      'Downloadable monthly reports'
    ],
    ctaText: 'Start with Growth',
    ctaLink: '#',
    isPopular: true,
  },
  {
    id: 'business',
    name: 'FlashBind Business',
    price: 'Custom',
    subtitle: 'For growing and multi-location businesses.',
    features: [
      'Everything in Growth',
      'Multi-location dashboard',
      'Staff accounts and permissions',
      'Combined location reporting',
      'Data exports',
      'Custom domain options',
      'Priority onboarding and support',
      'Custom integrations'
    ],
    ctaText: 'Contact Sales',
    ctaLink: '/contact',
    isPopular: false,
  }
];

const PRODUCT_EXPLANATIONS = [
  {
    id: 'google-review-stand',
    title: 'Google Review Stand',
    description: 'Collect public reviews and private feedback through one neutral, branded experience.'
  },
  {
    id: 'digital-menu',
    title: 'Digital Menu',
    description: 'Link directly to your existing menu or use an optional FlashBind-hosted menu that can be updated without reprinting.'
  },
  {
    id: 'guest-wifi',
    title: 'Guest Wi-Fi',
    description: 'Provide straightforward Wi-Fi access and optionally display a branded welcome page with useful business links.'
  },
  {
    id: 'smart-pet-tag',
    title: 'Smart Pet Tag',
    description: 'Essential pet details remain available without a subscription. Advanced recovery features may be introduced separately in the future.'
  }
];

const FAQS = [
  {
    q: "Does FlashBind hardware work without a subscription?",
    a: "Yes. FlashBind hardware works without a subscription."
  },
  {
    q: "Can I link directly to my existing website?",
    a: "Yes. Businesses with an existing website can link directly to it without using our landing pages."
  },
  {
    q: "What happens if I cancel Growth?",
    a: "Cancelling Growth disables premium pages and analytics but keeps the product connected to its last direct destination."
  },
  {
    q: "What do Guest Wi-Fi analytics track?",
    a: "Guest Wi-Fi analytics represent page visits or card interactions, not confirmed Wi-Fi connections."
  },
  {
    q: "Are pet tags included in business billing?",
    a: "No. Pet tags are not included in business-location billing."
  },
  {
    q: "Do you use fake testimonials or statistics?",
    a: "No fake testimonials, fabricated statistics, fake urgency or unsupported compatibility guarantees may be added."
  }
];

export default function SoftwarePrototype() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden font-sans">
      {/* Ambient Lighting - Reduced on mobile to prevent interference */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 @media (prefers-reduced-motion: reduce) { hidden }">
        <div className="absolute top-[2%] -right-[20%] md:top-[5%] md:-right-[10%] w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-[#F5F4EE] rounded-full blur-[80px] md:blur-[120px] opacity-60 md:opacity-80"></div>
        <div className="absolute bottom-[10%] -left-[20%] md:bottom-[20%] md:-left-[10%] w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-[#F3F0E6] rounded-full blur-[60px] md:blur-[100px] opacity-40 md:opacity-60"></div>
      </div>

      {/* Hero Section */}
      <section className="pt-16 md:pt-24 pb-12 md:pb-16 px-4 sm:px-6 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 md:mb-6 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-xs md:text-sm font-bold tracking-widest uppercase">
            Software & Subscriptions
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 md:mb-6 leading-[1.1] sm:leading-tight">
            One dashboard.<br className="block sm:hidden" /> Smarter NFC experiences.
          </h1>
          <p className="text-slate-500 text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-2">
            Keep every FlashBind destination current, understand how your products are used, and manage customer interactions from one place.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 md:py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {PRICING_TIERS.map((tier) => (
            <div 
              key={tier.id} 
              className={`bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-2 flex flex-col relative h-full transition-all duration-300 ${
                tier.isPopular ? 'border-[#1E3A8A] md:-translate-y-4 shadow-[0_20px_40px_rgba(30,58,138,0.1)]' : 'border-slate-100 hover:border-slate-200 md:hover:-translate-y-1'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1E3A8A] text-white text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md whitespace-nowrap">
                  {tier.badge}
                </div>
              )}
              
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
              <div className="mb-2 md:mb-4">
                <span className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{tier.price}</span>
              </div>
              <p className="text-slate-500 font-medium text-sm md:text-base h-10 md:h-12 mb-2">
                {tier.billingLabel || tier.subtitle}
              </p>
              
              <Link 
                to={tier.ctaLink} 
                className={`block w-full py-3.5 md:py-4 text-center rounded-full font-bold transition-all duration-300 mb-6 md:mb-8 min-h-[44px] flex items-center justify-center ${
                  tier.isPopular 
                    ? 'bg-[#1E3A8A] text-white hover:bg-[#172A66] shadow-[0_4px_15px_rgba(30,58,138,0.3)] hover:shadow-[0_6px_20px_rgba(30,58,138,0.4)]' 
                    : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tier.ctaText}
              </Link>
              
              <ul className="space-y-3 md:space-y-4 flex-grow">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-slate-600 text-sm md:text-base">
                    <svg className={`w-5 h-5 mr-3 mt-0.5 shrink-0 ${tier.isPopular ? 'text-[#1E3A8A]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback Page Preview Mockup */}
      <section className="py-10 md:py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto bg-slate-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-blue-600 rounded-full mix-blend-screen filter blur-[60px] md:blur-[80px] opacity-30 md:opacity-40"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 md:mb-4">Neutral, Un-Gated Feedback</h2>
              <p className="text-slate-300 text-sm md:text-base mb-2 md:mb-6 leading-relaxed">
                Our smart landing pages are designed to give every visitor equally visible options. We never ask customers if they are happy before showing the public review option.
              </p>
            </div>
            
            <div className="w-full max-w-[280px] shrink-0 bg-white rounded-3xl p-5 md:p-6 shadow-xl text-center mx-auto">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-full mx-auto mb-3 md:mb-4"></div>
              <h4 className="text-slate-900 font-bold mb-1 md:mb-2 text-sm md:text-base">How was your experience?</h4>
              <p className="text-slate-500 text-xs md:text-sm mb-5 md:mb-6">Your feedback helps us improve.</p>
              
              <div className="flex flex-col gap-3">
                <button className="w-full bg-[#1E3A8A] text-white rounded-xl py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 min-h-[44px]">
                  <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Leave a Public Review
                </button>
                <button className="w-full bg-slate-100 text-slate-800 rounded-xl py-3.5 font-semibold text-sm hover:bg-slate-200 transition-colors min-h-[44px]">
                  Send Private Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works With Your Products */}
      <section className="py-10 md:py-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center mb-8 md:mb-12">How it works with your products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {PRODUCT_EXPLANATIONS.map((product) => (
              <div key={product.id} className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{product.title}</h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact FAQ */}
      <section className="py-10 md:py-16 px-4 sm:px-6 relative z-10 border-t border-slate-200/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 md:mb-8 text-center md:text-left">Important Details</h2>
          <div className="space-y-3 md:space-y-4">
            {FAQS.map((faq, index) => (
              <details key={index} className="group border border-slate-200 rounded-xl bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-5 md:p-6 text-slate-900 font-bold transition-colors hover:text-blue-600 min-h-[44px]">
                  <span className="text-sm md:text-base pr-4">{faq.q}</span>
                  <span className="shrink-0 transition duration-300 group-open:-rotate-180 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 md:px-6 md:pb-6 text-slate-600 text-sm md:text-base leading-relaxed">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

