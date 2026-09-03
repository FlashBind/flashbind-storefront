import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense, useState, useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import PhoneMockupCooper from '../components/PhoneMockupCooper';
import PhoneMockupReviews from '../components/PhoneMockupReviews';
import PhoneMockupMenu from '../components/PhoneMockupMenu';
import PhoneMockupWifi from '../components/PhoneMockupWifi';
import AmbientGlow from '../components/AmbientGlow';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import {useAside} from '~/components/Aside';

// Dedicated internal routing map for Product Detail Pages (PDPs)
export const PRODUCT_ROUTES = {
  googleReview: '/products/google-review-stand',
  petTag: '/products/smart-pet-collar-tag',
  menu: '/products/nfc-restaurant-menu-stand',
  wifi: '/products/guest-wi-fi-hub',
};

export const meta: Route.MetaFunction = ({data, matches}) => {
  const parentMeta = matches.flatMap((match) => match.meta ?? []);
  return [
    ...parentMeta.filter(
      (m) => !('name' in m && m.name === 'description') && !('title' in m)
    ),
    {title: 'FlashBind | Premium NFC Products'},
    {name: 'description', content: 'FlashBind sells premium NFC-powered products — Google Review stands, digital menu cards, guest WiFi cards, and pet tags. Tap to connect instantly, no app required.'},
    {property: 'og:title', content: 'FlashBind | Premium NFC Products'},
    {property: 'og:image', content: 'https://flashbind.com/hero_new_1.jpg'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}


const HERO_IMAGES = [
  '/hero_new_1.jpg',
  '/hero_new_2.jpg',
  '/hero_new_3.jpg',
  '/hero_new_4.jpg'
];

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  const [heroImageIndex, setHeroImageIndex] = useState(0);


  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home min-h-screen">

      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-[#FDFCF8] flex flex-col lg:flex-row">
        {/* Abstract/Minimal Background Elements */}
        <AmbientGlow />
        
        {/* Left Half: Text Column */}
        <div className="w-full lg:w-1/2 relative z-10 flex justify-center lg:justify-end">
          <div className="w-full max-w-[45rem] px-6 lg:pl-12 lg:pr-16 pt-16 pb-12 lg:py-20 mx-auto lg:ml-auto lg:mr-0 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <div className="inline-block mb-8 px-4 py-2 rounded-full border border-black/5 bg-white/40 backdrop-blur-md self-center lg:self-start">
              <span className="text-[13px] font-medium text-[#4A4A4A] flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A] opacity-80"></span>
                The future of interaction
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium mb-6 tracking-tighter text-[#1A1A1A] leading-tight lg:leading-[1.05]">
              One Tap<br />
              Everything<br />
              <span className="text-[#1E3A8A] italic font-serif">Connects</span>
            </h1>
            
            <p className="text-[#4A4A4A] text-lg md:text-xl max-w-2xl mb-10 font-light leading-relaxed tracking-tight">
              Branded NFC stands and cards that connect customers to what matters most — the moment they arrive.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start w-full gap-4">
              <Link to="/catalog" className="w-full sm:w-auto px-8 py-4 bg-[#1E3A8A] text-white font-bold rounded-full hover:bg-[#172A66] hover:scale-105 shadow-[0_10px_40px_rgba(30,58,138,0.3)] transition-all duration-300 text-base text-center">
                Explore Catalog
              </Link>
              <a href="#solutions" className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-50 hover:border-[#1E3A8A]/30 hover:text-[#1E3A8A] hover:scale-105 shadow-sm hover:shadow-md transition-all duration-300 text-base text-center">
                View Solutions
              </a>
            </div>
          </div>
        </div>

        {/* Right Half: Image Column */}
        <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-0 lg:h-auto lg:py-16 lg:pr-16 lg:pl-8 p-6 flex flex-col justify-center">
          <div className="relative w-full h-full flex-1 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(30,58,138,0.15)] border-4 border-white/60">
            {HERO_IMAGES.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt={`NFC Product Showcase ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === heroImageIndex ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
            
            {/* Floating Badge overlay */}
            <div className="absolute bottom-6 left-6 inline-block px-5 py-2.5 rounded-full border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg z-10">
              <span className="text-[13px] font-bold text-[#1A1A1A] flex items-center gap-2.5 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse"></span>
                Fully Customisable
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid Section */}
      <section id="solutions" className="py-24 bg-gradient-to-b from-white to-blue-50/30 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[10%] left-[5%] w-[30rem] h-[30rem] bg-purple-200/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-[#1E3A8A]/30 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-purple-600 text-sm font-bold tracking-[0.2em] uppercase mb-4 block">Created for you</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">For professionals and businesses</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Choose what your product opens, from Google reviews to digital business cards.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: Google Reviews */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] flex flex-col sm:flex-row items-center gap-8 group hover:-translate-y-2 transition-all duration-300">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Google Reviews</h3>
                <p className="text-slate-600 leading-relaxed mb-8 text-sm md:text-base">Direct customers instantly to your Google Review page with a single tap. Built for storefronts, cafes, and reception desks.</p>
                <Link to={PRODUCT_ROUTES.googleReview} className="text-slate-900 font-bold text-sm inline-flex items-center gap-2 hover:text-[#1E3A8A] transition-colors">
                  Learn more <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
              {/* Standardized Review Mockup */}
              <div className="w-48 md:w-64 h-[220px] md:h-[280px] bg-gradient-to-br from-[#FDFCF8] to-[#F5F4EE] rounded-[2rem] md:rounded-[2.5rem] relative flex-shrink-0 transition-transform duration-500 flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
                 <div className="absolute origin-center scale-[0.26] md:scale-[0.32] drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[0.28] md:group-hover:scale-[0.35] group-hover:-translate-y-2">
                   <PhoneMockupReviews />
                 </div>
              </div>
            </div>

            {/* Card 2: Smart Pet Tags */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] flex flex-col sm:flex-row items-center gap-8 group hover:-translate-y-2 transition-all duration-300">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Smart Pet Tags</h3>
                <p className="text-slate-600 leading-relaxed mb-8 text-sm md:text-base">Keep your best friend safe. A quick tap by any smartphone reveals the owner's contact info and pet details instantly.</p>
                <Link to={PRODUCT_ROUTES.petTag} className="text-slate-900 font-bold text-sm inline-flex items-center gap-2 hover:text-[#1E3A8A] transition-colors">
                  Learn more <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
              {/* Standardized Cooper Preview */}
              <div className="w-48 md:w-64 h-[220px] md:h-[280px] bg-gradient-to-br from-[#FDFCF8] to-[#F5F4EE] rounded-[2rem] md:rounded-[2.5rem] relative flex-shrink-0 transition-transform duration-500 flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
                 <div className="absolute origin-center scale-[0.26] md:scale-[0.32] drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[0.28] md:group-hover:scale-[0.35] group-hover:-translate-y-2">
                   <PhoneMockupCooper />
                 </div>
              </div>
            </div>

            {/* Card 3: Tap-to-View Menus */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] flex flex-col sm:flex-row items-center gap-8 group hover:-translate-y-2 transition-all duration-300">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Tap-to-View Menus</h3>
                <p className="text-slate-600 leading-relaxed mb-8 text-sm md:text-base">Modernize your hospitality business. Let customers tap your tabletop stands to view your digital menu instantly.</p>
                <Link to={PRODUCT_ROUTES.menu} className="text-slate-900 font-bold text-sm inline-flex items-center gap-2 hover:text-[#1E3A8A] transition-colors">
                  Learn more <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
              {/* Standardized Menu Mockup */}
              <div className="w-48 md:w-64 h-[220px] md:h-[280px] bg-gradient-to-br from-[#FDFCF8] to-[#F5F4EE] rounded-[2rem] md:rounded-[2.5rem] relative flex-shrink-0 transition-transform duration-500 flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
                 <div className="absolute origin-center scale-[0.26] md:scale-[0.32] drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[0.28] md:group-hover:scale-[0.35] group-hover:-translate-y-2">
                   <PhoneMockupMenu />
                 </div>
              </div>
            </div>

            {/* Card 4: Guest Wi-Fi */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] flex flex-col sm:flex-row items-center gap-8 group hover:-translate-y-2 transition-all duration-300">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Guest Wi-Fi</h3>
                <p className="text-slate-600 leading-relaxed mb-8 text-sm md:text-base">No more spelling out complex passwords. Customers can instantly connect to your guest Wi-Fi with a single tap.</p>
                <Link to={PRODUCT_ROUTES.wifi} className="text-slate-900 font-bold text-sm inline-flex items-center gap-2 hover:text-[#1E3A8A] transition-colors">
                  Learn more <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
              {/* Standardized Wifi Mockup */}
              <div className="w-48 md:w-64 h-[220px] md:h-[280px] bg-gradient-to-br from-[#FDFCF8] to-[#F5F4EE] rounded-[2rem] md:rounded-[2.5rem] relative flex-shrink-0 transition-transform duration-500 flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
                 <div className="absolute origin-center scale-[0.26] md:scale-[0.32] drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[0.28] md:group-hover:scale-[0.35] group-hover:-translate-y-2">
                   <PhoneMockupWifi />
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section className="bg-slate-50 py-24 border-y border-slate-200">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <RecommendedProducts products={data.recommendedProducts} />
        </div>
      </section>

      {/* Feature Highlight Section 1: Google Reviews */}
      <section className="py-8 md:py-16 bg-white relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            {/* Left Column (Visual) */}
            <div className="bg-gradient-to-br from-[#FDFCF8] to-[#F5F4EE] rounded-[2.5rem] p-3 h-[280px] md:h-[340px] max-w-md mx-auto w-full flex items-center justify-center relative shadow-sm border border-black/5 overflow-hidden group">
               <div className="absolute origin-center scale-[0.35] md:scale-[0.4] drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[0.38] md:group-hover:scale-[0.43] group-hover:-translate-y-2">
                 <PhoneMockupReviews />
               </div>
            </div>

            {/* Right Column (Content) */}
            <div className="flex flex-col text-left">
              <h2 className="text-slate-900 text-3xl font-bold tracking-tight mb-4">
                Google Reviews
              </h2>
              <div className="text-gray-600 text-lg leading-relaxed mb-6 space-y-3">
                <p><strong>1. Instant Tap:</strong> Customers tap the stand or card with their iPhone or Android.</p>
                <p><strong>2. Zero Friction:</strong> Your exact Google Review page opens instantly without any app downloads or typing.</p>
                <p><strong>3. Effortless Rating:</strong> The customer leaves a review in seconds, before they even leave your business.</p>
              </div>
              <Link to={PRODUCT_ROUTES.googleReview} className="inline-flex items-center text-[#1E3A8A] font-semibold text-lg hover:text-[#172A66] transition-colors group">
                Google Reviews
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlight Section 2: Instant Menus */}
      <section className="py-8 md:py-16 bg-white relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            {/* Left Column (Content) */}
            <div className="flex flex-col text-left order-last md:order-first">
              <h2 className="text-slate-900 text-3xl font-bold tracking-tight mb-4">
                Tap-to-View Menus
              </h2>
              <div className="text-gray-600 text-lg leading-relaxed mb-6 space-y-3">
                <p><strong>1. Dual Access:</strong> Diners can instantly tap via NFC or scan the printed QR code with their smartphone.</p>
                <p><strong>2. Immediate Display:</strong> Your up-to-date digital menu opens directly in their browser without any app downloads.</p>
                <p><strong>3. Effortless Browsing:</strong> Guests browse your offerings comfortably at their own pace, entirely contact-free.</p>
              </div>
              <Link to={PRODUCT_ROUTES.menu} className="inline-flex items-center text-[#1E3A8A] font-semibold text-lg hover:text-[#172A66] transition-colors group">
                Tap-to-View Menus
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Right Column (Visual) */}
            <div className="bg-gradient-to-br from-[#FDFCF8] to-[#F5F4EE] rounded-[2.5rem] p-3 h-[280px] md:h-[340px] max-w-md mx-auto w-full flex items-center justify-center relative shadow-sm border border-black/5 overflow-hidden group">
               <div className="absolute origin-center scale-[0.35] md:scale-[0.4] drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[0.38] md:group-hover:scale-[0.43] group-hover:-translate-y-2">
                 <PhoneMockupMenu />
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlight Section 3: Guest Wi-Fi */}
      <section className="py-8 md:py-16 bg-white relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            {/* Left Column (Visual) */}
            <div className="bg-gradient-to-br from-[#FDFCF8] to-[#F5F4EE] rounded-[2.5rem] p-3 h-[280px] md:h-[340px] max-w-md mx-auto w-full flex items-center justify-center relative shadow-sm border border-black/5 overflow-hidden group">
               <div className="absolute origin-center scale-[0.35] md:scale-[0.4] drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[0.38] md:group-hover:scale-[0.43] group-hover:-translate-y-2">
                 <PhoneMockupWifi />
               </div>
            </div>

            {/* Right Column (Content) */}
            <div className="flex flex-col text-left">
              <h2 className="text-slate-900 text-3xl font-bold tracking-tight mb-4">
                Guest Wi-Fi
              </h2>
              <div className="text-gray-600 text-lg leading-relaxed mb-6 space-y-3">
                <p><strong>1. Zero Friction:</strong> Visitors tap the Wi-Fi stand at the counter or table.</p>
                <p><strong>2. Secure Authentication:</strong> Their device automatically authenticates to your secure network.</p>
                <p><strong>3. Instant Connection:</strong> Guests are online instantly, completely eliminating the need to type out complex passwords.</p>
              </div>
              <Link to={PRODUCT_ROUTES.wifi} className="inline-flex items-center text-[#1E3A8A] font-semibold text-lg hover:text-[#172A66] transition-colors group">
                Guest Wi-Fi
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlight Section 4: Smart Pet Tags */}
      <section className="py-8 md:py-16 bg-white relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            {/* Left Column (Content) */}
            <div className="flex flex-col text-left order-last md:order-first">
              <h2 className="text-slate-900 text-3xl font-bold tracking-tight mb-4">
                Smart Pet Tags
              </h2>
              <div className="text-gray-600 text-lg leading-relaxed mb-6 space-y-3">
                <p><strong>1. Easy Scanning:</strong> Anyone finding your pet simply taps the collar tag.</p>
                <p><strong>2. Vital Information:</strong> The tag instantly displays your contact details and critical medical notes.</p>
                <p><strong>3. Safe Return:</strong> The finder contacts you with a single tap to bring your pet home safely.</p>
              </div>
              <Link to={PRODUCT_ROUTES.petTag} className="inline-flex items-center text-[#1E3A8A] font-semibold text-lg hover:text-[#172A66] transition-colors group">
                Smart Pet Tags
                <span className="ml-2 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

            {/* Right Column (Visual) */}
            <div className="bg-gradient-to-br from-[#FDFCF8] to-[#F5F4EE] rounded-[2.5rem] p-3 h-[280px] md:h-[340px] max-w-md mx-auto w-full flex items-center justify-center relative shadow-sm border border-black/5 overflow-hidden group">
               <div className="absolute origin-center scale-[0.35] md:scale-[0.4] drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] transition-all duration-500 group-hover:scale-[0.38] md:group-hover:scale-[0.43] group-hover:-translate-y-2">
                 <PhoneMockupCooper />
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3-Step Setup Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full opacity-30 pointer-events-none">
           <div className="absolute top-10 left-10 w-72 h-72 bg-[#1E3A8A] rounded-full mix-blend-multiply filter blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Ready in Seconds</h2>
            <p className="text-slate-500 text-lg">No apps to download. No complicated software. Just tap and grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-[48px] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-[#1E3A8A]/20 to-transparent z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center mb-8 relative transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
                <span className="absolute -top-3 -left-3 w-8 h-8 bg-[#1E3A8A] text-white font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">1</span>
                <svg className="w-10 h-10 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Order Your Tech</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs">Choose from our premium metal cards, PVC cards, or countertop stands.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center mb-8 relative transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
                <span className="absolute -top-3 -left-3 w-8 h-8 bg-[#1E3A8A] text-white font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">2</span>
                <svg className="w-10 h-10 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Scan to Activate</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs">When your tech arrives, simply tap it with your smartphone to create your account and link your product.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center mb-8 relative transform group-hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-[2.5rem] opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
                <span className="absolute -top-3 -left-3 w-8 h-8 bg-[#1E3A8A] text-white font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">3</span>
                <svg className="w-10 h-10 text-[#1E3A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Update Anytime</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs">Change your destination URL instantly from your dashboard. No need for new hardware.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Box Features Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle Background Gradients */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#1E3A8A]/20 rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-cyan-300/20 rounded-full blur-[120px] -z-10 mix-blend-multiply pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Flawless Technology</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Premium-quality NFC hardware paired with a beautifully simple dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Universal Card (Spans 2 columns on desktop) */}
            <div className="md:col-span-2 bg-white border border-slate-200 shadow-xl rounded-[2rem] p-10 flex flex-col justify-between group hover:-translate-y-1 hover:border-[#1E3A8A]/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 to-transparent opacity-50"></div>
              
              <div className="relative z-10 mb-12">
                <h3 className="text-3xl font-extrabold text-slate-900 mb-3">Universal Compatibility</h3>
                <p className="text-slate-600 max-w-sm leading-relaxed">No app required. Instantly shares your links to 99% of modern smartphones with a single tap using native OS capabilities.</p>
              </div>

              {/* Visual Apple/Android Graphic */}
              <div className="relative z-10 flex flex-row items-center justify-center gap-3 sm:gap-6 md:gap-12 py-8 px-2 bg-slate-900/5 rounded-3xl border border-slate-900/5 mx-auto w-full">
                {/* Apple */}
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.71 1.53.15 2.8.76 3.6 1.9-3.24 1.94-2.6 6.55.51 7.82-.74 1.83-1.63 3.65-2.69 3.16zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] sm:text-sm font-bold text-slate-700 whitespace-nowrap">iOS Ready</span>
                </div>
                
                {/* Glowing Wave */}
                <div className="flex gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1E3A8A] rounded-full animate-ping"></span>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1E3A8A] rounded-full animate-ping" style={{ animationDelay: '200ms' }}></span>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1E3A8A] rounded-full animate-ping" style={{ animationDelay: '400ms' }}></span>
                </div>

                {/* Android */}
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.52 10.93L19.21 8c.11-.19.04-.43-.15-.54-.19-.11-.43-.04-.54.15l-1.74 3.01C15.4 10.02 13.77 9.69 12 9.69s-3.4.33-4.78.93L5.48 7.61c-.11-.19-.35-.26-.54-.15-.19.11-.26.35-.15.54l1.69 2.93C4.21 12.35 2.62 14.94 2.15 18h19.7c-.47-3.06-2.06-5.65-4.33-7.07zM9.5 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                  </div>
                  <span className="text-[11px] sm:text-sm font-bold text-slate-700 whitespace-nowrap">Android Ready</span>
                </div>
              </div>
            </div>

            {/* Dynamic Control Card */}
            <div className="bg-white border border-slate-200 shadow-xl rounded-[2rem] p-10 flex flex-col group hover:-translate-y-1 hover:border-[#1E3A8A]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Dynamic Control</h3>
              <p className="text-slate-600 leading-relaxed text-sm">Update your destination link anytime from our dashboard without needing a new physical card.</p>
            </div>

            {/* Premium Chips Card */}
            <div className="bg-white border border-slate-200 shadow-xl rounded-[2rem] p-10 flex flex-col group hover:-translate-y-1 hover:border-[#1E3A8A]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-[#1E3A8A]/10 text-[#1E3A8A] rounded-full flex items-center justify-center mb-8 shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Premium Quality NFC</h3>
              <p className="text-slate-600 leading-relaxed text-sm">Built with modern NTAG chips to ensure instant, reliable scans from up to 2 inches away.</p>
            </div>

            {/* Optional Software Plans Card (Spans 2 columns) */}
            <div className="md:col-span-2 bg-slate-900 shadow-xl rounded-[2rem] p-10 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E3A8A]/20 rounded-full blur-[60px]"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 text-white rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Optional Software Plans</h3>
                <p className="text-slate-300 leading-relaxed max-w-md">Purchase the hardware once and use it without a monthly plan. Upgrade with optional FlashBind software when your business needs additional tools.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Custom Business Solutions Banner */}
      <section className="bg-[#1E3A8A]/[0.04] py-12 w-full border-y border-[#1E3A8A]/10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-800 font-medium text-lg">
            Ordering for multiple locations or need custom branding?{' '}
            <Link to="/services" className="inline-flex items-center text-[#1E3A8A] font-bold hover:text-[#172A66] transition-colors group ml-2">
              See our custom business solutions
              <span className="ml-1 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-lg">Everything you need to know about the technology and billing.</p>
          </div>
          
          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group bg-slate-50 rounded-2xl border border-slate-200 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex items-center justify-between p-6 font-bold text-slate-900 text-lg">
                Do I need to download an app to use this?
                <span className="transition-transform duration-300 group-open:-rotate-180 text-[#1E3A8A]">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-slate-600 px-6 pb-6 leading-relaxed">
                Absolutely not! FlashBind uses native NFC technology that is already built into 99% of modern smartphones. Simply tap the card to the back of their phone, and your link will instantly appear on their screen.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-slate-50 rounded-2xl border border-slate-200 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex items-center justify-between p-6 font-bold text-slate-900 text-lg">
                Do I need a FlashBind software plan?
                <span className="transition-transform duration-300 group-open:-rotate-180 text-[#1E3A8A]">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-slate-600 px-6 pb-6 leading-relaxed">
                No. FlashBind hardware works without a plan. Optional software plans add branded pages, customer-feedback tools, analytics and multi-location management.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-slate-50 rounded-2xl border border-slate-200 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex items-center justify-between p-6 font-bold text-slate-900 text-lg">
                Can I change the link destination later?
                <span className="transition-transform duration-300 group-open:-rotate-180 text-[#1E3A8A]">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-slate-600 px-6 pb-6 leading-relaxed">
                Yes! Your card uses dynamic linking technology. If you change your business name, get a new Google Review link, or want to link to your Instagram instead, you can easily update the destination URL from your account dashboard instantly.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-slate-50 rounded-2xl border border-slate-200 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex items-center justify-between p-6 font-bold text-slate-900 text-lg">
                Is the NFC technology secure?
                <span className="transition-transform duration-300 group-open:-rotate-180 text-[#1E3A8A]">
                  <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-slate-600 px-6 pb-6 leading-relaxed">
                100% secure. The card is "read-only", meaning it can only transmit the specific link URL you programmed into it. It cannot access any personal data on the phone that taps it, and it cannot extract any information from your customers.
              </p>
            </details>
          </div>
        </div>
      </section>

    </div>
  );
}

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

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image
            data={image}
            sizes="100vw"
            alt={image.altText || collection.title}
          />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  const [activeTab, setActiveTab] = useState<'business' | 'individuals'>('business');
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const width = carouselRef.current.offsetWidth;
      setActiveProductIndex(Math.round(scrollLeft / width));
    }
  };

  const scrollToProduct = (index: number) => {
    if (carouselRef.current) {
      const width = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <h2 id="recommended-products" className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Trending Solutions</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Select a category to view tailored products.</p>
        
        <div className="mt-8 flex justify-center">
          <div className="inline-flex bg-white rounded-full p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => { setActiveTab('business'); setActiveProductIndex(0); carouselRef.current?.scrollTo(0,0); }}
              className={`px-6 py-2.5 font-bold rounded-full text-sm transition-colors ${activeTab === 'business' ? 'bg-[#1E3A8A] text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              For Business
            </button>
            <button 
              onClick={() => { setActiveTab('individuals'); setActiveProductIndex(0); carouselRef.current?.scrollTo(0,0); }}
              className={`px-6 py-2.5 font-bold rounded-full text-sm transition-colors ${activeTab === 'individuals' ? 'bg-[#1E3A8A] text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              For Individuals
            </button>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-indigo-200 border-[#1E3A8A] rounded-full animate-spin"></div></div>}>
        <Await resolve={products}>
          {(response) => {
            const allProducts = response?.products.nodes || [];
            
            // Separate products based on whether they are for pets (individuals) or not (business)
            const businessProducts = allProducts.filter(product => !product.title.toLowerCase().includes('pet'));
            const individualProducts = allProducts.filter(product => product.title.toLowerCase().includes('pet'));
            
            const displayProducts = activeTab === 'business' ? businessProducts : individualProducts;

            return (
              <>
                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto text-left">
                  {displayProducts.length > 0 ? (
                    displayProducts.map((product) => (
                      <ProductItem key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-slate-500 py-12">
                      No products found for this category.
                    </div>
                  )}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden relative mt-8 -mx-6 px-6">
                  <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                  <div 
                    ref={carouselRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar pb-4 -mx-2 px-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {displayProducts.length > 0 ? (
                      displayProducts.map((product) => (
                        <div key={product.id} className="w-full flex-shrink-0 snap-center px-2">
                          <ProductItem product={product} />
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex-shrink-0 snap-center text-center text-slate-500 py-12">
                        No products found for this category.
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Dots */}
                {displayProducts.length > 1 && (
                  <div className="md:hidden flex justify-center gap-2 mt-4">
                    {displayProducts.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => scrollToProduct(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${activeProductIndex === idx ? 'bg-[#1E3A8A] w-6' : 'bg-slate-300'}`}
                        aria-label={`Go to product ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    availableForSale
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
