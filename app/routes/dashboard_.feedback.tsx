import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import {getSupabaseAdmin} from '~/utils/supabase.server';
import {assertSameOrigin} from '~/utils/requestSecurity.server';
import {purgeExpiredFeedback} from '~/utils/retention.server';
import {
  applyInboxOperation,
  getEntitlement,
  INBOX_OPERATIONS,
  isEntitlementActive,
  listFeedback,
  reviewStandSettings,
  statsByStand,
  unreadCountsByStand,
  type InboxOperation,
} from '~/utils/feedback.server';

// Private feedback inbox (SUB-001). One account can own review stands at many
// branches; every message shows which branch it came from, and the list can
// be filtered by branch. Only feedback addressed to this account is shown.

export const handle = {hideLayout: true};

export const meta: MetaFunction = () => [{title: 'FlashBind | Feedback'}, {name: 'robots', content: 'noindex'}];

export const headers: HeadersFunction = () =>
  new Headers({'Cache-Control': 'private, no-store, max-age=0'});

export async function loader({request, context}: LoaderFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) return redirect('/login?redirectTo=/dashboard/feedback');

  const admin = getSupabaseAdmin(context);
  await purgeExpiredFeedback(admin);

  const {data: rawStands} = await admin
    .from('tags')
    .select('id, settings')
    .eq('owner_email', userEmail)
    .eq('type', 'google_review')
    .eq('is_claimed', true);
  const stands = (rawStands ?? [])
    .map((tag: {id: string; settings: unknown}) => {
      const settings = reviewStandSettings(tag.settings);
      return {id: tag.id, label: settings.locationLabel, dualChoice: settings.dualChoiceEnabled};
    })
    .sort((a, b) => (a.label || a.id).localeCompare(b.label || b.id));

  const url = new URL(request.url);
  const view = url.searchParams.get('view') === 'archived' ? 'archived' : 'inbox';
  const standParam = url.searchParams.get('stand');
  const standId = stands.some((stand) => stand.id === standParam) ? standParam : null;

  const [entitlement, feedback, unread, stats] = await Promise.all([
    getEntitlement(admin, userEmail),
    listFeedback(admin, userEmail, {view, standId}),
    unreadCountsByStand(admin, userEmail),
    statsByStand(
      admin,
      stands.map((stand) => stand.id),
    ),
  ]);
  if (!feedback) throw new Response('Could not load feedback', {status: 500});

  return {
    stands,
    view,
    standId,
    feedback,
    unread,
    stats,
    subscriptionActive: isEntitlementActive(entitlement),
    businessName: entitlement?.business_name ?? '',
  };
}

export async function action({request, context}: ActionFunctionArgs) {
  assertSameOrigin(request);
  const userEmail = context.session.get('userEmail');
  if (!userEmail) return redirect('/login?redirectTo=/dashboard/feedback');

  const formData = await request.formData();
  const operation = formData.get('op');
  const id = formData.get('id');
  if (typeof id !== 'string' || !INBOX_OPERATIONS.includes(operation as InboxOperation)) {
    return {error: 'Unknown action.'};
  }
  const ok = await applyInboxOperation(getSupabaseAdmin(context), userEmail, id, operation as InboxOperation);
  return ok ? {ok: true} : {error: 'That message could not be updated.'};
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-GB', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Vilnius'});
}

function standName(stand: {id: string; label: string}) {
  return stand.label || `Stand #${stand.id}`;
}

export default function FeedbackInboxPage() {
  const {stands, view, standId, feedback, unread, stats, subscriptionActive, businessName} =
    useLoaderData<typeof loader>();
  const busy = useNavigation().state !== 'idle';
  const labelFor = (tagId: string, snapshot: string | null) =>
    stands.find((stand) => stand.id === tagId)?.label || snapshot || `Stand #${tagId}`;
  const query = (next: {view?: string; stand?: string | null}) => {
    const params = new URLSearchParams();
    const v = next.view ?? view;
    const s = next.stand === undefined ? standId : next.stand;
    if (v === 'archived') params.set('view', 'archived');
    if (s) params.set('stand', s);
    const text = params.toString();
    return text ? `?${text}` : '';
  };
  const totalUnread = Object.values(unread).reduce((sum, n) => sum + n, 0);

  return (
    <div className="min-h-screen w-full bg-slate-50 pb-12 font-sans">
      <div className="mb-6 border-b border-slate-100 bg-white px-4 pb-6 pt-8 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <Link to="/dashboard" className="text-sm font-bold text-slate-400 hover:text-slate-700">
            ← Back to Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900">Private feedback</h1>
          <p className="mt-1 text-sm text-slate-500">
            {businessName ? `${businessName} · ` : ''}
            {stands.length} review {stands.length === 1 ? 'stand' : 'stands'} · {totalUnread} unread
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4">
        {!subscriptionActive ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            The business subscription is not active on this account, so your stands go straight to Google and no new
            feedback arrives. Earlier feedback is still shown here. <Link to="/software" className="underline">About the subscription</Link>
          </p>
        ) : null}

        {stands.length > 0 ? (
          <details className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm" open={stands.length <= 5}>
            <summary className="cursor-pointer font-bold text-slate-800">Branches (last 30 days)</summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Branch</th>
                    <th className="py-2 pr-3">Dual Choice</th>
                    <th className="py-2 pr-3">Page views</th>
                    <th className="py-2 pr-3">Google clicks</th>
                    <th className="py-2 pr-3">Private messages</th>
                    <th className="py-2">Unread</th>
                  </tr>
                </thead>
                <tbody>
                  {stands.map((stand) => (
                    <tr key={stand.id} className="border-t border-slate-100">
                      <td className="py-2 pr-3">
                        <Link to={query({stand: stand.id})} className="font-semibold text-blue-700 hover:underline">
                          {standName(stand)}
                        </Link>
                      </td>
                      <td className="py-2 pr-3">{stand.dualChoice ? 'On' : 'Off'}</td>
                      <td className="py-2 pr-3">{stats[stand.id]?.views ?? 0}</td>
                      <td className="py-2 pr-3">{stats[stand.id]?.google ?? 0}</td>
                      <td className="py-2 pr-3">{stats[stand.id]?.feedback ?? 0}</td>
                      <td className="py-2">{unread[stand.id] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={query({view: 'inbox'})}
            className={`rounded-full px-4 py-2 text-sm font-bold ${view === 'inbox' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
          >
            Inbox
          </Link>
          <Link
            to={query({view: 'archived'})}
            className={`rounded-full px-4 py-2 text-sm font-bold ${view === 'archived' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
          >
            Archived
          </Link>
          {stands.length > 1 ? (
            <Form method="get" className="ml-auto flex items-center gap-2">
              {view === 'archived' ? <input type="hidden" name="view" value="archived" /> : null}
              <label htmlFor="stand" className="text-sm font-semibold text-slate-600">
                Branch
              </label>
              <select
                id="stand"
                name="stand"
                defaultValue={standId ?? ''}
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">All branches</option>
                {stands.map((stand) => (
                  <option key={stand.id} value={stand.id}>
                    {standName(stand)}
                    {unread[stand.id] ? ` (${unread[stand.id]} unread)` : ''}
                  </option>
                ))}
              </select>
              <noscript>
                <button type="submit" className="text-sm font-bold text-blue-700">Show</button>
              </noscript>
            </Form>
          ) : null}
        </div>

        {feedback.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            {view === 'archived' ? 'No archived messages.' : 'No messages yet.'}
          </p>
        ) : (
          <ul className="space-y-4">
            {feedback.map((item) => (
              <li
                key={item.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${item.read_at ? 'border-slate-100' : 'border-blue-200'}`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {!item.read_at ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-white">New</span> : null}
                  <span>{labelFor(item.tag_id, item.location_label)}</span>
                  <span>·</span>
                  <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                </div>
                <p className="whitespace-pre-wrap break-words text-slate-900">{item.message}</p>
                {item.contact_consent ? (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    <p className="font-semibold">The customer agreed to be contacted:</p>
                    {item.contact_name ? <p>{item.contact_name}</p> : null}
                    {item.contact_email ? (
                      <p>
                        <a href={`mailto:${item.contact_email}`} className="text-blue-700 underline">
                          {item.contact_email}
                        </a>
                      </p>
                    ) : null}
                    {item.contact_phone ? (
                      <p>
                        <a href={`tel:${item.contact_phone}`} className="text-blue-700 underline">
                          {item.contact_phone}
                        </a>
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <InboxButton id={item.id} op={item.read_at ? 'unread' : 'read'} busy={busy}>
                    {item.read_at ? 'Mark as unread' : 'Mark as read'}
                  </InboxButton>
                  <InboxButton id={item.id} op={item.archived_at ? 'unarchive' : 'archive'} busy={busy}>
                    {item.archived_at ? 'Move to inbox' : 'Archive'}
                  </InboxButton>
                  <InboxButton id={item.id} op="delete" busy={busy} danger>
                    Delete
                  </InboxButton>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-center text-xs text-slate-400">Messages are deleted automatically 12 months after they arrive.</p>
      </div>
    </div>
  );
}

function InboxButton({
  id,
  op,
  busy,
  danger,
  children,
}: {
  id: string;
  op: InboxOperation;
  busy: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Form method="post" preventScrollReset>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <button
        type="submit"
        disabled={busy}
        className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
          danger ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {children}
      </button>
    </Form>
  );
}
