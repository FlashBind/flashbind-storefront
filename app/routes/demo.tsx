import { Link } from 'react-router';
import type { MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
  return [{ title: 'FlashBind | Live Demo' }];
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-16 md:pt-32 pb-16 md:pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-20 items-start md:items-center">
          
          {/* Left Column: Mockup (Appears 2nd on mobile) */}
          <div className="order-2 md:order-1 flex flex-col items-center md:items-end justify-center md:justify-end w-full">
            <span className="md:hidden text-xs font-bold tracking-widest text-slate-400 uppercase text-center mb-4 block w-full border-t border-slate-200 pt-8 mt-2">
              LIVE MOBILE PREVIEW
            </span>
            <div className="w-full md:w-[350px] md:h-[700px] border border-slate-200 md:border-[14px] md:border-gray-900 rounded-3xl md:rounded-[3rem] shadow-xl md:shadow-2xl bg-white relative p-2 md:p-0 overflow-hidden">
              {/* Hardcoded Profile UI */}
              <div className="w-full h-auto md:h-full bg-white md:overflow-y-auto rounded-xl md:rounded-none shadow-sm md:shadow-none overflow-hidden" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full flex flex-col md:min-h-[800px]">
                  {/* Pet Image */}
                  <div className="h-64 md:h-72 w-full bg-slate-200 flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800" 
                      alt="Photo of Cooper" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Pet Info Content */}
                  <div className="p-5 md:p-6 flex flex-col gap-5 md:gap-6 flex-grow bg-white">
                    <div className="text-center">
                      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1 md:mb-2">Cooper</h1>
                      <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        If found, please call my owner!
                      </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-4 md:space-y-5">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Owner
                        </p>
                        <p className="text-lg md:text-xl font-semibold text-slate-900">Sarah Jenkins</p>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-full flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-slate-900">+1 (555) 123-4567</span>
                        </div>
                        
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-full flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-slate-900">sarah@example.com</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                          Medical Notes
                        </p>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                          <p className="text-sm md:text-sm font-medium text-red-900 leading-relaxed">
                            Cooper is allergic to chicken. Please do not feed him any poultry products!
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 rounded-full transition-colors text-lg mt-4 md:mt-6 cursor-default">
                      Call Owner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Explanation (Appears 1st on mobile) */}
          <div className="order-1 md:order-2 flex flex-col gap-5 md:gap-6">
            <div>
              <Link to="/products/smart-pet-collar-tag" className="inline-flex items-center text-slate-500 hover:text-blue-600 text-sm font-semibold mb-6 transition-colors group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Product Page
              </Link>
              <h1 className="text-2xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3 md:mb-4">
                This is what the finder sees.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-2 md:mb-4">
                Interact with the phone on the left to see exactly how your profile looks when scanned.
              </p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 md:gap-5 items-center">
                <div className="flex-shrink-0 bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
                    <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
                    <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8" />
                    <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">1. Tap</h3>
                  <p className="text-slate-600 text-sm md:text-lg">The finder taps their phone to the FlashBind tag.</p>
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 md:gap-5 items-center">
                <div className="flex-shrink-0 bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">2. Instant Load</h3>
                  <p className="text-slate-600 text-sm md:text-lg">This profile opens instantly—no apps required.</p>
                </div>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 md:gap-5 items-center">
                <div className="flex-shrink-0 bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    <path d="M14.05 2a9 9 0 0 1 8 7.94" />
                    <path d="M14.05 6A5 5 0 0 1 18 10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">3. Contact</h3>
                  <p className="text-slate-600 text-sm md:text-lg">One tap on "Call Owner" connects them directly to you.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 md:pt-6">
              <Link
                to="/products/smart-pet-collar-tag"
                className="w-full md:w-auto inline-flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-10 rounded-full hover:bg-blue-700 transition-all text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Get Your Tag
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
