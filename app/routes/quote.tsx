import type {MetaFunction, ActionFunctionArgs} from 'react-router';
import {useState, useEffect, useRef} from 'react';
import {useSearchParams, useActionData, useNavigation, Form} from 'react-router';
import {getSupabaseAdmin} from '~/utils/supabase.server';
import {purgeExpiredContactMessages} from '~/utils/retention.server';
import {sendEmailNotification} from '~/utils/email.server';
import {CUSTOM_STAND_QUOTE, QUOTE_OPTIONS, quoteOptionLabel} from '~/config/products';
import {pageMeta} from '~/config/seo';

export const meta: MetaFunction = () => pageMeta('quote');

/** Design files: the formats the form offers, up to 10 MB. */
const ATTACHMENT_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'ai', 'eps', 'psd'];
const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
/** The bucket is private; the email gets a link that works for 7 days. */
const ATTACHMENT_LINK_SECONDS = 7 * 24 * 60 * 60;

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const hasDesign = formData.get('has_design') === 'yes';
  const attachment = formData.get('attachment') as File | null;
  const product = quoteOptionLabel(formData.get('product'));

  if (!email || !message) {
    return {error: 'Email and project details are required.'};
  }

  const supabase = getSupabaseAdmin(context);
  let attachmentUrl = null;
  let attachmentLink: string | null = null;

  // Handle File Upload if present
  if (hasDesign && attachment && attachment.size > 0) {
    const fileExt = (attachment.name.split('.').pop() || '').toLowerCase();
    if (!ATTACHMENT_EXTENSIONS.includes(fileExt)) {
      return {error: 'Please attach a PNG, JPG, SVG, PDF, AI, EPS or PSD file.'};
    }
    if (attachment.size > ATTACHMENT_MAX_BYTES) {
      return {error: 'The file is larger than 10 MB. Please attach a smaller file or email it to us.'};
    }
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Supabase requires ArrayBuffer or Blob
    const arrayBuffer = await attachment.arrayBuffer();
    
    const {data: uploadData, error: uploadError} = await supabase.storage
      .from('attachments')
      .upload(fileName, arrayBuffer, {
        contentType: attachment.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Failed to upload file:', uploadError);
      return {error: 'Failed to upload your design file. Please try again or email it to us.'};
    }

    // Stored in this form so the retention job can find and delete the file.
    const {data: publicUrlData} = supabase.storage.from('attachments').getPublicUrl(fileName);
    attachmentUrl = publicUrlData.publicUrl;
    // The bucket is private, so the email needs a signed link.
    const {data: signed} = await supabase.storage.from('attachments').createSignedUrl(fileName, ATTACHMENT_LINK_SECONDS);
    attachmentLink = signed?.signedUrl ?? null;
  }

  const fullMessage = product ? `Product: ${product}\n\n${message}` : message;

  // Save to Supabase DB
  const {error: dbError} = await supabase.from('contact_messages').insert([{
    email,
    message: fullMessage,
    type: 'quote',
    has_design: hasDesign,
    attachment_url: attachmentUrl
  }]);

  if (dbError) {
    console.error('Failed to save quote request:', dbError);
    return {error: 'Something went wrong. Please try again later.'};
  }

  // Remove messages older than the retention period (PRIV-002).
  await purgeExpiredContactMessages(supabase);

  // Send Email Notification
  const adminEmail = (context.env as any).NOTIFICATION_EMAIL || (context.env as any).ADMIN_EMAIL;
  const apiKey = (context.env as any).RESEND_API_KEY;

  if (!apiKey || !adminEmail) {
    console.error('RESEND_API_KEY or the notification email is not set');
    return {error: 'Server misconfiguration: Email service unavailable.'};
  }

  await sendEmailNotification({
    subject: product ? `New Quote Request: ${product}` : 'New Quote Request from FlashBind',
    email,
    message: fullMessage,
    type: 'Quote Form',
    attachmentUrl: attachmentLink,
    adminEmail,
    apiKey,
  });

  return {success: true};
}

export default function QuotePage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true' || actionData?.success;
  const requested = searchParams.get('product');
  const preselected = quoteOptionLabel(requested) ? (requested as string) : '';
  const [product, setProduct] = useState(preselected);
  const isCustom = product === CUSTOM_STAND_QUOTE;
  // A custom stand needs the logo, so offer the upload straight away.
  const [hasDesign, setHasDesign] = useState<string>(preselected === CUSTOM_STAND_QUOTE ? 'yes' : 'no');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.success && formRef.current) {
      formRef.current.reset();
      setHasDesign('no');
    }
  }, [actionData]);

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden flex items-center justify-center py-24">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-[#F5F4EE] rounded-full blur-[100px] opacity-80"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-[#1E3A8A]/5 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="container mx-auto px-6 max-w-lg relative z-10">
        <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border-2 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-medium text-slate-900 tracking-tighter mb-4">Request a Quote</h1>
            <p className="text-slate-500 text-lg">
              Tell us what you need and how many. We reply within one business day with a quote.
            </p>
            <p className="mt-4 rounded-2xl border border-[#1E3A8A]/15 bg-[#1E3A8A]/5 px-4 py-3 text-sm text-slate-700">
              <strong className="text-slate-900">Custom-designed stands</strong> with your own logo and colours are
              available on request. Choose &ldquo;Custom-designed stand with your logo&rdquo; and attach your logo.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-2">Request Received!</h2>
              <p>Thanks for reaching out. We'll review your details and get back to you with a quote shortly.</p>
              <a 
                href="/quote"
                className="mt-6 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors inline-block"
              >
                Submit another request
              </a>
            </div>
          ) : (
            <Form ref={formRef} method="post" encType="multipart/form-data" className="space-y-6">
              
              {actionData?.error && (
                <div className="p-4 bg-red-50 text-red-700 font-bold rounded-xl border border-red-200">
                  {actionData.error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all outline-none text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="product" className="block text-sm font-bold text-slate-900 mb-2">
                  Product
                </label>
                <select
                  id="product"
                  name="product"
                  value={product}
                  onChange={(event) => {
                    setProduct(event.target.value);
                    if (event.target.value === CUSTOM_STAND_QUOTE) setHasDesign('yes');
                  }}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all outline-none text-slate-900"
                >
                  <option value="">Choose a product (optional)</option>
                  {QUOTE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">
                  {isCustom ? 'Do you have your logo or design ready?' : 'Do you already have a design ready?'}
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="has_design" 
                      value="yes" 
                      checked={hasDesign === 'yes'}
                      onChange={(e) => setHasDesign(e.target.value)}
                      className="w-4 h-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Yes, I have a design</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="has_design" 
                      value="no" 
                      checked={hasDesign === 'no'}
                      onChange={(e) => setHasDesign(e.target.value)}
                      className="w-4 h-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">No, I need one</span>
                  </label>
                </div>
              </div>

              {hasDesign === 'yes' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label htmlFor="design_attachment" className="block text-sm font-bold text-slate-900 mb-2">
                    Attach Your Design
                  </label>
                  <input
                    type="file"
                    id="design_attachment"
                    name="attachment"
                    accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.ai,.eps,.psd"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#1E3A8A]/10 file:text-[#1E3A8A] hover:file:bg-[#1E3A8A]/20 transition-all cursor-pointer border border-slate-200 rounded-xl bg-white/50"
                  />
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Upload your logo or design (PNG, JPG, SVG, PDF, AI, EPS or PSD, up to 10 MB).
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-900 mb-2">
                  Project Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder={isCustom ? 'How many stands, your colours, and when you need them…' : 'How many you need, your requirements and timeline…'}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all outline-none text-slate-900 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-[#1E3A8A] hover:scale-[1.02] shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Sending...' : 'Request Quote'}
              </button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
