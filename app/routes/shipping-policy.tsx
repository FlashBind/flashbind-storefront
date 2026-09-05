import type {MetaFunction} from 'react-router';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Shipping Policy'}];
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-8">Shipping Policy</h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
            <p className="font-semibold text-slate-900">Last updated: September 5, 2026</p>
            
            <p>Thank you for visiting and shopping at FlashBind. Following are the terms and conditions that constitute our Shipping Policy.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Processing Time</h2>
            <p>The processing estimate available for your item will be shown at checkout or confirmed in a written quote. Custom work begins only after the required artwork, specifications and proof approval are complete.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Custom & Bulk Orders</h2>
            <p>Production time for custom printing, encoding or bulk orders varies by specification and quantity. We will confirm the expected production schedule in the quote or order confirmation.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Shipping Rates & Delivery Estimates</h2>
            <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
            <p>Any delivery date shown by a carrier or at checkout is an estimate rather than a guarantee unless explicitly agreed in writing.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Shipment Confirmation & Order Tracking</h2>
            <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Damages</h2>
            <p>If an order arrives damaged or appears lost, contact info@flashbind.com with the order number and supporting photographs where applicable. Keep the product and packaging while the issue is reviewed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
