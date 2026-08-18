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
  const { data: tagData, error } = await adminSupabase.from('tags').select('*').eq('id', tagId).single();

  if (error || !tagData) {
    console.error(`[SETUP] 404 for tag ${tagId}. Error:`, error, 'Data:', tagData);
    throw new Response('Not Found', { status: 404 });
  }

  // Protect route: Ensure user is logged in
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect(`/login?redirectTo=/setup/${tagId}`);
  }

  if (tagData.owner_email && tagData.owner_email !== userEmail) {
    // If it's owned by someone else, redirect to the public page
    return redirect(`/p/${tagId}`);
  }

  // If already setup (claimed), redirect to the public page
  if (tagData.is_claimed) {
    return redirect(`/p/${tagId}`);
  }

  return { tagId, userEmail, type: tagData.type || 'pet_tag', isOrphan: !tagData.owner_email };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const tagId = params.tagId;
  
  if (!tagId) {
    throw new Response('Not Found', { status: 404 });
  }

  const { getSupabaseAdmin } = await import('~/utils/supabase.server');
  const adminSupabase = getSupabaseAdmin(context);
  const { data: tagData, error: fetchError } = await adminSupabase.from('tags').select('*').eq('id', tagId).single();

  if (fetchError || !tagData) {
    throw new Response('Not Found', { status: 404 });
  }

  // Protect route: Ensure user is logged in
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect(`/login?redirectTo=/setup/${tagId}`);
  }

  // Ensure they are the rightful owner of this tag
  if (tagData.owner_email && tagData.owner_email !== userEmail) {
    return { error: 'You are not authorized to setup this tag.' };
  }

  const formData = await request.formData();

  // Prevent overwriting already claimed tags
  if (tagData.is_claimed) {
    return { error: 'This tag has already been activated.' };
  }

  if (!tagData.owner_email) {
    // It's a new orphan tag. Validate the activation PIN.
    const activationPin = formData.get('activation_pin') as string;
    if (!activationPin || tagData.settings?.activation_pin !== activationPin) {
      return { error: 'Invalid Activation PIN. Please check the code included in your packaging.' };
    }
  }

  const type = tagData.type || 'pet_tag';
  
  let updatePayload: any = {
    is_claimed: true,
    owner_email: userEmail,
  };

  if (type === 'pet_tag') {
    const imageBase64 = formData.get('imageBase64') as string;
    let imageUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop';
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
      ...updatePayload,
      pet_name: dogName,
      owner_name: ownerName,
      phone: ownerPhone,
      medical_notes: medicalNotes,
      image_url: imageUrl,
    };
  } else if (type === 'google_review' || type === 'menu') {
    let destinationUrl = formData.get('destinationUrl') as string;
    if (!destinationUrl) {
      return { error: 'Destination URL is required' };
    }
    
    // Automatically prepend https:// if the user forgets it
    if (!destinationUrl.startsWith('http://') && !destinationUrl.startsWith('https://')) {
      destinationUrl = 'https://' + destinationUrl;
    }

    try {
      new URL(destinationUrl);
    } catch {
      return { error: 'Please enter a valid URL' };
    }
    updatePayload = {
      ...updatePayload,
      settings: { destination_url: destinationUrl }
    };
  } else if (type === 'wifi') {
    const networkName = formData.get('networkName') as string;
    const networkPassword = formData.get('networkPassword') as string;
    if (!networkName || !networkPassword) {
      return { error: 'Network Name and Password are required' };
    }
    updatePayload = {
      ...updatePayload,
      settings: { network_name: networkName, network_password: networkPassword }
    };
  }

  // Update live Supabase database
  const { error: updateError } = await adminSupabase
    .from('tags')
    .update(updatePayload)
    .eq('id', tagId);

  if (updateError) {
    console.error('Supabase Update Error:', updateError);
    return { error: 'Failed to save to database. Please try again.' };
  }

  return { success: true, redirectUrl: `/setup/${tagId}/success` };
}

export default function SetupTagPage() {
  const { userEmail, type, isOrphan } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (actionData?.success && actionData?.redirectUrl) {
      navigate(actionData.redirectUrl);
    }
  }, [actionData, navigate]);

  let title = 'Activate Tag';
  let description = 'Set up your tag to get started.';
  if (type === 'pet_tag') {
    description = "Set up your pet's public profile to ensure they can find their way home safely.";
  } else if (type === 'google_review') {
    description = "Enter the link to your Google Review page so customers can tap and review instantly.";
  } else if (type === 'menu') {
    description = "Enter the link to your digital menu.";
  } else if (type === 'wifi') {
    description = "Enter your Wi-Fi details so guests can connect instantly.";
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
              {isOrphan && (
                <div>
                  <label htmlFor="activation_pin" className="block text-sm font-semibold text-slate-700 mb-1">
                    Activation PIN <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="activation_pin" 
                    name="activation_pin" 
                    required
                    placeholder="6-digit PIN"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono tracking-widest text-lg"
                  />
                </div>
              )}
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
                      placeholder="Allergies, medications, or special needs..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* File Input (Pet Photo) */}
                  <div>
                    <label htmlFor="photo" className="block text-sm font-semibold text-slate-700 mb-1">
                      Pet Photo
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
                    defaultValue="https://"
                    placeholder="e.g. yourwebsite.com"
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
                {isSubmitting ? 'Activating...' : 'Activate Tag'}
              </button>
              
              <a 
                href="javascript:history.back()" 
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
