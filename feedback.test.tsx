import {describe, it, expect, vi} from 'vitest';
import {renderToString} from 'react-dom/server';
import {createRoutesStub} from 'react-router';
import {
  applyInboxOperation,
  buildFeedbackAlertHtml,
  checkFeedbackRateLimit,
  getDualChoiceView,
  isEntitlementActive,
  isHoneypotFilled,
  listFeedback,
  parseFeedbackForm,
  parseLogo,
  reviewStandSettings,
  TAG_HOURLY_LIMIT,
} from './app/utils/feedback.server';
import {FEEDBACK_RETENTION_DAYS} from './app/utils/retention.server';
import {sanitizeTagSettings} from './app/utils/tagSanitizer.server';
import {DualChoicePage} from './app/components/DualChoicePage';

/** Records every builder call so tests can assert on the filters applied. */
function recordingClient(result: any = {data: [], error: null}) {
  const calls: Array<[string, unknown[]]> = [];
  const chain: any = {};
  for (const name of ['from', 'select', 'insert', 'update', 'delete', 'eq', 'is', 'not', 'in', 'gte', 'order', 'limit']) {
    chain[name] = vi.fn((...args: unknown[]) => {
      calls.push([name, args]);
      return chain;
    });
  }
  chain.maybeSingle = vi.fn(async () => result);
  chain.then = (resolve: any) => resolve(result);
  return {chain, calls};
}

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe('Dual Choice: entitlement', () => {
  const now = new Date('2026-09-27T12:00:00Z');
  it('is active with status active and no end date', () => {
    expect(isEntitlementActive({status: 'active', current_period_end: null}, now)).toBe(true);
  });
  it('is inactive when cancelled, expired, missing or malformed', () => {
    expect(isEntitlementActive({status: 'cancelled', current_period_end: null}, now)).toBe(false);
    expect(isEntitlementActive({status: 'active', current_period_end: '2026-09-26T23:59:59Z'}, now)).toBe(false);
    expect(isEntitlementActive({status: 'active', current_period_end: 'not a date'}, now)).toBe(false);
    expect(isEntitlementActive(null, now)).toBe(false);
  });
  it('is active until the paid-until date', () => {
    expect(isEntitlementActive({status: 'active', current_period_end: '2026-10-31T23:59:59Z'}, now)).toBe(true);
  });
});

describe('Dual Choice: stand settings and public view', () => {
  it('reads branch settings with safe defaults', () => {
    expect(reviewStandSettings(null)).toEqual({locationLabel: '', alertEmail: '', dualChoiceEnabled: false});
    expect(
      reviewStandSettings({location_label: 'Klaipėda centre', alert_email: 'Manager@Example.test', dual_choice_enabled: true}),
    ).toEqual({locationLabel: 'Klaipėda centre', alertEmail: 'manager@example.test', dualChoiceEnabled: true});
    // Only a real boolean true switches it on.
    expect(reviewStandSettings({dual_choice_enabled: 'true'}).dualChoiceEnabled).toBe(false);
  });

  it('never exposes the alert email in the public settings of a review stand', () => {
    const safe = sanitizeTagSettings('google_review', {
      destination_url: 'https://g.page/r/x/review',
      alert_email: 'manager@example.test',
      location_label: 'Centre',
    });
    expect(safe).toEqual({destination_url: 'https://g.page/r/x/review'});
  });

  const tag = {owner_email: 'owner@example.test', settings: {dual_choice_enabled: true, location_label: 'Centre', alert_email: 'm@example.test'}};
  const activeRow = {status: 'active', current_period_end: null, business_name: 'Café', logo_data_url: null};

  it('returns only name, logo and branch label when entitled and switched on', async () => {
    const {chain} = recordingClient({data: activeRow, error: null});
    const view = await getDualChoiceView(chain, tag, 'https://g.page/r/x/review');
    expect(view).toEqual({businessName: 'Café', logo: null, locationLabel: 'Centre'});
    expect(JSON.stringify(view)).not.toContain('@');
  });

  it('falls back to the direct Google redirect when not entitled, switched off, or no link', async () => {
    const cancelled = recordingClient({data: {...activeRow, status: 'cancelled'}, error: null}).chain;
    expect(await getDualChoiceView(cancelled, tag, 'https://g.page/r/x/review')).toBeNull();
    const none = recordingClient({data: null, error: null}).chain;
    expect(await getDualChoiceView(none, tag, 'https://g.page/r/x/review')).toBeNull();
    const active = recordingClient({data: activeRow, error: null}).chain;
    expect(await getDualChoiceView(active, {...tag, settings: {dual_choice_enabled: false}}, 'https://g.page/r/x/review')).toBeNull();
    expect(await getDualChoiceView(active, tag, null)).toBeNull();
    expect(await getDualChoiceView(active, {...tag, owner_email: null}, 'https://g.page/r/x/review')).toBeNull();
  });
});

describe('Dual Choice: feedback form validation', () => {
  it('accepts a message alone and stores no contact details', () => {
    const result = parseFeedbackForm(form({message: '  The soup was cold.  '}));
    expect(result).toEqual({
      value: {message: 'The soup was cold.', contactName: null, contactEmail: null, contactPhone: null, contactConsent: false},
    });
  });
  it('rejects an empty or too long message', () => {
    expect(parseFeedbackForm(form({message: '   '}))).toHaveProperty('error');
    expect(parseFeedbackForm(form({message: 'x'.repeat(2001)}))).toHaveProperty('error');
    expect(parseFeedbackForm(form({message: 'x'.repeat(2000)}))).toHaveProperty('value');
  });
  it('requires the consent tick before contact details are kept', () => {
    expect(parseFeedbackForm(form({message: 'Hi', contact_email: 'a@example.test'}))).toHaveProperty('error');
    const ok = parseFeedbackForm(
      form({message: 'Hi', contact_name: 'Ana', contact_email: 'A@Example.test', contact_phone: '+370 600 00000', contact_consent: 'yes'}),
    );
    expect(ok).toEqual({
      value: {message: 'Hi', contactName: 'Ana', contactEmail: 'a@example.test', contactPhone: '+370 600 00000', contactConsent: true},
    });
  });
  it('a consent tick with no contact details is not recorded as consent', () => {
    expect(parseFeedbackForm(form({message: 'Hi', contact_consent: 'yes'}))).toEqual({
      value: {message: 'Hi', contactName: null, contactEmail: null, contactPhone: null, contactConsent: false},
    });
  });
  it('rejects a malformed email or phone', () => {
    expect(parseFeedbackForm(form({message: 'Hi', contact_email: 'nope', contact_consent: 'yes'}))).toHaveProperty('error');
    expect(parseFeedbackForm(form({message: 'Hi', contact_phone: 'call me', contact_consent: 'yes'}))).toHaveProperty('error');
  });
  it('detects the honeypot field', () => {
    expect(isHoneypotFilled(form({message: 'Hi', website: 'http://spam'}))).toBe(true);
    expect(isHoneypotFilled(form({message: 'Hi'}))).toBe(false);
  });
});

describe('Dual Choice: rate limit', () => {
  it('refuses when the stand already has the hourly maximum', async () => {
    const {chain} = recordingClient({count: TAG_HOURLY_LIMIT, error: null});
    expect(await checkFeedbackRateLimit(chain, 'TAG1', null)).toBe(false);
  });
  it('refuses a visitor IP bucket that is over its limit in the window', async () => {
    const {chain} = recordingClient({count: 0, error: null});
    chain.maybeSingle = vi.fn(async () => ({data: {id: 'r1', attempts: 3, last_attempt_at: new Date().toISOString()}}));
    expect(await checkFeedbackRateLimit(chain, 'TAG1', 'fb:abc')).toBe(false);
  });
  it('allows and records a new visitor', async () => {
    const {chain, calls} = recordingClient({count: 0, error: null});
    expect(await checkFeedbackRateLimit(chain, 'TAG1', 'fb:abc')).toBe(true);
    expect(calls.some(([name, args]) => name === 'insert' && (args[0] as any).ip_address === 'fb:abc')).toBe(true);
  });
});

describe('Dual Choice: owner inbox access control', () => {
  it('lists only the logged-in owner\'s feedback', async () => {
    const {chain, calls} = recordingClient({data: [], error: null});
    await listFeedback(chain, 'owner@example.test', {standId: 'TAG1'});
    expect(calls).toContainEqual(['eq', ['owner_email', 'owner@example.test']]);
    expect(calls).toContainEqual(['eq', ['tag_id', 'TAG1']]);
    expect(calls).toContainEqual(['is', ['archived_at', null]]);
  });
  it('filters every inbox action on both the message id and the owner', async () => {
    for (const op of ['read', 'unread', 'archive', 'unarchive', 'delete'] as const) {
      const {chain, calls} = recordingClient({data: [{id: 'x'}], error: null});
      const id = '0f8fad5b-d9cb-469f-a165-70867728950e';
      expect(await applyInboxOperation(chain, 'owner@example.test', id, op)).toBe(true);
      expect(calls).toContainEqual(['eq', ['id', id]]);
      expect(calls).toContainEqual(['eq', ['owner_email', 'owner@example.test']]);
    }
  });
  it('reports failure when the message belongs to someone else (no row matched)', async () => {
    const {chain} = recordingClient({data: [], error: null});
    expect(await applyInboxOperation(chain, 'other@example.test', '0f8fad5b-d9cb-469f-a165-70867728950e', 'delete')).toBe(false);
  });
  it('rejects a malformed message id without querying', async () => {
    const {chain, calls} = recordingClient();
    expect(await applyInboxOperation(chain, 'owner@example.test', "1' or '1'='1", 'delete')).toBe(false);
    expect(calls).toHaveLength(0);
  });
});

describe('Dual Choice: alert email and logo', () => {
  it('escapes visitor text in the alert email', () => {
    const html = buildFeedbackAlertHtml({
      locationLabel: 'Centre <b>',
      businessName: 'Café',
      feedback: {message: '<script>x</script>', contactName: '<img>', contactEmail: null, contactPhone: null, contactConsent: true},
      inboxUrl: 'https://flashbind.com/dashboard/feedback?stand=T1',
    });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Centre &lt;b&gt;');
  });
  it('accepts only JPEG/PNG data URLs for logos', () => {
    expect(parseLogo('')).toBeNull();
    expect(parseLogo('remove')).toEqual({logo: null});
    expect(parseLogo('data:image/png;base64,AAAA')).toEqual({logo: 'data:image/png;base64,AAAA'});
    expect(parseLogo('data:image/svg+xml;base64,AAAA')).toHaveProperty('error');
    expect(parseLogo(`data:image/png;base64,${'A'.repeat(700_000)}`)).toHaveProperty('error');
  });
});

describe('Dual Choice: retention', () => {
  it('keeps feedback for 12 months (owner decision 2026-09-27)', () => {
    expect(FEEDBACK_RETENTION_DAYS).toBe(365);
  });
});

describe('Dual Choice page (Google policy: no review gating)', () => {
  function render(props: Partial<Parameters<typeof DualChoicePage>[0]> = {}) {
    const Stub = createRoutesStub([
      {
        path: '/p/:tagId',
        Component: () => (
          <DualChoicePage tagId="TAG1" businessName="Café" logo={null} locationLabel="Centre" initiallyShowForm={false} sent={false} {...props} />
        ),
      },
    ]);
    return renderToString(<Stub initialEntries={['/p/TAG1']} />);
  }

  it('shows both options, with identical styling, Google first', () => {
    const html = render();
    const google = html.indexOf('Leave a Google review');
    const privateOption = html.indexOf('Send private feedback');
    expect(google).toBeGreaterThan(-1);
    expect(privateOption).toBeGreaterThan(google);
    const classes = [...html.matchAll(/<a[^>]*class="([^"]*)"[^>]*>(Leave a Google review|Send private feedback)</g)].map((m) => m[1]);
    expect(classes).toHaveLength(2);
    expect(classes[0]).toBe(classes[1]);
    expect(html).toContain('href="/p/TAG1/google"');
  });

  it('asks no question or rating before the choice', () => {
    const html = render().toLowerCase();
    for (const phrase of ['were you happy', 'how was', 'rate your', 'stars', 'satisf']) {
      expect(html).not.toContain(phrase);
    }
  });
});
