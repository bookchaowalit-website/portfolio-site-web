---
title: portfolio-site-web — Event catalog
status: draft
created: 2026-10-23
updated: 2026-10-23
description: Every analytics event bookchaowalit.com can send, the metric it feeds, where it fires and which test covers it. All events are off until NEXT_PUBLIC_ANALYTICS_ENABLED=true and a PostHog key are set; browser events also wait for consent.
---

# portfolio-site-web — Event catalog

Metric definitions: [KPI-PLAN.md](KPI-PLAN.md). Go-live steps: [GO-LIVE.md](GO-LIVE.md).
`src/lib/__tests__/event-catalog.test.ts` fails when an event below has no call
site or no test, or when the code can send an event that is not listed here.

Every event carries `product = "portfolio"`. Browser events go through
`before_send` (`src/lib/posthog-adapter.ts`), which removes query strings,
fragments, id segments, referrer paths and `$ip`, and sets `$geoip_disable`.
The server event sets `$ip = null`, `$geoip_disable = true` and
`$process_person_profile = false`, with a fresh random `distinct_id` per event.

## Events

| Event | Emitted by | Properties (allow-list) | Feeds metric | Call site | Test |
|---|---|---|---|---|---|
| `contact_sent` | server, after Resend accepts the message (no consent needed: no personal data) | `locale` ∈ `en`, `th` (else `unknown`) | KPI-O-01 | `src/app/api/contact/route.ts` (`after(() => trackServer(...))`) | `src/lib/__tests__/server-analytics.test.ts` |
| `$pageview` | browser, after consent | `$pathname`, `$current_url` (cleaned) | KPI-L-01 (denominator: consented visits) | `src/components/analytics/analytics-provider.tsx` (`analytics.page` on route change) | `src/lib/__tests__/browser-analytics.test.ts`, `src/lib/__tests__/posthog-adapter.test.ts` |
| `view_project` | browser, after consent | `project_slug` (public catalog slug, `a-z0-9-`, ≤ 64, not id-like), `evidence_level` ∈ `live`, `prototype`, `internal_system`, `experiment`, `none` | KPI-L-01 (numerator), KPI-L-02 (denominator) | `src/app/[locale]/projects/[slug]/project-detail-client.tsx` (on open) | `src/lib/__tests__/browser-analytics.test.ts` |
| `click_demo` | browser, after consent | same as `view_project` | KPI-L-02 (numerator) | `src/app/[locale]/projects/[slug]/project-detail-client.tsx` ("Visit project" link) | `src/lib/__tests__/browser-analytics.test.ts` |
| `click_source` | browser, after consent | same as `view_project` | KPI-L-02 (numerator) | `src/app/[locale]/projects/[slug]/project-detail-client.tsx` ("View source" link) | `src/lib/__tests__/browser-analytics.test.ts` |

## Identity

| Call | When | Value | Test |
|---|---|---|---|
| `identify` / `forgetIdentity` | not called: the site has no sign-in. The core API exists only to match the other products' copies | — | `src/lib/__tests__/browser-analytics.test.ts` |

Browser visitors stay anonymous: PostHog's own random id in `localStorage`,
created only after "Allow analytics" (`person_profiles: identified_only`, so no
person profiles are made).

## Never sent

Names, emails, contact subjects or message text, search text, URLs with
queries, ids, request bodies, error messages. There is no autocapture (forms
and inputs are never read), no session recording, no heatmaps, no surveys and
no feature flags.
