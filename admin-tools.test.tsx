import {describe, it, expect, vi} from 'vitest';
import {renderToString} from 'react-dom/server';
import {createRoutesStub} from 'react-router';
import {
  createDemoPage,
  createReviewStand,
  DEMO_DAYS,
  DEMO_EMAIL_DOMAIN,
  parseDemoForm,
  requireAdminEmail,
} from './app/utils/adminTools.server';
import {brandTextOnWhite, inkOnBrandColor, normalizeBrandColor, tintBrandColor} from './app/utils/brandColor';
import {getDualChoiceView} from './app/utils/feedback.server';
import {DualChoicePage} from './app/components/DualChoicePage';

const routeDb = vi.hoisted(() => ({admin: null as any}));
vi.mock('~/utils/supabase.server', () => ({getSupabaseAdmin: () => routeDb.admin}));

const reviewStandRoute = await import('./app/routes/admin.review-stand');
const demoPageRoute = await import('./app/routes/admin.demo-page');

/** Supabase stand-in: records inserts/deletes, fails the tables listed in `fail`. */
function fakeAdmin(fail: string[] = []) {
  const inserts: Array<[string, any]> = [];
  const deletes: Array<[string, string, unknown]> = [];
  const admin = {
    from(table: string) {
      return {
        insert: vi.fn(async (row: any) => {
          inserts.push([table, row]);
          return {error: fail.includes(table) ? {code: '23505'} : null};
        }),
        delete: () => ({
          eq: vi.fn(async (column: string, value: unknown) => {
            deletes.push([table, column, value]);
            return {error: null};
          }),
        }),
      };
    },
  };
  return {admin, inserts, deletes};
}

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

function context(userEmail: string | undefined, adminEmail: string | undefined) {
  return {session: {get: () => userEmail}, env: {ADMIN_EMAIL: adminEmail}};
}

describe('brand colour', () => {
  it('accepts #rrggbb only, lowercased', () => {
    expect(normalizeBrandColor(' #FF8800 ')).toBe('#ff8800');
    expect(normalizeBrandColor('#f80')).toBeNull();
    expect(normalizeBrandColor('red')).toBeNull();
    expect(normalizeBrandColor('#ff8800; background:url(x)')).toBeNull();
    expect(normalizeBrandColor(null)).toBeNull();
  });

  it('picks readable text on the colour', () => {
    expect(inkOnBrandColor('#0f172a')).toBe('#ffffff');
    expect(inkOnBrandColor('#1e3a8a')).toBe('#ffffff');
    expect(inkOnBrandColor('#facc15')).toBe('#0f172a');
    expect(inkOnBrandColor('#ffffff')).toBe('#0f172a');
  });

  it('uses the colour as text on white only when it is readable', () => {
    expect(brandTextOnWhite('#1e3a8a')).toBe('#1e3a8a');
    expect(brandTextOnWhite('#facc15')).toBe('#0f172a');
    expect(brandTextOnWhite('not a colour')).toBe('#0f172a');
  });

  it('mixes the colour with white', () => {
    expect(tintBrandColor('#000000', 0)).toBe('#ffffff');
    expect(tintBrandColor('#000000', 1)).toBe('#000000');
    expect(tintBrandColor('#000000', 0.5)).toBe('#808080');
    expect(tintBrandColor('#1e3a8a', 2)).toBe('#1e3a8a');
  });
});

describe('requireAdminEmail', () => {
  it('redirects to login without a session', () => {
    try {
      requireAdminEmail(context(undefined, 'admin@flashbind.com'), '/admin/review-stand');
      expect.fail('should throw');
    } catch (error) {
      expect((error as Response).status).toBe(302);
      expect((error as Response).headers.get('Location')).toBe('/login?redirectTo=/admin/review-stand');
    }
  });

  it('refuses other accounts, and everyone when ADMIN_EMAIL is unset', () => {
    for (const ctx of [context('someone@example.com', 'admin@flashbind.com'), context('admin@flashbind.com', undefined)]) {
      try {
        requireAdminEmail(ctx, '/admin/demo-page');
        expect.fail('should throw');
      } catch (error) {
        expect((error as Response).status).toBe(403);
      }
    }
  });

  it('returns the admin email', () => {
    expect(requireAdminEmail(context('admin@flashbind.com', 'admin@flashbind.com'), '/x')).toBe('admin@flashbind.com');
  });
});

describe('createReviewStand', () => {
  it('creates one unclaimed, unowned google_review tag with a 6-digit PIN', async () => {
    const {admin, inserts} = fakeAdmin();
    const result = await createReviewStand(admin);
    if (!('pin' in result)) throw new Error('expected success');

    expect(inserts).toHaveLength(1);
    const [table, row] = inserts[0];
    expect(table).toBe('tags');
    expect(row).toEqual({
      id: result.tagId,
      type: 'google_review',
      is_claimed: false,
      owner_email: null,
      settings: {activation_pin: result.pin},
    });
    expect(result.pin).toMatch(/^[0-9]{6}$/);
    expect(result.tagId).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.url).toBe(`https://flashbind.com/p/${result.tagId}`);
  });

  it('reports a failed insert without the PIN', async () => {
    const {admin} = fakeAdmin(['tags']);
    const result = await createReviewStand(admin);
    expect(result).toEqual({error: 'Could not create the review stand. Please try again.'});
  });
});

describe('parseDemoForm', () => {
  const valid = {businessName: 'Cafe Melga', googleUrl: 'https://g.page/r/abc/review'};

  it('needs a business name and a Google link', () => {
    expect(parseDemoForm(form({googleUrl: valid.googleUrl}))).toEqual({error: 'Enter the business name.'});
    expect('error' in parseDemoForm(form({businessName: 'Cafe'}))).toBe(true);
    expect('error' in parseDemoForm(form({...valid, googleUrl: 'javascript:alert(1)'}))).toBe(true);
  });

  it('rejects a malformed colour and a non-image logo', () => {
    expect(parseDemoForm(form({...valid, brandColor: 'blue'}))).toEqual({
      error: 'Enter the brand colour as #RRGGBB, or leave it empty.',
    });
    expect('error' in parseDemoForm(form({...valid, logo: 'data:image/svg+xml;base64,AAAA'}))).toBe(true);
  });

  it('rejects an over-long branch label', () => {
    expect('error' in parseDemoForm(form({...valid, locationLabel: 'x'.repeat(81)}))).toBe(true);
  });

  it('returns clean values', () => {
    expect(
      parseDemoForm(
        form({
          ...valid,
          displayName: ' Melga ',
          locationLabel: ' Old Town ',
          brandColor: '#AA3300',
          logo: 'data:image/png;base64,AAAA',
          logoBackground: '#000000',
        }),
      ),
    ).toEqual({
      value: {
        businessName: 'Cafe Melga',
        displayName: 'Melga',
        logo: 'data:image/png;base64,AAAA',
        logoBackground: '#000000',
        locationLabel: 'Old Town',
        brandColor: '#aa3300',
        googleUrl: 'https://g.page/r/abc/review',
        pageLanguage: 'lt',
      },
    });
    expect(parseDemoForm(form(valid))).toEqual({
      value: {
        businessName: 'Cafe Melga',
        displayName: null,
        logo: null,
        logoBackground: null,
        locationLabel: '',
        brandColor: null,
        googleUrl: 'https://g.page/r/abc/review',
        pageLanguage: 'lt',
      },
    });
  });

  it('ignores a logo background without a logo, and a malformed one', () => {
    expect(parseDemoForm(form({...valid, logoBackground: '#000000'}))).toMatchObject({value: {logoBackground: null}});
    expect(
      parseDemoForm(form({...valid, logo: 'data:image/png;base64,AAAA', logoBackground: 'black'})),
    ).toMatchObject({value: {logoBackground: null}});
  });

  it('takes the page language, Lithuanian by default', () => {
    expect(parseDemoForm(form({...valid, pageLanguage: 'en'}))).toMatchObject({value: {pageLanguage: 'en'}});
    expect('error' in parseDemoForm(form({...valid, pageLanguage: 'ru'}))).toBe(true);
  });
});

describe('createDemoPage', () => {
  const input = {
    businessName: 'Cafe Melga',
    displayName: 'Melga',
    logo: null,
    logoBackground: null,
    locationLabel: 'Old Town',
    brandColor: '#aa3300',
    googleUrl: 'https://g.page/r/abc/review',
    pageLanguage: 'lt' as const,
  };
  const now = new Date('2026-10-01T12:00:00Z');

  it('creates a time-limited demo account and a Dual Choice stand alerting the admin', async () => {
    const {admin, inserts} = fakeAdmin();
    const result = await createDemoPage(admin, input, 'Admin@FlashBind.com', now);
    if (!('tagId' in result)) throw new Error('expected success');

    const [[entTable, ent], [tagTable, tag]] = inserts;
    expect(entTable).toBe('business_entitlements');
    expect(ent.owner_email).toBe(result.ownerEmail);
    expect(result.ownerEmail.endsWith(`@${DEMO_EMAIL_DOMAIN}`)).toBe(true);
    expect(ent).toMatchObject({
      plan: 'growth',
      status: 'active',
      source: 'manual',
      business_name: 'Cafe Melga',
      logo_data_url: null,
      brand_color: '#aa3300',
      page_language: 'lt',
      display_name: 'Melga',
      logo_background: null,
    });
    expect(new Date(ent.current_period_end).getTime() - now.getTime()).toBe(DEMO_DAYS * 86400000);
    expect(result.activeUntil).toBe(ent.current_period_end);

    expect(tagTable).toBe('tags');
    expect(tag).toEqual({
      id: result.tagId,
      type: 'google_review',
      is_claimed: true,
      owner_email: result.ownerEmail,
      settings: {
        destination_url: 'https://g.page/r/abc/review',
        location_label: 'Old Town',
        alert_email: 'admin@flashbind.com',
        dual_choice_enabled: true,
      },
    });
    expect(result.url).toBe(`https://flashbind.com/p/${result.tagId}`);
  });

  it('uses a fresh demo account each time', async () => {
    const first = await createDemoPage(fakeAdmin().admin, input, 'admin@flashbind.com');
    const second = await createDemoPage(fakeAdmin().admin, input, 'admin@flashbind.com');
    if (!('ownerEmail' in first) || !('ownerEmail' in second)) throw new Error('expected success');
    expect(first.ownerEmail).not.toBe(second.ownerEmail);
  });

  it('removes the demo account when the stand cannot be created', async () => {
    const {admin, inserts, deletes} = fakeAdmin(['tags']);
    const result = await createDemoPage(admin, input, 'admin@flashbind.com');
    expect(result).toEqual({error: 'Could not create the demo stand. Please try again.'});
    expect(deletes).toEqual([['business_entitlements', 'owner_email', inserts[0][1].owner_email]]);
  });

  it('stops before writing when the account insert fails or ADMIN_EMAIL is invalid', async () => {
    const failing = fakeAdmin(['business_entitlements']);
    expect('error' in (await createDemoPage(failing.admin, input, 'admin@flashbind.com'))).toBe(true);
    expect(failing.inserts.map(([table]) => table)).toEqual(['business_entitlements']);

    const invalid = fakeAdmin();
    expect(await createDemoPage(invalid.admin, input, 'not-an-email')).toEqual({error: 'ADMIN_EMAIL is not a valid email address.'});
    expect(invalid.inserts).toHaveLength(0);
  });
});

describe('brand colour on the Dual Choice page', () => {
  function entitlementClient(row: any) {
    const chain: any = {};
    for (const name of ['from', 'select', 'eq']) chain[name] = () => chain;
    chain.maybeSingle = async () => ({data: row, error: null});
    return chain;
  }
  const tag = {owner_email: 'owner@example.com', settings: {dual_choice_enabled: true, location_label: 'Old Town'}};

  it('passes a valid stored colour through and drops an invalid one', async () => {
    const base = {status: 'active', current_period_end: null, business_name: 'Cafe', logo_data_url: null};
    const view = await getDualChoiceView(entitlementClient({...base, brand_color: '#aa3300'}), tag, 'https://g.page/r/x');
    expect(view?.brandColor).toBe('#aa3300');
    const bad = await getDualChoiceView(entitlementClient({...base, brand_color: 'red;}'}), tag, 'https://g.page/r/x');
    expect(bad?.brandColor).toBeNull();
  });

  function render(brandColor: string | null) {
    const Stub = createRoutesStub([
      {
        path: '/p/:tagId',
        Component: () => (
          <DualChoicePage tagId="t1" businessName="Cafe" logo={null} locationLabel="" brandColor={brandColor} language="en" initiallyShowForm={false} sent={false} />
        ),
      },
    ]);
    return renderToString(<Stub initialEntries={['/p/t1']} />);
  }

  it('sets the brand colour and readable text colour for both options alike', () => {
    const html = render('#facc15');
    expect(html).toContain('--brand:#facc15');
    expect(html).toContain('--brand-ink:#0f172a');
    // One brand-tinted icon tile per option, nothing extra on either.
    expect(html.match(/bg-\[color:var\(--brand-tint\)\]/g)).toHaveLength(2);
    expect(html).toContain('--brand-text:#0f172a');
  });

  it('falls back to the default colour', () => {
    const html = render(null);
    expect(html).toContain('--brand:#0f172a');
    expect(html).toContain('--brand-ink:#ffffff');
  });
});

describe('admin routes', () => {
  const ADMIN = 'admin@flashbind.com';
  function post(path: string, fields: Record<string, string> = {}, origin = 'https://flashbind.com') {
    return new Request(`https://flashbind.com${path}`, {method: 'POST', headers: {origin}, body: form(fields)});
  }
  async function status(promise: Promise<unknown>) {
    try {
      await promise;
      return 'no throw';
    } catch (error) {
      return (error as Response).status;
    }
  }
  const args = (request: Request, user?: string) => ({request, context: context(user, ADMIN), params: {}}) as any;

  it('review stand: only the admin, only same-origin', async () => {
    const {admin, inserts} = fakeAdmin();
    routeDb.admin = admin;
    expect(await status(reviewStandRoute.action(args(post('/admin/review-stand'), 'someone@example.com')))).toBe(403);
    expect(await status(reviewStandRoute.action(args(post('/admin/review-stand', {}, 'https://evil.example'), ADMIN)))).toBe(403);
    expect(await status(reviewStandRoute.action(args(post('/admin/review-stand'))))).toBe(302);
    expect(inserts).toHaveLength(0);

    const result: any = await reviewStandRoute.action(args(post('/admin/review-stand'), ADMIN));
    expect(result.pin).toMatch(/^[0-9]{6}$/);
    expect(inserts).toHaveLength(1);
  });

  it('review stand page response is never cached', () => {
    expect((reviewStandRoute.headers as any)({}).get('Cache-Control')).toBe('private, no-store, max-age=0');
  });

  it('demo page: validates, then creates the account and stand with alerts to the admin', async () => {
    const {admin, inserts} = fakeAdmin();
    routeDb.admin = admin;
    expect(await status(demoPageRoute.action(args(post('/admin/demo-page', {businessName: 'X'}), 'someone@example.com')))).toBe(403);

    const invalid: any = await demoPageRoute.action(args(post('/admin/demo-page', {businessName: 'Cafe'}), ADMIN));
    expect(invalid.error).toBeTruthy();
    expect(inserts).toHaveLength(0);

    const result: any = await demoPageRoute.action(
      args(post('/admin/demo-page', {businessName: 'Cafe', googleUrl: 'https://g.page/r/abc/review', brandColor: '#123456'}), ADMIN),
    );
    expect(result.url).toBe(`https://flashbind.com/p/${result.tagId}`);
    expect(inserts.map(([table]) => table)).toEqual(['business_entitlements', 'tags']);
    expect(inserts[1][1].settings.alert_email).toBe(ADMIN);
    expect(inserts[0][1].brand_color).toBe('#123456');
  });
});