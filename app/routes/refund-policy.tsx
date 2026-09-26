import type {MetaFunction} from 'react-router';
import {Link} from 'react-router';
import {EuWithdrawalNotice} from '~/components/EuWithdrawalNotice';
import {PolicyLayout, PolicyHeading} from '~/components/PolicyLayout';
import {SELLER} from '~/config/seller';

// DRAFT for legal review (LEGAL-001).

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Returns and Refunds'}];
};

export default function RefundPolicyPage() {
  return (
    <PolicyLayout title="Returns and Refunds">
      <p>
        This policy explains how to return a product and get your money back. Your rights depend on whether you buy as
        a consumer (for yourself, outside your trade or business) or as a business customer (for example a café,
        restaurant or hotel).
      </p>

      <PolicyHeading>1. Summary</PolicyHeading>
      <ul className="list-disc pl-6 space-y-1">
        <li><strong>Consumers</strong> can return products within <strong>30 days</strong> of receiving them, without giving a reason.</li>
        <li>This includes your legal 14-day right of withdrawal, described in full below; days 15 to 30 are our extra promise.</li>
        <li>We refund you within 14 days of hearing from you, including the standard delivery cost.</li>
        <li>You pay the cost of sending the product back, unless it is faulty or we sent the wrong item.</li>
        <li>Custom-branded products made with your own logo or design can&apos;t be returned unless they are faulty.</li>
        <li>Faulty products are covered by our <Link to="/warranty" className="text-[#1E3A8A] underline">Warranty</Link>, whether you are a consumer or a business.</li>
      </ul>

      <EuWithdrawalNotice />

      <PolicyHeading id="30-day-returns">2. Our 30-day returns promise (consumers)</PolicyHeading>
      <p>
        On top of the legal 14-day right of withdrawal, consumers can return products for a refund within 30 days of
        receiving them. For returns after the first 14 days, the product must be unused, undamaged and in its original
        packaging, and not yet activated in a FlashBind account. Everything else works as described above: tell us by
        email, send the product back at your own cost within 14 days of telling us, and we refund the price and the
        standard delivery cost within 14 days of your message. Custom-branded products are excluded.
      </p>
      <p>
        This promise is in addition to your legal rights and does not limit them.
      </p>

      <PolicyHeading>3. How to return a product</PolicyHeading>
      <ol className="list-decimal pl-6 space-y-1">
        <li>Email us at <a href={`mailto:${SELLER.email}`} className="text-[#1E3A8A] underline">{SELLER.email}</a> with your order number (or use the model form above).</li>
        <li>We reply with the return address.</li>
        <li>Send the product back within 14 days of telling us (and within the 30 days), well packed. We recommend a tracked service.</li>
        <li>We refund you within 14 days of your message. We may wait until the product is back with us or you show proof you have sent it.</li>
      </ol>

      <PolicyHeading>4. Who pays for return shipping</PolicyHeading>
      <p>
        If you return a product you don&apos;t want, you pay the direct cost of returning the product. If the product is faulty,
        damaged on arrival, or not what you ordered, we pay the return cost or send you a prepaid label.
      </p>

      <PolicyHeading>5. Business customers</PolicyHeading>
      <p>
        The 14-day right of withdrawal and our 30-day returns promise apply to consumers only. If you buy for your business, you can&apos;t withdraw
        from the purchase, but faulty products are still covered by our <Link to="/warranty" className="text-[#1E3A8A] underline">Warranty</Link>.
        If you ordered the wrong product, contact us; we&apos;ll help where we can.
      </p>

      <PolicyHeading>6. Contact</PolicyHeading>
      <p>
        Questions about returns: <a href={`mailto:${SELLER.email}`} className="text-[#1E3A8A] underline">{SELLER.email}</a>.
      </p>
    </PolicyLayout>
  );
}
