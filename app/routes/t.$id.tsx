import { redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { getSupabaseAdmin } from '~/utils/supabase.server';

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    return redirect('/');
  }

  const supabase = getSupabaseAdmin(context);

  // Query the redirects table where card_id matches the id parameter
  const { data, error } = await supabase
    .from('redirects')
    .select('destination_url, is_active')
    .eq('card_id', id)
    .single();

  // If no match is found, or if is_active is false, redirect to the home page
  if (error || !data || !data.is_active || !data.destination_url) {
    return redirect('/');
  }

  // Instantly redirect the user to the destination_url
  return redirect(data.destination_url);
}
