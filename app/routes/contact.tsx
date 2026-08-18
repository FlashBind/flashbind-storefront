import type {MetaFunction, ActionFunctionArgs} from 'react-router';
import {useState, useEffect, useRef} from 'react';
import {useSearchParams, useActionData, useNavigation, Form} from 'react-router';
import {getSupabaseAdmin} from '~/utils/supabase.server';
import {sendEmailNotification} from '~/utils/email.server';

export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Contact Us'}];
export const meta: MetaFunction = () => {
  return [{title: 'FlashBind | Contact Us'}];
};

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  if (!email || !message) {
    return {error: 'Email and message are required.'};
  }

  const supabase = getSupabaseAdmin(context);

  // 1. Save to Supabase
  const {error} = await supabase.from('contact_messages').insert([{
    email,
    message,
    type: 'contact',
  }]);

  if (error) {
    console.error('Failed to save contact message:', error);
    return {error: 'Something went wrong. Please try again later.'};
  }

  // 2. Send Email Notification
  await sendEmailNotification({
    subject: 'New Contact Request from FlashBind',
    email,
    message,
    type: 'Contact Form',
  });

  return {success: true};
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true' || actionData?.success;
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [actionData]);

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative overflow-hidden flex items-center justify-center py-24">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-[#F5F4EE] rounded-full blur-[100px] opacity-80"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="container mx-auto px-6 max-w-lg relative z-10">
        <div className="bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border-2 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Contact Us</h1>
            <p className="text-slate-500 text-lg">
              Have questions about bulk encoding, white-labeling, or anything else? Send us a message and we'll get right back to you.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
              <p>Thanks for reaching out. We'll get back to you shortly.</p>
              <a 
                href="/contact"
                className="mt-6 px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors inline-block"
              >
                Send another message
              </a>
            </div>
          ) : (
            <Form ref={formRef} method="post" className="space-y-6">
              
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
                <label htmlFor="message" className="block text-sm font-bold text-slate-900 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all outline-none text-slate-900 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-[#1E3A8A] hover:scale-[1.02] shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </Form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Or email us directly at <a href="mailto:info@flashbind.com" className="text-[#1E3A8A] font-bold hover:underline">info@flashbind.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
