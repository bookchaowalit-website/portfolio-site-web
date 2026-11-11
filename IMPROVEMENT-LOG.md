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

## Iteration 4 — SEO meta in `<head>`, Sentry off the hydration path (SEO + performance) — 2026-11-13

- Picked: SEO (meta description streamed into `<body>` for browsers and Googlebot; Next 15
  streaming metadata only blocks for `htmlLimitedBots`, which includes Lighthouse, so Lighthouse
  SEO never saw it) and performance (TBT ~0.5–1 s; biggest client chunk was Sentry, ~350 KB raw).
- Tests first: `e2e/pages.spec.ts` "SEO metadata" (description before `</head>` with a normal
  Chrome UA on `/en`, `/th`, `/en/projects`, `/en/blog`) failed 4/4 against live main;
  `metadata-bots.test.ts` and `sentry-build-options.test.ts` (tree-shake flags, no static
  `@sentry/nextjs` import in `instrumentation-client.ts`) failed before the change.
- Change: `htmlLimitedBots: /.*/` (`metadata-bots.mjs`); withSentryConfig options moved to
  `sentry-build-options.mjs` with `webpack.treeshake` (tracing, debug logging, replay);
  `instrumentation-client.ts` imports the SDK after `load` + idle. Errors thrown before that
  are not reported (errors-only setup, accepted trade-off). `onRouterTransitionStart` dropped
  (tracing is tree-shaken anyway).
- After (local `next start`, same dummy DSN on both builds, Lighthouse mobile, median of 5; host
  load average 7–14 from other jobs, so TBT is noisy):

  | Page | Perf | LCP | TBT | JS transfer |
  |------|------|-----|-----|-------------|
  | `/en` main → branch | 82 → 89 | 1.21 s → 1.36 s | 707 → 437 ms | 369 → 344 KB (treeshake alone) |
  | `/th` main → branch | 78 → 86 | 1.21 s → 1.36 s | 984 → 546 ms | |

  e2e "SEO metadata" 4/4 green on the branch build; typecheck, lint, unit tests (118) green.
