import type {MetaFunction} from 'react-router';
import {Link} from 'react-router';
import {PolicyLayout, PolicyHeading} from '~/components/PolicyLayout';
import {SELLER, sellerName} from '~/config/seller';
import {SHIPPING} from '~/config/shipping';

// DRAFT for legal review (LEGAL-001). International shipping with EU
// consumer law as the baseline.

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Shipping Policy'}];
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy">
      <p>
        This policy explains where we ship, what delivery costs, how long it takes and what happens if something goes
        wrong on the way. The seller is {sellerName()}, a business based in the European Union.
      </p>

      <PolicyHeading>1. Where we ship</PolicyHeading>
      <p>
        We ship to all countries of the European Union and to most other countries worldwide. If we can&apos;t deliver
        to your address, you&apos;ll see this at checkout before you pay.
      </p>

      <PolicyHeading>2. Prices and shipping costs</PolicyHeading>
      <p>
        All prices are in euros (EUR). The shipping options available for your address and their cost are shown at
        checkout before you pay. For customers in the EU, prices include VAT where it applies.
      </p>

      <PolicyHeading>3. Processing and delivery times</PolicyHeading>
      {SHIPPING.confirmed ? (
        <>
          <p>
            We usually dispatch orders within {SHIPPING.dispatchBusinessDays} business days. Estimated delivery times
            after dispatch:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            {SHIPPING.estimates.map((e) => (
              <li key={e.region}>
                <strong>{e.region}:</strong> {e.time}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>The estimated delivery time for your address is shown at checkout before you pay.</p>
      )}
      <p>
        Unless we agree a different date with you, we deliver within 30 days of your order at the latest. Custom-branded
        orders take longer because they are produced for you; we agree the production and delivery time with you
        before you order.
      </p>
      <p>
        When your order ships, we send you an email with tracking details where the carrier provides them. Please make
        sure your delivery address is complete and correct; we can&apos;t be responsible for delays caused by an
        incorrect address.
      </p>

      <PolicyHeading>4. Who is responsible during delivery</PolicyHeading>
      <p>
        We are responsible for your order until it is delivered to you or to a person you have named. Until then, the
        risk of loss or damage stays with us.
      </p>

      <PolicyHeading>5. Lost or damaged parcels</PolicyHeading>
      <p>
        <strong>Lost:</strong> if your parcel hasn&apos;t arrived by the latest estimated delivery date, contact us.
        We&apos;ll check with the carrier and, if the parcel is lost, we&apos;ll send a replacement or give you a full
        refund, whichever you prefer.
      </p>
      <p>
        <strong>Damaged:</strong> if your order arrives damaged, please contact us as soon as possible, ideally with
        photos of the product and the packaging. We&apos;ll send a replacement or give you a full refund, whichever you
        prefer. This doesn&apos;t limit your legal rights (see our <Link to="/warranty" className="text-[#1E3A8A] underline">Warranty</Link>).
      </p>

      <PolicyHeading>6. Orders outside the EU: duties and taxes</PolicyHeading>
      <p>
        If you order from outside the European Union, your country may charge import duties, taxes (such as VAT or GST)
        and customs handling fees when the parcel arrives. These are set by your country, are not included in our
        prices unless checkout clearly says so, and are paid by the recipient. Please check your country&apos;s rules
        before you order.
      </p>
      <p>
        If a parcel is returned to us because these charges weren&apos;t paid, we refund the price of the products once
        it arrives back with us. The original shipping cost and the cost of returning the parcel to us are not refunded.
      </p>

      <PolicyHeading>7. Contact</PolicyHeading>
      <p>
        Questions about delivery: <a href={`mailto:${SELLER.email}`} className="text-[#1E3A8A] underline">{SELLER.email}</a>.
        Returns and refunds are covered in our <Link to="/refund-policy" className="text-[#1E3A8A] underline">Returns and Refunds policy</Link>.
      </p>
    </PolicyLayout>
  );
}
