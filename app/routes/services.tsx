import type {MetaFunction} from 'react-router';
import {Link} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Services'}];
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-[#F5F4EE] rounded-full blur-[100px] opacity-80"></div>
        <div className="absolute bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="mb-20 text-center">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-sm font-bold tracking-widest uppercase">
            B2B Services
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">Elevate Your Brand</h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">Discover our premium B2B services tailored for enterprise clients, restaurant chains, and corporate orders.</p>
        </div>

        <div className="space-y-24">
          {/* Service 1 - Centered Text Only */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 to-transparent opacity-50"></div>
            <div className="relative z-10 w-16 h-16 bg-white shadow-md border border-slate-100 rounded-2xl flex items-center justify-center text-[#1E3A8A] mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h2 className="relative z-10 text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Custom White-Labeling</h2>
            <p className="relative z-10 text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">Want your logo on our hardware? We offer custom UV printing for corporate orders and restaurant chains. Ensure every tap reflects your unique brand identity perfectly.</p>
            <Link to="/contact" className="relative z-10 w-full sm:w-auto inline-block text-center px-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-[#1E3A8A] hover:scale-105 shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-300 text-lg">
              Request a Quote
            </Link>
          </div>

          {/* Service 2 - Centered Text Only */}
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-50 to-transparent opacity-50"></div>
            <div className="relative z-10 w-16 h-16 bg-white shadow-md border border-slate-100 rounded-2xl flex items-center justify-center text-[#1E3A8A] mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="relative z-10 text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Bulk NFC Encoding</h2>
            <p className="relative z-10 text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl">Save time. We can pre-program your entire order with your custom URLs or Wi-Fi payloads before shipping. Deploy thousands of units instantly with zero manual setup.</p>
            <Link to="/contact" className="relative z-10 w-full sm:w-auto inline-block text-center px-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-[#1E3A8A] hover:scale-105 shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-300 text-lg">
              Contact Sales
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
