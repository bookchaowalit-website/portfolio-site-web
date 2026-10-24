# #10 Blog post overclaims "100 micro-frontends" and overflows at 375px

## Document control
- Issue: #10 (bookchaowalit-website/portfolio-site-web)
- Branch: `autopilot/10-blog-post-overclaims-100-micro-frontends`
- Attempt: 1 of 3
- Date: 2026-10-24
- Maker: Claude autopilot

## Definition of Ready
- [x] Requirement: ชัดเจน (ลบตัวเลขเกินจริง + แก้ overflow ที่ 375px)
- [x] Acceptance criteria ทดสอบได้ (ดูด้านล่าง)
- [x] Data/API impact: ไม่มี
- [x] Security/privacy impact: ไม่มี
- [x] Dependencies: ไม่มี

## Requirement & acceptance criteria
- Given โพสต์, When ผู้อ่านตรวจตัวเลข, Then ทุกตัวเลขมีแหล่งใน repo หรือถูกแทนด้วยข้อความเชิงคุณภาพ; ไม่มี "100" ที่ไม่มีแหล่ง
- Title/excerpt เขียนใหม่ให้ตรง; slug `building-100-micro-frontends` คงเดิม
- เวอร์ชันไทย (ถ้ามี) ต้องสอดคล้อง
- Given โพสต์ที่ 375px, When โหลด, Then หน้าไม่กว้างกว่า viewport

## Design / approach
- เขียนโพสต์ใหม่: ตัด "100 apps", "separate analytics and error tracking", "~4.5s", "0 incidents", "9 categories", "under 100KB" ออก (ไม่มีแหล่งใน repo) แทนด้วยข้อความเชิงคุณภาพ และบอกตรง ๆ ว่า Sentry/PostHog ติดตั้งเฉพาะบางแอป ตาม `docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`
- Slug คงเดิม จึง**ไม่ต้องเพิ่ม redirect**
- Overflow: `aside` ของ TOC เป็น fixed + `translate-x-full` ทำให้หน้ากว้าง 663px; เปลี่ยนสถานะปิดบนมือถือเป็น `max-lg:hidden` (ออกจาก layout) — desktop (`lg:`) ไม่เปลี่ยน
- ทางเลือกที่ไม่ใช้: ใส่ `overflow-x-hidden` ที่ body (ซ่อนอาการ ไม่แก้ที่ต้นเหตุ)

## Impact & risk
- Data/Auth: ไม่มี. Performance: ไม่กระทบ.
- Accessibility: panel ที่ปิดไม่อยู่ใน tab order/accessibility tree บนมือถือ (ดีขึ้น). ข้อเสีย: ไม่มี animation slide-out ตอนปิด
- Rollback: revert commit

## Implementation notes
- `content/blog/building-100-micro-frontends.mdx` — เขียนใหม่ ไม่มีตัวเลขที่ไม่มีแหล่ง; title/excerpt ใหม่
- `src/components/table-of-contents.tsx` — สถานะปิดบนมือถือใช้ `max-lg:hidden`
- `src/lib/__tests__/blog-claims.test.ts` — เทสต์ใหม่ (regression)
- ไม่มีโพสต์ภาษาไทยของเรื่องนี้ (`content/blog` มีเฉพาะ EN สำหรับโพสต์นี้) จึงไม่มีอะไรต้องแก้ใน `messages/*.json`
- หมายเหตุ: `src/app/[locale]/projects/opengraph-image.tsx` มี "100 Micro-Frontends" เช่นกัน อยู่นอกขอบเขต issue นี้ — ควรเปิด issue แยก

## Test evidence
- `npm test` — 52 pass, 0 fail (รวมเทสต์ใหม่)
- `npm run typecheck` — ผ่าน
- `npm run lint` — 0 errors (1 warning เดิมใน `mdx-components.tsx`)
- `npm run build` — สำเร็จ
- ยังไม่ได้รัน `ui_review.mjs` ที่ 375px ในรอบนี้ (ต้องใช้ visual gate)

## Review evidence
pending

## Visual review
pending

## Definition of Done
- [x] ไม่มีตัวเลข "100" / analytics ต่อแอป / metrics ที่ไม่มีแหล่ง
- [x] Title/excerpt เขียนใหม่, slug คงเดิม (ไม่ต้อง redirect)
- [x] N/A — ไม่มีเวอร์ชันไทย
- [ ] ไม่มี overflow ที่ 375px — แก้ที่ต้นเหตุแล้ว รอ visual gate ยืนยัน

## Release / deploy
Merge เข้า `main` = deploy production ผ่าน Vercel Git; loop เปิด PR และเจ้าของอนุมัติด้วย label `autopilot:approved`
