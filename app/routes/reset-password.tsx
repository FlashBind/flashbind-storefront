import { data, type ActionFunctionArgs, redirect } from 'react-router';
import { useEffect, useState } from 'react';
import { Form, useActionData, useNavigation } from 'react-router';
import { getSupabase } from '~/utils/supabase.server';
import {getFormPassword} from '~/utils/requestSecurity.server';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const password = getFormPassword(formData, 'password');
  const accessToken = String(formData.get('access_token') || '');
  const refreshToken = String(formData.get('refresh_token') || '');

  if (!password || password.length < 8) {
    return data({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  if (!accessToken) {
    return data({ error: 'Missing authentication tokens. Please click the reset link in your email again.' }, { status: 400 });
  }

  const supabase = getSupabase(context);
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  
  if (sessionError) {
    return data({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return data({ error: 'Unable to update the password. Please request a new reset link.' }, { status: 400 });
  }

  return redirect('/login');
}

export default function ResetPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [tokens, setTokens] = useState({ accessToken: '', refreshToken: '' });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        setTokens({accessToken, refreshToken});
      }
    }
  }, []);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Set New Password</h1>
          <p className="text-sm font-medium text-slate-500">
            Please enter your new password below.
          </p>
        </div>

        <Form method="post" className="space-y-6">
          {actionData?.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center">
              {actionData.error}
            </div>
          )}
          
          <input type="hidden" name="access_token" value={tokens.accessToken} />
          <input type="hidden" name="refresh_token" value={tokens.refreshToken} />

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[#1E3A8A] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </Form>
      </div>
    </div>
  );
}
