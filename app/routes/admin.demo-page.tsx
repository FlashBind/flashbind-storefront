import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import {useState} from 'react';
import {getSupabaseAdmin} from '~/utils/supabase.server';
import {assertSameOrigin} from '~/utils/requestSecurity.server';
import {prepareLogo} from '~/utils/logoImage';
import {createDemoPage, DEMO_DAYS, parseDemoForm, requireAdminEmail} from '~/utils/adminTools.server';

// A Dual Choice demo for a sales visit: a demo account with the prospect's
// name, logo and colour, and one review stand whose private feedback alerts
// go to the admin. The demo subscription ends by itself after DEMO_DAYS.

export const handle = {hideLayout: true};

export const meta: MetaFunction = () => [{title: 'FlashBind | Create demo page'}, {name: 'robots', content: 'noindex'}];

export const headers: HeadersFunction = () => new Headers({'Cache-Control': 'private, no-store, max-age=0'});

export function loader({context}: LoaderFunctionArgs) {
  requireAdminEmail(context, '/admin/demo-page');
  return {demoDays: DEMO_DAYS};
}

export async function action({request, context}: ActionFunctionArgs) {
  assertSameOrigin(request);
  const adminEmail = requireAdminEmail(context, '/admin/demo-page');
  const parsed = parseDemoForm(await request.formData());
  if ('error' in parsed) return parsed;
  return createDemoPage(getSupabaseAdmin(context), parsed.value, adminEmail);
}

const INPUT_CLASS = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal';

export default function AdminDemoPage() {
  const {demoDays} = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const busy = useNavigation().state === 'submitting';
  const [logoValue, setLogoValue] = useState('');
  const [logoBackground, setLogoBackground] = useState<string | null>(null);
  const [color, setColor] = useState('#0f172a');

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="mx-auto max-w-xl py-8">
        <Link to="/dashboard" className="text-sm font-bold text-slate-400 hover:text-slate-700">
          ← Back to Dashboard
        </Link>
        <h1 className="mb-2 mt-4 text-3xl font-extrabold text-slate-900">Create demo page</h1>
        <p className="mb-6 text-sm text-slate-600">
          Creates a demo business account and one review stand with the Dual Choice page switched on. Private feedback
          alerts go to you. The demo subscription ends after {demoDays} days; then the stand sends visitors straight to
          Google. Extend or cancel it on <Link to="/admin/entitlements" className="underline">Business subscriptions</Link>.
        </p>

        {result && 'error' in result ? (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{result.error}</p>
        ) : null}

        {result && 'tagId' in result ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
            <p className="mb-3 font-bold text-emerald-900">Demo page created.</p>
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold text-slate-600">Demo page (also the NFC address)</dt>
                <dd className="break-all font-mono">
                  <a href={result.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                    {result.url}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-600">Demo account</dt>
                <dd className="break-all font-mono text-slate-900">{result.ownerEmail}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-600">Active until</dt>
                <dd className="text-slate-900">{result.activeUntil.slice(0, 10)}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        <Form method="post" className="grid gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <label className="text-sm font-semibold text-slate-700">
            Business name
            <input name="businessName" required maxLength={120} placeholder="e.g. UAB Stasmila" className={INPUT_CLASS} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Display name (optional)
            <input name="displayName" maxLength={120} placeholder="e.g. Stasmila" className={INPUT_CLASS} />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Shown on the page. Empty: the business name. The business name is still used in the privacy note.
            </span>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Branch label (optional)
            <input name="locationLabel" maxLength={80} placeholder="e.g. Vilnius Old Town" className={INPUT_CLASS} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Google review link
            <input name="googleUrl" type="url" required maxLength={2048} placeholder="https://g.page/r/…/review" className={INPUT_CLASS} />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Page language
            <select name="pageLanguage" defaultValue="lt" className={INPUT_CLASS}>
              <option value="lt">Lithuanian</option>
              <option value="en">English</option>
            </select>
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Phones set to Lithuanian or English see that language; all others see this one.
            </span>
          </label>
          <div className="text-sm font-semibold text-slate-700">
            <span>Brand colour</span>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                aria-label="Pick the brand colour"
                className="h-10 w-14 cursor-pointer rounded border border-slate-200"
              />
              <input
                name="brandColor"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                pattern="#[0-9a-fA-F]{6}"
                aria-label="Brand colour as #RRGGBB"
                className="w-32 rounded-xl border border-slate-200 px-3 py-2 font-mono font-normal"
              />
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            <span>Logo (optional, PNG or JPEG)</span>
            {logoValue ? (
              <img
                src={logoValue}
                alt="Logo preview"
                style={logoBackground ? {backgroundColor: logoBackground} : undefined}
                className="my-2 h-20 w-20 rounded-2xl border object-contain"
              />
            ) : null}
            <input type="hidden" name="logo" value={logoValue} />
            <input type="hidden" name="logoBackground" value={logoBackground ?? ''} />
            <input
              type="file"
              accept="image/png,image/jpeg"
              aria-label="Choose a logo"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void prepareLogo(file).then((prepared) => {
                  setLogoValue(prepared?.dataUrl ?? '');
                  setLogoBackground(prepared?.background ?? null);
                });
              }}
              className="mt-1 w-full text-sm font-normal text-slate-500"
            />
          </div>
          <button type="submit" disabled={busy} className="rounded-full bg-slate-900 py-3 font-bold text-white disabled:opacity-70">
            {busy ? 'Creating…' : 'Create demo page'}
          </button>
        </Form>
      </div>
    </div>
  );
}
