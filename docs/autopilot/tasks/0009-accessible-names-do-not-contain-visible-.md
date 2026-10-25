# #9 Accessible names do not contain visible text (aria-label on cards/links, command palette button)
## Document control
- Issue: #9 · Branch: autopilot/9-accessible-names-do-not-contain-visible- · Attempt: 1 · Date: 2026-10-25 · Maker: Claude autopilot
## Definition of Ready
- [x] Requirement ชัดเจน · [x] Acceptance criteria ทดสอบได้ · [x] ไม่กระทบ data/API · [x] ไม่กระทบ security/privacy · [x] ไม่มี dependency ใหม่
## Requirement & acceptance criteria
- Given หน้าใดก็ตามที่ 1440 และ 375px, When axe ทำงาน, Then ไม่มี `label-content-name-mismatch`
- accessible name ของแต่ละ control ขึ้นต้นด้วยข้อความที่มองเห็น; messages ทั้ง en/th อัปเดตตรงกัน; `npm run e2e:a11y` และ `npm run test:a11y` ผ่าน
## Design / approach
- ปุ่ม command palette แสดง "⌘K" แต่ label เดิมคือ "Open command palette (Cmd+K)" → เปลี่ยน `openPalette` เป็น "⌘K — Open command palette" (th: "⌘K — เปิดถาดคำสั่ง") ให้ขึ้นต้นด้วยข้อความที่เห็น
- ปุ่ม Preview ใน featured-projects ฮาร์ดโค้ด "Preview {name}" ทำให้ locale th ไม่ตรงกับข้อความที่เห็น → ใช้ `tProjects("preview")` นำหน้าชื่อ
- การ์ดโปรเจกต์ (`projects-client.tsx`) ตรวจแล้ว: ลิงก์ overlay และลิงก์ไอคอนไม่มีข้อความที่มองเห็น จึงไม่เข้าข่าย
- ทางเลือกที่ปฏิเสธ: ลบ aria-label ทิ้ง (ชื่อจะเหลือแค่ "⌘K" ไม่สื่อความหมาย)
## Impact & risk
- ไม่กระทบ data/auth/performance; a11y ดีขึ้น; rollback = revert commit
## Implementation notes
- `messages/en.json`, `messages/th.json`: ปรับ `openPalette`
- `src/components/lazy/featured-projects.tsx`: aria-label ปุ่ม Preview ใช้ข้อความแปล
## Test evidence
- รัน `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` (ผลดูในรายงานสุดท้าย); ไม่มีการเพิ่ม test ใหม่ — axe ครอบคลุมโดย `npm run test:a11y`
## Review evidence
pending
## Visual review
pending
## Definition of Done
- [x] ชื่อ accessible ขึ้นต้นด้วยข้อความที่เห็น · [x] อัปเดตทั้งสอง locale · [ ] axe ผ่านบน CI
## Release / deploy
merge เข้า main = deploy production ผ่าน Vercel; loop เปิด PR และเจ้าของอนุมัติด้วย label autopilot:approved
