import { Form, redirect, useLoaderData, type HeadersFunction } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { getSupabaseAdmin } from '~/utils/supabase.server';
import { sanitizeTagSettings } from '~/utils/tagSanitizer.server';

export const handle = {
  hideLayout: true, // Hide global header/footer to match app-like feel
};

export const headers: HeadersFunction = () => {
  return new Headers({
    'Cache-Control': 'private, no-store, max-age=0',
  });
};

export async function loader({ context }: LoaderFunctionArgs) {
  // 1. Verify that a user is actively logged in
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect('/login');
  }

  // 2. Query the database for tags matching this user's email
  const supabase = getSupabaseAdmin(context);
  const { data: rawTags, error } = await supabase
    .from('tags')
    .select('id, is_claimed, type, settings, pet_name, owner_name, phone, owner_email, medical_notes, image_url')
    .eq('owner_email', userEmail);

  if (error) {
    console.error('Failed to load dashboard tags:', error);
    throw new Response('Internal Server Error', { status: 500 });
  }

  const userTags = (rawTags || []).map((rawTag: any) => {
    const type = rawTag.type || 'pet_tag';
    const safeSettings = sanitizeTagSettings(type, rawTag.settings);

    return {
      id: rawTag.id,
      isClaimed: rawTag.is_claimed,
      type: type,
      settings: safeSettings,
      dogName: rawTag.pet_name,
      ownerName: rawTag.owner_name,
      ownerPhone: rawTag.phone,
      ownerEmail: rawTag.owner_email,
      medicalNotes: rawTag.medical_notes,
      imageUrl: rawTag.image_url,
    };
  });

  return { userEmail, userTags };
}

export default function DashboardPage() {
  const { userEmail, userTags } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-slate-50 w-full font-sans pb-12">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm pt-8 pb-6 px-4 mb-8 border-b border-slate-100">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Back to home"
              title="Back to home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </a>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">My Dashboard</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Welcome back, <span className="text-blue-600 font-semibold">{userEmail}</span>
              </p>
            </div>
          </div>
          
          <Form method="post" action="/logout">
            <button 
              type="submit"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
            >
              Log Out
            </button>
          </Form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Your NFC Tags</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
            {userTags.length} Active
          </span>
        </div>

        {/* Empty State */}
        {userTags.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center flex flex-col items-center">
            <div className="bg-blue-50 text-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No active tags yet</h3>
            <p className="text-slate-500 font-medium max-w-sm text-sm">
              You don't have any active tags yet. Tap a new FlashBind tag with your phone to claim it and set it up.
            </p>
          </div>
        ) : (
          /* List of Tags */
          <div className="space-y-4">
            {userTags.map((tag) => (
              <div key={tag.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-shadow hover:shadow-md">
                
                {/* Tag Info */}
                <div className="flex items-center gap-4">
                  {tag.type === 'pet_tag' ? (
                    tag.imageUrl ? (
                      <img 
                        src={tag.imageUrl} 
                        alt={tag.dogName || 'Pet'} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-50 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                      {tag.type === 'google_review' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      )}
                      {tag.type === 'menu' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      )}
                      {tag.type === 'wifi' && (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                        </svg>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {tag.type === 'pet_tag' && (tag.dogName || 'Unnamed Pet')}
                        {tag.type === 'google_review' && 'Google Review'}
                        {tag.type === 'menu' && 'Smart Menu'}
                        {tag.type === 'wifi' && (tag.settings?.network_name || 'Wi-Fi Network')}
                      </h3>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {tag.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Tag ID: #{tag.id}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <a 
                    href={`/p/${tag.id}`} 
                    className="flex-1 sm:flex-none text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-xl transition-colors text-sm"
                  >
                    View Public
                  </a>
                  <a 
                    href={`/edit/${tag.id}`} 
                    className="flex-1 sm:flex-none text-center bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-xl transition-colors text-sm"
                  >
                    Edit Tag
                  </a>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
