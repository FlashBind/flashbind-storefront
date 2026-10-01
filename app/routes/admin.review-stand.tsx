import {
  Form,
  Link,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import {getSupabaseAdmin} from '~/utils/supabase.server';
import {assertSameOrigin} from '~/utils/requestSecurity.server';
import {createReviewStand, requireAdminEmail} from '~/utils/adminTools.server';

// One Google review stand for a custom one-off stand: FlashBind programs the
// /p/{id} address onto its own NFC sticker and gives the PIN to the customer,
// who activates it on /setup/{id} like any other tag.

export const handle = {hideLayout: true};

export const meta: MetaFunction = () => [{title: 'FlashBind | Create review stand'}, {name: 'robots', content: 'noindex'}];

// The response carries an activation PIN: never cache it.
export const headers: HeadersFunction = () => new Headers({'Cache-Control': 'private, no-store, max-age=0'});

export function loader({context}: LoaderFunctionArgs) {
  requireAdminEmail(context, '/admin/review-stand');
  return null;
}

export async function action({request, context}: ActionFunctionArgs) {
  assertSameOrigin(request);
  requireAdminEmail(context, '/admin/review-stand');
  return createReviewStand(getSupabaseAdmin(context));
}

export default function AdminReviewStandPage() {
  const result = useActionData<typeof action>();
  const busy = useNavigation().state === 'submitting';

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="mx-auto max-w-xl py-8">
        <Link to="/dashboard" className="text-sm font-bold text-slate-400 hover:text-slate-700">
          ← Back to Dashboard
        </Link>
        <h1 className="mb-2 mt-4 text-3xl font-extrabold text-slate-900">Create review stand</h1>
        <p className="mb-6 text-sm text-slate-600">
          Creates one blank Google review stand with its own address and activation PIN, for programming your own NFC
          sticker on a custom stand. The customer activates it at the address with the PIN, then adds their Google
          review link.
        </p>

        {result && 'error' in result ? (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{result.error}</p>
        ) : null}

        {result && 'pin' in result ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="mb-3 font-bold text-emerald-900">Review stand created.</p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-600">Address to write on the NFC sticker</dt>
                <dd className="select-all break-all font-mono text-slate-900">{result.url}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-600">Activation PIN</dt>
                <dd className="select-all font-mono text-2xl font-bold tracking-widest text-slate-900">{result.pin}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-emerald-900">
              Copy the PIN now: this page won&apos;t show it again. Keep it with the stand for the customer.
            </p>
          </div>
        ) : null}

        <Form method="post">
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-slate-900 py-4 text-lg font-bold text-white disabled:opacity-70"
          >
            {busy ? 'Creating…' : result && 'pin' in result ? 'Create another review stand' : 'Create review stand'}
          </button>
        </Form>
      </div>
    </div>
  );
}
