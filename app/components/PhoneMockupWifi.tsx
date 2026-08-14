import React from 'react';

export default function PhoneMockupWifi() {
  return (
    <div className="w-[350px] h-[700px] border-[14px] border-gray-900 rounded-[3rem] shadow-2xl bg-slate-50 relative p-0 overflow-hidden flex-shrink-0 font-sans">
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50">
        
        {/* Animated Wi-Fi Icon */}
        <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
          <div className="absolute inset-4 bg-blue-200 rounded-full animate-pulse"></div>
          <div className="relative bg-blue-600 text-white p-5 rounded-full shadow-xl">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Connected to<br/>Guest Wi-Fi</h1>
          <p className="text-slate-500 font-medium text-sm">Network: <span className="text-slate-800 font-semibold">Luminance_Guest_5G</span></p>
        </div>

        {/* Connection Details Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 w-full mb-10">
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signal</span>
            <span className="text-sm font-bold text-green-600 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div> Strong
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</span>
            <span className="text-sm font-bold text-slate-700">Active</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security</span>
            <span className="text-sm font-medium text-slate-500">WPA3 Personal</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 mt-auto mb-8">
          <button className="w-full bg-white border-2 border-slate-200 text-slate-500 font-bold tracking-wide text-sm py-4 rounded-full shadow-sm">
            DISCONNECT
          </button>
          <button className="w-full bg-blue-600 text-white font-bold tracking-wide text-sm py-4 rounded-full shadow-md">
            MANAGE CONNECTION
          </button>
        </div>

      </div>
    </div>
  );
}
