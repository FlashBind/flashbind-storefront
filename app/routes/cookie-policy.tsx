import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Cookie Policy'}];
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">Cookie Policy</h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="font-semibold text-slate-900">Last updated: September 5, 2026</p>
            
            <p>This Cookie Policy explains how FlashBind uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. What are cookies?</h2>
            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Why do we use cookies?</h2>
            <p>Some cookies are required for the storefront, account session and checkout to operate. With permission where required, optional cookies may also be used to understand site usage and support marketing.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Types of Cookies We Use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential website cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.</li>
              <li><strong>Preferences cookies:</strong> These may remember choices you make when optional cookies are enabled.</li>
              <li><strong>Analytics cookies:</strong> With permission where required, these help us understand how the storefront is used and improve performance.</li>
              <li><strong>Marketing cookies:</strong> If marketing tools are configured and permission is given where required, these may help measure campaigns and make marketing more relevant.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. How can I control cookies?</h2>
            <p>You can accept or reject optional cookies in the consent banner. To review the choice again, select “Cookie Preferences” in the footer.</p>
            <p>If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p>If you have questions or comments about our use of cookies or other technologies, please email us at info@flashbind.com.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
