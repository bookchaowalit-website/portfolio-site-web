# ADR-0001 — Next.js 15 App Router + next-intl (en/th) แบบ static-first

- Status: **accepted (retro-documented)** — 2026-11-03
- เลขนี้เป็นเลขของ repo นี้ ไม่ใช่ ADR ใน architecture-docs (โค้ดอ้าง ADR-0004/0005/0007 ของ architecture-docs)

## Context
เว็บ portfolio สองภาษาที่ต้อง SEO ดี (OG ต่อหน้า, sitemap hreflang) และมี project 128 หน้า

## Decision
ใช้ Next.js 15 App Router (`next ^15.5.28`, React 19.1) กับ `next-intl` 4: ทุกหน้าอยู่ใต้ `src/app/[locale]/`,
locale `en` (default) และ `th`, middleware ของ next-intl จัด routing, หน้า project/blog/tag/domain สร้างล่วงหน้าด้วย `generateStaticParams`

## Evidence
- `package.json` (`next`, `next-intl`, `react`)
- `src/i18n/routing.ts` (`locales: ['en','th']`, `defaultLocale: 'en'`), `src/i18n/request.ts`, `middleware.ts`
- `generateStaticParams` ใน `src/app/[locale]/layout.tsx`, `projects/[slug]/page.tsx`, `blog/[slug]/page.tsx`, `blog/tags/[tag]/page.tsx`, `projects/domains/[domain]/page.tsx`
- `src/app/sitemap.ts` (en/th alternates + `x-default`)
- `PRODUCT.md` "Performance" (258+ static project pages)

## Consequences
- + หน้าเกือบทั้งหมดเป็น static, ไม่ต้องมี server state
- − bundle vendor 534 kB ก้อนเดียว (`PRODUCT.md` "What I'd improve next" #1)
- − ทุก path ที่ไม่มี locale ต้องมี redirect ใน `next.config.js`
