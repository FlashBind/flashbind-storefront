/**
 * Data retention (PRIV-002). These periods must match the Privacy Policy.
 *
 * There is no scheduler on Oxygen, so clean-up runs opportunistically:
 * rate-limit rows are purged on activation attempts, and contact/quote
 * messages on new contact or quote submissions. Failures are logged and
 * never block the visitor's request.
 */
export const RATE_LIMIT_RETENTION_DAYS = 30;
export const CONTACT_MESSAGE_RETENTION_DAYS = 730; // 2 years

const ATTACHMENTS_BUCKET = 'attachments';

export function retentionCutoff(days: number, now: Date = new Date()): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** File name inside the attachments bucket, from the stored public URL. */
export function attachmentPathFromUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const marker = `/${ATTACHMENTS_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return null;
  const path = decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
  // Only plain file names are ever uploaded; refuse anything else.
  return /^[A-Za-z0-9._-]+$/.test(path) ? path : null;
}

export async function purgeExpiredRateLimits(admin: any): Promise<void> {
  try {
    const {error} = await admin
      .from('rate_limits')
      .delete()
      .lt('last_attempt_at', retentionCutoff(RATE_LIMIT_RETENTION_DAYS));
    if (error) console.error('[RETENTION] rate_limits purge failed', error.code || 'unknown');
  } catch {
    console.error('[RETENTION] rate_limits purge failed');
  }
}

export async function purgeExpiredContactMessages(admin: any): Promise<void> {
  try {
    const {data: expired, error} = await admin
      .from('contact_messages')
      .select('id, attachment_url')
      .lt('created_at', retentionCutoff(CONTACT_MESSAGE_RETENTION_DAYS))
      .limit(100);
    if (error || !expired?.length) {
      if (error) console.error('[RETENTION] contact_messages lookup failed', error.code || 'unknown');
      return;
    }

    const files = expired
      .map((row: {attachment_url: unknown}) => attachmentPathFromUrl(row.attachment_url))
      .filter((path: string | null): path is string => Boolean(path));
    if (files.length) {
      const {error: storageError} = await admin.storage.from(ATTACHMENTS_BUCKET).remove(files);
      if (storageError) {
        // Keep the rows so the files can be retried next time.
        console.error('[RETENTION] attachment removal failed');
        return;
      }
    }

    const {error: deleteError} = await admin
      .from('contact_messages')
      .delete()
      .in('id', expired.map((row: {id: string}) => row.id));
    if (deleteError) console.error('[RETENTION] contact_messages purge failed', deleteError.code || 'unknown');
  } catch {
    console.error('[RETENTION] contact_messages purge failed');
  }
}
