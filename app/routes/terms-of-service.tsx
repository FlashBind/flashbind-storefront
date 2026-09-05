import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Terms of Service'}];
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="font-semibold text-slate-900">Last updated: September 5, 2026</p>
            
            <p>Welcome to FlashBind. These Terms of Service (“Terms”) govern your use of the FlashBind website, products, and software services. By accessing or using our services, you agree to be bound by these Terms.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Use of Services</h2>
            <p>FlashBind provides NFC-enabled physical products and a corresponding digital routing dashboard. You agree to use these services only for lawful purposes. You are strictly prohibited from programming FlashBind NFC hardware to link to malicious software, phishing websites, or illegal content.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. User Accounts</h2>
            <p>To access the digital dashboard, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Purchases and Payment</h2>
            <p>Available payment methods, prices, taxes, shipping charges and the final order total are shown during checkout or in a written quote. You agree to provide current, complete and accurate purchase and account information.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Software Subscriptions</h2>
            <p>FlashBind does not currently sell a paid software subscription through this storefront. Any software pricing or features shown on a preview page are proposals only. The applicable price, billing interval, cancellation terms and feature availability will be presented before a future subscription purchase.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h2>
            <p>In no event will FlashBind, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
