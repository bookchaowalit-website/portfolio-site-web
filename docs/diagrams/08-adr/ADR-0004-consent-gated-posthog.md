# ADR-0004 — Product analytics: PostHog EU หลัง consent + server event ไม่มี PII; เอา GA4 ออก

- Status: **accepted (retro-documented)** — 2026-11-03
- นำ ADR-0005 ของ architecture-docs (analytics standard) มาใช้ใน repo นี้

## Decision
- Browser: `src/lib/browser-analytics.ts` เป็น API กลาง, โหลด `posthog-js` (pin `1.438.7`) ด้วย dynamic import **หลัง** "Allow analytics" เท่านั้น
  ปิด autocapture, recording, surveys, flags; `before_send` ตัด query, id, referrer path, `$ip`
- Server: `contact_sent` ส่งจาก `/api/contact` ผ่าน `after()` ด้วย `distinct_id` สุ่มทุก event, `$ip: null`
- Kill switch: ต้อง `NEXT_PUBLIC_ANALYTICS_ENABLED === "true"` และมี `NEXT_PUBLIC_POSTHOG_KEY`
- Vercel Web Analytics + Speed Insights คงไว้ (cookieless)

## Evidence
- `src/lib/browser-analytics.ts`, `src/lib/posthog-adapter.ts`, `src/lib/server-analytics.ts`, `src/components/analytics/*`
- Tests: `browser-analytics.test.ts`, `posthog-adapter.test.ts`, `server-analytics.test.ts`, `event-catalog.test.ts`, `no-ga4.test.ts`, `consent-banner.test.ts`
- `docs/measurement/KPI-PLAN.md`, `EVENTS.md`, `GO-LIVE.md` (go-live 2026-10-26), `ANALYTICS_SETUP.md`

## Consequences
- + ไม่มี request ไป PostHog ก่อน consent (ตรวจใน test และ GO-LIVE step 5)
- − KPI-L วัดได้เฉพาะคนที่ยอม consent
