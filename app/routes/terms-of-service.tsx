import type {MetaFunction} from 'react-router';
import {Link} from 'react-router';
import {PolicyLayout, PolicyHeading, PolicySubheading} from '~/components/PolicyLayout';
import {SellerDetails} from '~/components/SellerDetails';
import {SELLER, sellerName} from '~/config/seller';
import {pageMeta} from '~/config/seo';

// DRAFT for legal review (LEGAL-001). Separate rules for consumers and
// business customers; EU consumer law as the baseline.

export const meta: MetaFunction = () => pageMeta('terms');

const link = 'text-[#1E3A8A] underline';

export default function TermsOfServicePage() {
  return (
    <PolicyLayout title="Terms of Service">
      <PolicyHeading>1. Who we are</PolicyHeading>
      <p>The FlashBind website, products and online service are provided by:</p>
      <SellerDetails className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm" />
      <p>In these terms, &ldquo;we&rdquo; and &ldquo;us&rdquo; mean {sellerName()}.</p>

      <PolicyHeading>2. Consumers and business customers</PolicyHeading>
      <p>
        You are a <strong>consumer</strong> if you buy mainly for yourself, outside your trade, business or profession
        (for example a pet tag for your own pet). You are a <strong>business customer</strong> if you buy for a business,
        for example a café, restaurant, hotel or shop, even if you use a personal account.
      </p>
      <p>
        Some rules differ: the right of withdrawal applies only to consumers and business customers have their own returns rule (section 6), the warranty differs
        (section 7), and liability and applicable law differ (sections 10 and 12). Nothing in these terms limits the
        rights consumers have under the law of their country.
      </p>

      <PolicyHeading>3. Orders and contract</PolicyHeading>
      <p>
        You order through our online checkout, which is operated by Shopify. The contract is made when we confirm your
        order by email. If we can&apos;t accept an order (for example because a product is unavailable or a price was
        clearly wrong), we tell you and refund any payment in full.
      </p>
      <p>
        Prices are in euros. For customers in the EU, prices include VAT where it applies. Delivery costs are shown at
        checkout before you pay.
      </p>

      <PolicyHeading>4. Payment</PolicyHeading>
      <p>
        You pay at checkout using one of the payment methods shown there. Payments are processed by Shopify and its
        payment providers; we don&apos;t receive or store your full card details.
      </p>

      <PolicyHeading>5. Delivery</PolicyHeading>
      <p>
        Delivery is covered in our <Link to="/shipping-policy" className={link}>Shipping Policy</Link>. We are responsible
        for your order until it is delivered.
      </p>

      <PolicyHeading>6. Right of withdrawal and returns</PolicyHeading>
      <p>
        Consumers can withdraw from a purchase within 14 days of receiving it, without giving a reason, and we extend
        this to 30 days as a returns promise. Custom-branded
        products made with your own logo or design are excluded. Full details and the model withdrawal form are in
        our <Link to="/refund-policy#right-of-withdrawal" className={link}>Returns and Refunds policy</Link>.
      </p>
      <p>
        Business customers don&apos;t have the legal right of withdrawal, but can return products that are unused,
        undamaged, in their original packaging and not activated within 30 days of receiving them. The business pays
        the return shipping, and the original delivery cost is refunded only if the product is faulty; custom-branded
        products are excluded. Faulty products are always covered by the warranty
        (section 7). See <Link to="/refund-policy#business-returns" className={link}>Returns for business customers</Link>.
      </p>

      <PolicyHeading>7. Warranty</PolicyHeading>
      <p>
        Consumers have a 2-year legal guarantee. Business customers have a 12-month warranty. See
        our <Link to="/warranty" className={link}>Warranty</Link> page.
      </p>

      <PolicyHeading>8. Your FlashBind account and products</PolicyHeading>
      <p>
        To set up a product, you create a free FlashBind account (you must be at least 14 years old) and activate the product with the activation code
        that comes with it. You are responsible for keeping your login details safe and for everything done with your
        account. Tell us straight away at <a href={`mailto:${SELLER.email}`} className={link}>{SELLER.email}</a> if you
        think someone else has used it.
      </p>
      <p>
        You choose what each product shows: a link (for example your Google review page or menu), your Wi-Fi network
        name and password, or a pet profile. <strong>This information is visible to anyone who taps or scans the
        product.</strong> Only add information you are happy to share. Your account email is never shown.
      </p>
      <p>
        You must not use a product to link to anything illegal, harmful or misleading, such as malware, phishing or
        content that infringes someone else&apos;s rights. We may disable a product&apos;s link if it breaks this rule,
        and we will tell you why.
      </p>

      <PolicyHeading>9. The online service</PolicyHeading>
      <p>
        Your products work through pages hosted by us, and you manage them in your FlashBind account. This service is
        included in the product price; no subscription is needed. We work to keep it available but can&apos;t
        guarantee it will never be interrupted, for example during maintenance. If we ever have to stop the service,
        we will give you reasonable advance notice.
      </p>
      <PolicySubheading>Paid software plans</PolicySubheading>
      <p>
        We are developing optional paid plans for businesses (such as branded landing pages and a feedback inbox).
        They are not available to buy yet. If we introduce them, their price and terms will be shown to you before you
        sign up, and your products will keep working without a paid plan.
      </p>

      <PolicyHeading>10. Liability</PolicyHeading>
      <p>
        <strong>Consumers:</strong> we are responsible for loss or damage you suffer that is a foreseeable result of us
        breaking these terms or failing to use reasonable care and skill. Nothing in these terms limits our liability
        where the law does not allow it, including for death or personal injury caused by our negligence, for fraud, or
        under your legal rights for faulty products.
      </p>
      <p>
        <strong>Business customers:</strong> we are not liable for indirect or consequential loss, or for loss of
        profit, revenue, business or data. Our total liability for each order is limited to the amount you paid for
        it. These limits don&apos;t apply to liability for intent or gross negligence, for death or personal injury, or
        where the law does not allow them.
      </p>

      <PolicyHeading>11. Business customers: other rules</PolicyHeading>
      <ul className="list-disc pl-6 space-y-1">
        <li>We issue an invoice with VAT shown. If you give a valid EU VAT number from another EU country, the reverse-charge rules may apply.</li>
        <li>For custom-branded orders, production starts only after you approve the design proof in writing. You confirm you have the right to use any logo or artwork you send us.</li>
        <li>You are responsible for the links and details your staff set up on your products.</li>
      </ul>

      <PolicyHeading>12. Applicable law and disputes</PolicyHeading>
      <p>
        <strong>Consumers:</strong> these terms are governed by the law of {SELLER.confirmed ? SELLER.country : 'the country where we are registered'}.
        If you live in another country, you also keep the protection of the mandatory consumer law of your country,
        and you can bring a claim in the courts of your country. If you have a complaint, please contact us first; we
        aim to solve it quickly.{' '}
        {SELLER.confirmed
          ? `If we can't agree, you can contact ${SELLER.consumerDisputeBody}, or the consumer protection authority in your country.`
          : "If we can't agree, you can contact the consumer protection authority in your country."}
      </p>
      <p>
        <strong>Business customers:</strong> these terms are governed by the law
        of {SELLER.confirmed ? SELLER.country : 'the country where we are registered'}, and the courts of the place of
        our registered office have jurisdiction.
      </p>

      <PolicyHeading>13. Changes to these terms</PolicyHeading>
      <p>
        We may update these terms, for example when the law or our service changes. The version that applies to an
        order is the one shown when you placed it. For your FlashBind account, we will tell you about important
        changes in advance.
      </p>

      <PolicyHeading>14. Contact</PolicyHeading>
      <p>
        Questions about these terms: <a href={`mailto:${SELLER.email}`} className={link}>{SELLER.email}</a>. How we handle
        personal data is explained in our <Link to="/privacy-policy" className={link}>Privacy Policy</Link>.
      </p>
    </PolicyLayout>
  );
}
