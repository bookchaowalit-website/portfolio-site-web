# ADR-0005 — Sentry รายงานเฉพาะ error และ scrub ข้อมูลผู้มาเยือน

- Status: **accepted (retro-documented)** — 2026-11-03

## Decision
`sentryOptions(dsn)` ใช้ร่วม browser/Node/Edge: ปิดเมื่อไม่มี `NEXT_PUBLIC_SENTRY_DSN`, `sendDefaultPii: false`,
ไม่มี tracing, `tracePropagationTargets: []`, `maxBreadcrumbs: 0`, replay 0, `beforeSendTransaction` ทิ้งทุกตัว,
`scrubEvent` ลบ `request`, `user`, `breadcrumbs`, `extra`, context ที่ไม่ใช่ platform, frame `vars` และ query string ใน URL

## Evidence
- `src/lib/sentry.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/instrumentation.ts` (`onRequestError`)
- `next.config.js` (`withSentryConfig`, `hideSourceMaps: true`)
- Test: `src/lib/__tests__/sentry.test.ts`; SPEC-001 AC-06; Sentry project `personal-yu0/portfolio-site-web` (KPI-PLAN)

## Consequences
- + ไม่มี PII ใน Sentry
- − debug ยากขึ้น (ไม่มี breadcrumbs / request path)
