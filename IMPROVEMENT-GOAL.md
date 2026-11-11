# Improvement goal — bookchaowalit.com

Goal: make the site the best version of itself for real users. Every iteration
must raise one scorecard metric without lowering any other. Results go in
[IMPROVEMENT-LOG.md](IMPROVEMENT-LOG.md).

## Scorecard (priority order)

| # | Area | Metric | Target | How it is measured |
|---|------|--------|--------|--------------------|
| 1 | Correctness | typecheck, lint errors, unit tests, build | all green, 0 errors | `npm run ci:local` |
| 2 | Security | high/critical advisories | 0 | `npm audit --omit=dev` |
| 2 | Security | moderate advisories in prod deps | 0 | `npm audit --omit=dev` |
| 2 | Security | response headers | CSP, HSTS, XCTO, XFO, Referrer, Permissions, COOP present | `curl -I https://bookchaowalit.com/en` |
| 3 | UX / a11y | Lighthouse accessibility (mobile) | 100 | Lighthouse on `/en`, `/th`, `/en/projects`, `/en/blog` |
| 3 | UX / a11y | design floor (ADR-0007) | 12/12 | CI `design-floor` job |
| 3 | UX / a11y | visual check | no broken layout at 375/768/1440 | screenshots of touched pages |
| 4 | Performance | Lighthouse performance (mobile) | ≥ 90 on every page | Lighthouse, same pages |
| 4 | Performance | LCP / CLS / TBT (lab) | < 2.5 s / < 0.1 / < 200 ms | Lighthouse |
| 5 | SEO | Lighthouse SEO | 100 | Lighthouse, same pages |
| 5 | SEO | links | 0 broken | `npm run audit:links` |
| 6 | Code health | lint warnings | 0 | `npm run lint` |
| 7 | Product | core flows instrumented | contact + newsletter + project click events in PostHog | `src/lib/event-catalog` tests |

## Rules per iteration

1. Measure every metric; record the baseline.
2. Pick the lowest-scoring item in the highest-priority area that is not met.
3. Write the spec/test first, then the smallest change that improves it.
4. Re-measure; keep the change only if that metric improved and none regressed.
5. Screenshot touched pages at 375/768/1440 and check them.
6. One small PR per iteration; log before/after.

## Guardrails

- CI green and Codex review before merge; merge locally (no GitHub web merge).
- Batch deploys (Vercel free plan, 100/24 h): push to `main` deploys production.
- No DB/auth/billing changes or new paid dependencies without asking the owner.

## Stop

All targets met, three iterations in a row with no gain, or an owner decision is needed.
