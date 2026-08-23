import { data, type ActionFunctionArgs } from 'react-router';
import { Form, useActionData, useNavigation } from 'react-router';
import { getSupabase } from '~/utils/supabase.server';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get('email'));

  if (!email) {
    return data({ error: 'Email is required', success: false }, { status: 400 });
  }

  const isLocalhost = request.url.includes('localhost') || request.url.includes('127.0.0.1');
  const origin = isLocalhost ? 'http://localhost:3000' : 'https://flashbind.com';

  const supabase = getSupabase(context);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    console.error('Supabase Reset Password Error:', error);
  }

  return data({ success: true, error: null });
}

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Reset Password</h1>
          <p className="text-sm font-medium text-slate-500">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {actionData?.success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-medium">
            If an account exists with that email, a reset link has been sent.
          </div>
        ) : (
          <Form method="post" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[#1E3A8A] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center mt-4">
              <a href="/login" className="text-sm font-semibold text-[#1E3A8A] hover:underline">
                Back to Login
              </a>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}
