# 21 — Incident response

Status: **done** (ใช้ช่องทางแจ้งเตือนที่พบจริง; ไม่มี on-call — `RUNBOOK.md` "Solo operator, no multi-person on-call")

```mermaid
flowchart TD
  subgraph ALERT["Alert sources"]
    A1["deploy-smoke.yml fails: GitHub email"]
    A2["ci.yml fails on main: GitHub email"]
    A3["Sentry issue email"]
    A4["Autopilot Telegram: run_error, paused, task_blocked"]
    A5["Visitor reports via contact or direct email"]
    A6["audit:links finds broken card link"]
  end
  ALERT --> T{"Triage by owner: user-facing?"}
  T -- "site down or key page not 200" --> R1["Rollback: promote previous Vercel Production deployment"]
  T -- "broken card link" --> R2["Set demoUnavailable or drop repo in app-projects.ts"]
  T -- "contact 503" --> R3["Check RESEND_API_KEY and RESEND_FROM in Vercel"]
  T -- "analytics leak suspicion" --> R4["Set NEXT_PUBLIC_ANALYTICS_ENABLED=false and redeploy"]
  T -- "autopilot misbehaves" --> R5["Open issue Autopilot paused or unset AUTOPILOT_ENABLED"]
  T -- "CI only, not user-facing" --> R6["Fix forward on main"]
  R1 --> F["Fix forward: commit, push main, Vercel deploy"]
  R2 --> F
  R3 --> V
  R4 --> F
  R5 --> F
  R6 --> F
  F --> V["Verify: deploy-smoke green, scripts/deploy-smoke.sh"]
  V --> P["Postmortem: no template in repo, open question"]
  P --> B["Backlog: GitHub issue with source:incident label, read by autopilot planner"]
```

Sources: `.github/workflows/deploy-smoke.yml`, `.github/workflows/ci.yml`, `docs/measurement/KPI-PLAN.md` (alert channels), `.autopilot/config.json` (`notify.events`),
`.autopilot/README.md` (planner reads `source:incident`; pause issue), `.github/workflows/autopilot.yml` (`vars.AUTOPILOT_ENABLED`), `docs/measurement/GO-LIVE.md` ("Turning it off again"),
`RUNBOOK.md` (Rollback), `src/app/api/contact/route.ts`, `scripts/live-link-audit.mjs`

## Severity (เสนอจากสิ่งที่มี ไม่ได้กำหนดไว้ใน repo)

ไม่พบ severity matrix หรือ SLA ใน repo — **not defined**

## Open questions

- ต้องการ postmortem template (เช่นจาก architecture-docs) และที่เก็บ (`docs/incidents/`) หรือไม่
- ขั้นตอน rollback ใน Vercel ยังไม่มีเอกสารที่ทดสอบแล้ว
