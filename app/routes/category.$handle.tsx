import type {LoaderFunctionArgs, MetaFunction} from 'react-router';
import {useLoaderData} from 'react-router';
import {useAside} from '~/components/Aside';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `FlashBind | ${data?.title || 'Category'}`}];
};

type TrendingProduct = {
  id: string;
  name: string;
  description: string;
  price: string;
  comparePrice?: string;
  reviews: number;
  badge?: string;
  badgeColor?: string;
  colors?: string[];
  categoryId: string;
  availableForSale?: boolean;
  tags?: string[];
};

const ALL_PRODUCTS: TrendingProduct[] = [
  {
    id: 'p-1',
    name: 'Smart Business Card (Metal)',
    description: 'Premium matte metal finish with instant tap-to-share networking technology.',
    price: '$39.99',
    comparePrice: '$49.99',
    reviews: 241,
    badge: 'Bestseller',
    badgeColor: 'bg-white/95 text-slate-800',
    colors: ['bg-slate-900', 'bg-slate-300', 'bg-yellow-500'],
    categoryId: 'business-cards'
  },
  {
    id: 'p-1b',
    name: 'Smart Business Card (Bamboo)',
    description: 'Eco-friendly bamboo finish with built-in NFC for sustainable networking.',
    price: '$29.99',
    reviews: 145,
    categoryId: 'business-cards'
  },
  {
    id: 'p-2',
    name: 'Google Review Stand',
    description: 'Perfect for countertops. Let customers review your business with a single tap.',
    price: '$24.99',
    reviews: 892,
    badge: 'Selling Fast',
    badgeColor: 'bg-slate-800/90 text-white',
    categoryId: 'review-stands'
  },
  {
    id: 'p-3',
    name: 'Smart Pet Collar Tag',
    description: 'Keep your pets safe. Tap to reveal owner contact details instantly.',
    price: '$19.99',
    reviews: 118,
    badge: 'Low Stock',
    badgeColor: 'bg-slate-800/90 text-white',
    colors: ['bg-[#1E3A8A]', 'bg-pink-500', 'bg-slate-900'],
    categoryId: 'pet-tags',
    tags: ['selling-fast']
  },
  {
    id: 'p-4',
    name: 'Guest Wi-Fi Hub',
    description: 'Minimalist acrylic stand. Allow guests to connect to your network instantly without passwords.',
    price: '$29.99',
    reviews: 312,
    categoryId: 'wifi-hubs',
    availableForSale: false
  }
];

export async function loader({params}: LoaderFunctionArgs) {
  const handle = params.handle;
  
  let title = 'Category';
  let description = 'Explore our NFC products.';
  let products = ALL_PRODUCTS;

  if (handle === 'business-cards') {
    title = 'Corporate Business Cards';
    description = 'Elevate your networking with premium smart business cards.';
    products = ALL_PRODUCTS.filter(p => p.categoryId === 'business-cards');
  } else if (handle === 'review-stands') {
    title = 'Google Review Stands';
    description = 'Boost your local SEO and collect 5-star reviews effortlessly.';
    products = ALL_PRODUCTS.filter(p => p.categoryId === 'review-stands');
  } else if (handle === 'pet-tags') {
    title = 'Smart Pet Tags';
    description = 'Keep your furry friends safe with tap-to-scan digital profiles.';
    products = ALL_PRODUCTS.filter(p => p.categoryId === 'pet-tags');
  } else if (handle === 'wifi-hubs') {
    title = 'Guest Wi-Fi Hubs';
    description = 'Seamless password-free connection for your customers and guests.';
    products = ALL_PRODUCTS.filter(p => p.categoryId === 'wifi-hubs');
  } else if (handle === 'individuals') {
    title = 'For Individuals';
    description = 'Personal smart tech designed for your everyday life.';
    products = ALL_PRODUCTS.filter(p => ['pet-tags', 'business-cards'].includes(p.categoryId));
  }

  return { title, description, products, handle };
}

export default function CategoryPage() {
  const { title, description, products } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[#FDFCF8] py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -right-[10%] w-[800px] h-[800px] bg-[#F5F4EE] rounded-full blur-[120px] opacity-80"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[600px] h-[600px] bg-[#F3F0E6] rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="mb-16 text-center">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-sm font-bold tracking-widest uppercase">
            Collection
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">{title}</h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">{description}</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <TrendingProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No products found</h2>
            <p className="text-slate-500">Check back later for new arrivals in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrendingProductCard({ product }: { product: TrendingProduct }) {
  const {open} = useAside();
  
  const priceAmount = parseFloat(product.price.replace('$', ''));
  const compareAmount = product.comparePrice ? parseFloat(product.comparePrice.replace('$', '')) : null;
  const isSale = compareAmount !== null && compareAmount > priceAmount;
  const isSoldOut = product.availableForSale === false;
  const isSellingFast = product.tags?.includes('selling-fast') || product.id?.includes('pet') || product.name.toLowerCase().includes('pet');

  return (
    <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(30,58,138,0.4)] transition-all duration-500 group border-2 border-white/80 hover:border-[#1E3A8A] relative overflow-hidden flex flex-col h-full">
      <div className="relative z-10 flex flex-col h-full">
        <div className="relative z-10 flex flex-col items-start gap-2 absolute top-4 left-4 z-20">
            {isSoldOut ? (
              <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm">
                Sold Out
              </div>
            ) : isSellingFast ? (
              <div className="bg-orange-500 text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                Selling Fast
              </div>
            ) : isSale ? (
              <div className="bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm">
                Sale
              </div>
            ) : null}
          </div>
          <div className="bg-gradient-to-tr from-slate-100/80 to-white/90 border border-white shadow-inner rounded-[2rem] h-64 mb-8 overflow-hidden relative group/image cursor-pointer flex flex-col items-center justify-center shrink-0">
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 transition-opacity duration-500 opacity-100">
            <svg className="w-12 h-12 text-slate-300 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/></svg>
            <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Image Placeholder</span>
          </div>

          {product.badge && (
            <div className={`absolute top-4 left-4 ${product.badgeColor || 'bg-slate-900/90 text-white'} backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-md z-10`}>
              {product.badge}
            </div>
          )}
        </div>
        
        <h3 className="text-2xl font-sans font-extrabold text-slate-900 mb-2 tracking-tight group-hover:text-[#1E3A8A] transition-colors duration-300 cursor-pointer shrink-0">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-3 shrink-0">
          <div className="flex text-yellow-400 text-[10px]">★★★★★</div>
          <span className="text-xs font-bold text-slate-400">({product.reviews})</span>
        </div>
        <p className="font-sans text-slate-500 text-[15px] mb-6 leading-relaxed line-clamp-3 grow">{product.description}</p>
      
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 shrink-0">
          <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">One-time price</span>
             {isSale && (
               <span className="text-xs text-slate-400 line-through decoration-slate-300 font-medium mb-0.5">
                 {product.comparePrice}
               </span>
             )}
             <span className={`text-2xl font-extrabold ${isSale ? 'text-[#1E3A8A]' : 'text-slate-900'}`}>{product.price}</span>
          </div>
          <button 
            onClick={() => open('cart')}
            className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-[#1E3A8A] hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-[0_10px_20px_rgba(30,58,138,0.2)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
