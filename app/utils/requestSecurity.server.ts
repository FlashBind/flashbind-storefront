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

/**
 * CSRF check for form posts that React Router's own Origin check doesn't
 * cover (resource routes such as logout) and for high-value admin actions.
 *
 * Accepts a request when its Origin header names this site. When Origin is
 * missing, falls back to the browser's Sec-Fetch-Site header (same-origin,
 * or none for a typed URL/bookmark). An opaque "null" origin is rejected.
 * Requests with neither header come from non-browser clients, which can't
 * carry a visitor's cookies across sites, and are allowed.
 */
export function isSameOriginRequest(request: Request): boolean {
  const headers = request.headers;
  const origin = headers.get('origin');

  if (origin === 'null') return false;
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return false;
    }
    // Same host resolution as React Router's built-in check.
    const forwardedHost = headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const host = forwardedHost || headers.get('host') || new URL(request.url).host;
    return originHost === host;
  }

  const fetchSite = headers.get('sec-fetch-site');
  if (fetchSite) return fetchSite === 'same-origin' || fetchSite === 'none';

  return true;
}

/** Throws a 403 response unless {@link isSameOriginRequest} accepts the request. */
export function assertSameOrigin(request: Request): void {
  if (!isSameOriginRequest(request)) {
    throw new Response('Forbidden', {status: 403});
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

const IPV4_PATTERN =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

const IPV6_PATTERN =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/;

/**
 * Normalizes and strictly validates a client IP taken from a header this
 * server explicitly trusts (i.e. `cf-connecting-ip`, set by the Cloudflare
 * edge — never a client-settable header like `x-forwarded-for`). Rejects
 * anything that isn't exactly one well-formed IPv4/IPv6 address: malformed
 * values, comma-separated lists, and embedded whitespace/newlines all
 * return null rather than being partially accepted.
 */
export function normalizeTrustedClientIp(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 45) return null;

  // A single trusted header must contain exactly one address — reject any
  // embedded whitespace (including newlines) or comma-separated lists.
  if (/[,\s]/.test(trimmed)) return null;

  if (IPV4_PATTERN.test(trimmed) || IPV6_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Builds the identifier set used for activation-attempt rate limiting. The
 * hashed account identifier is always included and can never be dropped or
 * replaced by request headers. `cf-connecting-ip` may add one optional,
 * strictly-validated secondary identifier; no other client-controlled
 * header (e.g. `x-forwarded-for`) is ever consulted.
 */
export function buildActivationRateLimitIdentifiers(
  headers: Pick<Headers, 'get'>,
  hashedAccountIdentifier: string,
): string[] {
  const trustedIp = normalizeTrustedClientIp(headers.get('cf-connecting-ip'));
  return [hashedAccountIdentifier, ...(trustedIp ? [trustedIp] : [])];
}
