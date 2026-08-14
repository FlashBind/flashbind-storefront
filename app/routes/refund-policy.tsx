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
            <p className="font-semibold text-slate-900">Last updated: October 24, 2026</p>
            
            <p>We want you to be completely satisfied with your FlashBind NFC products. If you are not entirely satisfied with your purchase, we're here to help.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Returns</h2>
            <p>You have 30 calendar days to return an item from the date you received it.</p>
            <p>To be eligible for a return, your item must be unused and in the same condition that you received it. Your item must be in the original packaging. Your item needs to have the receipt or proof of purchase.</p>
            <p><strong>Exceptions:</strong> Custom-printed or bulk-encoded orders (e.g., custom business cards with your logo) are final sale and cannot be returned unless there is a manufacturing defect or the NFC chip is non-functional upon arrival.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Refunds</h2>
            <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
            <p>If your return is approved, we will initiate a refund to your credit card (or original method of payment). You will receive the credit within a certain amount of days, depending on your card issuer's policies.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Software Subscriptions</h2>
            <p>If you are subscribed to the FlashBind "Pro" software tier, you may cancel at any time via your dashboard. We do not offer prorated refunds for canceled subscriptions; however, you will retain access to Pro features until the end of your current billing cycle.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Shipping for Returns</h2>
            <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund (if a prepaid label was provided).</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p>If you have any questions on how to return your item to us, contact us at info@flashbind.com.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
