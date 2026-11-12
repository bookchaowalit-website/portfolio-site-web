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

## Live check — after iteration 4 (main 1cb3ea3, CI + Storybook green)

Production, Lighthouse mobile, median of the valid runs (host load avg ~2):

| Page | a11y | SEO (was) | Perf (baseline → now) | LCP (baseline → now) |
|------|------|-----------|-----------------------|----------------------|
| `/en` | 100 | 100 (92) | 69 → 85–86 | 4.4 s → 1.18 s |
| `/th` | 100 | 100 (92) | 70 → 87 | 5.0 s → 1.22 s |
| `/en/blog` | 100 | 100 (91) | 84 → 85 | 1.1 s → 1.26 s |
| `/en/projects` | 100 | 100 (92) | 87 → 76 | 1.2 s → 3.9 s (consent banner, varies) |

Best practices 100. Open: perf < 90 everywhere because TBT ≈ 0.5 s (shared chunk `4952`);
`/en/projects` LCP is the consent banner (owner UX choice); CSP `script-src` needs nonces.

## Iteration 5 — TBT: Sentry off the hydration path

- Picked: performance, TBT ≈ 0.5 s on every page (perf < 90). The biggest shared client chunk
  (`4952`, ~350 KB raw) was the Sentry SDK incl. tracing code, evaluated during hydration,
  although Sentry runs errors-only (`src/lib/sentry.ts`).
- Test first: `src/lib/__tests__/sentry-build-options.test.ts` — build must tree-shake tracing,
  debug logging and replay; `instrumentation-client.ts` must not import `@sentry/nextjs`
  statically and must load it after `load` (failed: module missing).
- Change: `sentry-build-options.mjs` (`webpack.treeshake`); `instrumentation-client.ts` imports the
  SDK when the browser is idle after `load`. Trade-off: errors thrown before that moment are not
  reported; `onRouterTransitionStart` (tracing only) is gone.
  Approach first drafted in a stray worktree (`wt-t4`) left by an interrupted run of this loop;
  re-applied and measured here.
- After (local `next start`, Lighthouse mobile, median of 3, main 1cb3ea3 vs branch, interleaved):

  | Page | Perf | TBT | Lab LCP | CLS |
  |------|------|-----|---------|-----|
  | `/en` run A | 90 → 95 | 392 → 254 ms | 1.21 → 1.36 s | 0.026 → 0.030 |
  | `/en` run B | 90 → 92 | 416 → 337 ms | 1.21 → 1.36 s | 0.030 → 0.030 |
  | `/th` | 92 → 92 | 350 → 348 ms | 1.21 → 1.36 s | 0.001 → 0.001 |

  First Load JS shared by all: 166 kB → 107 kB.
- Lab LCP +150 ms: same LCP element; Lantern charges more render-blocking time because the two
  CSS files load small-first in this build (12 kB + 95 kB) and big-first in the local main build
  (99 kB + 8 kB). The split order varies by build — production before this change already loaded
  the small file (`015d8d5…`) first. Observed (unthrottled) LCP: `/en` 150 → 118 ms, `/th` 105 →
  142 ms (noise). Screenshots main vs branch at 375/768/1440 on 5 pages are pixel-identical with
  the blinking cursor masked, so the CSS order does not change rendering. Kept: LCP stays well
  under the 2.5 s target; recheck on production.
- e2e 24/24, lib tests 70/70, typecheck/lint pass.

## Live check — after iteration 5 (main 4c2fd49)

- Sentry on production: no SDK at `load`; after idle a client with DSN exists (lazy init works).
- Lighthouse mobile, median of 3:

  | Page | a11y | SEO | Perf | LCP | TBT |
  |------|------|-----|------|-----|-----|
  | `/en` | 100 | 100 | 86 → **90** | 1.16 s | 525 → 415 ms |
  | `/th` | 100 | 100 | 77 | 3.8 s (runs 1.2 / 3.8 / 4.1 s) | 457 ms |
  | `/en/blog` | 100 | 100 | 70 | 4.8 s | 460 ms |
  | `/en/projects` | 100 | 100 | 73 | 5.2 s (runs 1.3 / 5.2 / 5.6 s) | 329 ms |

- On `/th`, `/en/blog` and `/en/projects` the LCP element is the analytics consent banner text in
  every run, before and after this change; its paint lands either at ~1.2 s or at 4–5 s, so the
  medians swing between deploys. This is the one blocker left for LCP < 2.5 s and perf ≥ 90 on
  those pages. Fixing it changes how consent is asked (PDPA) → **owner decision**; loop stops here.
- Codex P2s on Storybook (#38) fixed in #41 (fetch mock, theme sync, unprefixed pathname).
- UI review (qa-testing ui_review, 320–1440) found only issues that production already had:
  at 320 px the site name overlaps the theme icon and the Thai name breaks mid-word
  ("กรี/โภค"); doodle muted subtitle contrast flagged during fade-in; header control
  label/name mismatch. Next UX iteration.

## Iteration 6 — UX: header at 320 px

- Picked: UX (priority above perf; perf now waits on the consent-banner decision). UI review at
  320 px: "Chaowalit Greepoke" ran under the theme toggle on every page.
- Cause: the brand link is `whitespace-nowrap` but could shrink, so flex squeezed its box to 123 px
  while the text needed ~165 px and was drawn over the next button.
- Test first: `e2e/navigation.spec.ts` "Header at phone widths" (320/375 × en/th) measures the drawn
  brand width (`scrollWidth`) against the first header control and checks for sideways scroll
  (failed at 320 on en and th: text ends at 181 px, first control at 139 px).
- Change (below 360 px only): brand `shrink-0 text-sm`, header controls `gap-1`, language button
  shows the flag without the globe icon. 360 px and up are unchanged.
- After: e2e 28/28; at 320 px the brand ends at 165 px and the toggle starts at 165 px; the
  language button is 44 px wide (tap target). Screenshots 320/375/768/1440 × en/th: 320 fixed,
  others unchanged.
- Codex P2 on the test (confirmed, fixed): it could measure before hydration (ThemeToggle is a
  placeholder) and `Math.min()` of no controls is `Infinity`. It now waits for the toggle button,
  requires ≥ 3 controls, and checks the header's own overflow. Red against production (old header)
  at 320 px, green on the branch 3 runs in a row.
- Found on the way: right after hydration the hero entrance animations make the page scroll
  sideways for a moment at 320 px (0 px once they finish). Next UX item.

## Live check — after iteration 6 (main 3bfb486)

`/en` perf 89, LCP 1.18 s, TBT 437 ms · `/th` perf 77, LCP 4.0 s (consent banner), TBT 429 ms ·
a11y 100, SEO 100. e2e against production 20/20.

## Iteration 7 — UX/a11y on phones and header controls

Three items from the UI review, all pre-existing, none needing the owner:

1. **Sideways scroll at 320 px.** The hero sticky note's entrance spring (stiffness 200, damping 15)
   overshot to ~1.13× and the page overflowed 20–25 px for a moment. Test first: e2e samples
   `scrollWidth - innerWidth` every 100 ms for 3 s at 320 px on `/en`, `/th` (red: 20, 25).
   Fix: damping 30 (critical ≈ 28) — no overshoot. Green 3 runs in a row.
2. **Thai name split mid-word** ("กรี / โภค") at 320 px. Test first: e2e maps each word of the
   hero name to its line boxes (red on `/th`: "กรีโภค)"). Fix: each word in `whitespace-nowrap`,
   wrapping only at spaces. `/th` now breaks "(เชาวลิต / กรีโภค)"; `/en` unchanged.
3. **Label in Name (WCAG 2.5.3).** Header buttons showed "⌘K" and "?" but were named
   "… (Cmd+K)" and "Keyboard shortcuts help". axe 4.13 in this repo does not flag it (4.14 in the
   UI review does), so the e2e checks it directly at 375/768/1440 × en/th (red at 768/1440).
   Fix: names "Open command palette (⌘K)" / "เปิดถาดคำสั่ง (⌘K)" and "Keyboard shortcuts help (?)".

After: e2e 43/43 (home, navigation, locale, keyboard, axe smoke); unit tests pass; local
Lighthouse `/en` 94 (LCP 1.36 s, TBT 284 ms), `/th` 91 (LCP 1.36 s, TBT 356 ms) — same range as
iteration 5, no regression. Screenshots 320/375/768/1440 × en/th checked.
- Codex P2s on the tests (confirmed, fixed): the overflow test now records every animation frame
  from first paint and waits until the sticky note has settled; the label test waits for the "⌘K"
  and "?" buttons at ≥ 768 px. Against production (old code) 7 of 10 fail as expected; on the
  branch all pass 3 runs in a row.

## Iteration 8 — consent banner from static HTML + cookie (owner chose "render from cookie")

- Cause of the slow LCP on `/th`, `/en/blog`, `/en/projects`: the banner was loaded with
  `next/dynamic`, so the server HTML held it inside a hidden Suspense segment that only JavaScript
  revealed, and during hydration it could unmount and mount again when its chunk arrived late —
  a new, late LCP candidate (4–5 s runs). Returning visitors also saw it flash before it hid.
- Approach (pages stay static): the provider is imported statically, so the banner is plain
  server HTML; the answer is stored in a first-party cookie `portfolio.analytics-consent.v1`
  (`granted|denied`, 1 year, Lax, Secure on HTTPS; legacy localStorage answers are honoured and
  copied over); a tiny `<head>` script (`src/lib/consent-boot.ts`) reads it before first paint
  and sets `<html data-consent>`; CSS hides the first-visit banner for those visitors. A server
  reading the cookie would have made every page dynamic.
- Tests first: `consent-cookie.test.ts` (cookie read/write, legacy migration, junk ignored,
  pre-paint script), `consent-banner.test.ts` (initial/reopened marker + CSS rule), and
  `e2e/consent-banner.spec.ts` (needs a build with analytics on, `E2E_CONSENT=1`): banner visible
  with JS off; returning visitor sees it in 0 frames and can still reopen it; answering writes the
  cookie. All 4 e2e fail against production, pass locally (2 runs).
- After (local builds, both with analytics on; Lighthouse mobile, median of 3):

  | Page | Perf main → branch | TBT | Lab LCP | Observed LCP |
  |------|--------------------|-----|---------|--------------|
  | `/en` | 92 → 97 | 330 → 206 ms | 1.21 → 1.36 s | — |
  | `/th` | 93 → 97 | 308 → 205 ms | 1.21 → 1.36 s | 261 → 190 ms |
  | `/en/blog` | 93 → 97 | 312 → 197 ms | 1.21 → 1.36 s | — |
  | `/en/projects` | 88 → 97 | 388 → 179 ms | 1.21 → 1.36 s | 196 → 142 ms |

  Lab LCP +150 ms is the CSS split order again: the local main build loads 99 kB + 8 kB, this
  branch 12 kB + 95 kB — which is what production already serves today, so there is no change
  against production. e2e 47/47 with the banner present. Screenshots 375/768/1440 × en/th × new /
  returning: banner unchanged for new visitors, absent for returning ones.
- Codex P2 (confirmed, fixed): the pre-paint script adds `data-consent` to `<html>`, which React
  reported as a hydration attribute mismatch (dev only; production React is silent). The returning-
  visitor e2e now fails on any hydration warning — red on `next dev`, green after
  `suppressHydrationWarning` on `<html>` (covers only that element's own attributes). e2e 47/47 on
  the production build, 4/4 on dev (2 runs).
- Follow-up from the UI review (axe 4.14): "Open command palette (⌘K)" still failed Label in Name —
  axe treats "(⌘K)" as a different word from the visible "⌘K". Name is now "Open command palette ⌘K"
  / "เปิดถาดคำสั่ง ⌘K"; the e2e compares whole words like axe (red on the parenthesised name, green
  after). axe 4.14 label-content-name-mismatch: 0 on `/en` and `/th`.

## Live check — after iterations 7–8 (main 62281e6)

- Production HTML: consent banner is plain markup (no hidden Suspense segment), pre-paint script in
  `<head>`. e2e against production 34/34 incl. the 4 consent tests (returning visitor: banner in
  0 frames). axe 4.14 Label in Name: 0.
- Lighthouse mobile, median of 3 (host load avg ~10, TBT inflated):

  | Page | Perf (before → now) | LCP median (runs) |
  |------|---------------------|-------------------|
  | `/en` | 89 → 89 | 1.20 s |
  | `/th` | 77 → 86 | 1.24 s (1.22 / 3.33 / 1.24) |
  | `/en/blog` | 70 → 88 | 1.26 s (1.17 / 3.07 / 1.26) |
  | `/en/projects` | 73 → 85 | 3.32 s (1.25 / 3.33 / 3.32) |

- The banner is still the LCP element. Its late mode dropped from 4–5 s to 3.1–3.3 s and the early
  mode (~1.2 s) is now the common one (6 of 9 runs); observed render delay is 0.1–0.7 s. Next lead:
  the banner text's web-font swap (Geist / Geist Mono) may re-time the LCP paint in Lantern.

## Iteration 9 — banner paints with the first frame

- Investigation: under real mobile throttling (CPU ×4, 1.6 Mbps, 150 ms) Chrome records a single
  LCP entry — the banner text — at first paint in every run (~1.5 s). The 3.1–3.3 s lab values
  come from Lighthouse runs where the banner painted one frame after FCP (FCP 404 / LCP 533 ms,
  604 / 632 ms): Lantern then makes LCP wait for all the JavaScript run before it. The banner sat
  at the very end of `<body>` (after the footer), so with the HTML arriving in chunks the first
  frame could be painted before the parser reached it. (The late Kalam font is not involved.)
- Test first: `consent-banner.test.ts` `panelFor` (top slot: first-visit banner only; bottom:
  choices control + reopened banner); e2e: banner marker before `<main` on `/en`, `/th`,
  `/en/projects`, and Tab order skip link → Decline. Both e2e red on production.
- Change: `AnalyticsProvider` renders in two slots — `top` right after the skip link (first-visit
  banner), `bottom` where it was (choices control, reopened banner, page views). On screen nothing
  moves (the banner is `position: fixed`); keyboard users reach the choice right after the skip link.
- After: unit 83/83; e2e 49/49 twice (analytics-on build). Screenshots: first-visit banner and the
  reopened banner unchanged. Lab effect has to be checked on production (local server sends the
  HTML in one piece, so the late-frame mode does not occur locally).

## Live check — after iteration 9 (main c19c6a4)

e2e against production 36/36 (incl. HTML order and Tab order). Lighthouse mobile, 3 runs each:

| Page | a11y | SEO | Perf | LCP runs (s) | TBT |
|------|------|-----|------|--------------|-----|
| `/en` | 100 | 100 | 92 | 1.14 / 1.15 / 1.22 | 351 ms |
| `/th` | 100 | 100 | 92 | 1.22 / 1.23 / 1.22 | 330 ms |
| `/en/blog` | 100 | 100 | 91 | 1.17 / 1.15 / 1.14 | 361 ms |
| `/en/projects` | 100 | 100 | 94 | 1.26 / 1.26 / 1.25 | 296 ms |

Observed LCP equals observed FCP in all 12 runs: the late-frame mode is gone. Every page now meets
perf ≥ 90 and LCP < 2.5 s. Against the first baseline (2026-11-12 morning): perf 69/70/84/87 →
92/92/91/94, LCP 4.4/5.0 s → ~1.2 s, SEO 91–92 → 100, prod advisories 8 → 0, CSP/COOP added.
Still open: TBT 300–360 ms (target < 200 ms), CSP `script-src` nonces, small-text and orphan-grid
items from the UI review, Google Fonts fetch flake in CI builds.
