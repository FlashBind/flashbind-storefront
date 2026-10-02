import {
  Form,
  Link,
  redirect,
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
import {assertSameOrigin, getFormText} from '~/utils/requestSecurity.server';
import {resizeImageToDataUrl} from '~/utils/resizeImage';
import {BUSINESS_NAME_MAX, getEntitlement, isEntitlementActive, parseLogo} from '~/utils/feedback.server';

// Business name and logo shown on every Dual Choice page of this account,
// so a business with many branches sets them once.

export const handle = {hideLayout: true};

export const meta: MetaFunction = () => [{title: 'FlashBind | Business profile'}, {name: 'robots', content: 'noindex'}];

export const headers: HeadersFunction = () =>
  new Headers({'Cache-Control': 'private, no-store, max-age=0'});

export async function loader({context}: LoaderFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) return redirect('/login?redirectTo=/dashboard/business');
  const entitlement = await getEntitlement(getSupabaseAdmin(context), userEmail);
  return {
    hasSubscription: Boolean(entitlement),
    active: isEntitlementActive(entitlement),
    periodEnd: entitlement?.current_period_end ?? null,
    businessName: entitlement?.business_name ?? '',
    logo: entitlement?.logo_data_url ?? null,
  };
}

export async function action({request, context}: ActionFunctionArgs) {
  assertSameOrigin(request);
  const userEmail = context.session.get('userEmail');
  if (!userEmail) return redirect('/login?redirectTo=/dashboard/business');

  const admin = getSupabaseAdmin(context);
  const entitlement = await getEntitlement(admin, userEmail);
  if (!entitlement) return {error: 'This account has no business subscription.'};

  const formData = await request.formData();
  const rawName = formData.get('businessName');
  if (typeof rawName === 'string' && rawName.trim().length > BUSINESS_NAME_MAX) {
    return {error: `Please keep the business name under ${BUSINESS_NAME_MAX} characters.`};
  }
  const businessName = getFormText(formData, 'businessName', BUSINESS_NAME_MAX);
  const logo = parseLogo(formData.get('logo'));
  if (logo && 'error' in logo) return {error: logo.error};

  const update: Record<string, unknown> = {business_name: businessName, updated_at: new Date().toISOString()};
  if (logo) update.logo_data_url = logo.logo;

  const {error} = await admin.from('business_entitlements').update(update).eq('owner_email', userEmail);
  if (error) {
    console.error('[BUSINESS] profile save failed', error.code || 'unknown');
    return {error: 'Could not save. Please try again.'};
  }
  return {success: true};
}

export default function BusinessProfilePage() {
  const {hasSubscription, active, periodEnd, businessName, logo} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const busy = useNavigation().state === 'submitting';
  const [logoValue, setLogoValue] = useState('');
  const preview = logoValue === 'remove' ? null : logoValue || logo;

  return (
    <div className="min-h-screen w-full bg-slate-50 p-4 font-sans">
      <div className="mx-auto max-w-md py-8">
        <Link to="/dashboard" className="text-sm font-bold text-slate-400 hover:text-slate-700">
          ← Back to Dashboard
        </Link>
        <div className="mt-4 rounded-3xl bg-white p-6 shadow-md sm:p-8">
          <h1 className="mb-2 text-2xl font-extrabold text-slate-900">Business profile</h1>
          {!hasSubscription ? (
            <p className="text-slate-600">
              The business subscription isn&apos;t set up on this account.{' '}
              <Link to="/software" className="text-blue-700 underline">
                Find out more
              </Link>
              .
            </p>
          ) : (
            <>
              <p className="mb-6 text-sm text-slate-500">
                Subscription: <strong>{active ? 'active' : 'not active'}</strong>
                {periodEnd ? ` (paid until ${periodEnd.slice(0, 10)})` : ''}. The name and logo appear on the Dual Choice
                page of every review stand in this account.
              </p>
              {actionData && 'error' in actionData ? (
                <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{actionData.error}</p>
              ) : null}
              {actionData && 'success' in actionData ? (
                <p className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Saved.</p>
              ) : null}
              <Form method="post" className="space-y-5">
                <div>
                  <label htmlFor="businessName" className="mb-1 block text-sm font-semibold text-slate-700">
                    Business name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    maxLength={120}
                    defaultValue={businessName}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Logo</span>
                  {preview ? <img src={preview} alt="Logo preview" className="mb-3 h-20 w-20 rounded-2xl border object-contain" /> : null}
                  <input type="hidden" name="logo" value={logoValue} />
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    aria-label="Choose a logo"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void resizeImageToDataUrl(file, 400, 0.9).then((url) => setLogoValue(url ?? ''));
                    }}
                    className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-6 file:py-3 file:text-sm file:font-semibold file:text-blue-700"
                  />
                  {logo ? (
                    <button type="button" onClick={() => setLogoValue('remove')} className="mt-2 text-sm font-semibold text-red-700">
                      Remove logo
                    </button>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {busy ? 'Saving…' : 'Save'}
                </button>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
