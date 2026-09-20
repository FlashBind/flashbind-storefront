import { redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { getSupabaseAdmin } from '~/utils/supabase.server';
import { getInternalCSV } from '~/utils/tagAdmin.server';

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect('/login?redirectTo=/admin/generate-tags');
  }

  const adminEmail = (context.env as any).ADMIN_EMAIL;
  if (!adminEmail || userEmail !== adminEmail) {
    return new Response('Not authorized', { status: 403 });
  }

  const url = new URL(request.url);
  const batchId = url.searchParams.get('batchId');

  if (!batchId) {
    return new Response('Missing batchId parameter', { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin(context);
    const result = await getInternalCSV(batchId, supabase);

    if (result.error) {
      return new Response(result.error, { status: 400 });
    }

    return new Response(result.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'private, no-store, max-age=0',
        'Content-Disposition': `attachment; filename="flashbind_tags_internal_${batchId.slice(0, 8)}.csv"`
      }
    });
  } catch (err: any) {
    console.error('[EXPORT INTERNAL CSV ERROR] Unexpected server error.');
    return new Response('Server error generating CSV. Please try again.', { status: 500 });
  }
}
