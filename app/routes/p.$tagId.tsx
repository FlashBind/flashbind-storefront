import {
  redirect,
  useLoaderData,
  type ActionFunctionArgs,
  type HeadersFunction,
  type LoaderFunctionArgs,
  type ShouldRevalidateFunction,
} from 'react-router';
import {useState} from 'react';
import { sanitizeTagSettings } from '~/utils/tagSanitizer.server';
import {normalizeHttpUrl} from '~/utils/requestSecurity.server';
import {
  checkFeedbackRateLimit,
  feedbackIpBucket,
  getDualChoiceView,
  isHoneypotFilled,
  parseFeedbackForm,
  recordReviewStandEvent,
  reviewStandSettings,
  sendFeedbackAlert,
  SITE_ORIGIN,
} from '~/utils/feedback.server';
import {purgeExpiredFeedback} from '~/utils/retention.server';
import {DualChoicePage} from '~/components/DualChoicePage';

export const handle = {
  hideLayout: true,
};

// A feedback post that fails validation stays on the same URL and shows the
// error; reloading the loader would only count an extra page view. A
// successful post redirects to ?sent=1, which must load.
export const shouldRevalidate: ShouldRevalidateFunction = ({ formMethod, currentUrl, nextUrl, defaultShouldRevalidate }) =>
  formMethod === 'POST' && currentUrl.href === nextUrl.href ? false : defaultShouldRevalidate;

export const headers: HeadersFunction = () => {
  return new Headers({
    'Cache-Control': 'private, no-store, max-age=0',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  });
};

// Server-side Logic (Remix Loader)
export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const tagId = params.tagId;
  
  if (!tagId) {
    throw new Response('Not Found', { status: 404 });
  }

  const { getSupabaseAdmin } = await import('~/utils/supabase.server');
  const adminSupabase = getSupabaseAdmin(context);
  const { data: rawPet, error } = await adminSupabase
    .from('tags')
    .select('id, is_claimed, type, settings, pet_name, owner_name, phone, owner_email, medical_notes, image_url')
    .eq('id', tagId)
    .single();

  // If the ID is not found in the DB, return 404
  if (error || !rawPet) {
    throw new Response('Not Found', { status: 404 });
  }

  // If the tag is not claimed, redirect to setup
  if (!rawPet.is_claimed) {
    return redirect(`/setup/${tagId}`);
  }

  const type = rawPet.type || 'pet_tag';
  const safeSettings = sanitizeTagSettings(type, rawPet.settings);
  const isPetTag = type === 'pet_tag';

  // Map snake_case to frontend camelCase
  const pet = {
    id: rawPet.id,
    isClaimed: rawPet.is_claimed,
    type,
    settings: safeSettings,
    dogName: isPetTag ? rawPet.pet_name : null,
    ownerName: isPetTag ? rawPet.owner_name : null,
    ownerPhone: isPetTag ? rawPet.phone : null,
    medicalNotes: isPetTag ? rawPet.medical_notes : null,
    imageUrl: isPetTag ? rawPet.image_url : null,
  };

  // Immediate redirect for google_review and menu tags, except review stands
  // with the subscription's Dual Choice page switched on.
  if (pet.type === 'google_review' || pet.type === 'menu') {
    const dest = normalizeHttpUrl(pet.settings.destination_url);
    if (pet.type === 'google_review') {
      const dualChoice = await getDualChoiceView(adminSupabase, rawPet, dest);
      if (dualChoice) {
        const params = new URL(request.url).searchParams;
        const showForm = params.get('feedback') === '1';
        const sent = params.get('sent') === '1';
        // Count real page opens only: not the form view or the thank-you page.
        if (!showForm && !sent) await recordReviewStandEvent(adminSupabase, tagId, 'view');
        // The Google link goes through /p/{id}/google, so no settings are sent.
        return { pet: { ...pet, settings: {} }, isOwner: false, tagId, dualChoice, showForm, sent };
      }
    }
    if (dest) {
      return redirect(dest, 302);
    }

    return redirect('/');
  }

  const userEmail = context.session.get('userEmail');
  // The owner's account email is used only for this check. It is never sent
  // to the browser, because this page is public to anyone who taps the tag.
  const ownerEmail = isPetTag ? rawPet.owner_email : null;
  const isOwner = Boolean(userEmail && userEmail === ownerEmail);

  return { pet, isOwner, tagId, dualChoice: null, showForm: false, sent: false };
}

// Private feedback from a review stand's Dual Choice page.
export async function action({ params, context, request }: ActionFunctionArgs) {
  const tagId = params.tagId;
  if (!tagId) throw new Response('Not Found', { status: 404 });

  const formData = await request.formData();
  // Bots fill the hidden field; pretend it worked and store nothing.
  if (isHoneypotFilled(formData)) return redirect(`/p/${tagId}?sent=1`);

  const { getSupabaseAdmin } = await import('~/utils/supabase.server');
  const admin = getSupabaseAdmin(context);
  const { data: tag } = await admin
    .from('tags')
    .select('id, is_claimed, type, settings, owner_email')
    .eq('id', tagId)
    .maybeSingle();
  if (!tag || !tag.is_claimed || tag.type !== 'google_review') {
    throw new Response('Not Found', { status: 404 });
  }
  const dest = normalizeHttpUrl(sanitizeTagSettings(tag.type, tag.settings).destination_url);
  const view = await getDualChoiceView(admin, tag, dest);
  if (!view) throw new Response('Not Found', { status: 404 });

  const parsed = parseFeedbackForm(formData);
  if ('error' in parsed) return { error: parsed.error };

  if (!(await checkFeedbackRateLimit(admin, tagId, await feedbackIpBucket(request.headers)))) {
    return { error: 'Too many messages were sent just now. Please try again later.' };
  }

  const stand = reviewStandSettings(tag.settings);
  const feedback = parsed.value;
  const { data: saved, error } = await admin
    .from('private_feedback')
    .insert({
      tag_id: tagId,
      owner_email: tag.owner_email,
      location_label: stand.locationLabel || null,
      message: feedback.message,
      contact_name: feedback.contactName,
      contact_email: feedback.contactEmail,
      contact_phone: feedback.contactPhone,
      contact_consent: feedback.contactConsent,
    })
    .select('id')
    .single();
  if (error || !saved) {
    console.error('[FEEDBACK] save failed', error?.code || 'unknown');
    return { error: 'Something went wrong. Please try again.' };
  }

  await recordReviewStandEvent(admin, tagId, 'feedback');
  await purgeExpiredFeedback(admin);
  await sendFeedbackAlert({
    admin,
    env: context.env as Record<string, any>,
    feedbackId: saved.id,
    tagId,
    to: stand.alertEmail || tag.owner_email,
    locationLabel: stand.locationLabel,
    businessName: view.businessName,
    feedback,
    origin: SITE_ORIGIN,
  });

  // Post/redirect/get: a refresh can't resend, and the thank-you page isn't
  // counted as a page view.
  return redirect(`/p/${tagId}?sent=1`);
}

/**
 * Copies the Wi-Fi password and says so on the button. If the browser blocks
 * the clipboard, the guest is told to copy it by hand (the password text is
 * select-all, so one long-press selects it).
 */
function CopyPasswordButton({password}: {password: string}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    window.setTimeout(() => setStatus('idle'), 2500);
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-live="polite"
      className="w-full bg-[#1E3A8A] hover:bg-[#172A66] text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm"
    >
      {status === 'copied'
        ? 'Password copied'
        : status === 'failed'
          ? 'Copy failed: press and hold the password'
          : 'Copy password'}
    </button>
  );
}

// Frontend UI
export default function PetTagLandingPage() {
  const { pet, isOwner, tagId, dualChoice, showForm, sent } = useLoaderData<typeof loader>();

  if (dualChoice) {
    return (
      <DualChoicePage
        tagId={tagId}
        businessName={dualChoice.businessName}
        logo={dualChoice.logo}
        locationLabel={dualChoice.locationLabel}
        brandColor={dualChoice.brandColor}
        initiallyShowForm={showForm}
        sent={sent}
      />
    );
  }

  if (pet.type === 'wifi') {
    return (
      <div className="min-h-screen bg-white md:bg-slate-50 w-full font-sans flex flex-col items-center md:justify-center md:p-4">
        {/* Phones: full-screen page. From md up: the framed card. */}
        <div className="w-full bg-white min-h-screen md:min-h-0 md:max-w-[400px] md:mx-auto md:border-[12px] md:border-slate-900 md:rounded-[2.5rem] md:shadow-2xl px-6 py-10 md:p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#1E3A8A]/5 text-[#1E3A8A] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#1E3A8A]/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Guest Wi-Fi</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Network name</p>
          <p className="text-lg font-semibold text-slate-800 mb-8 break-all">
            {pet.settings?.network_name || 'Guest Network'}
          </p>

          <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 relative">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</p>
            <p className="text-xl font-mono text-slate-900 font-bold select-all break-all">
              {pet.settings?.network_password || 'Not set'}
            </p>
          </div>

          {pet.settings?.network_password && (
            <CopyPasswordButton password={pet.settings.network_password} />
          )}
          <p className="text-sm text-slate-500 mt-6 leading-relaxed">
            Open your phone&apos;s Wi-Fi settings, choose this network and paste the password.
          </p>

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
            {pet.imageUrl ? (
              <img
                src={pet.imageUrl}
                alt={pet.dogName || 'Pet'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20" aria-hidden="true">
                  <circle cx="5.5" cy="10" r="2.2" />
                  <circle cx="9.5" cy="5.5" r="2.2" />
                  <circle cx="14.5" cy="5.5" r="2.2" />
                  <circle cx="18.5" cy="10" r="2.2" />
                  <path d="M12 11c-3 0-6 3.6-6 6.3 0 1.7 1.3 2.7 3 2.7 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.7 0 3-1 3-2.7C18 14.6 15 11 12 11z" />
                </svg>
                <span className="text-sm font-medium">No photo added</span>
              </div>
            )}
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
                    <div className="bg-[#1E3A8A]/10 text-[#1E3A8A] p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-900">{pet.ownerPhone}</span>
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
              <a href={`tel:${pet.ownerPhone}`} className="block w-full text-center bg-[#1E3A8A] hover:bg-[#172A66] text-white font-bold py-4 rounded-full transition-colors text-lg mt-6">
                Call Owner
              </a>
            )}
          </div>
        </div>
      </div>
  );
}
