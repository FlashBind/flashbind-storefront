import { Form, useActionData, useNavigation, redirect, isRouteErrorResponse, useRouteError } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { getSupabaseAdmin } from '~/utils/supabase.server';

import { generateBatch } from '~/utils/tagAdmin.server';

export const handle = {
  hideLayout: true,
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect('/login?redirectTo=/admin/generate-tags');
  }

  const adminEmail = (context.env as any).ADMIN_EMAIL;
  if (!adminEmail || userEmail !== adminEmail) {
    throw new Response('Not authorized', { status: 403 });
  }

  return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect('/login?redirectTo=/admin/generate-tags');
  }

  const adminEmail = (context.env as any).ADMIN_EMAIL;
  if (!adminEmail || userEmail !== adminEmail) {
    throw new Response('Not authorized', { status: 403 });
  }

  const formData = await request.formData();
  const rawBatchRef = formData.get('batchReference');
  const batchReference = typeof rawBatchRef === 'string' ? rawBatchRef.trim().toUpperCase() : '';

  if (!/^[A-Z0-9.\-_]{3,64}$/.test(batchReference)) {
    return { error: 'Please provide a valid Batch Reference (3-64 characters: uppercase letters, digits, periods, underscores, hyphens).' };
  }

  const supabase = getSupabaseAdmin(context);
  
  const result = await generateBatch(batchReference.trim(), supabase);
  if (result.error) {
    return { error: result.error };
  }

  return {
    success: true,
    batchId: result.batchId,
    message: result.message
  };
}

export default function AdminGenerateTagsPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-slate-50 w-full font-sans p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Admin: Generate Tags</h1>
          <div className="flex items-center gap-6">
              <button disabled className="inline-flex items-center px-5 py-2.5 bg-slate-200 text-slate-500 text-sm font-bold rounded-xl cursor-not-allowed shadow-sm" title="Generate a batch first to export">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Order CSV
              </button>
            <a href="/dashboard" className="text-blue-600 font-semibold hover:underline">
              Back to Dashboard
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Bulk Create Blank Tags</h2>
          
          {actionData?.error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl border border-red-100">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="batchReference" className="block text-sm font-semibold text-slate-700 mb-2">
                  Batch Reference Name
                </label>
                <input
                  type="text"
                  id="batchReference"
                  name="batchReference"
                  placeholder="e.g. FACTORY-ORDER-100"
                  required
                  minLength={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700"
                />
                <p className="text-xs text-slate-500 mt-2">
                  This will generate exactly 100 tags: 25 Menu, 25 Wi-Fi, 25 Black Pet Tags, 25 White Pet Tags.
                </p>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Generating...' : 'Generate Tags'}
            </button>
          </Form>
        </div>

        {actionData?.success && actionData.batchId && (
          <div className="bg-green-50 rounded-3xl border border-green-200 p-8">
            <h3 className="text-xl font-bold text-green-900 mb-2">{actionData.message}</h3>
            <p className="text-green-800 text-sm mb-6">
              The batch has been secured. You can now download the exports for manufacturing.
            </p>
            
            <div className="flex gap-4">
              <a href={`/admin/export-csv?batchId=${actionData.batchId}`} className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm">
                Download Supplier CSV
              </a>
              <a href={`/admin/export-internal?batchId=${actionData.batchId}`} className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm">
                Download Internal CSV (With PINs)
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error) && error.status === 403) {
    return (
      <div className="min-h-screen bg-slate-50 w-full font-sans flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Not Authorized</h1>
          <p className="text-slate-500 font-medium mb-8">
            You don&apos;t have permission to access the admin tools.
          </p>
          <a 
            href="/dashboard" 
            className="inline-block w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  console.error('[ADMIN GENERATE TAGS ERROR] An error occurred during batch generation. (Raw error omitted for safety)');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-2xl w-full text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-slate-700 font-medium mb-4">An unexpected error occurred. Please try again later.</p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-full transition-colors mt-4"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
