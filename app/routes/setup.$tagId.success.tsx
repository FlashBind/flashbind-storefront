import { useLoaderData, Link, redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';


export const handle = {
  hideLayout: true,
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const tagId = params.tagId;
  
  if (!tagId) {
    throw new Response('Not Found', { status: 404 });
  }

  const { getSupabaseAdmin } = await import('~/utils/supabase.server');
  const adminSupabase = getSupabaseAdmin(context);
  const { data: tagData, error } = await adminSupabase.from('tags').select('*').eq('id', tagId).single();

  if (error || !tagData) {
    throw new Response('Not Found', { status: 404 });
  }

  // Protect route: Ensure user is logged in
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect(`/login?redirectTo=/setup/${tagId}/success`);
  }

  // Ensure they are the owner
  if (tagData.owner_email !== userEmail) {
    return redirect('/dashboard');
  }

  return { 
    tagId, 
    type: tagData.type || 'pet_tag',
    settings: tagData.settings || {},
    petName: tagData.pet_name
  };
}

export default function SetupSuccessPage() {
  const { tagId, type, settings, petName } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-slate-50 w-full font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md overflow-hidden p-8 text-center">
        
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Tag Activated!</h1>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
          <p className="text-slate-600 font-medium">
            {type === 'pet_tag' && (
              <>{petName || 'Your pet'}'s profile is now live.</>
            )}
            {(type === 'google_review' || type === 'menu') && (
              <>Customers will now be redirected to: <br/><strong className="text-slate-900 break-all">{settings.destination_url}</strong></>
            )}
            {type === 'wifi' && (
              <>Network Name: <strong className="text-slate-900">{settings.network_name}</strong></>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link 
            to={`/p/${tagId}`}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm"
          >
            View Public Page
          </Link>
          
          <Link 
            to="/dashboard"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-full transition-colors text-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
