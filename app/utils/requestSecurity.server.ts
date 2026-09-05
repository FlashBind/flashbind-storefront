const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getFormText(
  formData: FormData,
  name: string,
  maxLength: number,
): string | null {
  const value = formData.get(name);

  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;

  return trimmed;
}

export function getFormPassword(
  formData: FormData,
  name: string,
  maxLength = 128,
): string | null {
  const value = formData.get(name);

  if (typeof value !== 'string' || !value || value.length > maxLength) {
    return null;
  }

  return value;
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const email = value.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) return null;

  return email;
}

export function safeRedirectPath(
  value: unknown,
  fallback = '/',
): string {
  if (typeof value !== 'string') return fallback;

  const candidate = value.trim();
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return fallback;
  const hasControlCharacter = Array.from(candidate).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
  if (candidate.includes('\\') || hasControlCharacter) {
    return fallback;
  }

  try {
    const base = new URL('https://flashbind.local');
    const parsed = new URL(candidate, base);

    if (parsed.origin !== base.origin) return fallback;

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function normalizeHttpUrl(
  value: unknown,
  maxLength = 2048,
): string | null {
  if (typeof value !== 'string') return null;

  let candidate = value.trim();
  if (!candidate || candidate.length > maxLength) return null;

  if (!/^[a-z][a-z\d+.-]*:/i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    if (!parsed.hostname || parsed.username || parsed.password) return null;

    return parsed.toString();
  } catch {
    return null;
  }
}

export async function hashRateLimitIdentifier(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
