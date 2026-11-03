# ADR-0002 — Hosting บน Vercel Git integration; CI ไม่ deploy และ deploy-smoke ตรวจหลัง deploy

- Status: **accepted (retro-documented)** — 2026-11-03

## Context
Solo operator, free plan Vercel (100 deploy / 24 ชม. ใช้ร่วมทั้ง team), repo public ใช้ GitHub-hosted runner

## Decision
Vercel project `bookchaowalit-portfolio-frontend` deploy `main` เป็น Production ผ่าน Git integration เอง
`ci.yml` "never deploys"; หลัง Vercel รายงาน `deployment_status` = success ของ environment `Production`
`deploy-smoke.yml` ยิง `scripts/deploy-smoke.sh https://bookchaowalit.com`
branch `autopilot/*` ปิด preview deploy เพื่อประหยัดโควตา

## Evidence
- `.github/workflows/ci.yml` (comment บรรทัดแรก), `.github/workflows/deploy-smoke.yml`, `scripts/deploy-smoke.sh`
- `vercel.json` (`git.deploymentEnabled: {"autopilot/*": false}`)
- `specs/001-truthful-portfolio/spec.md` §6, `.autopilot/README.md` "merge = deploy production"
- GitHub Deployments API: 78 Production deployments โดย `vercel[bot]` ใน 90 วัน (ดู [22-dora.md](../22-dora.md))

## Consequences
- + deploy ง่าย ไม่มี deploy secret ใน CI
- − CI สีแดงไม่หยุด deploy: commit ที่ CI fail ทั้ง 7 ตัวใน 90 วันถูก deploy ขึ้น Production (ดู [22-dora.md](../22-dora.md))
- − rollback ต้องทำใน Vercel (promote deployment เก่า) — ไม่มี script ใน repo
