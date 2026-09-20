export function generateActivationPin() {
  const values = new Uint32Array(1);
  const unbiasedLimit = Math.floor(0x100000000 / 900000) * 900000;
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= unbiasedLimit);
  return String(100000 + (values[0] % 900000));
}

export function validateCompleteBatchCore(tags: any[], requirePins: boolean) {
  if (!tags || tags.length !== 100) {
    return { error: `Batch must contain exactly 100 items. Found ${tags?.length || 0}.` };
  }

  const counts = { 'digital-menu': 0, 'guest-wifi': 0, 'black-pet-tag': 0, 'white-pet-tag': 0 };
  const itemNumbers = new Set();
  const uuids = new Set();

  for (const tag of tags) {
    if (uuids.has(tag.id)) return { error: 'Duplicate UUID found.' };
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tag.id)) {
      return { error: 'Invalid UUID format.' };
    }
    uuids.add(tag.id);

    if (!Number.isInteger(tag.item_number)) return { error: 'Item number must be an integer.' };
    if (tag.item_number < 1 || tag.item_number > 100) return { error: 'Item number out of range.' };
    if (itemNumbers.has(tag.item_number)) return { error: 'Duplicate item number found.' };
    itemNumbers.add(tag.item_number);

    if (tag.is_claimed !== false || tag.owner_email !== null) {
      return { error: 'Batch contains claimed or owned tags.' };
    }

    const variant = tag.product_variant;
    if (Object.prototype.hasOwnProperty.call(counts, variant)) {
      counts[variant as keyof typeof counts]++;
    } else {
      return { error: `Invalid variant '${variant}' found.` };
    }

    if (variant === 'digital-menu' && tag.type !== 'menu') return { error: 'Type mismatch for digital-menu.' };
    if (variant === 'guest-wifi' && tag.type !== 'wifi') return { error: 'Type mismatch for guest-wifi.' };
    if (variant === 'black-pet-tag' && tag.type !== 'pet_tag') return { error: 'Type mismatch for black-pet-tag.' };
    if (variant === 'white-pet-tag' && tag.type !== 'pet_tag') return { error: 'Type mismatch for white-pet-tag.' };

    if (requirePins) {
      const pin = tag.settings?.activation_pin;
      if (!pin || !/^[0-9]{6}$/.test(pin)) {
        return { error: 'Missing or malformed activation PIN.' };
      }
    }
  }

  if (
    counts['digital-menu'] !== 25 ||
    counts['guest-wifi'] !== 25 ||
    counts['black-pet-tag'] !== 25 ||
    counts['white-pet-tag'] !== 25
  ) {
    return { error: 'Invalid variant composition.' };
  }

  return { success: true };
}

export async function awaitCompleteBatch(supabase: any, batchId: string, sleepFn: (ms: number) => Promise<void> = ms => new Promise(r => setTimeout(r, ms))) {
  const startTime = Date.now();
  const deadlineMs = 10000;
  let delayMs = 150;
  const maxDelayMs = 2000;

  while (Date.now() - startTime < deadlineMs) {
    const { data: existingTags, error: tagFetchError } = await supabase
      .from('tags')
      .select('id, type, product_variant, item_number, is_claimed, owner_email, settings')
      .eq('batch_id', batchId);

    if (tagFetchError) {
      console.error('[TAG FETCH ERROR]', tagFetchError.code || 'unknown');
      return { error: 'Failed to verify existing tags in batch.' };
    }

    if (existingTags && existingTags.length === 100) {
      const validation = validateCompleteBatchCore(existingTags, true);
      if (validation.error) {
        return { error: `Conflicting batch exists. ${validation.error} Manual review required.` };
      }
      return { success: true };
    } else if (existingTags && existingTags.length > 0 && existingTags.length < 100) {
      return { error: `Conflicting batch exists with partial tags (${existingTags.length}). Manual review required.` };
    }

    await sleepFn(delayMs);
    delayMs = Math.min(delayMs * 1.5, maxDelayMs);
  }

  return { error: 'Timeout waiting for concurrent batch to complete. Manual review required.' };
}

export type BatchResult = {
  success?: boolean;
  error?: string;
  batchId?: string;
  existing?: boolean;
  message?: string;
};

export async function generateBatch(batchReferenceRaw: string, supabase: any): Promise<BatchResult> {
  const batchReference = String(batchReferenceRaw).trim().toUpperCase();
  if (!/^[A-Z0-9.\-_]{3,64}$/.test(batchReference)) {
    return { error: 'Invalid batch reference format.' };
  }

  const { data: batch, error: batchError } = await supabase
    .from('tag_batches')
    .insert({ batch_reference: batchReference })
    .select('id')
    .maybeSingle();

  let batchId;
  if (batchError && batchError.code === '23505') {
    const { data: existingBatch, error: existingBatchError } = await supabase
      .from('tag_batches')
      .select('id')
      .eq('batch_reference', batchReference)
      .single();

    if (existingBatchError || !existingBatch) return { error: 'Failed to retrieve existing batch.' };
    batchId = existingBatch.id;

    const validation = await awaitCompleteBatch(supabase, batchId);
    if (validation.error) return validation;

    return { success: true, batchId, existing: true, message: 'Batch already exists and composition is correct.' };
  } else if (batchError || !batch) {
    console.error('[BATCH INSERT ERROR]', batchError?.code || 'unknown');
    return { error: 'Failed to create batch.' };
  } else {
    batchId = batch.id;
  }

  const variants = [
    { variant: 'digital-menu', type: 'menu', count: 25 },
    { variant: 'guest-wifi', type: 'wifi', count: 25 },
    { variant: 'black-pet-tag', type: 'pet_tag', count: 25 },
    { variant: 'white-pet-tag', type: 'pet_tag', count: 25 }
  ];

  const newTags = [];
  let itemNumber = 1;

  for (const v of variants) {
    for (let i = 0; i < v.count; i++) {
      newTags.push({
        id: crypto.randomUUID(),
        batch_id: batchId,
        product_variant: v.variant,
        type: v.type,
        item_number: itemNumber++,
        settings: { activation_pin: generateActivationPin() },
        is_claimed: false,
        owner_email: null,
      });
    }
  }

  const { error: insertError } = await supabase.from('tags').insert(newTags);
  if (insertError) {
    console.error('[TAG INSERT ERROR]', insertError.code || 'unknown');
    if (insertError.code === '23505') {
       const validation = await awaitCompleteBatch(supabase, batchId);
       if (validation.error) return validation;
       return { success: true, batchId, existing: true, message: 'Batch already exists and composition is correct.' };
    }
    return { error: 'Failed to insert tags.' };
  }

  return { success: true, batchId, existing: false, message: 'Batch successfully generated.' };
}

function generateCSVContent(headers: string[], rows: (string | number)[][]) {
  const allRows = [headers, ...rows];
  return allRows.map(row => row.map(cell => {
    let cellStr = String(cell);
    if (cellStr.match(/^[=+\-@\t\r]/)) {
      cellStr = "'" + cellStr;
    }
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  }).join(',')).join('\n');
}

export type CsvResult = {
  error?: string;
  content?: string;
};

export async function getSupplierCSV(batchId: string, supabase: any): Promise<CsvResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(batchId)) {
    return { error: 'Invalid batch ID.' };
  }

  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, type, product_variant, item_number, is_claimed, owner_email')
    .eq('batch_id', batchId)
    .order('item_number', { ascending: true });

  if (error || !tags) {
    console.error('[TAG LOAD ERROR]', error?.code || 'unknown');
    return { error: 'Failed to load tags.' };
  }

  const validation = validateCompleteBatchCore(tags, false);
  if (validation.error) {
    return { error: `Export refused: ${validation.error}` };
  }

  const headers = ['Item_Number', 'Product_Type', 'Product_Variant', 'Tag_ID', 'NFC_URL_To_Encode', 'Print_Variable_QR', 'Design_File'];
  const rows = [];
  const uniqueUrls = new Set();

  for (const tag of tags) {
    const url = `https://flashbind.com/p/${tag.id}`;
    if (uniqueUrls.has(url)) return { error: 'Export refused: Duplicate URL found.' };
    uniqueUrls.add(url);

    let productType = '';
    let designFile = '';
    let printQR = url;

    if (tag.product_variant === 'digital-menu') {
      productType = 'Menu Stand';
      designFile = 'menu_stand_design';
    } else if (tag.product_variant === 'guest-wifi') {
      productType = 'Wi-Fi Stand';
      designFile = 'wifi_stand_design';
    } else if (tag.product_variant === 'black-pet-tag') {
      productType = 'Black Pet Tag';
      designFile = 'black_pet_tag_design';
      printQR = 'NO';
    } else if (tag.product_variant === 'white-pet-tag') {
      productType = 'White Pet Tag';
      designFile = 'white_pet_tag_design';
      printQR = 'NO';
    }

    if (tag.type === 'menu' || tag.type === 'wifi') {
        if (printQR !== url) return { error: 'Export refused: QR/NFC mismatch for menu/wifi.' };
    } else if (tag.type === 'pet_tag') {
        if (printQR !== 'NO') return { error: 'Export refused: Pet tags must not have a QR.' };
    }

    rows.push([
      String(tag.item_number).padStart(3, '0'),
      productType,
      tag.product_variant,
      tag.id,
      url,
      printQR,
      designFile
    ]);
  }

  return { content: generateCSVContent(headers, rows) };
}

export async function getInternalCSV(batchId: string, supabase: any): Promise<CsvResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(batchId)) {
    return { error: 'Invalid batch ID.' };
  }

  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, type, product_variant, item_number, is_claimed, owner_email, settings')
    .eq('batch_id', batchId)
    .order('item_number', { ascending: true });

  if (error || !tags) {
    console.error('[TAG LOAD ERROR]', error?.code || 'unknown');
    return { error: 'Failed to load tags.' };
  }

  const validation = validateCompleteBatchCore(tags, true);
  if (validation.error) {
    return { error: `Internal export refused: ${validation.error}` };
  }

  const headers = ['Item_Number', 'Tag_ID', 'Activation_PIN', 'URL'];
  const rows = [];

  for (const tag of tags) {
    const pin = tag.settings?.activation_pin;
    const url = `https://flashbind.com/p/${tag.id}`;
    rows.push([
      String(tag.item_number).padStart(3, '0'),
      tag.id,
      pin,
      url
    ]);
  }

  return { content: generateCSVContent(headers, rows) };
}

export type ClaimResult = {
  success?: boolean;
  error?: string;
};

export async function claimTagAtomically(
  supabase: any,
  tagId: string,
  userEmail: string,
  isOrphan: boolean,
  updatePayload: any
): Promise<ClaimResult> {
  let updateQuery = supabase
    .from('tags')
    .update(updatePayload)
    .eq('id', tagId)
    .eq('is_claimed', false);

  if (isOrphan) {
    updateQuery = updateQuery.is('owner_email', null);
  } else {
    updateQuery = updateQuery.eq('owner_email', userEmail);
  }

  const { error: updateError, data: updateData } = await updateQuery
    .select('id')
    .maybeSingle();

  if (updateError) {
    console.error('[ATOMIC CLAIM ERROR]', updateError.code || 'unknown');
    return { error: 'Failed to save to database.' };
  }

  if (!updateData) {
    return { error: 'Tag already activated or could not be claimed.' };
  }

  return { success: true };
}

export function removePinFromSettings(settings: any) {
  if (!settings) return null;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { activation_pin, ...rest } = settings;
  return Object.keys(rest).length > 0 ? rest : null;
}
