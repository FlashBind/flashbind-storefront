import type {MetaFunction} from 'react-router';
import {Link} from 'react-router';
import {PolicyLayout, PolicyHeading} from '~/components/PolicyLayout';
import {SellerDetails} from '~/components/SellerDetails';
import {SELLER, sellerName} from '~/config/seller';

// DRAFT for legal review (LEGAL-001). GDPR privacy notice. The data list
// matches what the code stores as of 2026-09-26; keep it in sync.

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Privacy Policy'}];
};

const link = 'text-[#1E3A8A] underline';

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>
        This policy explains what personal data we collect when you use the FlashBind website, products and online
        service, why we use it, who processes it for us, how long we keep it, and your rights under the EU General Data
        Protection Regulation (GDPR).
      </p>

      <PolicyHeading>1. Who is responsible for your data</PolicyHeading>
      <p>The data controller is:</p>
      <SellerDetails className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm" />
      <p>
        For any privacy question or request, email <a href={`mailto:${SELLER.email}`} className={link}>{SELLER.email}</a>.
      </p>

      <PolicyHeading>2. What we collect and why</PolicyHeading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-slate-200">
          <thead className="bg-slate-50 text-slate-900">
            <tr>
              <th className="text-left p-3 border-b">Data</th>
              <th className="text-left p-3 border-b">Why</th>
              <th className="text-left p-3 border-b">Legal basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border-b align-top"><strong>Account:</strong> email address and password (stored only in scrambled, hashed form by our login provider).</td>
              <td className="p-3 border-b align-top">To let you log in and manage your products.</td>
              <td className="p-3 border-b align-top">Contract (Art. 6(1)(b))</td>
            </tr>
            <tr>
              <td className="p-3 border-b align-top"><strong>Product settings you enter:</strong> links (e.g. review page, menu); Wi-Fi network name and password; pet profile (pet name, owner name, phone number, medical notes, photo).</td>
              <td className="p-3 border-b align-top">To show this information to people who tap or scan your product. <strong>It is public to anyone who taps or scans the product.</strong> Your account email is not shown.</td>
              <td className="p-3 border-b align-top">Contract (Art. 6(1)(b))</td>
            </tr>
            <tr>
              <td className="p-3 border-b align-top"><strong>Orders:</strong> name, delivery and billing address, email, phone, products bought, payment status.</td>
              <td className="p-3 border-b align-top">To process, deliver and support your order, and keep accounting records.</td>
              <td className="p-3 border-b align-top">Contract (Art. 6(1)(b)); legal obligation for accounting (Art. 6(1)(c))</td>
            </tr>
            <tr>
              <td className="p-3 border-b align-top"><strong>Contact and quote requests:</strong> your email, message, and any file you attach.</td>
              <td className="p-3 border-b align-top">To answer you and prepare quotes.</td>
              <td className="p-3 border-b align-top">Steps before a contract (Art. 6(1)(b)); legitimate interest in answering enquiries (Art. 6(1)(f))</td>
            </tr>
            <tr>
              <td className="p-3 border-b align-top"><strong>Security data:</strong> IP address and a scrambled account identifier when someone tries to activate a product.</td>
              <td className="p-3 border-b align-top">To limit repeated guessing of activation codes.</td>
              <td className="p-3 border-b align-top">Legitimate interest in security (Art. 6(1)(f))</td>
            </tr>
            <tr>
              <td className="p-3 align-top"><strong>Cookies:</strong> essential cookies for login and your cart; other cookies only with your consent.</td>
              <td className="p-3 align-top">To run the site. See our <Link to="/cookie-policy" className={link}>Cookie Policy</Link>.</td>
              <td className="p-3 align-top">Necessary for the service; consent for non-essential cookies (Art. 6(1)(a))</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>We don&apos;t sell your personal data, and we don&apos;t use it for automated decision-making or profiling.</p>

      <PolicyHeading>3. Who processes your data for us</PolicyHeading>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Shopify</strong>: online store, checkout, order emails and website hosting.</li>
        <li><strong>Payment providers</strong> offered at checkout (for example PayPal or Google Pay): payments.</li>
        <li><strong>Supabase</strong>: user accounts and login, and the database storing product settings, contact messages and attachments.</li>
        <li><strong>Resend</strong>: sends us an email notification when you use the contact or quote form.</li>
        <li><strong>Delivery companies</strong>: your name, address and phone number, to deliver your order.</li>
      </ul>
      <p>
        These providers process data only on our instructions and under data processing agreements. Some of them may
        process data outside the European Economic Area, for example in the United States. Where this happens, the
        transfer is protected by an EU adequacy decision (such as the EU-US Data Privacy Framework) or by the European
        Commission&apos;s Standard Contractual Clauses.
      </p>

      <PolicyHeading>4. How long we keep data</PolicyHeading>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Account and product settings:</strong> while your account exists. You can delete your account yourself at any time from your dashboard (&ldquo;Delete account&rdquo;); this erases them immediately.</li>
        <li><strong>Orders and invoices:</strong> as long as tax and accounting law requires.</li>
        <li><strong>Contact and quote requests</strong> (including attachments): deleted automatically 2 years after they were sent.</li>
        <li><strong>Security data:</strong> deleted automatically after 30 days.</li>
      </ul>

      <PolicyHeading>5. Your rights</PolicyHeading>
      <p>You have the right to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>get a copy of your personal data (access);</li>
        <li>have incorrect data corrected;</li>
        <li>have your data deleted;</li>
        <li>restrict how we use your data;</li>
        <li>receive your data in a portable format;</li>
        <li>object to use based on our legitimate interests;</li>
        <li>withdraw consent at any time, without affecting earlier use.</li>
      </ul>
      <p>
        You can change most product settings, and delete your account, yourself in your FlashBind account. For anything else, email{' '}
        <a href={`mailto:${SELLER.email}`} className={link}>{SELLER.email}</a>. We reply within one month.
      </p>
      <p>
        You also have the right to complain to a data protection authority, in particular in the EU country where you
        live or work.{' '}
        {SELLER.confirmed ? `Our lead authority is ${SELLER.dataProtectionAuthority}.` : ''}
      </p>

      <PolicyHeading>6. Children</PolicyHeading>
      <p>
        You must be at least 14 years old to create a FlashBind account. We don&apos;t knowingly collect data from
        younger children; if you think a child has created an account, contact us and we will delete it.
      </p>

      <PolicyHeading>7. Security</PolicyHeading>
      <p>
        Access to stored data is limited to our servers and the people who need it to run the service. Passwords are
        stored only in hashed form, and the site is served over HTTPS. No online service can be completely secure, so
        please use a strong password and don&apos;t reuse it elsewhere.
      </p>

      <PolicyHeading>8. Changes to this policy</PolicyHeading>
      <p>
        We may update this policy when our service or the law changes. We show the date of the latest version at the
        top, and we tell account holders about important changes.
      </p>

      <PolicyHeading>9. Contact</PolicyHeading>
      <p>
        {sellerName()}, <a href={`mailto:${SELLER.email}`} className={link}>{SELLER.email}</a>.
      </p>
    </PolicyLayout>
  );
}
