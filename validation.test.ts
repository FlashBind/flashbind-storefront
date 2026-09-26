import { describe, it, expect, vi } from 'vitest';
import { generateBatch, getSupplierCSV, getInternalCSV, claimTagAtomically, removePinFromSettings, buildReleasedTagUpdate } from './app/utils/tagAdmin.server';
import { retentionCutoff, attachmentPathFromUrl, RATE_LIMIT_RETENTION_DAYS, CONTACT_MESSAGE_RETENTION_DAYS } from './app/utils/retention.server';
import { normalizeTrustedClientIp, buildActivationRateLimitIdentifiers, isSameOriginRequest, assertSameOrigin } from './app/utils/requestSecurity.server';
import crypto from 'node:crypto';
import { escapeHtml } from './app/utils/email.server';

// Fluent Mock Supabase Client Factory
function createMockSupabase(responses: any = {}) {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockImplementation(async () => responses.maybeSingle || { data: null, error: null }),
    single: vi.fn().mockImplementation(async () => responses.single || { data: null, error: null }),
  };

  chain.then = (resolve: any) => resolve(responses.defaultResult || { data: [], error: null });
  return chain;
}

const generateMockTags = (modifyFn?: (tags: any[]) => void) => {
  const tags: any[] = [];
  let num = 1;
  const add = (variant: string, type: string, count: number) => {
    for (let i = 0; i < count; i++) {
      tags.push({
        id: crypto.randomUUID(),
        type,
        product_variant: variant,
        item_number: num++,
        settings: { activation_pin: '123456' },
        is_claimed: false,
        owner_email: null,
      });
    }
  };
  add('digital-menu', 'menu', 25);
  add('guest-wifi', 'wifi', 25);
  add('black-pet-tag', 'pet_tag', 25);
  add('white-pet-tag', 'pet_tag', 25);

  if (modifyFn) modifyFn(tags);
  return tags;
};

describe('Batch Generation Validation', () => {
  it('inserts 100 tags with exact variants', async () => {
    let insertedTags: any[] = [];
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });
    chain.insert.mockImplementation((data: any) => {
      if (Array.isArray(data)) insertedTags = data;
      return chain;
    });

    const result = await generateBatch('BATCH-001', chain);

    expect(result.success).toBe(true);
    expect(insertedTags.length).toBe(100);
  });

  it('fails if existing tags have duplicate item numbers', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[1].item_number = 1; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('Duplicate item number found');
  });

  it('fails if item numbers are not integers', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[0].item_number = 1.5; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('must be an integer');
  });

  it('fails if item numbers are out of bounds', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[0].item_number = 101; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('out of range');
  });

  it('fails if item numbers are below 1', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[0].item_number = 0; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('out of range');
  });

  it('fails if existing tags have variant mismatch', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[0].type = 'wifi'; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('Type mismatch');
  });

  it('fails if existing tags are already claimed', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[0].is_claimed = true; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('claimed or owned');
  });

  it('fails if existing tags have non-null owner_email', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[0].owner_email = 'test@example.com'; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('claimed or owned');
  });

  it('fails if existing tags have invalid UUIDs', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[0].id = 'invalid-uuid'; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('Invalid UUID format');
  });

  it('fails on invalid batch reference format', async () => {
    const chain = createMockSupabase();
    const result = await generateBatch('A', chain);
    expect(result.error).toContain('Invalid batch reference format');
  });

  it('fails if activation PIN is missing during internal verification', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { delete tags[0].settings.activation_pin; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('Missing or malformed activation PIN');
  });

  it('fails if activation PIN is malformed', async () => {
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags(tags => { tags[0].settings.activation_pin = 'abc'; });
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.error).toContain('Missing or malformed activation PIN');
  });
});

describe('CSV Exports', () => {
  it('generates supplier CSV enforcing pet tags do not export URL', async () => {
    const batchId = crypto.randomUUID();
    const chain = createMockSupabase({ defaultResult: { data: generateMockTags(), error: null } });
    const result = await getSupplierCSV(batchId, chain);

    expect(result.error).toBeUndefined();
    expect(result.content).toBeDefined();

    const lines = result.content!.split('\n');
    expect(lines[0]).toBe('Item_Number,Product_Type,Product_Variant,Tag_ID,NFC_URL_To_Encode,Print_Variable_QR,Design_File');

    expect(result.content).not.toContain('123456');
    expect(result.content).not.toContain('activation_pin');
    expect(result.content).not.toContain('settings');

    const menuLine = lines.find(l => l.includes('digital-menu'))!;
    const menuCols = menuLine.split(',');
    expect(menuCols[4]).toBe(menuCols[5]); // URL == Print_Variable_QR

    const wifiLine = lines.find(l => l.includes('guest-wifi'))!;
    const wifiCols = wifiLine.split(',');
    expect(wifiCols[4]).toBe(wifiCols[5]); // URL == Print_Variable_QR

    const blackPetLine = lines.find(l => l.includes('black-pet-tag'))!;
    const blackPetCols = blackPetLine.split(',');
    expect(blackPetCols[5]).toBe('NO');

    const whitePetLine = lines.find(l => l.includes('white-pet-tag'))!;
    const whitePetCols = whitePetLine.split(',');
    expect(whitePetCols[5]).toBe('NO');
  });

  it('fails supplier CSV if missing items', async () => {
    const batchId = crypto.randomUUID();
    const tags = generateMockTags(t => { t.pop(); });
    const chain = createMockSupabase({ defaultResult: { data: tags, error: null } });

    const result = await getSupplierCSV(batchId, chain);
    expect(result.error).toContain('exactly 100 items');
  });

  it('fails internal export if missing items', async () => {
    const batchId = crypto.randomUUID();
    const tags = generateMockTags(t => { t.pop(); });
    const chain = createMockSupabase({ defaultResult: { data: tags, error: null } });

    const result = await getInternalCSV(batchId, chain);
    expect(result.error).toContain('exactly 100 items');
  });

  it('fails supplier export with invalid batchId format', async () => {
    const chain = createMockSupabase();
    const result = await getSupplierCSV('invalid-uuid', chain);
    expect(result.error).toContain('Invalid batch ID');
  });

  it('fails internal export with invalid batchId format', async () => {
    const chain = createMockSupabase();
    const result = await getInternalCSV('invalid-uuid', chain);
    expect(result.error).toContain('Invalid batch ID');
  });
});

describe('Atomic Claiming Helper', () => {
  it('chains correct query conditions for orphans', async () => {
    const mockAdminSupabase = createMockSupabase();
    mockAdminSupabase.maybeSingle.mockResolvedValueOnce({ data: { id: 'tag-1' }, error: null });

    const res = await claimTagAtomically(mockAdminSupabase, 'tag-1', 'user@test.com', true, { is_claimed: true });

    expect(res.success).toBe(true);
    expect(mockAdminSupabase.eq).toHaveBeenCalledWith('id', 'tag-1');
    expect(mockAdminSupabase.eq).toHaveBeenCalledWith('is_claimed', false);
    expect(mockAdminSupabase.is).toHaveBeenCalledWith('owner_email', null);
  });

  it('chains correct query conditions for preassigned tags', async () => {
    const mockAdminSupabase = createMockSupabase();
    mockAdminSupabase.maybeSingle.mockResolvedValueOnce({ data: { id: 'tag-1' }, error: null });

    const res = await claimTagAtomically(mockAdminSupabase, 'tag-1', 'user@test.com', false, { is_claimed: true });

    expect(res.success).toBe(true);
    expect(mockAdminSupabase.eq).toHaveBeenCalledWith('is_claimed', false);
    expect(mockAdminSupabase.eq).toHaveBeenCalledWith('owner_email', 'user@test.com');
  });

  it('returns error if updateData is null (already claimed or condition fail)', async () => {
    const mockAdminSupabase = createMockSupabase();
    mockAdminSupabase.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const res = await claimTagAtomically(mockAdminSupabase, 'tag-1', 'user@test.com', true, { is_claimed: true });

    expect(res.error).toContain('already activated or could not be claimed');
  });
});

describe('Settings Pure Helper', () => {
  it('removes PIN and preserves unrelated settings', () => {
    const settings = { activation_pin: '123456', theme: 'dark', views: 42 };
    const result = removePinFromSettings(settings);
    expect(result).toEqual({ theme: 'dark', views: 42 });
    expect(result).not.toHaveProperty('activation_pin');
  });

  it('returns null if only PIN exists', () => {
    const settings = { activation_pin: '123456' };
    expect(removePinFromSettings(settings)).toBeNull();
  });

  it('returns null if settings is undefined', () => {
    expect(removePinFromSettings(undefined)).toBeNull();
  });
});

describe('Concurrency Unit Simulations', () => {
  it('retries bounded recovery when initial tag fetch returns 0 rows', async () => {
    vi.useFakeTimers();
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    const existingTags = generateMockTags();

    let fetchCount = 0;
    chain.then = (resolve: any) => {
      fetchCount++;
      if (fetchCount === 1) {
         resolve({ data: [], error: null }); // First time returns 0
         vi.advanceTimersByTime(200); // Advance timer to trigger retry
      } else {
         resolve({ data: existingTags, error: null }); // Second time returns 100
      }
    };

    const promise = generateBatch('BATCH-001', chain);
    await vi.runAllTimersAsync();
    const result = await promise;
    expect(result.success).toBe(true);
    expect(fetchCount).toBeGreaterThanOrEqual(2);
    vi.useRealTimers();
  });

  it('handles post-23505 on tag insert (tag unique constraint collision)', async () => {
    vi.useFakeTimers();
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    chain.insert.mockImplementation((data: any) => {
      if (!Array.isArray(data)) {
        return chain;
      }
      return { error: { code: '23505' } };
    });

    const existingTags = generateMockTags();
    chain.then = (resolve: any) => resolve({ data: existingTags, error: null });

    const result = await generateBatch('BATCH-001', chain);
    expect(result.success).toBe(true);
    expect(result.message).toContain('composition is correct');
    vi.useRealTimers();
  });

  it('fails safely if bounded recovery times out (never hits 100 rows)', async () => {
    vi.useFakeTimers();
    const chain = createMockSupabase();
    chain.maybeSingle.mockResolvedValue({ data: null, error: { code: '23505' } });
    chain.single.mockResolvedValue({ data: { id: crypto.randomUUID() }, error: null });

    chain.then = (resolve: any) => {
      resolve({ data: [], error: null });
    };

    const promise = generateBatch('BATCH-001', chain);
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result.error).toContain('Timeout waiting for concurrent batch');
    vi.useRealTimers();
  });
});

describe('Rate-Limit IP Identifier Validation', () => {
  const ACCOUNT_BUCKET = 'u:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  it('accepts a valid IPv4 cf-connecting-ip value', () => {
    expect(normalizeTrustedClientIp('203.0.113.42')).toBe('203.0.113.42');
  });

  it('accepts a valid IPv6 cf-connecting-ip value', () => {
    expect(normalizeTrustedClientIp('2001:db8::1')).toBe('2001:db8::1');
  });

  it('rejects a malformed IP value', () => {
    expect(normalizeTrustedClientIp('not-an-ip')).toBeNull();
    expect(normalizeTrustedClientIp('999.999.999.999')).toBeNull();
  });

  it('rejects a comma-separated list of IPs', () => {
    expect(normalizeTrustedClientIp('203.0.113.42, 198.51.100.7')).toBeNull();
  });

  it('rejects a multiline/embedded-whitespace value', () => {
    expect(normalizeTrustedClientIp('203.0.113.42\n198.51.100.7')).toBeNull();
    expect(normalizeTrustedClientIp('203.0.113.42 198.51.100.7')).toBeNull();
  });

  it('rejects null, undefined, and empty values', () => {
    expect(normalizeTrustedClientIp(null)).toBeNull();
    expect(normalizeTrustedClientIp(undefined)).toBeNull();
    expect(normalizeTrustedClientIp('')).toBeNull();
    expect(normalizeTrustedClientIp('   ')).toBeNull();
  });

  it('a valid cf-connecting-ip adds the secondary bucket', () => {
    const headers = new Headers({ 'cf-connecting-ip': '203.0.113.42' });
    const identifiers = buildActivationRateLimitIdentifiers(headers, ACCOUNT_BUCKET);
    expect(identifiers).toEqual([ACCOUNT_BUCKET, '203.0.113.42']);
  });

  it('x-forwarded-for is ignored entirely, even when cf-connecting-ip is absent', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.42, 198.51.100.7' });
    const identifiers = buildActivationRateLimitIdentifiers(headers, ACCOUNT_BUCKET);
    expect(identifiers).toEqual([ACCOUNT_BUCKET]);
  });

  it('x-forwarded-for is ignored even when it is a validly-formatted single IP', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.42' });
    const identifiers = buildActivationRateLimitIdentifiers(headers, ACCOUNT_BUCKET);
    expect(identifiers).toEqual([ACCOUNT_BUCKET]);
  });

  it('a malformed cf-connecting-ip is ignored, keeping only the account bucket', () => {
    const headers = new Headers({ 'cf-connecting-ip': '203.0.113.42, 198.51.100.7' });
    const identifiers = buildActivationRateLimitIdentifiers(headers, ACCOUNT_BUCKET);
    expect(identifiers).toEqual([ACCOUNT_BUCKET]);
  });

  it('absence of any IP header still retains the hashed account bucket', () => {
    const headers = new Headers();
    const identifiers = buildActivationRateLimitIdentifiers(headers, ACCOUNT_BUCKET);
    expect(identifiers).toEqual([ACCOUNT_BUCKET]);
  });

  it('spoofed/changing forwarding headers cannot remove or replace the account bucket', () => {
    const attempts = [
      new Headers({ 'x-forwarded-for': '10.0.0.1' }),
      new Headers({ 'x-forwarded-for': '10.0.0.2, 10.0.0.3' }),
      new Headers({ 'cf-connecting-ip': 'garbage' }),
      new Headers({ 'cf-connecting-ip': '10.0.0.1', 'x-forwarded-for': '203.0.113.42' }),
      new Headers(),
    ];

    for (const headers of attempts) {
      const identifiers = buildActivationRateLimitIdentifiers(headers, ACCOUNT_BUCKET);
      expect(identifiers[0]).toBe(ACCOUNT_BUCKET);
      expect(identifiers).toContain(ACCOUNT_BUCKET);
    }
  });
});

describe('Same-origin check (CSRF)', () => {
  const post = (headers: Record<string, string>) =>
    new Request('https://flashbind.com/logout', {method: 'POST', headers});

  it('accepts a post whose Origin is this site', () => {
    expect(isSameOriginRequest(post({origin: 'https://flashbind.com', host: 'flashbind.com'}))).toBe(true);
  });

  it('rejects a post from another site', () => {
    expect(isSameOriginRequest(post({origin: 'https://evil.example', host: 'flashbind.com'}))).toBe(false);
  });

  it('rejects a look-alike host', () => {
    expect(isSameOriginRequest(post({origin: 'https://flashbind.com.evil.example', host: 'flashbind.com'}))).toBe(false);
  });

  it('rejects the opaque "null" origin and malformed origins', () => {
    expect(isSameOriginRequest(post({origin: 'null', host: 'flashbind.com'}))).toBe(false);
    expect(isSameOriginRequest(post({origin: 'not a url', host: 'flashbind.com'}))).toBe(false);
  });

  it('uses X-Forwarded-Host when present, like the framework check', () => {
    expect(isSameOriginRequest(post({origin: 'https://flashbind.com', host: 'internal:8080', 'x-forwarded-host': 'flashbind.com'}))).toBe(true);
  });

  it('falls back to Sec-Fetch-Site when Origin is missing', () => {
    expect(isSameOriginRequest(post({'sec-fetch-site': 'same-origin'}))).toBe(true);
    expect(isSameOriginRequest(post({'sec-fetch-site': 'none'}))).toBe(true);
    expect(isSameOriginRequest(post({'sec-fetch-site': 'cross-site'}))).toBe(false);
    expect(isSameOriginRequest(post({'sec-fetch-site': 'same-site'}))).toBe(false);
  });

  it('allows non-browser clients that send neither header', () => {
    expect(isSameOriginRequest(post({}))).toBe(true);
  });

  it('assertSameOrigin throws a 403 response for a cross-site post', () => {
    try {
      assertSameOrigin(post({origin: 'https://evil.example', host: 'flashbind.com'}));
      expect.unreachable('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      expect((e as Response).status).toBe(403);
    }
    expect(() => assertSameOrigin(post({origin: 'https://flashbind.com', host: 'flashbind.com'}))).not.toThrow();
  });
});

describe('Account deletion: tag reset (PRIV-002)', () => {
  it('clears every personal field and unclaims the tag', () => {
    const update = buildReleasedTagUpdate({batch_id: 'b1'});
    expect(update).toMatchObject({
      is_claimed: false, owner_email: null, owner_name: null, pet_name: null,
      phone: null, medical_notes: null, image_url: null,
    });
  });

  it('gives batch tags a fresh 6-digit PIN (satisfies tags_batch_pin_check) and nothing else', () => {
    const update = buildReleasedTagUpdate({batch_id: 'b1'});
    expect(Object.keys(update.settings)).toEqual(['activation_pin']);
    expect((update.settings as {activation_pin: string}).activation_pin).toMatch(/^[0-9]{6}$/);
  });

  it('gives legacy (non-batch) tags empty settings', () => {
    expect(buildReleasedTagUpdate({batch_id: null}).settings).toEqual({});
  });
});

describe('Retention helpers (PRIV-002)', () => {
  it('matches the periods in the Privacy Policy', () => {
    expect(RATE_LIMIT_RETENTION_DAYS).toBe(30);
    expect(CONTACT_MESSAGE_RETENTION_DAYS).toBe(730);
  });

  it('computes the cutoff date', () => {
    expect(retentionCutoff(30, new Date('2026-09-26T00:00:00Z'))).toBe('2026-08-27T00:00:00.000Z');
  });

  it('extracts attachment file names only from the attachments bucket', () => {
    expect(attachmentPathFromUrl('https://x.supabase.co/storage/v1/object/public/attachments/1727-abc.png')).toBe('1727-abc.png');
    expect(attachmentPathFromUrl('https://x.supabase.co/storage/v1/object/public/attachments/a%2F..%2Fb.png')).toBeNull();
    expect(attachmentPathFromUrl('https://x.supabase.co/storage/v1/object/public/other/1727-abc.png')).toBeNull();
    expect(attachmentPathFromUrl(null)).toBeNull();
  });
});

describe('Notification email escaping', () => {
  it('escapes HTML typed by visitors', () => {
    expect(escapeHtml(`<img src=x onerror="alert(1)"> & 'hi'`)).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;hi&#39;');
  });
});
