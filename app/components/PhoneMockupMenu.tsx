import React from 'react';

export default function PhoneMockupMenu() {
  return (
    <div className="w-[350px] h-[700px] border-[14px] border-gray-900 rounded-[3rem] shadow-2xl bg-zinc-950 relative p-0 overflow-hidden flex-shrink-0 font-sans text-white">
      <div className="w-full h-full overflow-y-auto rounded-none shadow-none pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {/* Header Image */}
        <div className="w-full h-56 relative">
          <img src="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-60" alt="Restaurant interior" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 w-full text-center">
            <h1 className="text-3xl font-serif tracking-[0.2em] uppercase">Bistro Luminance</h1>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mt-2">Modern European</p>
          </div>
        </div>

        {/* Menu Navigation */}
        <div className="flex px-6 gap-6 text-xs font-semibold tracking-widest uppercase text-zinc-500 border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
          <div className="py-4 text-white border-b-2 border-white">Starters</div>
          <div className="py-4">Mains</div>
          <div className="py-4">Desserts</div>
          <div className="py-4">Drinks</div>
        </div>

        {/* Menu Items */}
        <div className="p-6">
          <h2 className="text-sm font-serif tracking-[0.15em] text-amber-500 uppercase mb-6 text-center">Starters</h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-medium tracking-wide">Seared Scallops</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Cauliflower purée, brown butter, crispy capers, micro herbs</p>
              </div>
              <span className="text-sm font-medium">$24</span>
            </div>
            
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-medium tracking-wide">Wagyu Beef Tartare</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Quail egg, truffle emulsion, pickled shallots, sourdough crisp</p>
              </div>
              <span className="text-sm font-medium">$28</span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-medium tracking-wide">Burrata Heirloom</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Heirloom tomatoes, basil oil, aged balsamic, toasted pine nuts</p>
              </div>
              <span className="text-sm font-medium">$19</span>
            </div>
          </div>

          <h2 className="text-sm font-serif tracking-[0.15em] text-amber-500 uppercase mt-10 mb-6 text-center">Mains</h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-medium tracking-wide">Black Truffle Risotto</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Aborio rice, wild mushrooms, parmesan crisp, fresh black truffle</p>
              </div>
              <span className="text-sm font-medium">$34</span>
            </div>
            
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-medium tracking-wide">Pan-Roasted Halibut</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Saffron beurre blanc, asparagus, crushed fingerling potatoes</p>
              </div>
              <span className="text-sm font-medium">$42</span>
            </div>
          </div>
        </div>

        {/* Call to waiter */}
        <div className="fixed bottom-6 w-full px-6 left-0">
          <button className="w-full bg-white text-black font-semibold tracking-wide text-sm py-4 rounded-full shadow-lg flex justify-center items-center gap-2 hover:bg-zinc-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Call Waiter
          </button>
        </div>

      </div>
    </div>
  );
}
