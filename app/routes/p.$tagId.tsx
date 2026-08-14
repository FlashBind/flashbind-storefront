import { useLoaderData, redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';


// Tell the root layout to hide the header and footer for this route
export const handle = {
  hideLayout: true,
};

// Server-side Logic (Remix Loader)
export async function loader({ params, context }: LoaderFunctionArgs) {
  const tagId = params.tagId;
  
  if (!tagId) {
    throw new Response('Not Found', { status: 404 });
  }

  const { getSupabaseAdmin } = await import('~/utils/supabase.server');
  const adminSupabase = getSupabaseAdmin(context);
  const { data: rawPet, error } = await adminSupabase.from('tags').select('*').eq('id', tagId).single();

  // If the ID is not found in the DB, return 404
  if (error || !rawPet) {
    throw new Response('Not Found', { status: 404 });
  }

  // If the tag is not claimed, redirect to setup
  if (!rawPet.is_claimed) {
    return redirect(`/setup/${tagId}`);
  }

  // Map snake_case to frontend camelCase
  const pet = {
    id: rawPet.id,
    isClaimed: rawPet.is_claimed,
    type: rawPet.type || 'pet_tag',
    settings: rawPet.settings || {},
    dogName: rawPet.pet_name,
    ownerName: rawPet.owner_name,
    ownerPhone: rawPet.phone,
    ownerEmail: rawPet.owner_email,
    medicalNotes: rawPet.medical_notes,
    imageUrl: rawPet.image_url,
  };

  // Immediate redirect for google_review and menu tags
  if (pet.type === 'google_review' || pet.type === 'menu') {
    const dest = pet.settings.destination_url;
    if (dest) {
      return redirect(dest, 302);
    }
  }

  const userEmail = context.session.get('userEmail');
  const isOwner = Boolean(userEmail && userEmail === pet.ownerEmail);

  return { pet, isOwner, tagId };
}

// Frontend UI
export default function PetTagLandingPage() {
  const { pet, isOwner, tagId } = useLoaderData<typeof loader>();

  if (pet.type === 'wifi') {
    return (
      <div className="min-h-screen bg-slate-50 w-full font-sans flex flex-col items-center md:justify-center p-4">
        <div className="w-full bg-white max-w-[400px] mx-auto border-[12px] border-slate-900 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Connect to Wi-Fi</h1>
          <p className="text-sm font-semibold text-slate-500 mb-8 uppercase tracking-wider">
            {pet.settings?.network_name || 'Guest Network'}
          </p>
          
          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 relative">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</p>
            <p className="text-xl font-mono text-slate-900 font-bold select-all">
              {pet.settings?.network_password || 'Not set'}
            </p>
          </div>

          <button
            onClick={() => {
              if (pet.settings?.network_password) {
                navigator.clipboard.writeText(pet.settings.network_password);
                alert('Password copied to clipboard!');
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm"
          >
            Copy Password
          </button>

          {isOwner && (
            <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
              <a href={`/edit/${tagId}`} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                Edit Tag Details
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full font-sans flex flex-col items-center md:justify-center">
      <div className="w-full bg-white min-h-screen md:min-h-0 md:max-w-[400px] md:mx-auto md:border-[12px] md:border-gray-900 md:rounded-[2.5rem] md:shadow-2xl md:my-12 overflow-hidden">
          {/* Pet Image */}
          <div className="h-72 w-full bg-slate-200">
            <img 
              src={pet.imageUrl} 
              alt={`Photo of ${pet.dogName}`} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Pet Info Content */}
          <div className="p-6 flex flex-col gap-6">
            {/* Header */}
            {isOwner && (
              <div className="text-center flex flex-col items-center gap-3 mb-2">
                <a href={`/edit/${tagId}`} className="block w-full py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                  Edit Profile
                </a>
                <a href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors mb-2">
                  Back to Dashboard
                </a>
                <hr className="w-full border-slate-100 my-2" />
              </div>
            )}
            
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{pet.dogName}</h1>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                If found, please call my owner!
              </p>
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Owner
                </p>
                <p className="text-xl font-semibold text-slate-900">{pet.ownerName}</p>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 gap-3">
                {pet.ownerPhone && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-900">{pet.ownerPhone}</span>
                  </div>
                )}
                {pet.ownerEmail && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-900">{pet.ownerEmail}</span>
                  </div>
                )}
              </div>
              
              {pet.medicalNotes && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Medical Notes
                  </p>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-sm font-medium text-red-900 leading-relaxed">
                      {pet.medicalNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Button */}
            {pet.ownerPhone && (
              <a href={`tel:${pet.ownerPhone}`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full transition-colors text-lg mt-6">
                Call Owner
              </a>
            )}
          </div>
        </div>
      </div>
  );
}
