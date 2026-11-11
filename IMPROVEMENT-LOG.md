# Improvement log — bookchaowalit.com

Scorecard and rules: [IMPROVEMENT-GOAL.md](IMPROVEMENT-GOAL.md).

## Baseline — 2026-11-12 (main e37c597)

| Area | Metric | Value |
|------|--------|-------|
| Correctness | typecheck / lint errors / tests / build | pass / 0 / 101 of 101 / pass |
| Security | prod advisories (high+critical / moderate) | 0 / 8 (glob, minimatch via `@serwist/next` and `@sentry/nextjs` build plugins) |
| Security | headers on `/en` | HSTS, XCTO, XFO, Referrer, Permissions present; **no CSP, no COOP**; `X-XSS-Protection: 1; mode=block` |
| UX / a11y | Lighthouse a11y `/en` `/th` `/en/projects` `/en/blog` | 100 / 100 / 100 / 100 |
| Performance | Lighthouse perf (mobile, lab) | 69 / 70 / 87 / 84 |
| Performance | LCP / TBT on `/en` | 4.4 s / 620 ms (`/th` 5.0 s / 460 ms) |
| SEO | Lighthouse SEO | 92 / 92 / 92 / 91 — `meta-description` fails: the tag is streamed into `<body>`, not `<head>` (also for Googlebot) |
| Code health | lint warnings | 1 (`<img>` in `mdx-components.tsx`) |

## Iteration 1 — security headers (CSP + COOP)

- Picked: security, missing CSP/COOP (highest-priority area not met).
- Test first: `src/lib/__tests__/security-headers.test.ts` (failed: module missing).
- Change: headers moved to `security-headers.mjs`; adds
  `Content-Security-Policy: base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests`,
  `Cross-Origin-Opener-Policy: same-origin`, `X-XSS-Protection: 0` (OWASP).
- After: lib tests 60/60, typecheck + lint + build pass; local `next start` sends all headers;
  `/en` `/th` `/en/contact` `/en/projects` at 375/768/1440 show no CSP violation, no page error,
  no horizontal overflow (only the expected `/_vercel/*` 404s off Vercel).
- Not yet: `script-src`/`style-src` need per-request nonces — next security step.
