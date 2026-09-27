import {redirect, type LoaderFunctionArgs} from 'react-router';
import {getSupabaseAdmin} from '~/utils/supabase.server';
import {normalizeHttpUrl} from '~/utils/requestSecurity.server';
import {sanitizeTagSettings} from '~/utils/tagSanitizer.server';
import {recordReviewStandEvent, reviewStandSettings} from '~/utils/feedback.server';

// "Leave a Google review" on the Dual Choice page. Counts the click (a daily
// total, no cookies or personal data), then sends the visitor to the stand's
// Google review link.
export async function loader({params, context}: LoaderFunctionArgs) {
  const tagId = params.tagId;
  if (!tagId) throw new Response('Not Found', {status: 404});

  const admin = getSupabaseAdmin(context);
  const {data: tag} = await admin
    .from('tags')
    .select('id, is_claimed, type, settings')
    .eq('id', tagId)
    .maybeSingle();
  if (!tag || !tag.is_claimed || tag.type !== 'google_review') {
    throw new Response('Not Found', {status: 404});
  }

  const dest = normalizeHttpUrl(sanitizeTagSettings(tag.type, tag.settings).destination_url);
  if (!dest) return redirect('/');

  if (reviewStandSettings(tag.settings).dualChoiceEnabled) {
    await recordReviewStandEvent(admin, tagId, 'google');
  }

  return redirect(dest, {
    status: 302,
    headers: {'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow'},
  });
}
