import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Privacy Policy'}];
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="font-semibold text-slate-900">Last updated: October 24, 2026</p>
            
            <p>At FlashBind, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our NFC hardware and services.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Names, phone numbers, email addresses, and mailing addresses.</li>
              <li>Payment information required to process your orders securely.</li>
              <li>Links and URLs that you explicitly program into your dashboard for NFC tag routing.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To fulfill and manage your orders, payments, returns, and exchanges.</li>
              <li>To dynamically route your NFC tags based on the preferences saved in your dashboard.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Children's Privacy (COPPA Compliance)</h2>
            <p>Our website and services are not intended for or directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child under 13 has provided us with personal information without your consent, please contact us immediately at info@flashbind.com so we can promptly delete such information from our systems.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p>If you have questions or comments about this notice, you may email us at info@flashbind.com or by post to our registered office.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
