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

## Iteration 2 — moderate advisories (glob, minimatch)

- Picked: security, 8 moderate prod advisories (GHSA-3g3m-2fjr-6pw4 glob, GHSA-g3hv-75wg-m249 minimatch)
  pulled in by the Serwist and Sentry build plugins, plus typescript-eslint (dev).
- Test first: `src/lib/__tests__/dependency-advisories.test.ts` reads `package-lock.json`
  (failed: glob 13.0.6, minimatch 10.2.5 ×2).
- Change: scoped overrides `glob ^14.0.4` under `@serwist/next`, `@serwist/build`,
  `@sentry/bundler-plugins`; `minimatch ^11.0.8` under `@typescript-eslint/typescript-estree`.
  Lockfile written with npm 10 (CI runs `npm ci` on Node 22). `npm audit fix` was tried and
  rejected: it rewrote unrelated packages.
- After: `npm audit` 0 vulnerabilities (prod and dev, was 8 / 13); `ci:local` passes;
  the service worker still precaches 217 entries (glob is what builds that list).

## Iteration 3 — hero LCP (performance)

- Picked: performance (security and a11y targets met). `/en` 69, `/th` 70 on mobile; LCP 4.4 s / 5.0 s.
- Cause: the LCP element is the hero `h1` on `/en` and the value-prop paragraph on `/th`. Both
  were server-rendered with `opacity:0` (framer-motion `initial`) and only appeared after
  hydration (~1.4 s of JavaScript on a mobile CPU).
- Test first: `e2e/home.spec.ts` "hero text is visible before JavaScript runs (en, th)" loads the
  page with JavaScript off and fails if the `h1` or the value prop has an `opacity:0` ancestor
  (failed on both).
- Change: the hero text wrapper and the value-prop paragraph are plain elements (no entrance
  fade). The avatar spring and other animations stay.
- After (local `next start`, Lighthouse mobile, median of 3, main vs branch on the same machine):

  | Page | Perf | LCP | TBT | CLS |
  |------|------|-----|-----|-----|
  | `/en` main → branch | 66 → 88 | 5.5 s → 1.36 s | 507 → 454 ms | 0.026 → 0.026 |
  | `/th` main → branch | 68 → 85 | 5.4 s → 1.36 s | 478 → 613 ms | 0.001 → 0.001 |

  TBT on this host is noisy (repeat runs: main 478–954 ms, branch 412–1314 ms); the change
  only removes animation work. LCP improved in every run. e2e home/navigation/locale/keyboard
  20/20 pass.
- Still open: perf < 90 because TBT ~0.5 s (chunk `4952`, 1.2 s scripting on mobile).

## Merge note — 2026-11-12

- Stack #35 → #36 → #37 merged to main as 05f981d after CI 9/9 green (run 43070061432) and a
  Codex read-only review ("no findings").
- Main had gained Storybook (#38) meanwhile; the auto-merged lockfile was out of sync
  (`npm ci` failed) and Storybook's docgen plugin brought glob 13.0.7 / minimatch 10.2.6 back.
  `dependency-advisories.test.ts` caught it. Fix: lockfile resynced with npm 10 and a scoped
  `glob ^14.0.4` override under `@joshwooding/vite-plugin-react-docgen-typescript`.
  `npm ci`, `npm audit` (0), `ci:local` and `build-storybook` pass.
- Lesson: after merging main into a branch that touches `package.json`, run `npm ci` before pushing.

## Live check — 2026-11-12 (main 4c319aa, CI + Storybook green)

Production, Lighthouse mobile, median of 3:

| Page | a11y | SEO | Perf (baseline → now) | LCP (baseline → now) |
|------|------|-----|-----------------------|----------------------|
| `/en` | 100 | 92 | 69 → 87 | 4.4 s → 1.19 s |
| `/th` | 100 | 92 | 70 → 69 | 5.0 s → 5.0 s |
| `/en/projects` | 100 | 92 | 87 → 72 | 1.2 s → 4.4 s (runs: 1.2–4.4 s) |
| `/en/blog` | 100 | 91 | 84 → 85 | 1.1 s → 1.3 s |

Headers live: CSP, COOP, `X-XSS-Protection: 0`. `npm audit` 0.

Finding: on `/th` and `/en/projects` the LCP element is the analytics consent banner text
(`body > div.fixed > p.mt-2`). It mounts after hydration, so lab LCP waits for JavaScript and
swings with CPU load (the earlier `/en/projects` 1.2 s baseline was a single run). Returning
visitors who already answered never see it. Fixing it means changing how the consent banner
renders (server-rendered from a cookie, or a smaller bar) — a PDPA consent UX choice.

Next, no owner input needed: SEO `meta-description` is streamed into `<body>` on every page
(92 → 100 once it is in `<head>`); TBT ~0.5 s from chunk `4952`.

## Iteration 4 — SEO metadata in `<head>` (+ Codex P2 on the dev CSP)

- Codex review P2 (confirmed): `upgrade-insecure-requests` broke `next dev` over plain HTTP in
  Safari. `buildContentSecurityPolicy({ dev })` now leaves it out in development; production keeps
  it. Test added. (Two other Codex P2s — Newsletter story fetch mock, ThemeToggle vs toolbar theme —
  are in the Storybook commit #38 from another session, not in this loop's changes; left to that work.)
- Picked: SEO 91–92 on every page; `meta-description` failed because Next 15 streams async
  `generateMetadata` into `<body>` for non-bot user agents, and the static prerender did the same.
- Test first: `e2e/home.spec.ts` "Metadata in <head>" fetches raw HTML of `/en`, `/th`,
  `/en/blog`, `/en/projects` and requires `description`, `og:title`, `og:description` before
  `</head>` (failed on all four).
- Change: `htmlLimitedBots: /.*/` in `next.config.js` — metadata is rendered blocking, in `<head>`,
  for every user agent. Pages are static, so no extra request-time wait.
- After (local `next start`): SEO 100 on all four pages (was 91–92); a11y 100; one description tag
  per page; e2e 24/24. Perf on `/en` runs 79–90 under host load avg ~14 (before: 88), no sign of
  regression beyond noise — to be confirmed on production.
- Codex review of iteration 4: (a) P2 "`htmlLimitedBots` delays TTFB on dynamic routes" — disputed:
  the build lists every page route as static (●); only OG/Twitter images, icons and `/api/*` are
  dynamic (ƒ), so metadata is resolved at build time. A comment in `next.config.js` asks to revisit
  if a page turns dynamic. (b) P2 the CSP test depended on `NODE_ENV` — fixed (asserts both modes
  explicitly; passes with `NODE_ENV=development`). (c) P3 the head test ignored status/redirects —
  fixed (`maxRedirects: 0`, 200, `<html lang>` per locale).
