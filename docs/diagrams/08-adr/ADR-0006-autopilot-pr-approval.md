# ADR-0006 — Autopilot ส่งงานเป็น PR และรอเจ้าของอนุมัติทุกครั้ง (merge = deploy)

- Status: **accepted (retro-documented)** — 2026-11-03 (เจ้าของอนุมัติ W6 2026-10-24 ตาม `.autopilot/README.md`)

## Decision
`merge.mode: pr-approval`, `auto_merge_risk: []`; merge เฉพาะ PR ที่คนใส่ `autopilot:approved`, CI (`ci.yml` dispatch บน branch) เขียว
และโควตา Vercel เหลือ ≥ 20 (`min_free_vercel_deploys`); path สำคัญ (`src/app/api/`, `.github/`, `next.config.js`, …) อยู่ใน `protected_paths`

## Evidence
`.autopilot/config.json`, `.autopilot/README.md`, `.github/workflows/autopilot.yml`, `.autopilot/tests/test_ci_gate.py`, `vercel.json`

## Consequences
- + bot deploy production เองไม่ได้
- − branch protection ยังต้องการ check `Typecheck, lint, unit` ที่ไม่มีแล้ว จึงต้องให้เจ้าของ merge เอง (admin bypass) — ดู [18-git-release-workflow.md](../18-git-release-workflow.md)
