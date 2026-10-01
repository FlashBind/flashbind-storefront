import {Form, useActionData, useNavigation} from 'react-router';
import {useState, type CSSProperties} from 'react';
import {DEFAULT_BRAND_COLOR, inkOnBrandColor} from '~/utils/brandColor';

// Google policy (no review gating): both options are always shown, with the
// same size and style, in a fixed order, and nothing is asked before them.
// Keep it that way -- see PLAN_DUAL_CHOICE_FEEDBACK.md.

type Props = {
  tagId: string;
  businessName: string;
  logo: string | null;
  locationLabel: string;
  /** Lowercase #rrggbb, or null for the default. */
  brandColor?: string | null;
  initiallyShowForm: boolean;
  sent: boolean;
};

type ActionResult = {error?: string} | undefined;

const OPTION_CLASS =
  'flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[color:var(--brand)] bg-white px-5 py-4 text-lg font-bold text-slate-900 transition-colors hover:bg-[color:var(--brand)] hover:text-[color:var(--brand-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300';

const INPUT_CLASS =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';

export function DualChoicePage({tagId, businessName, logo, locationLabel, brandColor, initiallyShowForm, sent}: Props) {
  const actionData = useActionData() as ActionResult;
  const navigation = useNavigation();
  const [showForm, setShowForm] = useState(initiallyShowForm || Boolean(actionData?.error));
  const sending = navigation.state === 'submitting';
  const name = businessName || 'this business';
  // Both options get the same brand styling, so neither is favoured.
  const brand = brandColor || DEFAULT_BRAND_COLOR;
  const brandStyle = {'--brand': brand, '--brand-ink': inkOnBrandColor(brand)} as CSSProperties;

  return (
    <div style={brandStyle} className="min-h-screen w-full bg-slate-50 p-4 font-sans md:flex md:items-center md:justify-center">
      <main className="mx-auto w-full max-w-[420px] rounded-[2rem] bg-white p-7 text-center shadow-xl md:p-9">
        {logo ? (
          <img src={logo} alt="" className="mx-auto mb-4 h-20 w-20 rounded-2xl object-contain" />
        ) : null}
        <h1 className="text-2xl font-extrabold text-slate-900">{businessName || 'Share your experience'}</h1>
        {locationLabel ? (
          <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-slate-500">{locationLabel}</p>
        ) : null}

        {sent ? (
          <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6" role="status">
            <p className="text-lg font-bold text-emerald-900">Thank you.</p>
            <p className="mt-1 text-emerald-900">Your message was sent privately to the team.</p>
          </div>
        ) : !showForm ? (
          <>
            <p className="mb-7 mt-6 text-slate-600">
              Share your experience: publicly on Google, or privately with the team.
            </p>
            <div className="flex flex-col gap-4">
              <a href={`/p/${tagId}/google`} rel="nofollow" className={OPTION_CLASS}>
                Leave a Google review
              </a>
              <a
                href="?feedback=1"
                rel="nofollow"
                className={OPTION_CLASS}
                onClick={(event) => {
                  event.preventDefault();
                  setShowForm(true);
                }}
              >
                Send private feedback
              </a>
            </div>
          </>
        ) : (
          <Form method="post" className="mt-6 space-y-4 text-left">
            <p className="text-center text-slate-600">Your message goes privately to the team at {name}.</p>

            {actionData?.error ? (
              <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
                {actionData.error}
              </p>
            ) : null}

            {/* Honeypot: hidden from people, filled in by bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="website">Website</label>
              <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-semibold text-slate-700">
                Your message
              </label>
              <textarea id="message" name="message" required maxLength={2000} rows={5} className={INPUT_CLASS} />
            </div>

            <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-700">Contact details (optional)</legend>
              <input type="text" name="contact_name" maxLength={100} autoComplete="name" placeholder="Name" aria-label="Name" className={INPUT_CLASS} />
              <input type="email" name="contact_email" maxLength={254} autoComplete="email" placeholder="Email" aria-label="Email" className={INPUT_CLASS} />
              <input type="tel" name="contact_phone" maxLength={40} autoComplete="tel" placeholder="Phone" aria-label="Phone" className={INPUT_CLASS} />
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" name="contact_consent" value="yes" className="mt-1 h-4 w-4" />
                <span>{name} may contact me about this.</span>
              </label>
            </fieldset>

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-full bg-[color:var(--brand)] py-4 text-lg font-bold text-[color:var(--brand-ink)] transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {sending ? 'Sending…' : 'Send privately'}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="block w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              Back
            </button>

            <p className="text-xs leading-relaxed text-slate-500">
              {name} receives your message through FlashBind. Please don&apos;t include sensitive personal
              information. Contact details are only saved if you tick the box. Messages are deleted after 12
              months. <a href="/privacy-policy" className="underline">Privacy Policy</a>
            </p>
          </Form>
        )}
      </main>
    </div>
  );
}
