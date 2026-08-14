import React from 'react';

export default function PhoneMockupCooper() {
  return (
    <div className="w-[350px] h-[700px] border-[14px] border-gray-900 rounded-[3rem] shadow-2xl bg-white relative p-0 overflow-hidden flex-shrink-0">
      <div className="w-full h-full bg-white overflow-y-auto rounded-none shadow-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="w-full flex flex-col min-h-[800px]">
          {/* Pet Image */}
          <div className="h-72 w-full bg-slate-200 flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800" 
              alt="Photo of Cooper" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Pet Info Content */}
          <div className="p-6 flex flex-col gap-6 flex-grow bg-white">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Cooper</h1>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                If found, please call my owner!
              </p>
            </div>

            <div className="flex gap-3 mb-6">
              <button className="flex-1 bg-slate-900 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call
              </button>
              <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Directions
              </button>
            </div>

            {/* Info Cards */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-50">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Owner</p>
                  <p className="text-sm font-semibold text-slate-800">Sarah Jenkins</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-50">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-slate-800">+1 (415) 867-5309</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">sarah.jenkins@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Medical Alert */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Medical Information</p>
              <div className="bg-red-50 text-red-700 p-2 text-[11px] rounded-lg border border-red-100 flex items-start gap-2">
                <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                <span>Severe chicken allergy. Requires daily joint supplement.</span>
              </div>
            </div>
            
            {/* Action Button */}
            <button className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full transition-colors text-lg mt-6 cursor-default">
              Call Owner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
