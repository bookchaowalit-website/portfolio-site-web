---
title: portfolio-site-web — KPI and Instrumentation Plan
tags: [kpi, measurement, portfolio, analytics, adr-0005]
created: 2026-10-21
updated: 2026-10-23
description: North star, input and guardrail KPIs for bookchaowalit.com, the PostHog events behind them (behind a flag and a consent banner), how the baseline is collected, and what is still open before they can be measured.
status: approved
template: architecture-docs templates/sdlc/kpi-and-instrumentation-plan.md
---

# portfolio-site-web — KPI and Instrumentation Plan

Big Loop W4 (2026-10-23): this plan is one of the three pilots that must close
one full loop (events live → baseline → outcome review → backlog item →
shipped → measured again) before M2 (2026-12-31). GA4 is removed from the code
(it loaded on every page before any consent); PostHog replaces it behind a
kill switch and a consent banner (ADR-0005). All events stay **off** until the
owner sets the three variables in [GO-LIVE.md](GO-LIVE.md). Event catalog:
[EVENTS.md](EVENTS.md). Learn stage: [OUTCOME-REVIEW-001.md](OUTCOME-REVIEW-001.md)
(OR-201) and [EXPERIMENT-LOG.md](EXPERIMENT-LOG.md).

## North star and input metrics

| Role | KPI | Why it is tied to the goal ("a visitor trusts the portfolio enough to get in touch") |
|---|---|---|
| **North star** | KPI-O-01 Contact messages delivered per month | Getting in touch is the outcome itself |
| Input 1 | KPI-L-01 Case-study views per consented visit | A visitor who opens case studies is checking the evidence before trusting it |
| Input 2 | KPI-L-02 Demo / source click-through from a case study | Opening the live demo or the source is the strongest trust check a visitor can make |
| Guardrails | KPI-G-01…G-03 | Growth must not come from broken links, overclaiming cards or a broken site |

## Document control

| Field | Value |
|---|---|
| Project / product ID | portfolio-site-web (Tier A, Big Loop Plan Wave 5 / P1; W4 analytics pilot) |
| Version | 0.2 |
| Status | draft — instrumented behind a flag (off by default, W4 pilot 2026-10-23); guardrails live |
| Metric owner | Owner (bookchaowalit) |
| AI maker | Claude Code (Wave 5 P1 session 2026-10-21; W4 session w4c-loop-pilot 2026-10-23) |
| AI reviewer | independent Claude reviewer subagent (`solo:solo-reviewer`, Sonnet, read-only, no maker context), 2026-10-24: approved (see Approval) |
| Charter objectives | OBJ-01 below (no separate charter for this repository) |
| Analytics / data source of truth | PostHog Cloud EU, shared own-products project, `product = "portfolio"` (ADR-0005 D-2) — off until GO-LIVE step 3. Vercel Web Analytics (cookieless page counts, ADR-0005 layer 3) stays as it is. GA4 removed 2026-10-23 |
| Dashboard | PostHog dashboard "Portfolio pilot" — spec in [`analytics/posthog/dashboard.json`](../../analytics/posthog/dashboard.json), created by the owner after sign-up; Sentry project `personal-yu0/portfolio-site-web` |
| Next review | OR-201 ([OUTCOME-REVIEW-001.md](OUTCOME-REVIEW-001.md)) — due go-live + 30 days; pending go-live |

## KPI tree

```text
OBJ-01 A visitor (recruiter, interviewer, prospective client) trusts the portfolio enough to get in touch
  └─ KPI-O-01 Contact messages delivered per month     (server event, all visitors)
       ├─ KPI-L-01 Case-study views per consented visit (browser, consent only)
       ├─ KPI-L-02 Demo or source click-through rate    (browser, consent only)
       ├─ KPI-G-01 Broken published links (must stay 0)
       ├─ KPI-G-02 Cards that claim what their repository does not ship (must stay 0)
       └─ KPI-G-03 Production error events per week (Sentry)
```

## KPI definitions

| KPI ID | Type | Name | Objective | Formula | Unit | Min volume for a rate | Segment / filter | Data source and event(s) | Baseline | Target | Alert threshold | Cadence | Owner |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| KPI-O-01 | outcome (north star) | Contact messages delivered | OBJ-01 | count of `contact_sent` in the calendar month (sent only after Resend accepted the message) | messages / month | n/a (count) | all locales; split by `locale` | PostHog: `contact_sent` from `src/app/api/contact/route.ts` | not yet measured: events off, and production refuses to send until `RESEND_FROM` is a verified sender (owner action) | ≥ 2 / month by 2027-01-31 | 0 for 30 days after the sender is verified | monthly | Owner |
| KPI-L-01 | leading | Case-study views per consented visit | OBJ-01 | `view_project` events / distinct sessions with a `$pageview` (both from visitors who allowed analytics) | views per visit | 200 consented visits per week | en + th; `product = portfolio` | PostHog: `$pageview`, `view_project` | not yet measured — events not live | provisional ≥ 0.5 by 2027-01-31; restated after 2 baseline periods | < 0.2 for 14 days (above min volume) | weekly | Owner |
| KPI-L-02 | leading | Demo / source click-through | OBJ-01 | (`click_demo` + `click_source`) / `view_project`, same week | % | 100 project views per week | by `evidence_level`; `product = portfolio` | PostHog: `view_project`, `click_demo`, `click_source` | not yet measured — events not live | provisional ≥ 25% by 2027-01-31; restated after 2 baseline periods | < 10% for 14 days (above min volume) | weekly | Owner |
| KPI-G-01 | guardrail | Broken published links | OBJ-01 | cards whose published demo or source link is not HTTP 200 | cards | n/a | all cards | `npm run audit:links` (`scripts/live-link-audit.mjs`) and `scripts/deploy-smoke.sh` after each production deploy | 0 (2026-10-21, [audit](../audits/LIVE-LINK-AUDIT-2026-10.md)) | stay 0 | ≥ 1 | each deploy + monthly | Owner |
| KPI-G-02 | guardrail | Overclaiming cards | OBJ-01 | cards whose copy names a backend, integration or scale the repository lacks | cards | n/a | all cards | `src/data/__tests__/portfolio-catalog.test.ts` ("portfolio claims"), [claims review](../audits/CARD-CLAIMS-REVIEW-2026-10.md) | 0 after 2026-10-21 review (was most website cards) | stay 0 | test failure in CI | each push | Owner |
| KPI-G-03 | guardrail | Production errors | OBJ-01 | Sentry error events | events / week | n/a | production | Sentry `personal-yu0/portfolio-site-web` (errors only, scrubbed) | not yet measured (DSN set 2026-10-21) | ≤ 5 / week | > 20 in a day | weekly | Owner |

Pilot rule: KPI-L targets are provisional (owner to confirm **[ต้องยืนยัน]**)
and are restated after two baseline periods. "go-live" is the date of the first
production event (GO-LIVE.md step 5); write the real date into this file and
OR-201 on that day. KPI-L-01 and KPI-L-02 count only visitors who allowed
analytics, so they describe that group, not all visitors. A KPI below its
minimum volume is reported as `not measurable`, never as a ratio. Raw page
views (Vercel Web Analytics) and total stars are vanity counts, not KPIs.

## Baseline collection

| KPI | How the baseline is collected | When |
|---|---|---|
| KPI-O-01 | PostHog insight "KPI-O-01" (`analytics/posthog/dashboard.json`) for the first full calendar month after go-live; cross-check against the number of contact emails in the owner's inbox for the same month (should match ± retries) | first full month after go-live, then monthly |
| KPI-L-01, KPI-L-02 | PostHog insights "KPI-L-01" and "KPI-L-02" for the first two full weeks after go-live; below the minimum volume write `not measurable` and extend the window | weekly from go-live |
| KPI-G-01…G-03 | Already collected: link audit and catalog test baselines 2026-10-21; Sentry weekly count from the first full week after the DSN deploy | as listed |

Paste the aggregates (no raw events) into OR-201.

## Event and data specification

The contact event is sent server-side after Resend accepted the message.
Steps that make no server request (page views, case-study views, demo/source
clicks) are sent from the browser through the provider-neutral
`src/lib/browser-analytics.ts`, only after the visitor allows analytics in the
consent banner. Every event, server or browser, is off unless
`NEXT_PUBLIC_ANALYTICS_ENABLED=true` and `NEXT_PUBLIC_POSTHOG_KEY` are set.
Full catalog with call sites and tests: [EVENTS.md](EVENTS.md).

| Event / field | Trigger | Properties | Personal data? | Emitted by | Requirement | Status |
|---|---|---|---|---|---|---|
| `contact_sent` | Resend accepts a contact message | `locale` only — never name, email, subject or message text | no: fresh random `distinct_id` per event, `$ip = null`, `$geoip_disable`, `$process_person_profile = false` | `src/app/api/contact/route.ts` (via `after()`) | KPI-O-01 | implemented (tests), off |
| `$pageview` | Route change, after consent | `$pathname`, `$current_url` with no query, fragment or id segments | anonymous PostHog browser id (pseudonymous); IP removed | `src/components/analytics/analytics-provider.tsx` | KPI-L-01 | implemented (tests), off |
| `view_project` | Case-study page opens, after consent | `project_slug` (public catalog slug), `evidence_level` | browser id | `src/app/[locale]/projects/[slug]/project-detail-client.tsx` | KPI-L-01, KPI-L-02 | implemented (tests), off |
| `click_demo` / `click_source` | Visitor opens the demo or source link on a case study, after consent | `project_slug`, `evidence_level` | browser id | same file | KPI-L-02 | implemented (tests), off |
| every PostHog event | — | `product = "portfolio"` | — | wrapper | ADR-0005 D-2 | implemented (tests) |
| Sentry error | Uncaught error, browser or server | stack trace only; `request`, `user`, breadcrumbs, extra and frame locals are removed (`src/lib/sentry.ts`) | no | `instrumentation-client.ts`, `sentry.*.config.ts` | KPI-G-03 | implemented |

Privacy and data rules:

- No names, emails, phone numbers or message text go to PostHog or Sentry.
  Contact form content goes only to the owner's inbox through Resend. The
  wrappers drop any property or value not on the allow-list.
- Consent (PDPA): browser events need consent. The banner
  (`src/components/analytics/consent-banner.tsx`, en + th) offers Decline and
  Allow analytics with the same size and style. **Before a choice, and after
  Decline, the PostHog SDK is not loaded at all** — no cookies, no storage, no
  request. This is stricter than PostHog's cookieless mode. After Allow, PostHog
  keeps its anonymous id in `localStorage` (never cookies). The choice is stored
  in `localStorage` (`portfolio.analytics-consent.v1`) and can be changed from
  "Analytics choices".
- Lawful basis for `contact_sent`: it carries no personal data (random id per
  event, no IP, no GeoIP, no person profile, locale only), so it is not
  personal-data processing and needs no consent; it counts a message the
  visitor chose to send.
- Vercel Web Analytics (`@vercel/analytics`) stays: it sets no cookies (Vercel
  documents a daily-rotating request hash instead), so it is the cookieless
  page layer of ADR-0005 (layer 3). Owner to re-confirm against Vercel's current
  privacy page **[ต้องยืนยัน]**.
- Retention: PostHog free plan, reported 1 year **[ต้องยืนยัน at sign-up]**;
  Sentry plan default.
- Processors: PostHog (EU), Vercel (analytics, hosting), Sentry (US region),
  Resend. DPAs: PostHog at sign-up (GO-LIVE step 2); Sentry owner to confirm.
- Cross-border transfer (PDPA section 28 adequacy not available for the EU, so
  a section 29 safeguard): PostHog EU plus sub-processors; safeguard = vendor
  DPA/SCC **[ต้องยืนยัน]**.
- Deletion requests: browser events are tied only to an anonymous id the
  visitor can clear (Decline / clear site data); on request, delete the person
  in PostHog with the delete-events option. Server events hold nothing to
  delete.
- PostHog project setting "discard client IP data" switched on at sign-up, on
  top of `$ip` removal per event.

## Dashboards and alerts

| Dashboard / alert | KPIs | Audience | Location | Refresh | Alert channel | Status |
|---|---|---|---|---|---|---|
| Deploy smoke | KPI-G-01 | Owner | GitHub Actions `Deploy smoke` workflow | each production deploy | GitHub failure email | live |
| Catalog claims tests | KPI-G-02 | Owner | GitHub Actions `CI` | each push | GitHub failure email | live |
| Sentry issues | KPI-G-03 | Owner | Sentry `portfolio-site-web` | real time | Sentry email | live once the next production deploy carries the DSN |
| Portfolio pilot | KPI-O-01, KPI-L-01, KPI-L-02, first-event check | Owner | PostHog (EU), spec `analytics/posthog/dashboard.json` | live | — | planned (GO-LIVE step 6) |

## Instrumentation verification (before G10)

| # | Check | Evidence | Result |
|---|---|---|---|
| 1 | Every event fires once per real action | unit tests; then one manual pass against PostHog live events (GO-LIVE step 5) | pass in tests; manual pending |
| 2 | Event counts reconcile with the system of record | `contact_sent` per month vs contact emails received | pending |
| 3 | No PII in event payloads | `src/lib/__tests__/browser-analytics.test.ts`, `server-analytics.test.ts`, `posthog-adapter.test.ts`, `sentry.test.ts` | pass in tests; sample 20 live events at go-live |
| 4 | Dashboard renders each KPI | screenshot after GO-LIVE step 6 | pending |
| 5 | Alerts reach the channel | — | pending (KPI-L alerts are read at the weekly review) |
| 6 | Baselines captured or dated action | KPI-G-01/G-02 baselines 2026-10-21; others per "Baseline collection" | waived with dated action (go-live + 30) |
| 7 | Tracking respects consent | `src/lib/__tests__/browser-analytics.test.ts` (no load, no request before consent or after Decline; fetch/XHR/sendBeacon trapped); `no-ga4.test.ts` (GA4 gone) | pass in tests — recheck in production with the network panel at go-live |

## Owner actions

| ID | Action | Needed before |
|---|---|---|
| A-1 | PostHog EU sign-up, DPA, env vars, deploy, first-event check, dashboard: [GO-LIVE.md](GO-LIVE.md) steps 1–6 | first production event |
| A-2 | Remove `NEXT_PUBLIC_GA_MEASUREMENT_ID` from Vercel project `bookchaowalit-portfolio-frontend` after the deploy that carries this change (GO-LIVE step 9) | after that deploy |
| A-3 | Review the `/privacy` wording (now PostHog with consent + Vercel Web Analytics), its effective date and retention (GO-LIVE step 10) | first production event |
| A-4 | Verify `RESEND_FROM` so production can deliver contact messages (otherwise KPI-O-01 stays 0) | first outcome review |

## Change history of definitions

| Date | KPI ID | Change | Reason | Baseline restated? | Approved by |
|---|---|---|---|---|---|
| 2026-10-21 | all | First draft | Big Loop Plan Wave 5 (P1), L3 requirement | n/a | pending owner |
| 2026-10-23 | all | v0.2: north star named; KPI-L-01 now per consented visit; GA4 replaced by PostHog behind consent; `contact_sent` server event; baseline collection section | Big Loop W4 pilot, ADR-0005 rejects GA4 as default | n/a (no baseline yet) | pending owner |

## Quality gate and approval

| Gate | Condition | Decision | Approver | Date | Evidence |
|---|---|---|---|---|---|
| G5 (06 Requirements) | Objective has outcome, leading and guardrail KPIs with formulas | pending | Owner — own product, no external signatory | | this file |
| G10 (11 Deployment) | Checks 1–5 and 7 pass; check 6 passes or is waived with a dated action | pending | Owner | | |
| G11 (12 Operations) | Dashboard live, first outcome review scheduled | pending | Owner | | |

## Approval (2026-10-24)

| Field | Value |
|---|---|
| Checker | independent Claude reviewer subagent (`solo:solo-reviewer`, Sonnet, read-only, no maker context) |
| Approver | AI approval under the owner's process (approvals by the owner or AI with evidence; maker and checker are different agents). Recorded by Claude session oa-remainder on the owner's instruction "ทำที่เหลือให้หน่อย" (2026-10-24) |
| Verdict | **approved** |
| Evidence | contact_sent, view_project, click_demo, click_source in src/ with tests; server-analytics.ts ($ip null, randomUUID); consent key; analytics/posthog/dashboard.json; audit:links; events marked off, dashboard planned. |
