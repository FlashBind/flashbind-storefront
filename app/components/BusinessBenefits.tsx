export function BusinessBenefits({ isProductPage = false }: { isProductPage?: boolean }) {
  return (
    <div className="bg-white border-y border-slate-200 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Why FlashBind for Business?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-10 text-center flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:bg-white hover:-translate-y-1">
            <div className="w-16 h-16 bg-blue-100 text-[#1E3A8A] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isProductPage ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                )}
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{isProductPage ? 'Real-Time Updates' : 'Bulk Encoding'}</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              {isProductPage 
                ? 'Update your destination URL instantly from our free dashboard anytime, anywhere.' 
                : 'Zero manual setup. We pre-program your entire order with custom payloads before shipping.'}
            </p>
          </div>
          
          {/* Column 2 */}
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-10 text-center flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:bg-white hover:-translate-y-1">
            <div className="w-16 h-16 bg-blue-100 text-[#1E3A8A] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isProductPage ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                )}
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{isProductPage ? 'Commercial Grade' : '100% White-Labeled'}</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              {isProductPage 
                ? 'Built to withstand high-traffic hospitality and retail environments. Premium UV-printed and water-resistant.' 
                : 'Your brand is the star. Upload your own artwork, or let us handle the custom design layout for you at no extra cost. Premium UV printing ensures your logo looks perfect in any environment.'}
            </p>
          </div>
          
          {/* Column 3: Optional Software */}
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-10 text-center flex flex-col items-center transition-all duration-300 hover:shadow-xl hover:bg-white hover:-translate-y-1">
            <div className="w-16 h-16 bg-blue-100 text-[#1E3A8A] rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Optional Software</h3>
            <p className="text-slate-500 text-[15px] leading-relaxed">Purchase the hardware once and use it without a monthly plan. Upgrade with optional FlashBind software when your business needs additional tools.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
