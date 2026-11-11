// Security headers sent on every response (wired in next.config.js).
// Tested by src/lib/__tests__/security-headers.test.ts.
//
// The CSP is deliberately narrow for now: it only covers directives that
// cannot break rendering or third-party scripts (PostHog, Vercel analytics,
// Sentry). A script-src/style-src policy needs per-request nonces and is a
// separate step tracked in IMPROVEMENT-LOG.md.

/**
 * upgrade-insecure-requests is left out in development: `next dev` serves
 * plain HTTP and Safari would upgrade its JS/CSS requests to HTTPS and fail.
 * @param {{ dev?: boolean }} [options]
 * @returns {string}
 */
export function buildContentSecurityPolicy({ dev = process.env.NODE_ENV === 'development' } = {}) {
  return [
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

/** @type {string} */
export const contentSecurityPolicy = buildContentSecurityPolicy();

/** @type {{ key: string, value: string }[]} */
export const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // The legacy XSS auditor is removed from browsers and could be abused;
  // OWASP recommends turning it off explicitly.
  { key: 'X-XSS-Protection', value: '0' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
];
