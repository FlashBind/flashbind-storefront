import {Form, Link, useActionData, useNavigation} from 'react-router';
import type {ActionFunctionArgs, MetaFunction} from 'react-router';
import {getSupabaseAdmin} from '~/utils/supabase.server';
import {getFormText, normalizeEmail} from '~/utils/requestSecurity.server';
import {purgeExpiredContactMessages} from '~/utils/retention.server';
import {sendEmailNotification} from '~/utils/email.server';

// Business subscription page (SUB-001). Based on the software preview from
// fix/storefront-credibility, reworked: subscriptions cover Google Review,
// Menu and Wi-Fi stands only (not pet tags); what works today is separated
// from what is coming; no public price -- businesses request founding-
// customer pricing instead.

export const meta: MetaFunction = () => [
  {title: 'FlashBind | Business Subscription (coming soon)'},
  {
    name: 'description',
    content:
      'FlashBind stands work today with no subscription. An optional business subscription for Google Review, Menu and Wi-Fi stands is in development. Request founding-customer pricing.',
  },
];

const PRODUCTS = ['Google Review stand', 'Menu stand', 'Wi-Fi stand'] as const;
const LOCATIONS = ['1', '2–5', '6 or more'] as const;
const CONSENT_TEXT =
  'I agree that FlashBind may email me about founding-customer pricing and the subscription launch. I can unsubscribe at any time.';

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = normalizeEmail(formData.get('email'));
  if (!email) return {error: 'Please enter a valid email address.'};
  if (formData.get('consent') !== 'yes') {
    return {error: 'Please tick the box so we can email you about pricing.'};
  }

  const business = getFormText(formData, 'business', 120) ?? '';
  const locationsRaw = formData.get('locations');
  const locations = LOCATIONS.find((l) => l === locationsRaw) ?? '';
  const products = formData
    .getAll('products')
    .filter((p): p is (typeof PRODUCTS)[number] => PRODUCTS.includes(p as (typeof PRODUCTS)[number]));

  const message = [
    'Founding-customer pricing request',
    `Business: ${business || '(not given)'}`,
    `Locations: ${locations || '(not given)'}`,
    `Interested in: ${products.length ? products.join(', ') : '(not given)'}`,
    `Consent given ${new Date().toISOString()}: "${CONSENT_TEXT}"`,
  ].join('\n');

  const supabase = getSupabaseAdmin(context);
  const {error} = await supabase.from('contact_messages').insert([{email, message, type: 'founding_pricing'}]);
  if (error) {
    console.error('Failed to save founding-pricing request:', error.code || 'unknown');
    return {error: 'Something went wrong. Please try again later.'};
  }
  await purgeExpiredContactMessages(supabase);

  // The request is saved either way; the email alert is a convenience.
  const apiKey = (context.env as any).RESEND_API_KEY;
  const adminEmail = (context.env as any).NOTIFICATION_EMAIL || (context.env as any).ADMIN_EMAIL;
  if (apiKey && adminEmail) {
    await sendEmailNotification({
      subject: 'New founding-customer pricing request',
      email,
      message,
      type: 'Founding pricing',
      adminEmail,
      apiKey,
    });
  }

  return {success: true};
}

function Badge({tone, children}: {tone: 'live' | 'soon'; children: React.ReactNode}) {
  const cls =
    tone === 'live'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-[#1E3A8A]/5 text-[#1E3A8A] border-[#1E3A8A]/20';
  return (
    <span className={`inline-block px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-widest ${cls}`}>
      {children}
    </span>
  );
}

const WORKS_TODAY = [
  'Activate each stand with the code that comes with it.',
  'Choose where it points (your Google review page or menu link) or set your Wi-Fi name and password, and change it any time.',
  'See all your stands in one FlashBind account.',
  'No subscription and no monthly fee.',
];

const COMING = [
  {
    title: 'Google Review: Dual Choice page and feedback inbox',
    text: 'One page with two equal options: leave a public Google review, or send private feedback that arrives in your FlashBind account with an email alert. Nobody is filtered away from Google.',
    next: true,
  },
  {title: 'Menu: hosted menu page', text: 'A simple menu page hosted by FlashBind that you can update without reprinting.'},
  {title: 'Wi-Fi: branded welcome page', text: 'Your network details plus links to your menu, social media and review page.'},
  {title: 'Tap and button analytics', text: 'How often your stands are tapped and which buttons are used. For Wi-Fi this counts page visits, not confirmed connections.'},
  {title: 'Several locations and staff accounts', text: 'For businesses with more than one venue.'},
];

export default function SubscriptionPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans">
      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-10 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-5"><Badge tone="soon">Business subscription · coming soon</Badge></div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-5 leading-tight">
            Your stands work today. More is on the way.
          </h1>
          <p className="text-slate-500 text-base md:text-xl leading-relaxed">
            Google Review, Menu and Wi-Fi stands work on their own, with no subscription. We&apos;re building an optional
            subscription for businesses. Founding customers help shape it and get special pricing.
          </p>
        </div>
      </section>

      {/* Works today vs coming soon */}
      <section className="px-4 sm:px-6 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 border-2 border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-3"><Badge tone="live">Works today · free</Badge></div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Included with every stand</h2>
            <ul className="space-y-3">
              {WORKS_TODAY.map((item) => (
                <li key={item} className="flex items-start text-slate-600 text-sm md:text-base">
                  <svg className="w-5 h-5 mr-3 mt-0.5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 bg-white rounded-[2rem] p-6 md:p-8 border-2 border-[#1E3A8A]/15 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-3"><Badge tone="soon">Coming soon · subscription</Badge></div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">In development</h2>
            <p className="text-slate-500 text-sm mb-5">For Google Review, Menu and Wi-Fi stands. Not available to buy yet; order and timing may change.</p>
            <ul className="space-y-4">
              {COMING.map((item) => (
                <li key={item.title} className="border-l-2 border-[#1E3A8A]/20 pl-4">
                  <p className="font-bold text-slate-900">
                    {item.title}
                    {item.next && <span className="ml-2 text-[11px] font-bold uppercase tracking-widest text-[#1E3A8A]">first</span>}
                  </p>
                  <p className="text-slate-600 text-sm">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="max-w-6xl mx-auto mt-4 text-sm text-slate-500 text-center">
          Pet tags are not part of the subscription: pet profiles stay free.
        </p>
      </section>

      {/* Founding-customer pricing */}
      <section id="founding-pricing" className="px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-2xl mx-auto bg-slate-900 text-white rounded-[2rem] p-6 sm:p-10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Request founding-customer pricing</h2>
          <p className="text-slate-300 mb-6">
            Leave your email and we&apos;ll send you founding-customer pricing before the subscription launches. No
            payment and no commitment.
          </p>

          {actionData && 'success' in actionData ? (
            <p className="bg-emerald-500/15 border border-emerald-400/40 rounded-2xl p-4" role="status">
              Thank you. We&apos;ll email you founding-customer pricing before launch.
            </p>
          ) : (
            <Form method="post" className="space-y-4">
              <div>
                <label htmlFor="fp-email" className="block text-sm font-semibold mb-1">Email <span className="text-red-400">*</span></label>
                <input id="fp-email" name="email" type="email" required autoComplete="email" maxLength={254}
                  className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fp-business" className="block text-sm font-semibold mb-1">Business name</label>
                  <input id="fp-business" name="business" type="text" maxLength={120} autoComplete="organization"
                    className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label htmlFor="fp-locations" className="block text-sm font-semibold mb-1">Locations</label>
                  <select id="fp-locations" name="locations" defaultValue=""
                    className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Choose…</option>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <fieldset>
                <legend className="block text-sm font-semibold mb-2">Interested in</legend>
                <div className="flex flex-wrap gap-4">
                  {PRODUCTS.map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="products" value={p} className="w-4 h-4" /> {p}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-start gap-3 text-sm text-slate-300">
                <input type="checkbox" name="consent" value="yes" required className="mt-1 w-4 h-4" />
                <span>
                  {CONSENT_TEXT} See our <Link to="/privacy-policy" className="underline text-white">Privacy Policy</Link>.
                </span>
              </label>
              {actionData && 'error' in actionData && (
                <p className="bg-red-500/15 border border-red-400/40 rounded-2xl p-3 text-sm" role="alert">{actionData.error}</p>
              )}
              <button type="submit" disabled={submitting}
                className="w-full min-h-[48px] rounded-full bg-white text-slate-900 font-bold hover:bg-blue-50 disabled:opacity-60">
                {submitting ? 'Sending…' : 'Request founding-customer pricing'}
              </button>
            </Form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-10 md:py-16 border-t border-slate-200/60">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Questions</h2>
          {[
            ['Do the stands need a subscription?', 'No. Every stand works on its own with the free features above.'],
            ['What happens to my stand if I stop a subscription later?', 'It keeps working and points to its last direct link.'],
            ['Will you ever ask customers if they are happy before showing Google?', "No. The review page always shows both options equally, as Google's review policy requires."],
            ['When does the subscription launch, and what will it cost?', "We haven't set a date or public price yet. Founding customers hear first."],
            ['Are pet tags included?', 'No. Pet tags are not part of the subscription, and pet profiles stay free.'],
          ].map(([q, a]) => (
            <details key={q} className="group border border-slate-200 rounded-xl bg-white shadow-sm">
              <summary className="cursor-pointer p-5 font-bold text-slate-900 min-h-[44px]">{q}</summary>
              <p className="px-5 pb-5 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
