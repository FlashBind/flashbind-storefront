import { Form, useActionData, useNavigation, useSearchParams } from 'react-router';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { getSupabase } from '~/utils/supabase.server';

export const handle = {
  hideLayout: true,
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const email = context.session.get('userEmail');
  if (email) {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirectTo') || '/';
    return redirect(redirectTo);
  }
  return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  const supabase = getSupabase(context);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    let errorMessage = 'Invalid email or password. Please try again.';
    if (error?.message && error.message !== '{}') {
      errorMessage = error.message;
    } else if (error?.error_description && error.error_description !== '{}') {
      errorMessage = error.error_description;
    } else if (error?.msg && error.msg !== '{}') {
      errorMessage = error.msg;
    } else if (typeof error === 'string' && error !== '{}') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && Object.keys(error).length > 0) {
      errorMessage = `System Error: ${JSON.stringify(error)}`;
    }
    
    return Response.json(
      { error: errorMessage },
      { status: 400 }
    );
  }

  // Securely store the user's email and access tokens in Hydrogen's AppSession
  context.session.set('userEmail', data.user.email);
  context.session.set('access_token', data.session?.access_token);
  
  // We no longer need to sync passwords with Shopify!
  // Orders are now securely fetched via the Admin API using the user's email address.
  context.session.unset('shopifyCustomerAccessToken');
  context.session.unset('shopifyDisconnected');

  return redirect(redirectTo);
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '';
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-slate-50 w-full font-sans flex items-center justify-center p-4 relative">
      <a href="/" className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </a>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md overflow-hidden p-6 sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-sm font-medium text-slate-500">
            Log in to manage your account and NFC tags.
          </p>
        </div>

        {actionData?.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold text-center">
            {actionData.error}
          </div>
        )}

        <Form method="post" action={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Logging in...' : 'Log In'}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?{' '}
              <a href={`/register?redirectTo=${encodeURIComponent(redirectTo)}`} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Create one
              </a>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}
