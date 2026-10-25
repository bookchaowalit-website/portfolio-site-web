# #8 Colour contrast fails on /live-systems (yellow 11px status) and /about

## Document control
- Issue: #8 (bookchaowalit-website/portfolio-site-web)
- Branch: `autopilot/8-colour-contrast-fails-on-live-systems-ye`
- Attempt: 1 จาก 3
- วันที่: 2026-10-25
- Maker: Claude autopilot

## Definition of Ready
- [x] Requirement ชัดเจน (แก้ `color-contrast` serious ของ axe)
- [x] Acceptance criteria ทดสอบได้ (axe / `npm run test:a11y`)
- [x] Data/API impact: ไม่มี
- [x] Security/privacy impact: ไม่มี
- [x] Dependencies: ไม่มี

## Requirement & acceptance criteria
- Given `/en/live-systems` และ `/en/about` ทั้ง light/dark, When axe รันที่ 375 และ 1440px, Then ไม่มี `color-contrast` violation
- สีสถานะยังคงเป็นเหลือง/แอมเบอร์ และได้ 4.5:1 สำหรับข้อความปกติ
- หน้าอื่นไม่มี contrast violation ใหม่ (`npm run test:a11y`)

## Design / approach
- `/live-systems`: ข้อความ 11px สถานะเตือนเปลี่ยน `text-yellow-600` (~3.2:1 บนพื้นสว่าง) เป็น `text-yellow-700` (~4.9:1) โหมด dark คง `yellow-400`
- `/about`: selector ที่รายงานคือ `p` ตัวแรกใน footer (`.text-center.space-y-6 > .text-center > p`) ซึ่งใช้ `text-muted-foreground` (oklch 0.50 ≈ 6:1 บนพื้นขาว จึงผ่านเมื่ออยู่นิ่ง) สาเหตุที่เป็นไปได้คือ axe สุ่มตัวอย่างระหว่าง fade-in (opacity 0 → 1, delay 0.6s) จึงเอา opacity fade ออกจากบล็อก copyright ให้เป็น `div` ธรรมดา
- ทางเลือกที่ไม่เลือก: ปรับ `--muted-foreground` ทั้งเว็บ (กระทบทุกหน้า เสี่ยงเกินขอบเขต)
- ข้อจำกัด: ไม่ได้รัน axe กับเบราว์เซอร์ในสภาพแวดล้อมนี้ การวินิจฉัย `/about` จึงเป็นข้อสรุปจากโค้ด

## Impact & risk
- Data/Auth/Performance: ไม่กระทบ
- Accessibility: ดีขึ้น (contrast); ข้อความ copyright ไม่ fade-in อีกต่อไป
- Rollback: revert commit เดียว

## Implementation notes
- `src/components/live-systems-client.tsx`: yellow-600 → yellow-700 ที่ข้อความ 11px
- `src/components/footer.tsx`: เอา opacity fade ออกจากบล็อก copyright
- `src/lib/__tests__/contrast-classes.test.ts`: test กันการย้อนกลับ

## Test evidence
- `npm test` — ผ่านทั้งหมด (รวม test ใหม่ 2 รายการ)
- `npm run typecheck` — ผ่าน
- `npm run lint` — 0 error (1 warning เดิมใน mdx-components.tsx)
- `npm run build` — ผ่าน
- `npm run test:a11y` / axe — ไม่ได้รันในที่นี้ ให้ visual gate ยืนยัน

## Review evidence
pending

## Visual review
pending

## Definition of Done
- [ ] ไม่มี `color-contrast` บน `/en/live-systems` และ `/en/about` (รอ visual gate / axe)
- [x] สีเตือนยังเป็นเหลือง และ ≥ 4.5:1 (yellow-700 บนพื้นสว่าง, yellow-400 บน dark)
- [ ] `npm run test:a11y` ผ่าน (รอ gate)

## Release / deploy
merge เข้า main = deploy production ผ่าน Vercel Git; loop เปิด PR และเจ้าของอนุมัติด้วย label `autopilot:approved`
