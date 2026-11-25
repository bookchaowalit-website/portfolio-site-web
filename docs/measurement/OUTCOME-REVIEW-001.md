---
title: portfolio-site-web — Outcome Review 001 (T+30)
status: decided
created: 2026-10-23
updated: 2026-11-26
description: First outcome review of the bookchaowalit.com KPI pilot, prepared before go-live. Due 30 days after the first production event; status stays "pending" until then (go-live 2026-10-26). Read by empire-backlog-sync once its status is "decided".
---

# portfolio-site-web — Outcome Review 001 (T+30)

Prepared from architecture-docs `templates/sdlc/outcome-review.md`. When this
review is `decided`, `empire-backlog-sync` turns each row of "Decisions and
actions" into one task in tasks-api with key `outcome-review/OR-201#<row>`
(architecture-docs `docs/lifecycle/OUTCOME-REVIEW-TO-BACKLOG.md`). Review IDs
are unique across products because the key has no repository in it: the
portfolio uses OR-201…OR-299.

## Document control

| Field | Value |
|---|---|
| Review ID | OR-201 |
| Project / product ID | portfolio-site-web (`bookchaowalit-website/portfolio-site-web`, bookchaowalit.com) |
| Version | 1.0 |
| Release(s) covered | Production redeploy of `a2f3308` with analytics on (dpl_DsK5DHo9QJkFMkFtynaibX47ZqxN, 2026-10-26) |
| Review period | 2026-10-26 – 2026-11-25 |
| Review type | T+30 |
| Status | decided 2026-11-26 (owner accepted all proposed decisions) |
| Owner | Owner (bookchaowalit) |
| AI maker | Claude Code (session w4c-loop-pilot) prepared the empty review |
| AI reviewer | Fresh read-only Claude reviewer at review time |
| KPI plan version | [KPI-PLAN.md](KPI-PLAN.md) v0.2 |
| Data snapshot | PostHog insight exports from `analytics/posthog/dashboard.json`, `npm run audit:links` output, Sentry weekly count — aggregates only |
| Previous review | none (first review) |
| Phase gate record | G11 record — fill in at review |
| Due | 2026-11-25 (go-live 2026-10-26 + 30 days) |

## Summary

Data snapshot: PostHog project 318524 (EU), HogQL over `events` from 2026-10-20 to 2026-11-25 17:00 UTC (full period); live bundles checked 2026-11-20.

| Objective | Outcome KPI | Verdict | One-line reason |
|---|---|---|---|
| OBJ-01 | KPI-O-01 (north star) | off-track (low confidence) | 0 `contact_sent` in the first period; volume is far below every rate KPI's minimum |

Overall decision (owner accepted 2026-11-26): **not measurable for the rates; north star at 0 →
create traffic** — the instrumentation works (91 pageviews from 16 consented visitors in 20 sessions), so the gap
is traffic, not tracking.


## KPI results

| KPI ID | Type | Baseline | Target (by date) | Previous review | This period | Change vs baseline | Status | Data quality note |
|---|---|---|---|---|---|---|---|---|
| KPI-O-01 | outcome (north star) | not yet measured | ≥ 2 / month by 2027-01-31 | — | 0 `contact_sent` | — | below target | Count KPI; valid only once `RESEND_FROM` is verified (unconfirmed) |
| KPI-L-01 | leading | not yet measured | ≥ 0.5 views / consented visit by 2027-01-31 (provisional) | — | 2 `view_project` / 20 sessions | — | not measurable | Max 9 sessions in a week vs 200 minimum |
| KPI-L-02 | leading | not yet measured | ≥ 25% by 2027-01-31 (provisional) | — | 1 click / 2 project views | — | not measurable | Below 100 project views per week |
| KPI-G-01 | guardrail | 0 (2026-10-21) | stay 0 | — | not re-run in this pass | — | not checked | `npm run audit:links` |
| KPI-G-02 | guardrail | 0 (2026-10-21) | stay 0 | — | not re-run in this pass | — | not checked | catalog claims test runs in CI on each push |
| KPI-G-03 | guardrail | not yet measured | ≤ 5 / week | — | not collected in this pass | — | not checked | Sentry |

Weekly PostHog counts for bookchaowalit.com (week starting Monday):

| Week | `$pageview` | Sessions | `view_project` | `click_demo` + `click_source` | `contact_sent` |
|---|---|---|---|---|---|
| 2026-10-19 | 2 | 2 | 0 | 0 | 0 |
| 2026-10-26 | 0 | 0 | 0 | 0 | 0 |
| 2026-11-02 | 12 | 3 | 1 | 0 | 0 |
| 2026-11-09 | 24 | 4 | 1 | 1 | 0 |
| 2026-11-16 | 37 | 9 | 0 | 0 | 0 |
| 2026-11-23 (to 11-25) | 15 | 4 | 0 | 0 | 0 |

## Attribution

| KPI ID | Evidence type | Confidence | Other possible causes checked |
|---|---|---|---|
| all | before-after only (first period is the baseline) | low | — |

## Qualitative signals

| Source | Volume this period | Top themes | Link |
|---|---|---|---|
| Contact messages (owner inbox) | not checked in this pass | — | — |
| Sentry errors (`personal-yu0/portfolio-site-web`) | not collected in this pass | — | — |

## Decisions and actions

Filled in at the review. Allowed types: backlog item, experiment, discovery
question, KPI definition change, retire feature, change request, roadmap
change. One action per row; write the task key or issue into "Tracked in".

| # | Decision | Type | Owner | Due | Tracked in |
|---|---|---|---|---|---|
| 1 | Confirm `RESEND_FROM` is a verified sender and send one test contact message | backlog item | Owner | 2026-11-27 | outcome-review/OR-201#1 |
| 2 | Lower the rate KPIs' minimum volume to a monthly window (e.g. 50 consented sessions / month) or report them as counts until traffic grows | KPI definition change | Owner | 2026-11-25 | outcome-review/OR-201#2 |
| 3 | Link the portfolio from the outbound offers (kill-rule batch) and measure the next period | experiment | Owner | 2026-12-25 | outcome-review/OR-201#3 |

Continuous discovery: open questions from this review go here.

- How many visitors decline consent? (no cookieless count yet) → OR-202
- Which channel brought the 16 consented visitors? → OR-202
## Approval and sign-off

| Decision | Approver | Date | Evidence |
|---|---|---|---|
| accept review and decisions | Owner | 2026-11-26 | owner reply in the Claude Code session, 2026-11-26 ("ตามข้อเสนอ") |
| next review scheduled (OR-202, T+60) | Owner | 2026-11-26 | due 2026-12-25, task `outcome-review/portfolio/2026-12-25` |
