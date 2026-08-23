import { Form, useActionData, useNavigation, redirect, isRouteErrorResponse, useRouteError } from 'react-router';
import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { getSupabaseAdmin } from '~/utils/supabase.server';

export const handle = {
  hideLayout: true,
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect('/login?redirectTo=/admin/generate-tags');
  }

  const adminEmail = (context.env as any).ADMIN_EMAIL;
  if (!adminEmail || userEmail !== adminEmail) {
    throw new Response('Not authorized', { status: 403 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get('export') === 'csv') {
    const supabase = getSupabaseAdmin(context);
    const { data: tags, error } = await supabase.from('tags').select('*').eq('is_claimed', false);
    if (error) {
      throw new Response('Failed to load tags for export', { status: 500 });
    }

    // Sort by type
    tags.sort((a, b) => a.type.localeCompare(b.type));
    
    const csvRows = [
      ['Item_Number', 'Product_Type', 'Tag_ID', 'NFC_URL_To_Encode', 'Print_Variable_QR', 'Activation_PIN', 'Design_File']
    ];
    
    let i = 1;
    let petTagCount = 0;
    for (const tag of tags) {
      let designFile = '';
      let productType = '';
      let printQR = `https://flashbind.com/p/${tag.id}`;
      
      if (tag.type === 'pet_tag') {
          petTagCount++;
          const isBlack = petTagCount % 2 !== 0;
          productType = isBlack ? 'Black Pet Tag' : 'White Pet Tag'; 
          designFile = isBlack ? 'black_pet_tag_design' : 'white_pet_tag_design';
          printQR = 'NO';
      } else if (tag.type === 'wifi') {
          productType = 'Wi-Fi Stand';
          designFile = 'wifi_stand_design';
      } else if (tag.type === 'menu' || tag.type === 'google_review') {
          productType = 'Menu Stand';
          designFile = 'menu_stand_design';
      }
      
      csvRows.push([
        String(i++).padStart(3, '0'),
        productType,
        tag.id,
        `https://flashbind.com/p/${tag.id}`,
        printQR,
        tag.settings?.activation_pin || '',
        designFile
      ]);
    }

    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="flashbind_tags_order.csv"'
      }
    });
  }

  return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect('/login?redirectTo=/admin/generate-tags');
  }

  const adminEmail = (context.env as any).ADMIN_EMAIL;
  if (!adminEmail || userEmail !== adminEmail) {
    throw new Response('Not authorized', { status: 403 });
  }

  const formData = await request.formData();
  const type = formData.get('type') as string;
  const quantityStr = formData.get('quantity') as string;
  const quantity = parseInt(quantityStr, 10);

  if (!type || !quantity || quantity < 1 || quantity > 100) {
    return { error: 'Invalid type or quantity (must be between 1 and 100).' };
  }

  const supabase = getSupabaseAdmin(context);
  
  const newTags = [];
  for (let i = 1; i <= quantity; i++) {
    let newId;
    while (true) {
      newId = crypto.randomUUID().split('-')[0];
      const { data } = await supabase.from('tags').select('id').eq('id', newId).single();
      if (!data) break; // Unique
    }
    const activationPin = Math.floor(100000 + Math.random() * 900000).toString();
    newTags.push({
      id: newId,
      type: type,
      settings: { activation_pin: activationPin },
      is_claimed: false,
      owner_email: null,
    });
  }

  const { error: insertError } = await supabase.from('tags').insert(newTags);
  if (insertError) {
    console.error('Supabase insert error:', insertError);
    return { error: `Failed to insert new tags: ${insertError.message}` };
  }

  const host = new URL(request.url).origin;
  const results = newTags.map(tag => ({
    id: tag.id,
    type: tag.type,
    pin: tag.settings.activation_pin,
    url: `${host}/p/${tag.id}`,
  }));

  return { success: true, results };
}

export default function AdminGenerateTagsPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-slate-50 w-full font-sans p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Admin: Generate Tags</h1>
          <div className="flex items-center gap-6">
            <a href="/admin/generate-tags?export=csv" download="flashbind_tags_order.csv" className="inline-flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Order CSV
            </a>
            <a href="/dashboard" className="text-blue-600 font-semibold hover:underline">
              Back to Dashboard
            </a>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Bulk Create Blank Tags</h2>
          
          {actionData?.error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl border border-red-100">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2">
                  Tag Type
                </label>
                <select 
                  id="type" 
                  name="type" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-slate-700"
                >
                  <option value="pet_tag">Pet Tag</option>
                  <option value="google_review">Google Review</option>
                  <option value="menu">Menu</option>
                  <option value="wifi">Wi-Fi</option>
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-slate-700 mb-2">
                  Quantity to Generate
                </label>
                <input 
                  type="number" 
                  id="quantity" 
                  name="quantity" 
                  min="1"
                  max="100"
                  defaultValue="10"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Generating...' : 'Generate Tags'}
            </button>
          </Form>
        </div>

        {actionData?.success && actionData.results && (
          <div className="bg-green-50 rounded-3xl border border-green-200 p-8">
            <h3 className="text-xl font-bold text-green-900 mb-2">Successfully Generated!</h3>
            <p className="text-green-800 text-sm mb-6">
              You can copy these URLs to program your NFC tags.
            </p>
            
            <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">ID</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Activation PIN</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Public URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {actionData.results.map((tag: any) => (
                    <tr key={tag.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-900">#{tag.id}</td>
                      <td className="px-4 py-3 text-slate-600">{tag.type}</td>
                      <td className="px-4 py-3 font-mono text-red-600 font-bold">{tag.pin}</td>
                      <td className="px-4 py-3 font-mono text-blue-600">{tag.url}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error) && error.status === 403) {
    return (
      <div className="min-h-screen bg-slate-50 w-full font-sans flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-red-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Not Authorized</h1>
          <p className="text-slate-500 font-medium mb-8">
            You don't have permission to access the admin tools.
          </p>
          <a 
            href="/dashboard" 
            className="inline-block w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-full transition-colors text-lg shadow-sm"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-2xl w-full">
        <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-slate-700 font-medium mb-4">An unexpected error occurred:</p>
        <pre className="bg-slate-100 p-4 rounded-xl text-sm overflow-auto text-red-800 break-words whitespace-pre-wrap">
          {errorMessage}
        </pre>
      </div>
    </div>
  );
}
