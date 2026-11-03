# ADR-0003 — Content อยู่ใน repo (TS/MDX/JSON) ไม่มี database

- Status: **accepted (retro-documented)** — 2026-11-03

## Context
Catalog ต้องตรวจสอบได้ (truthful portfolio) และทดสอบได้ใน CI

## Decision
- Project catalog = array ใน `src/data/app-projects.ts` (type `AppProject`) — ทดสอบด้วย node test
- Blog = `content/blog/*.mdx` + frontmatter อ่านด้วย `gray-matter` ตอน build
- ข้อความ UI = `messages/en.json`, `messages/th.json`; atlas = `src/content/domain-inventory.json`; testimonials = `src/data/testimonials.ts`
- ไม่มี DB, ORM หรือ migration; state ฝั่ง server มีแค่ cache ใน memory (stars 1 ชม., screenshot 24 ชม.)

## Evidence
- ไม่มี dependency DB ใน `package.json`; `src/lib/blog.ts`; `src/data/__tests__/portfolio-catalog.test.ts` (`allProjects.length === 128`)
- `src/app/api/github-stars/route.ts` (`CACHE_TTL = 3600_000`), `src/app/api/screenshot/route.ts` (`CACHE_TTL` 24 ชม.)

## Consequences
- + Git = source of truth และ backup ([14-backup-dr.md](../14-backup-dr.md)); ทุกการแก้ผ่าน review/test
- − แก้ card 1 ใบ = 1 deploy (กินโควตา Vercel)
- − ข้อความ contact ไม่ถูกเก็บในระบบ อยู่ใน inbox ของเจ้าของเท่านั้น
