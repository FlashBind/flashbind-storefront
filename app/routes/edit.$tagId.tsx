import { Form, redirect, useActionData, useNavigation, useLoaderData, useNavigate } from 'react-router';
import { useEffect } from 'react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';


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
  const { data: rawPet, error } = await adminSupabase.from('tags').select('*').eq('id', tagId).single();

  if (error || !rawPet) {
    throw new Response('Not Found', { status: 404 });
  }

  const pet = {
    id: rawPet.id,
    isClaimed: rawPet.is_claimed,
    dogName: rawPet.pet_name,
    ownerName: rawPet.owner_name,
    ownerPhone: rawPet.phone,
    ownerEmail: rawPet.owner_email,
    medicalNotes: rawPet.medical_notes,
    imageUrl: rawPet.image_url,
  };

  // Protect route: Ensure user is logged in
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect(`/login?redirectTo=/edit/${tagId}`);
  }

  // Protect route: Ensure the logged in user is the ACTUAL owner
  if (userEmail !== pet.ownerEmail) {
    return redirect(`/p/${tagId}`);
  }

  const type = rawPet.type || 'pet_tag';
  const settings = rawPet.settings || {};

  return { tagId, pet, userEmail, type, settings };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const tagId = params.tagId;
  
  if (!tagId) {
    throw new Response('Not Found', { status: 404 });
  }

  const { getSupabaseAdmin } = await import('~/utils/supabase.server');
  const adminSupabase = getSupabaseAdmin(context);
  const { data: rawPet, error } = await adminSupabase.from('tags').select('*').eq('id', tagId).single();

  if (error || !rawPet) {
    throw new Response('Not Found', { status: 404 });
  }

  // Protect route: Ensure user is logged in and is the actual owner
  const userEmail = context.session.get('userEmail');
  if (!userEmail || userEmail !== rawPet.owner_email) {
    return redirect(`/login?redirectTo=/edit/${tagId}`);
  }

  const formData = await request.formData();
  const type = rawPet.type || 'pet_tag';
  let updatePayload: any = {};

  if (type === 'pet_tag') {
    const imageBase64 = formData.get('imageBase64') as string;
    let imageUrl = rawPet.image_url;
    if (imageBase64 && imageBase64.startsWith('data:image')) {
      imageUrl = imageBase64;
    }

    const dogName = formData.get('dogName') as string;
    const ownerName = formData.get('ownerName') as string;
    const ownerPhone = formData.get('ownerPhone') as string;
    const medicalNotes = formData.get('medicalNotes') as string;

    if (!dogName || !ownerName || !ownerPhone) {
      return { error: 'Please fill in all required fields' };
    }

    updatePayload = {
      pet_name: dogName,
      owner_name: ownerName,
      phone: ownerPhone,
      medical_notes: medicalNotes,
      image_url: imageUrl,
    };
  } else if (type === 'google_review' || type === 'menu') {
    const destinationUrl = formData.get('destinationUrl') as string;
    if (!destinationUrl) {
      return { error: 'Destination URL is required' };
    }
    try {
      new URL(destinationUrl);
    } catch {
      return { error: 'Please enter a valid URL (including https://)' };
    }
    updatePayload = {
      settings: { ...rawPet.settings, destination_url: destinationUrl }
    };
  } else if (type === 'wifi') {
    const networkName = formData.get('networkName') as string;
    const networkPassword = formData.get('networkPassword') as string;
    if (!networkName || !networkPassword) {
      return { error: 'Network Name and Password are required' };
    }
    updatePayload = {
      settings: { ...rawPet.settings, network_name: networkName, network_password: networkPassword }
    };
  }

  // Update live Supabase database
  const { error: updateError } = await adminSupabase
    .from('tags')
    .update(updatePayload)
    .eq('id', tagId);

  if (updateError) {
    return { error: 'Failed to update database. Please try again.' };
  }

  return { success: true, redirectUrl: `/p/${tagId}` };
}

export default function EditTagPage() {
  const { pet, userEmail, type, settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (actionData?.success && actionData?.redirectUrl) {
      navigate(actionData.redirectUrl);
    }
  }, [actionData, navigate]);

  let title = 'Edit Profile';
  let description = `Update ${pet.dogName}'s information.`;
  if (type === 'google_review') {
    title = 'Edit Google Review Link';
    description = 'Update the destination link for your review stand.';
  } else if (type === 'menu') {
    title = 'Edit Menu Link';
    description = 'Update the destination link for your digital menu.';
  } else if (type === 'wifi') {
    title = 'Edit Wi-Fi Network';
    description = 'Update the Wi-Fi details for your network.';
  }

  return (
    <div className="min-h-screen bg-slate-50 w-full font-sans">
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center p-4 py-12">
        
        {/* Back Button */}
        <div className="mb-4 ml-2">
          <a 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </a>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-md overflow-hidden p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{title}</h1>
            <p className="text-sm font-medium text-slate-500">
              {description}
            </p>
          </div>

          {actionData?.error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl border border-red-100 text-center">
              {actionData.error}
            </div>
          )}

          <Form method="post" encType="multipart/form-data" className="space-y-6">
            
            <div className="space-y-4">
              {type === 'pet_tag' && (
                <>
                  {/* Pet Name */}
                  <div>
                    <label htmlFor="dogName" className="block text-sm font-semibold text-slate-700 mb-1">
                      Pet Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="dogName" 
                      name="dogName" 
                      required
                      defaultValue={pet.dogName}
                      placeholder="e.g. Buddy"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label htmlFor="ownerName" className="block text-sm font-semibold text-slate-700 mb-1">
                      Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="ownerName" 
                      name="ownerName" 
                      required
                      defaultValue={pet.ownerName}
                      placeholder="e.g. Alice Smith"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="ownerPhone" className="block text-sm font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      id="ownerPhone" 
                      name="ownerPhone" 
                      required
                      defaultValue={pet.ownerPhone}
                      placeholder="e.g. (555) 123-4567"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Email (Read-Only) */}
                  <div>
                    <label htmlFor="ownerEmail" className="block text-sm font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      id="ownerEmail" 
                      name="ownerEmail" 
                      value={userEmail}
                      readOnly
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl focus:outline-none transition-all cursor-not-allowed"
                    />
                  </div>

                  {/* Medical Notes */}
                  <div>
                    <label htmlFor="medicalNotes" className="block text-sm font-semibold text-slate-700 mb-1">
                      Medical Notes
                    </label>
                    <textarea 
                      id="medicalNotes" 
                      name="medicalNotes" 
                      rows={3}
                      defaultValue={pet.medicalNotes}
                      placeholder="Allergies, medications, or special needs..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* File Input (Pet Photo) */}
                  <div>
                    <label htmlFor="photo" className="block text-sm font-semibold text-slate-700 mb-1">
                      Update Photo (Optional)
                    </label>
                    <input 
                      type="hidden" 
                      name="imageBase64" 
                      id="imageBase64" 
                    />
                    <input 
                      type="file" 
                      id="photo" 
                      name="photo"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const hiddenInput = document.getElementById('imageBase64') as HTMLInputElement;
                            if (hiddenInput && event.target?.result) {
                              hiddenInput.value = event.target.result.toString();
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                    />
                  </div>
                </>
              )}

              {(type === 'google_review' || type === 'menu') && (
                <div>
                  <label htmlFor="destinationUrl" className="block text-sm font-semibold text-slate-700 mb-1">
                    Destination URL <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="url" 
                    id="destinationUrl" 
                    name="destinationUrl" 
                    required
                    defaultValue={settings.destination_url}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    This is the link your customers will be sent to when they tap the tag.
                  </p>
                </div>
              )}

              {type === 'wifi' && (
                <>
                  <div>
                    <label htmlFor="networkName" className="block text-sm font-semibold text-slate-700 mb-1">
                      Network Name (SSID) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="networkName" 
                      name="networkName" 
                      required
                      defaultValue={settings.network_name}
                      placeholder="e.g. Guest_Network_5G"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="networkPassword" className="block text-sm font-semibold text-slate-700 mb-1">
                      Wi-Fi Password <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="networkPassword" 
                      name="networkPassword" 
                      required
                      defaultValue={settings.network_password}
                      placeholder="Enter the Wi-Fi password"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              
              <a 
                href="/dashboard"
                className="text-center text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </a>
            </div>
            
          </Form>
        </div>
      </div>
    </div>
  );
}
