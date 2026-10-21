---
title: portfolio-site-web — KPI and Instrumentation Plan
tags: [kpi, measurement, portfolio]
created: 2026-10-21
updated: 2026-10-21
description: Outcome, leading and guardrail KPIs for bookchaowalit.com, the events behind them and what is still missing before they can be measured.
status: draft
template: architecture-docs templates/sdlc/kpi-and-instrumentation-plan.md
---

# portfolio-site-web — KPI and Instrumentation Plan

## Document control

| Field | Value |
|---|---|
| Project / product ID | portfolio-site-web (Tier A, Big Loop Plan Wave 5 / P1) |
| Version | 0.1 |
| Status | draft — guardrails are instrumented; outcome and leading events are planned |
| Metric owner | Owner (bookchaowalit) |
| AI maker | Claude Code (Wave 5 P1 session, 2026-10-21) |
| AI reviewer | Pending — a fresh Claude reviewer before the first outcome review |
| Charter objectives | OBJ-01 below (no separate charter for this repository) |
| Analytics / data source of truth | GA4 (`NEXT_PUBLIC_GA_MEASUREMENT_ID` is set on Vercel project `bookchaowalit-portfolio-frontend`) and Vercel Web Analytics. ADR-0005 (PostHog) is pending owner decision D4; move the events there once it is accepted. |
| Dashboard | GA4 property for bookchaowalit.com (owner account); Sentry project `personal-yu0/portfolio-site-web` |
| Next review | 2026-11-21 |

## KPI tree

```text
OBJ-01 A visitor (recruiter, interviewer, prospective client) trusts the portfolio enough to get in touch
  └─ KPI-O-01 Contact messages delivered per month
       ├─ KPI-L-01 Case-study views per visit
       ├─ KPI-L-02 Demo or source click-through rate from a case study
       ├─ KPI-G-01 Broken published links (must stay 0)
       ├─ KPI-G-02 Cards that claim what their repository does not ship (must stay 0)
       └─ KPI-G-03 Production error events per week (Sentry)
```

## KPI definitions

| KPI ID | Type | Name | Objective | Formula | Unit | Min volume for a rate | Segment / filter | Data source and event(s) | Baseline | Target | Alert threshold | Cadence | Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| KPI-O-01 | outcome | Contact messages delivered | OBJ-01 | count of `contact_sent` (server, Resend accepted) | messages / month | n/a (count) | all locales | `POST /api/contact` → `contact_sent` (planned) | not yet measured: production refuses to send until `RESEND_FROM` is a verified sender (owner action) | ≥ 2 / month by 2027-01-31 | 0 for 30 days after the sender is verified | monthly | Owner |
| KPI-L-01 | leading | Case-study views per visit | OBJ-01 | `view_project` events / sessions | views per session | ≥ 200 sessions per period | en + th | GA4 `view_project` (helper exists in `src/components/google-analytics.tsx`, not yet called) | not yet measured | ≥ 0.5 by 2027-01-31 | < 0.2 for 14 days | weekly | Owner |
| KPI-L-02 | leading | Demo / source click-through | OBJ-01 | (`click_demo` + `click_source`) / `view_project` | % | ≥ 100 project views | by `evidence_level` | GA4 `click_demo`, `click_source` (planned) | not yet measured | ≥ 25% by 2027-01-31 | < 10% for 14 days | weekly | Owner |
| KPI-G-01 | guardrail | Broken published links | OBJ-01 | cards whose published demo or source link is not HTTP 200 | cards | n/a | all 129 cards | `npm run audit:links` (`scripts/live-link-audit.mjs`) and `scripts/deploy-smoke.sh` after each production deploy | 0 (2026-10-21, [audit](../audits/LIVE-LINK-AUDIT-2026-10.md)) | stay 0 | ≥ 1 | each deploy + monthly | Owner |
| KPI-G-02 | guardrail | Overclaiming cards | OBJ-01 | cards whose copy names a backend, integration or scale the repository lacks | cards | n/a | all cards | `src/data/__tests__/portfolio-catalog.test.ts` ("portfolio claims"), [claims review](../audits/CARD-CLAIMS-REVIEW-2026-10.md) | 0 after 2026-10-21 review (was most website cards) | stay 0 | test failure in CI | each push | Owner |
| KPI-G-03 | guardrail | Production errors | OBJ-01 | Sentry error events | events / week | n/a | production | Sentry `personal-yu0/portfolio-site-web` (errors only, scrubbed) | not yet measured (DSN set 2026-10-21) | ≤ 5 / week | > 20 in a day | weekly | Owner |

Vanity counts (page views, total stars) are tracked by GA4 and the stars widget but are not outcome KPIs.

## Event and data specification

| Event / field | Trigger | Properties | Personal data? | Emitted by | Requirement | Status |
|---|---|---|---|---|---|---|
| `page_view` | Route change | `page_path` | IP and GA cookie ID are personal data under PDPA | `src/components/google-analytics.tsx` | — | implemented |
| `view_project` | Case-study page opens | `project_slug`, `evidence_level` | no (beyond GA cookie ID) | project detail page | KPI-L-01 | planned (helper exists, not called) |
| `click_demo` / `click_source` | Visitor opens a card's demo or source link | `project_slug`, `evidence_level` | no | project card + detail page | KPI-L-02 | planned |
| `contact_sent` | Resend accepts a contact message | `locale` only — never name, email or message text | no | `src/app/api/contact/route.ts` | KPI-O-01 | planned |
| Sentry error | Uncaught error, browser or server | stack trace only; `request`, `user`, breadcrumbs, extra and frame locals are removed (`src/lib/sentry.ts`) | no | `instrumentation-client.ts`, `sentry.*.config.ts` | KPI-G-03 | implemented |

Privacy and data rules:

- No names, emails, phone numbers or message text go to GA4 or Sentry. Contact form content goes only to the owner's inbox through Resend.
- The GA cookie ID and IP are personal data under PDPA. GA4 currently loads without a consent banner — a gap to close before KPI-L-01/L-02 are used for decisions (owner decision with D4).
- Retention: GA4 property default (owner to confirm, ≤ 14 months); Sentry plan default.
- Processors: Google (GA4), Vercel (analytics, hosting), Sentry (US region), Resend. DPAs: owner to confirm for GA4 and Sentry.
- Deletion requests: GA4 user deletion API by client ID; Sentry events hold no visitor identifiers.

## Dashboards and alerts

| Dashboard / alert | KPIs | Audience | Location | Refresh | Alert channel | Status |
|---|---|---|---|---|---|---|
| Deploy smoke | KPI-G-01 | Owner | GitHub Actions `Deploy smoke` workflow | each production deploy | GitHub failure email | live |
| Catalog claims tests | KPI-G-02 | Owner | GitHub Actions `CI` | each push | GitHub failure email | live |
| Sentry issues | KPI-G-03 | Owner | Sentry `portfolio-site-web` | real time | Sentry email | live once the next production deploy carries the DSN |
| Outcome dashboard | KPI-O-01, KPI-L-01, KPI-L-02 | Owner | GA4 | daily | — | planned |

## Instrumentation verification (before G10)

| # | Check | Evidence | Result |
|---|---|---|---|
| 1 | Every event fires once per real action | — | not run (events planned) |
| 2 | Event counts reconcile with the system of record | — | not run |
| 3 | No PII in event payloads | `src/lib/__tests__/sentry.test.ts` (Sentry only) | pass for Sentry; GA4 not run |
| 4 | Dashboard renders each KPI | — | not run |
| 5 | Alerts reach the channel | — | not run |
| 6 | Baselines captured or dated action | KPI-G-01/G-02 baselines 2026-10-21; others: capture by 2026-11-21 | waived with dated action |
| 7 | Tracking respects consent | — | fail: GA4 loads without consent |

## Change history of definitions

| Date | KPI ID | Change | Reason | Baseline restated? | Approved by |
|---|---|---|---|---|---|
| 2026-10-21 | all | First draft | Big Loop Plan Wave 5 (P1), L3 requirement | n/a | pending owner |
