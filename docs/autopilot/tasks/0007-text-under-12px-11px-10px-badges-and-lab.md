# #7 Text under 12px: 11px/10px badges and labels on home, now, atlas, blog list

## Document control
- Issue: #7 (bookchaowalit-website/portfolio-site-web)
- Branch: autopilot/7-text-under-12px-11px-10px-badges-and-lab
- Attempt: 1 จาก 3
- วันที่: 2026-10-25
- Maker: Claude autopilot

## Definition of Ready
- [x] Requirement ชัดเจน: ข้อความ badge/label ต้อง ≥ 12px
- [x] Acceptance criteria ทดสอบได้ (`ui_review.mjs` ไม่พบ `text-under-12px`)
- [x] Data/API impact: ไม่มี
- [x] Security/privacy impact: ไม่มี
- [x] Dependencies: ไม่มี

## Requirement & acceptance criteria
- Given `/en`, `/en/now`, `/en/projects`, `/en/live-systems` ที่ 375/768/1440px, When รัน `ui_review.mjs`, Then ไม่พบ finding `text-under-12px`
- Badge และ label ใช้อย่างน้อย `text-xs` (12px) และไม่ wrap/overflow ที่ 375px
- ข้อความใน SVG ของ atlas อาจเล็กกว่าได้ถ้าเป็น decorative (`aria-hidden`)

## Design / approach
เปลี่ยน `text-[9px]`/`text-[10px]`/`text-[11px]` ที่เป็น HTML เป็น `text-xs` (Tailwind 12px) ทั้งหมด รวม command-palette และ lazy sections ที่มี pattern เดียวกัน
ข้อความใน `<svg>` (label ของ category และ node) คงขนาดเดิม เพราะอยู่ใน viewBox ที่ scale ตามความกว้าง และเพิ่ม `aria-hidden="true"` เพราะเป็น decorative (ข้อมูลเดียวกันมีใน list/detail panel ด้านล่าง)
ทางเลือกที่ไม่ใช้: เพิ่มขนาด SVG text เป็น 12px จะทำให้ label ชนกันใน diagram

## Impact & risk
- Data/Auth: ไม่มี
- Performance: ไม่มีผล
- Accessibility: ข้อความอ่านง่ายขึ้น; SVG label ถูกซ่อนจาก assistive tech (ซ้ำกับเนื้อหา list)
- ความเสี่ยง: badge ใหญ่ขึ้นอาจ wrap ที่ 375px — ให้ visual gate ตรวจ
- Rollback: revert PR

## Implementation notes
- `src/components/now-client.tsx`: label/badge 11px → `text-xs`
- `src/components/live-systems-client.tsx`: ข้อความเตือน 11px → `text-xs`
- `src/components/notebook-blog-list.tsx`: tag/meta 11px → `text-xs`
- `src/components/atlas-client.tsx`: stat label และ Badge → `text-xs`; SVG text เพิ่ม `aria-hidden`
- `src/components/lazy/domain-map.tsx`: SVG label เพิ่ม `aria-hidden`
- `src/components/lazy/featured-projects.tsx`: badge ของ project card → `text-xs`
- `src/components/lazy/knowledge-atlas-section.tsx`, `testimonials-section.tsx`, `src/components/command-palette.tsx`: 10px → `text-xs`

## Test evidence
- `npm test`: 50 pass, 0 fail
- `npm run typecheck`: ผ่าน
- `npm run lint`: 0 error (1 warning เดิมเรื่อง `<img>`)
- `npm run build`: ผ่าน
- ไม่มี test ใหม่ (เปลี่ยน class ด้านสไตล์เท่านั้น); `ui_review.mjs` และ `e2e:a11y` ไม่ได้รันในสภาพแวดล้อมนี้

## Review evidence
pending

## Visual review
pending

## Definition of Done
- [x] ไม่เหลือ `text-[9|10|11px]` ใน HTML (เหลือเฉพาะ SVG decorative 3 จุด และเป็น `aria-hidden`)
- [x] Badge/label ≥ `text-xs`
- [x] SVG label ที่เล็กกว่า 12px เป็น `aria-hidden`
- [ ] `ui_review.mjs` ที่ 375/768/1440 และ `npm run e2e:a11y` — รอ visual gate/CI

## Release / deploy
merge เข้า main = deploy production ผ่าน Vercel Git; loop เปิด PR และ owner อนุมัติด้วย label `autopilot:approved`
