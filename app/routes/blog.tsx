import {Link, type MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Blog'}];
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[10%] w-[800px] h-[800px] bg-[#F5F4EE] rounded-full blur-[120px] opacity-80"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="mb-16 text-center">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-sm font-bold tracking-widest uppercase">
            Journal
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">Latest Insights</h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">News, tech trends, and tips on how to maximize your physical-to-digital conversions.</p>
        </div>

        {/* Featured Post */}
        <div className="mb-20">
          <Link to="/blogs/journal/nfc-hospitality" className="bg-white rounded-[3rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-500 flex flex-col md:flex-row gap-8 lg:gap-16 group cursor-pointer block">
            <div className="w-full md:w-3/5">
              <div className="w-full aspect-[16/9] md:aspect-auto md:h-full bg-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden">
                 <img src="/nfc_blog_featured_new.png" alt="NFC Restaurant Table Menu" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-[#1E3A8A]/10 to-transparent pointer-events-none"></div>
              </div>
            </div>
            <div className="w-full md:w-2/5 flex flex-col justify-center py-6 pr-6">
              <div className="flex items-center gap-4 mb-6">
                 <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">Technology</span>
                 <span className="text-slate-400 font-medium text-sm">Oct 24, 2026</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-6 group-hover:text-[#1E3A8A] transition-colors leading-tight">
                Why NFC is Replacing QR Codes in Hospitality
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Learn why top restaurants and hotels are ditching clunky QR codes in favor of seamless tap-to-view NFC technology to elevate the guest experience.
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full border border-slate-200 shadow-sm bg-white overflow-hidden flex items-center justify-center">
                  <img src="/flashbind-icon-centered.png" alt="FlashBind Team" className="w-full h-full object-contain scale-110 -translate-x-0.5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">FlashBind Team</p>
                  <p className="text-xs text-slate-500">5 min read</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Article Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Post 1 */}
          <Link to="/blogs/journal/google-review-seo" className="bg-white rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group cursor-pointer flex flex-col h-full block">
            <div className="w-full aspect-[4/3] bg-slate-100 rounded-[2rem] mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-slate-100">
                 <img src="/seo_blog_featured.png" alt="Google Review SEO" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Marketing</span>
               <span className="text-slate-400 font-medium text-[11px]">Oct 18, 2026</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4 group-hover:text-[#1E3A8A] transition-colors">
              How to Boost Your Local SEO with Google Review Stands
            </h3>
            <p className="text-slate-500 leading-relaxed mb-8 flex-grow">
              Discover the exact strategy local businesses are using to triple their Google Reviews in under 30 days using physical NFC endpoints.
            </p>
            <div className="flex items-center text-[#1E3A8A] font-bold text-sm">
              Read article <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          {/* Post 3: Pet Tags */}
          <Link to="/blogs/journal/smart-pet-tags" className="bg-white rounded-[2.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] transition-all duration-300 group cursor-pointer flex flex-col h-full block">
            <div className="w-full aspect-[4/3] bg-slate-100 rounded-[2rem] mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-slate-100">
                 <img src="/pet_tags_blog_featured.png" alt="Smart Pet Tags" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
               <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-widest">Pets</span>
               <span className="text-slate-400 font-medium text-[11px]">Oct 5, 2026</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4 group-hover:text-[#1E3A8A] transition-colors">
              Why Smart Pet Tags are the New Standard for Pet Safety
            </h3>
            <p className="text-slate-500 leading-relaxed mb-8 flex-grow">
              Discover how NFC-enabled pet tags are helping lost pets get home faster by providing finders with instant access to contact info and medical records.
            </p>
            <div className="flex items-center text-[#1E3A8A] font-bold text-sm">
              Read article <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
