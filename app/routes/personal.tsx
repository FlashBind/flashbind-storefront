import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/personal';
import {useAside} from '~/components/Aside';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';

export const meta: Route.MetaFunction = () => {
  return [{title: 'FlashBind | Personal'}];
};

const PRODUCT_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      images(first: 5) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 1) {
        nodes {
          id
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: 'smart-pet-collar-tag',
    },
  });

  return {product};
}

export default function PersonalPage() {
  const {product} = useLoaderData<typeof loader>();
  const {open} = useAside();
  
  const variant = product?.variants?.nodes[0];
  // The first image is the featured image (black and white tags on wood)
  const displayImage = product?.images?.nodes[0];

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden">
      {/* Background glow for the top section */}
      <div className="absolute top-0 left-0 w-full h-[1000px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -right-[10%] w-[800px] h-[800px] bg-[#F5F4EE] rounded-full blur-[120px] opacity-80"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-[#F3F0E6] rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10 pt-24 pb-16">
        <div className="mb-16 text-center">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-sm font-bold tracking-widest uppercase">
            Product Spotlight
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">For Individuals</h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">Personal smart tech designed for your everyday life.</p>
        </div>

        {/* 1. Hero Product Expansion */}
        <div className="max-w-2xl w-full mx-auto flex justify-center items-stretch mb-24">
          <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_0_25px_rgba(30,58,138,0.2)] transition-all duration-500 group border-2 border-white/80 hover:border-[#1E3A8A]/30 relative overflow-hidden flex flex-col h-full w-full">
            <div className="relative z-10 flex flex-col h-full">
              
              {/* Product Image */}
              <Link to={`/products/${product?.handle || 'smart-pet-collar-tag'}`} className="block relative mb-8">
                <div className="bg-gradient-to-tr from-slate-100/80 to-white/90 border border-white shadow-inner rounded-[2rem] h-80 overflow-hidden relative group/image cursor-pointer flex flex-col items-center justify-center shrink-0">
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/50 mix-blend-multiply p-8">
                    {displayImage ? (
                      <Image
                        data={displayImage}
                        alt={displayImage.altText || product?.title || 'Product Image'}
                        className="w-full h-full object-contain mix-blend-multiply group-hover/image:scale-105 transition-transform duration-700 ease-out"
                        sizes="(min-width: 45em) 400px, 100vw"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <svg className="w-16 h-16 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/></svg>
                        <span className="text-sm font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 left-4 bg-slate-900 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold shadow-md z-10">
                    Bestseller
                  </div>
                </div>
              </Link>
              
              <Link to={`/products/${product?.handle || 'smart-pet-collar-tag'}`}>
                <h3 className="text-3xl font-sans font-extrabold text-slate-900 mb-3 tracking-tight text-center hover:text-[#1E3A8A] transition-colors duration-300">{product?.title || 'Smart Pet Collar Tag'}</h3>
              </Link>
              <p className="font-sans text-slate-500 text-lg mb-8 leading-relaxed text-center px-4">{product?.description || 'Keep your pets safe. Tap to reveal owner contact details instantly.'}</p>
            
              <div className="mt-auto pt-6 border-t border-slate-100 shrink-0 flex flex-col items-center">
                <div className="text-3xl font-extrabold text-slate-900 mb-6">
                  {variant?.price ? <Money data={variant.price} /> : '$19.99'}{' '}
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">One-time price</span>
                </div>
                {variant?.id ? (
                  <AddToCartButton
                    lines={[{merchandiseId: variant.id, quantity: 1}]}
                    onClick={() => open('cart')}
                    className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold text-lg hover:bg-[#1E3A8A] hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_10px_20px_rgba(30,58,138,0.25)]"
                  >
                    Add to Cart
                  </AddToCartButton>
                ) : (
                  <button className="w-full py-4 bg-slate-300 text-slate-500 rounded-2xl font-bold text-lg cursor-not-allowed">
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Visual "Benefits" Row */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Why Choose FlashBind?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-[2rem] p-8 text-center flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:bg-white">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Peace of Mind</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Real-time protection. Anyone who finds your pet can tap the tag and instantly access your emergency contact details.</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-[2rem] p-8 text-center flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:bg-white">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Built for Life</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Crafted from premium, durable materials. Fully waterproof and designed to withstand your pet's wildest adventures.</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-[2rem] p-8 text-center flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:bg-white">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tech-Forward</h3>
              <p className="text-slate-500 text-sm leading-relaxed">No app required for the finder. Powered by NFC technology, it works instantly with any modern smartphone.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Roadmap & Community Section (Footer-adjacent) */}
      <div className="bg-slate-50 border-t border-slate-200 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Future Roadmap Section */}
          <div className="max-w-3xl mx-auto text-center mb-24">
            <div className="inline-block mb-8 px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm text-slate-500 text-xs font-bold tracking-widest uppercase">
              Future Roadmap
            </div>
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg max-w-2xl mx-auto">
              <div className="w-20 h-20 mb-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-6-6h12" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">More Personal Tech</h3>
              <p className="text-slate-500 text-lg leading-relaxed">Coming Soon. We're working on exciting new ways to seamlessly connect your physical and digital worlds.</p>
            </div>
          </div>

          {/* Community Section */}
          <div className="max-w-5xl mx-auto text-center py-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Join the FlashBind Community</h2>
            <p className="text-slate-500 text-lg">Follow us on Instagram and TikTok for the latest updates, tips, and behind-the-scenes content.</p>
            <div className="flex justify-center gap-4 mt-14">
              <a href="https://instagram.com/flashbind" target="_blank" rel="noopener noreferrer" className="flex items-center border border-gray-300 rounded-full px-6 py-2.5 text-slate-700 font-medium hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] no-underline hover:no-underline transition-all duration-300 group">
                <svg className="w-5 h-5 mr-2 text-slate-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
                Follow on Instagram
              </a>
              <a href="https://www.tiktok.com/@flashbind" target="_blank" rel="noopener noreferrer" className="flex items-center border border-gray-300 rounded-full px-6 py-2.5 text-slate-700 font-medium hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] no-underline hover:no-underline transition-all duration-300 group">
                <svg className="w-5 h-5 mr-2 text-slate-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
                Follow on TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
