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
            <p className="font-semibold text-slate-900">Last updated: October 24, 2026</p>
            
            <p>Thank you for visiting and shopping at FlashBind. Following are the terms and conditions that constitute our Shipping Policy.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Domestic Shipping Processing Time</h2>
            <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
            <p>If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Custom & Bulk Orders</h2>
            <p>For B2B orders involving custom UV printing or bulk pre-encoding (e.g., custom business cards or 50+ NFC Menus), please allow an additional 3-5 business days for production and quality assurance before the order is dispatched.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Shipping Rates & Delivery Estimates</h2>
            <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Standard Shipping:</strong> 3-5 business days (Free for orders over $50)</li>
              <li><strong>Expedited Shipping:</strong> 2 business days</li>
              <li><strong>Overnight Shipping:</strong> 1 business day (Cut-off time: 2 PM EST)</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Shipment Confirmation & Order Tracking</h2>
            <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Damages</h2>
            <p>FlashBind is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
