import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Refund Policy'}];
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">Refund Policy</h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="font-semibold text-slate-900">Last updated: September 5, 2026</p>
            
            <p>We want you to be completely satisfied with your FlashBind NFC products. If you are not entirely satisfied with your purchase, we’re here to help.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Returns</h2>
            <p>Contact info@flashbind.com before returning an item so we can confirm the return address and instructions. Eligibility depends on the item, its condition and any mandatory consumer rights that apply to your purchase.</p>
            <p><strong>Custom products:</strong> Personalized, custom-printed or specially encoded products may not be eligible for a change-of-mind return where permitted by applicable law. This does not limit rights relating to defective, damaged or incorrectly supplied goods.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Refunds</h2>
            <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
            <p>If your return is approved, we will initiate a refund to your original payment method. The time needed for the credit to appear depends on the payment provider’s processing times.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Software Subscriptions</h2>
            <p>FlashBind does not currently sell a paid software subscription through this storefront. The cancellation and refund terms for any future plan will be shown before purchase.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Shipping for Returns</h2>
            <p>Return-shipping responsibility depends on the reason for the return and applicable law. Contact us before shipping anything back. If an item arrives damaged, defective or incorrect, include photographs and the order number in your message.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p>If you have any questions on how to return your item to us, contact us at info@flashbind.com.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
