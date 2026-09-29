import {Form, Link, redirect, useActionData, useNavigation} from 'react-router';
import type {ActionFunctionArgs, LoaderFunctionArgs, MetaFunction} from 'react-router';
import {getSupabase, getSupabaseAdmin} from '~/utils/supabase.server';
import {assertSameOrigin, getFormPassword, hashRateLimitIdentifier} from '~/utils/requestSecurity.server';
import {buildReleasedTagUpdate} from '~/utils/tagAdmin.server';

// Self-service account deletion (PRIV-002). Deletes the FlashBind login,
// resets every product the account owns to its factory state, and removes
// the account's activation-attempt records.

export const meta: MetaFunction = () => [{title: 'FlashBind | Delete account'}];

export async function loader({context}: LoaderFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) return redirect('/login?redirectTo=/delete-account');
  return {userEmail};
}

export async function action({request, context}: ActionFunctionArgs) {
  assertSameOrigin(request);

  const userEmail = context.session.get('userEmail');
  if (!userEmail) return redirect('/login?redirectTo=/delete-account');

  const formData = await request.formData();
  const password = getFormPassword(formData, 'password');
  if (!password || formData.get('confirm') !== 'yes') {
    return {error: 'Enter your password and tick the box to confirm.'};
  }

  // Re-check the password: confirms it's really the account owner and gives
  // us the account's ID.
  const {data: signIn, error: signInError} = await getSupabase(context).auth.signInWithPassword({
    email: userEmail,
    password,
  });
  const userId = signIn?.user?.id;
  if (signInError || !userId) {
    return {error: 'That password is not correct.'};
  }

  const admin = getSupabaseAdmin(context);

  // 1. Reset every product this account owns.
  const {data: ownedTags, error: tagsError} = await admin
    .from('tags')
    .select('id, batch_id')
    .eq('owner_email', userEmail);
  if (tagsError) {
    console.error('[DELETE ACCOUNT] could not list tags', tagsError.code || 'unknown');
    return {error: 'Something went wrong. Nothing was deleted. Please try again or contact us.'};
  }
  for (const tag of ownedTags ?? []) {
    const {error} = await admin
      .from('tags')
      .update(buildReleasedTagUpdate(tag))
      .eq('id', tag.id)
      .eq('owner_email', userEmail);
    if (error) {
      console.error('[DELETE ACCOUNT] could not reset a tag', error.code || 'unknown');
      return {error: 'Something went wrong part-way. Please contact us so we can finish deleting your data.'};
    }
  }

  // 2. Remove this account's activation-attempt records.
  const accountBucket = `u:${(await hashRateLimitIdentifier(userEmail)).slice(0, 40)}`;
  await admin.from('rate_limits').delete().eq('ip_address', accountBucket);

  // 3. Delete the login itself.
  const {error: deleteError} = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('[DELETE ACCOUNT] could not delete auth user', deleteError.status || 'unknown');
    return {error: 'Your products were reset, but your login could not be deleted. Please contact us so we can finish.'};
  }

  context.session.unset('userEmail');
  context.session.unset('access_token');
  return redirect('/delete-account/done', {
    headers: {'Set-Cookie': await context.session.commit()},
  });
}

export default function DeleteAccountPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="container mx-auto px-6 max-w-xl">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h1 className="text-3xl font-medium text-slate-900 tracking-tighter mb-4">Delete your account</h1>
          <p className="text-slate-600 mb-4">This permanently deletes your FlashBind account. It can&apos;t be undone.</p>
          <ul className="list-disc pl-6 text-slate-600 text-sm space-y-1 mb-6">
            <li>Your login is deleted.</li>
            <li>Every product in your account is reset: its link, Wi-Fi details or pet profile are erased, and it stops showing your information.</li>
            <li>To use a reset product again, contact us for a new activation code.</li>
            <li>Order records kept by our shop for accounting are not affected; <Link to="/privacy-policy" className="text-[#1E3A8A] underline">see the Privacy Policy</Link>.</li>
          </ul>

          <Form method="post" className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">Your password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input type="checkbox" name="confirm" value="yes" required className="mt-1 w-4 h-4" />
              <span>I understand my account and my products&apos; information will be permanently deleted.</span>
            </label>
            {actionData?.error && (
              <p className="bg-red-50 text-red-700 text-sm rounded-xl p-3" role="alert">{actionData.error}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={busy}
                className="min-h-[48px] px-6 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? 'Deleting…' : 'Delete my account'}
              </button>
              <Link to="/dashboard" className="min-h-[48px] px-6 rounded-full border border-slate-200 font-bold text-slate-900 inline-flex items-center justify-center">
                Cancel
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
