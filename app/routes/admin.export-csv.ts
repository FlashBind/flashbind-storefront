import { redirect } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { getSupabaseAdmin } from '~/utils/supabase.server';

export async function loader({ context, request }: LoaderFunctionArgs) {
  const userEmail = context.session.get('userEmail');
  if (!userEmail) {
    return redirect('/login?redirectTo=/admin/generate-tags');
  }

  const adminEmail = (context.env as any).ADMIN_EMAIL;
  if (!adminEmail || userEmail !== adminEmail) {
    return new Response('Not authorized', { status: 403 });
  }

  try {
    const supabase = getSupabaseAdmin(context);
    const { data: tags, error } = await supabase.from('tags').select('*').eq('is_claimed', false);
    
    if (error) {
      return new Response('Failed to load tags from database: ' + error.message, { status: 500 });
    }

    if (!tags || tags.length === 0) {
      return new Response('No unclaimed tags found', { status: 404 });
    }

    // Sort by type safely
    tags.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    
    const csvRows = [
      ['Item_Number', 'Product_Type', 'Tag_ID', 'NFC_URL_To_Encode', 'Print_Variable_QR', 'Activation_PIN', 'Design_File']
    ];
    
    let i = 1;
    let petTagCount = 0;
    for (const tag of tags) {
      let designFile = '';
      let productType = '';
      let printQR = `https://flashbind.com/p/${tag.id}`;
      
      const type = tag.type || '';
      
      if (type === 'pet_tag') {
          petTagCount++;
          const isBlack = petTagCount % 2 !== 0;
          productType = isBlack ? 'Black Pet Tag' : 'White Pet Tag'; 
          designFile = isBlack ? 'black_pet_tag_design' : 'white_pet_tag_design';
          printQR = 'NO';
      } else if (type === 'wifi') {
          productType = 'Wi-Fi Stand';
          designFile = 'wifi_stand_design';
      } else if (type === 'menu' || type === 'google_review') {
          productType = 'Menu Stand';
          designFile = 'menu_stand_design';
      }
      
      const pin = tag.settings?.activation_pin || '';
      
      csvRows.push([
        String(i++).padStart(3, '0'),
        productType,
        tag.id,
        `https://flashbind.com/p/${tag.id}`,
        printQR,
        pin,
        designFile
      ]);
    }

    const csvContent = csvRows.map(e => e.join(',')).join('\n');
    
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="flashbind_tags_order.csv"'
      }
    });
  } catch (err: any) {
    return new Response('Server error generating CSV: ' + (err.message || String(err)), { status: 500 });
  }
}
