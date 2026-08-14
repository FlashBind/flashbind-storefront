import {type MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Services'}];
};

export default function Services() {
  return (
    <div className="container mx-auto px-6 py-32 max-w-7xl min-h-screen text-center">
      <div className="inline-block mb-6 px-4 py-2 rounded-full border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 text-[#1E3A8A] text-sm font-bold tracking-widest uppercase">
        Enterprise
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">Our Services</h1>
      <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
        Discover how FlashBind can transform your business with our custom NFC solutions. We provide tailored hardware for hospitality, retail, and corporate networking.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Custom Branding</h3>
          <p className="text-slate-600 mb-6">Want your logo on our NFC cards and stands? We offer high-quality UV printing and laser engraving for bulk orders.</p>
          <a href="mailto:info@flashbind.com" className="text-[#1E3A8A] font-bold hover:underline">Contact Sales →</a>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Bulk Provisioning</h3>
          <p className="text-slate-600 mb-6">Equip your entire team with pre-programmed smart business cards, fully managed via a central spreadsheet before delivery.</p>
          <a href="mailto:info@flashbind.com" className="text-[#1E3A8A] font-bold hover:underline">Contact Sales →</a>
        </div>
      </div>
    </div>
  );
}
