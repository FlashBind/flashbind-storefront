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
            <p className="font-semibold text-slate-900">Last updated: September 5, 2026</p>
            
            <p>At FlashBind, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our NFC hardware and services.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Names, phone numbers, email addresses, and mailing addresses.</li>
              <li>Order and payment-status information supplied through our commerce provider. Payment-card details are processed by the checkout provider rather than stored in the FlashBind dashboard.</li>
              <li>Links and URLs that you explicitly program into your dashboard for NFC tag routing.</li>
              <li>Pet-profile details that you choose to publish, such as an owner name, contact details, photograph and medical notes.</li>
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

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Cookies and Tracking Technologies</h2>
            <p>We use essential cookies for storefront, account and checkout functions. With permission where required, optional analytics, preference or marketing technologies may also be used. You can review your choice through “Cookie Preferences” in the footer.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Data Sharing and Third Parties</h2>
            <p>We do not sell personal information. We use service providers, including Shopify for the storefront and checkout, Supabase for account and product-profile data, and email-delivery providers for operational messages. They process information as needed to provide their services to FlashBind.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. European Privacy Rights (GDPR Compliance)</h2>
            <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. Your rights include: the right to access, update or delete your information; the right of rectification; the right to object; the right of restriction; the right to data portability; and the right to withdraw consent. To exercise any of these rights, please contact us.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. California Privacy Rights (CCPA Compliance)</h2>
            <p>If you are a resident of California, the California Consumer Privacy Act (CCPA) provides you with specific rights regarding your personal information. You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past 12 months. You also have the right to request the deletion of your personal information. We do not sell your personal data. We will not discriminate against you for exercising any of your CCPA rights.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Children’s Privacy</h2>
            <p>Our website and services are not intended for or directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child under 13 has provided us with personal information without your consent, please contact us immediately at info@flashbind.com so we can promptly delete such information from our systems.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Contact Us</h2>
            <p>If you have questions, comments, or requests regarding this Privacy Policy or your data rights, email info@flashbind.com.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
