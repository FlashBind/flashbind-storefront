import React from 'react';

// Decorative preview of the real Wi-Fi page (/p/{tagId}): guests see the
// network name and password and can copy the password. It never connects
// anyone automatically, so the mockup must not suggest that it does.
export default function PhoneMockupWifi() {
  return (
    <div aria-hidden="true" className="w-[350px] h-[700px] border-[14px] border-gray-900 rounded-[3rem] shadow-2xl bg-slate-50 relative p-0 overflow-hidden flex-shrink-0 font-sans pointer-events-none select-none">
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50 text-center">

        {/* Wi-Fi Icon */}
        <div className="w-24 h-24 bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-full flex items-center justify-center mb-8 shadow-sm border border-[#1E3A8A]/10">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
          </svg>
        </div>

        {/* Network name */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Guest Wi-Fi</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Network name</p>
        <p className="text-lg font-semibold text-slate-800 mb-8">Luminance_Guest</p>

        {/* Password */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</p>
          <p className="text-xl font-mono text-slate-900 font-bold">espresso2026</p>
        </div>

        {/* Copy password (illustration only) */}
        <div className="w-full bg-[#1E3A8A] text-white font-bold py-4 rounded-full text-lg shadow-sm">
          Copy password
        </div>
        <p className="text-sm text-slate-500 mt-6 leading-relaxed">
          Paste the password in your phone&apos;s Wi-Fi settings to join.
        </p>
      </div>
    </div>
  );
}
