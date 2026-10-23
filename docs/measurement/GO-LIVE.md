---
title: portfolio-site-web — Analytics go-live checklist (owner)
status: draft
created: 2026-10-23
updated: 2026-10-23
description: The owner's steps to turn on PostHog analytics for bookchaowalit.com. Until step 3 is done every event is off and no request goes to PostHog.
---

# portfolio-site-web — Analytics go-live checklist (owner)

Everything is built and tested with analytics **off**. Nothing reaches PostHog
until step 3 is done and a deploy carries it. GA4 is already removed from the
code; it stops loading with the first deploy of this change.

Mind the deploy path: a push to `main` deploys from Git on Vercel, and the
free plan allows 100 deploys per 24 h across the whole team. Batch this change
with other portfolio work and push once.

| # | Step | Detail | Done |
|---|---|---|---|
| 1 | Sign up for PostHog Cloud **EU** (free plan) | One shared project for own products (ADR-0005 D-2), events split by `product = "portfolio"`; confirm free limits and retention on the pricing page; turn on "Discard client IP data" in project settings | ☐ |
| 2 | Accept the DPA | Read the DPA and sub-processor list; record the links in ADR-0005 (D-6 condition) and in KPI-PLAN.md "Privacy and data rules" | ☐ |
| 3 | Set 3 env vars in Vercel project `bookchaowalit-portfolio-frontend` (Production) and Infisical `/posthog` | `NEXT_PUBLIC_ANALYTICS_ENABLED=true` · `NEXT_PUBLIC_POSTHOG_KEY=<project API key, phc_…>` · `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`. The server event `contact_sent` uses the same key. These are `NEXT_PUBLIC_*`, so they are inlined at build time: set them **before** the deploy | ☐ |
| 4 | Deploy | Merge locally and push `main` once (Git deploy). Check the Vercel quota first | ☐ |
| 5 | Check the first event | Open the site in a private window: the banner shows; before a choice the network panel has **no** request to `posthog.com` and no `googletagmanager.com` request at all. Click "Decline": still nothing. Reopen "Analytics choices", click "Allow analytics", open a case study and click "Visit project". In PostHog run the "First-event check" insight: `$pageview`, `view_project`, `click_demo` appear with `product = portfolio`, URLs have no query string. Send one test message from `/contact` (needs `RESEND_FROM` verified) and see one `contact_sent`. Write today's date as **go-live** in KPI-PLAN.md and OUTCOME-REVIEW-001.md | ☐ |
| 6 | Create the dashboard | Dashboard "Portfolio pilot": one SQL insight per entry in `analytics/posthog/dashboard.json` | ☐ |
| 7 | Collect the baseline | See KPI-PLAN.md "Baseline collection": first full month for KPI-O-01, first two full weeks for KPI-L-01 / KPI-L-02. Paste aggregates into OR-201 | ☐ |
| 8 | First outcome review | **OR-201 due = go-live + 30 days.** Run it, set status `decided`; empire-backlog-sync then files one task per decision row (`outcome-review/OR-201#<row>`) | ☐ |
| 9 | Remove `NEXT_PUBLIC_GA_MEASUREMENT_ID` from Vercel | After the deploy in step 4 is live (the code no longer reads it). Optionally delete or archive the GA4 property | ☐ |
| 10 | Review the privacy notice | `/privacy` (messages `privacy.general`) now names PostHog (EU, only with consent) and Vercel Web Analytics instead of Google Analytics. Check the wording, update the effective date, and add retention once confirmed in step 1 | ☐ |

Turning it off again: set `NEXT_PUBLIC_ANALYTICS_ENABLED=false` (or remove the
key) and redeploy. Visitors can withdraw consent from "Analytics choices".
