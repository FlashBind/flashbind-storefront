import type {ReactNode} from 'react';
import {POLICIES_LAST_UPDATED} from '~/config/seller';

/** Shared frame for the legal pages (same look as the previous pages). */
export function PolicyLayout({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="min-h-screen bg-gray-50 py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h1 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tighter mb-8">{title}</h1>
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="font-semibold text-slate-900">Last updated: {POLICIES_LAST_UPDATED}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PolicyHeading({id, children}: {id?: string; children: ReactNode}) {
  return (
    <h2 id={id} className="text-2xl font-bold text-slate-900 mt-8 mb-4">
      {children}
    </h2>
  );
}

export function PolicySubheading({children}: {children: ReactNode}) {
  return <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">{children}</h3>;
}
