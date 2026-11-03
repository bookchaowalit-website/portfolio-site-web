# Core 22 SDLC diagram pack — portfolio-site-web

ชุดภาพ 22 รายการตาม SDLC Diagram Catalog v2 (knowledge-base `knowledge/tech/core-cs/sdlc-diagram-catalog.md`)
วาดจากโค้ดและ config ของ repo นี้ ณ `origin/main` `a046154` (2026-11-03) — live: https://bookchaowalit.com
ทุก diagram มี `Sources:` และสิ่งที่ไม่รู้อยู่ใน "Open questions" ของไฟล์นั้น

| # | Item | Status | File | Sources read |
|---|---|---|---|---|
| 01 | Business process (As-Is / To-Be) | done | [01-business-process.md](01-business-process.md) | PRODUCT.md, specs/001, KPI-PLAN, GO-LIVE, OUTCOME-REVIEW-001, contact route, workflows, .autopilot |
| 02 | Use cases | done | [02-use-cases.md](02-use-cases.md) | i18n routing, api routes, mcp tools, analytics provider, robots/sitemap |
| 03 | User flows | done | [03-user-flows.md](03-user-flows.md) | routing, next.config.js redirects, projects/contact/live-systems clients, e2e specs |
| 04 | Traceability (RTM) | done | [04-traceability.md](04-traceability.md) | specs/001, KPI-PLAN, EVENTS.md, all test files, ci.yml |
| 05 | C4 Context | done | [05-c4-context.md](05-c4-context.md) | api routes, analytics, sentry, data-products catalog |
| 06 | C4 Container | done | [06-c4-container.md](06-c4-container.md) | middleware, route runtimes, sw.ts, next.config.js |
| 07 | C4 Component | done | [07-c4-component.md](07-c4-component.md) | src/data, src/lib, api routes |
| 08 | ADRs (retro-documented) | done | [08-adr/](08-adr/) — [0001](08-adr/ADR-0001-nextjs-app-router-next-intl.md), [0002](08-adr/ADR-0002-vercel-git-deploy-ci-not-gating.md), [0003](08-adr/ADR-0003-file-based-content-no-database.md), [0004](08-adr/ADR-0004-consent-gated-posthog.md), [0005](08-adr/ADR-0005-sentry-errors-only-scrubbed.md), [0006](08-adr/ADR-0006-autopilot-pr-approval.md) | package.json, vercel.json, workflows, sentry/analytics libs, .autopilot |
| 09 | ERD | done (file-backed model, no DB) | [09-erd.md](09-erd.md) | app-projects.ts, project-domains.ts, project-stars.ts, blog.ts, testimonials.ts, data-products types |
| 10 | Sequences | done | [10-sequences.md](10-sequences.md) | contact, screenshot, mcp, github routes; project-detail-client; analytics libs |
| 11 | State machines | done | [11-state-machines.md](11-state-machines.md) | browser-analytics, contact-client, data-products client, status-config, .autopilot/README |
| 12 | API & integrations | done | [12-api-integration.md](12-api-integration.md) | all route.ts, mcp tools, next.config.js, README env table |
| 13 | Threat model | done | [13-threat-model.md](13-threat-model.md) | routes, headers, sentry, posthog adapter, workflows, osv-scanner.toml |
| 14 | Backup & DR | done | [14-backup-dr.md](14-backup-dr.md) | RUNBOOK.md, GO-LIVE, KPI-PLAN, ADR-0003 |
| 15 | CI/CD pipeline | done | [15-cicd-pipeline.md](15-cicd-pipeline.md) | ci.yml, deploy-smoke.yml, autopilot.yml, platform-ci-workflows @87dc5e1 / @81b568f, gh run list |
| 16 | Deployment | done | [16-deployment.md](16-deployment.md) | vercel.json, .autopilot config, spec §4/§6, GO-LIVE, route runtimes |
| 17 | Test coverage matrix | done | [17-test-coverage-matrix.md](17-test-coverage-matrix.md) | package.json scripts, 13 unit test files, 8 e2e specs, ci.yml |
| 18 | Git & release workflow | done | [18-git-release-workflow.md](18-git-release-workflow.md) | .autopilot/README, config, git log, branch protection API |
| 19 | Service dependency map | done | [19-service-dependency-map.md](19-service-dependency-map.md) | layouts, sw.ts, next.config.js, routes, data-products catalog |
| 20 | Observability | done | [20-observability.md](20-observability.md) | sentry, analytics, workflows, KPI-PLAN, dashboard.json |
| 21 | Incident response | done | [21-incident-response.md](21-incident-response.md) | workflows, KPI-PLAN alerts, .autopilot notify, RUNBOOK, GO-LIVE |
| 22 | DORA | done (rework = proxy) | [22-dora.md](22-dora.md) | GitHub Deployments API, gh run list, git log |

## Reused docs (ลิงก์ ไม่คัดลอก)

- KPI / events / go-live / outcome review: [docs/measurement/](../measurement/) — ใช้ใน 01, 04, 20
- Card claims + live links: [docs/audits/CARD-CLAIMS-REVIEW-2026-10.md](../audits/CARD-CLAIMS-REVIEW-2026-10.md), [docs/audits/LIVE-LINK-AUDIT-2026-10.md](../audits/LIVE-LINK-AUDIT-2026-10.md) — ใช้ใน 04, 13
- [docs/LIVE-DEMO-AUDIT-2026-08-12.md](../LIVE-DEMO-AUDIT-2026-08-12.md) — ประวัติ demo TLS/404 ก่อน audit 2026-10 (ไม่ใช่สถานะปัจจุบัน)
- Autopilot loop: [.autopilot/README.md](../../.autopilot/README.md) — ใช้ใน 01, 11, 18

## Validate

```bash
node ~/work/core22/tools/validate.mjs docs/diagrams/*.md docs/diagrams/08-adr/*.md
```
