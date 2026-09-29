import type {MetaFunction} from 'react-router';
import {Link} from 'react-router';
import {PolicyLayout, PolicyHeading} from '~/components/PolicyLayout';
import {SELLER} from '~/config/seller';

// DRAFT for legal review (LEGAL-001). Consumer part follows the EU legal
// guarantee (Directive (EU) 2019/771). The 12-month business-customer
// warranty was confirmed by the owner on 2026-09-26.

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Warranty'}];
};

export default function WarrantyPage() {
  return (
    <PolicyLayout title="Warranty">
      <PolicyHeading>1. Consumers: 2-year legal guarantee</PolicyHeading>
      <p>
        If you are a consumer, EU law gives you a legal guarantee: we are responsible for any fault (lack of conformity)
        that existed when the product was delivered and becomes apparent within 2 years of delivery. This guarantee is
        free and applies automatically.
      </p>
      <p>
        If a fault appears within the first year after delivery, it is presumed to have existed at delivery, unless we
        can show otherwise.
      </p>
      <p>If a product is faulty, you are entitled to:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>have it repaired or replaced, free of charge and within a reasonable time;</li>
        <li>if repair or replacement isn&apos;t possible, isn&apos;t done within a reasonable time, or the fault is serious: a price reduction, or to end the contract and get a refund.</li>
      </ul>
      <p>We pay the cost of sending a faulty product back to us.</p>

      <PolicyHeading>2. Business customers</PolicyHeading>
      <p>
        If you bought for your business, we repair or replace products that are faulty within 12 months of delivery. If
        neither is possible, we refund the price of the faulty product.
      </p>

      <PolicyHeading>3. What is not covered</PolicyHeading>
      <ul className="list-disc pl-6 space-y-1">
        <li>normal wear, scratches and fading from everyday use;</li>
        <li>damage caused by accidents, misuse, or changes to the product;</li>
        <li>phones that don&apos;t support NFC (the Digital Menu Stand and Guest Wi-Fi Stand also have a QR code that can be scanned with the camera; the Google Review Stand and Smart Pet Tag are NFC-only).</li>
      </ul>
      <p>These exclusions don&apos;t reduce your legal rights as a consumer.</p>

      <PolicyHeading>4. How to make a claim</PolicyHeading>
      <p>
        Email <a href={`mailto:${SELLER.email}`} className="text-[#1E3A8A] underline">{SELLER.email}</a> with your order
        number, a short description of the fault and, if possible, a photo. Please contact us as soon as you notice the
        fault. We&apos;ll tell you how to send the product back, or send a replacement directly.
      </p>
      <p>
        For returns you don&apos;t want to keep (not faults), see <Link to="/refund-policy" className="text-[#1E3A8A] underline">Returns and Refunds</Link>.
      </p>
    </PolicyLayout>
  );
}
