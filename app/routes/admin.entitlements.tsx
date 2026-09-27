import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router';
import {getSupabaseAdmin} from '~/utils/supabase.server';
import {assertSameOrigin, getFormText, normalizeEmail} from '~/utils/requestSecurity.server';

// Manual subscription switch for the pilot (billing option A): FlashBind
// invoices the business, then switches the subscription on here.

export const handle = {
  hideLayout: true,
};

function requireAdmin(context: LoaderFunctionArgs['context']) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) throw redirect('/login?redirectTo=/admin/entitlements');
  const adminEmail = (context.env as any).ADMIN_EMAIL;
  if (!adminEmail || userEmail !== adminEmail) {
    throw new Response('Not authorized', {status: 403});
  }
}

export async function loader({context}: LoaderFunctionArgs) {
  requireAdmin(context);
  const admin = getSupabaseAdmin(context);
  const {data, error} = await admin
    .from('business_entitlements')
    .select('owner_email, plan, status, source, current_period_end, business_name, notes, updated_at')
    .order('updated_at', {ascending: false})
    .limit(200);
  if (error) throw new Response('Could not load subscriptions', {status: 500});

  // Review stands per account, so the admin can see branch counts.
  const {data: stands} = await admin
    .from('tags')
    .select('owner_email')
    .eq('type', 'google_review')
    .in('owner_email', (data ?? []).map((row) => row.owner_email));
  const standCounts: Record<string, number> = {};
  for (const stand of stands ?? []) {
    if (stand.owner_email) standCounts[stand.owner_email] = (standCounts[stand.owner_email] ?? 0) + 1;
  }

  return {entitlements: data ?? [], standCounts};
}

export async function action({request, context}: ActionFunctionArgs) {
  assertSameOrigin(request);
  requireAdmin(context);

  const formData = await request.formData();
  const ownerEmail = normalizeEmail(formData.get('owner_email'));
  if (!ownerEmail) return {error: 'Enter the account email of the business.'};

  const status = formData.get('status') === 'cancelled' ? 'cancelled' : 'active';
  const periodRaw = formData.get('current_period_end');
  let currentPeriodEnd: string | null = null;
  if (typeof periodRaw === 'string' && periodRaw) {
    const date = new Date(`${periodRaw}T23:59:59Z`);
    if (Number.isNaN(date.getTime())) return {error: 'Enter a valid end date, or leave it empty.'};
    currentPeriodEnd = date.toISOString();
  }
  const notes = getFormText(formData, 'notes', 500);

  const admin = getSupabaseAdmin(context);
  const {error} = await admin.from('business_entitlements').upsert(
    {
      owner_email: ownerEmail,
      plan: 'growth',
      status,
      source: 'manual',
      current_period_end: currentPeriodEnd,
      notes,
      updated_at: new Date().toISOString(),
    },
    {onConflict: 'owner_email'},
  );
  if (error) {
    console.error('[ENTITLEMENTS] save failed', error.code || 'unknown');
    return {error: 'Could not save. Please try again.'};
  }
  return {success: `Saved: ${ownerEmail} is ${status}.`};
}

export default function AdminEntitlementsPage() {
  const {entitlements, standCounts} = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const busy = useNavigation().state === 'submitting';

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="mx-auto max-w-3xl py-8">
        <h1 className="mb-2 text-3xl font-extrabold text-slate-900">Business subscriptions</h1>
        <p className="mb-6 text-sm text-slate-600">
          Manual billing (pilot). Switching a subscription on lets that account turn on the Dual Choice page for its
          Google Review stands. Switching it off sends every stand straight back to Google.
        </p>

        {actionData && 'error' in actionData ? (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{actionData.error}</p>
        ) : null}
        {actionData && 'success' in actionData ? (
          <p className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{actionData.success}</p>
        ) : null}

        <Form method="post" className="mb-10 grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Account email
            <input name="owner_email" type="email" required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Status
            <select name="status" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal">
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Paid until (optional)
            <input name="current_period_end" type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Notes (invoice number, pilot terms; no personal data)
            <input name="notes" maxLength={500} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal" />
          </label>
          <button type="submit" disabled={busy} className="rounded-full bg-slate-900 py-3 font-bold text-white disabled:opacity-70 sm:col-span-2">
            {busy ? 'Saving…' : 'Save'}
          </button>
        </Form>

        <div className="overflow-x-auto">
          <table className="w-full rounded-2xl bg-white text-left text-sm shadow-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3">Account</th>
                <th className="p-3">Status</th>
                <th className="p-3">Paid until</th>
                <th className="p-3">Review stands</th>
              </tr>
            </thead>
            <tbody>
              {entitlements.map((row) => (
                <tr key={row.owner_email} className="border-t border-slate-100">
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{row.business_name || '—'}</div>
                    <div className="text-slate-500">{row.owner_email}</div>
                    {row.notes ? <div className="text-xs text-slate-400">{row.notes}</div> : null}
                  </td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">{row.current_period_end ? row.current_period_end.slice(0, 10) : 'No end date'}</td>
                  <td className="p-3">{standCounts[row.owner_email] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
