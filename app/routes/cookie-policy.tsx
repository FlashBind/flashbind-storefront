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
            <p className="font-semibold text-slate-900">Last updated: October 24, 2026</p>
            
            <p>This Cookie Policy explains how FlashBind uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. What are cookies?</h2>
            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Why do we use cookies?</h2>
            <p>We use first and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our online properties.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Types of Cookies We Use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential website cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.</li>
              <li><strong>Performance and functionality cookies:</strong> These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.</li>
              <li><strong>Analytics and customization cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.</li>
              <li><strong>Advertising cookies:</strong> These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. How can I control cookies?</h2>
            <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in our Cookie Consent Banner (available at the bottom of the screen on your first visit, or by clicking "Do Not Sell My Personal Information" in the footer).</p>
            <p>If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p>If you have questions or comments about our use of cookies or other technologies, please email us at info@flashbind.com.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
