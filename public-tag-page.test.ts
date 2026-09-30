import { describe, it, expect, vi, beforeEach } from 'vitest';

// The public tag page (/p/:tagId) is open to anyone who taps the tag, so the
// owner's account email must never be part of the data sent to the browser.

const OWNER_EMAIL = 'owner@example.test';

const claimedPetTag = {
  id: 'tag-123',
  is_claimed: true,
  type: 'pet_tag',
  settings: {},
  pet_name: 'Rex',
  owner_name: 'Alex',
  phone: '+37060000000',
  owner_email: OWNER_EMAIL,
  medical_notes: null,
  image_url: null,
};

let row: Record<string, unknown> = claimedPetTag;

vi.mock('~/utils/supabase.server', () => ({
  getSupabaseAdmin: () => {
    const chain: any = {
      from: () => chain,
      select: () => chain,
      eq: () => chain,
      single: async () => ({ data: row, error: null }),
    };
    return chain;
  },
}));

import { loader } from './app/routes/p.$tagId';

function callLoader(sessionEmail?: string) {
  const context = {
    env: {},
    session: { get: (key: string) => (key === 'userEmail' ? sessionEmail : undefined) },
  };
  return loader({ params: { tagId: 'tag-123' }, context, request: new Request('https://example.test/p/tag-123') } as any);
}

describe('public tag page loader', () => {
  beforeEach(() => {
    row = claimedPetTag;
  });

  it('does not send the owner email to an anonymous visitor', async () => {
    const data: any = await callLoader();

    expect(JSON.stringify(data)).not.toContain(OWNER_EMAIL);
    expect(data.pet).not.toHaveProperty('ownerEmail');
    expect(data.isOwner).toBe(false);
    // The contact details the owner chose to show are unchanged.
    expect(data.pet.ownerPhone).toBe('+37060000000');
  });

  it('still recognises the owner without sending the email', async () => {
    const data: any = await callLoader(OWNER_EMAIL);

    expect(data.isOwner).toBe(true);
    expect(data.pet).not.toHaveProperty('ownerEmail');
    // The owner's own session email is the only match, and it is not echoed back.
    expect(JSON.stringify(data)).not.toContain(OWNER_EMAIL);
  });

  it('does not treat a different signed-in user as the owner', async () => {
    const data: any = await callLoader('someone-else@example.test');

    expect(data.isOwner).toBe(false);
    expect(JSON.stringify(data)).not.toContain(OWNER_EMAIL);
  });

  it('does not send the owner email for Wi-Fi tags either', async () => {
    row = { ...claimedPetTag, type: 'wifi', settings: { network_name: 'Cafe', network_password: 'pw12345678' } };
    const data: any = await callLoader();

    expect(JSON.stringify(data)).not.toContain(OWNER_EMAIL);
  });
});
