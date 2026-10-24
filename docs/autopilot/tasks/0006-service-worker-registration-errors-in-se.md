# #6 Service worker registration errors in Sentry (PORTFOLIO-SITE-WEB-1, -2)

## Document control
- Issue: #6 (Sentry PORTFOLIO-SITE-WEB-1 `7805362074`, PORTFOLIO-SITE-WEB-2 `7807062094`)
- Branch: `autopilot/6-service-worker-registration-errors-in-se`
- Attempt: 1 จาก 3
- วันที่: 2026-10-24
- Maker: Claude autopilot

## Definition of Ready
- [x] Requirement ชัดเจน: การ register service worker ล้มเหลวต้องไม่ throw และไม่ถูกส่งเข้า Sentry
- [x] Acceptance criteria ทดสอบได้ (ดูหัวข้อถัดไป)
- [x] ผลกระทบต่อ data/API: ไม่มี
- [x] ผลกระทบด้าน security/privacy: ไม่มี (ไม่เพิ่ม request หรือการเก็บข้อมูล)
- [x] Dependencies: ไม่เพิ่ม dependency

## Requirement & acceptance criteria
- Given `register()` reject (network error), When โหลดหน้า, Then ไม่มี error ที่ไม่ได้ถูกจับ และไม่ส่งอะไรเข้า Sentry (warning ใน console ได้)
- Given `register()` resolve เป็น `undefined` หรือ registration ที่ไม่มี `waiting`, When ตรวจ update, Then ไม่เกิด `TypeError`
- มี test ที่ fail ก่อนแก้ ใน `src/lib/__tests__/` (ADR-0004)
- Service worker ยัง register และทำงานปกติ ไม่เปลี่ยนพฤติกรรม caching

## Design / approach
สาเหตุ: `@serwist/next` ฝังโค้ด `window.serwist.register()` (จาก `register: true`) โดยไม่มี `.catch` จึงเกิด unhandled rejection (-1) และ `@serwist/window` อ่าน `this._registration.waiting` โดยไม่ตรวจว่ามี registration (-2).

แก้: ปิดการ register อัตโนมัติ (`register: false`) แล้ว register เองผ่าน `registerServiceWorker()` ใน `src/lib/sw-register.ts` ซึ่งครอบด้วย try/catch (warn เท่านั้น) และใช้ `registration?.waiting?` เรียกจาก client component `SwRegister` หลัง `load`.

ทางเลือกที่ปฏิเสธ: กรอง error ใน `sentry.*` (ซ่อนอาการ ไม่ใช่แก้ต้นเหตุ และเป็นไฟล์ที่ห้ามแก้); patch `node_modules` (ไม่ยั่งยืน).

หมายเหตุ: ต้องแก้ `next.config.js` หนึ่งบรรทัด (`register: false`) ซึ่งปกติอยู่นอกขอบเขต แต่เป็นทางเดียวที่หยุด registration เดิมที่ไม่มี catch. `src/app/sw.ts` ไม่ถูกแก้ จึงไม่กระทบ caching.

## Impact & risk
- Data/Auth: ไม่มี
- Performance: เท่าเดิม (register หลัง `load` เหมือนเดิม) ; client component เล็ก ๆ หนึ่งตัว
- Accessibility: ไม่มี (ไม่ render อะไร)
- ความเสี่ยง: ปิด `cacheOnNavigation`/`reloadOnOnline` ไม่เกี่ยว (ไม่ได้เปิดใน config). Rollback: revert PR (คืน `register: true`).

## Implementation notes
- `src/lib/sw-register.ts` — ฟังก์ชัน register ที่ไม่ throw, ตรวจ `registration?.waiting`
- `src/lib/__tests__/sw-register.test.ts` — test reject, resolve undefined, ไม่มี waiting, ค่า default
- `src/components/sw-register.tsx` — client component เรียก register หลัง load (ข้ามใน development)
- `src/app/[locale]/layout.tsx` — mount `<SwRegister />`
- `next.config.js` — `register: false`

## Test evidence
- `npm test` — ผ่าน 54/54 (รวม test ใหม่ 4 ข้อ). Test ใหม่ import `sw-register.ts` ที่ยังไม่มีก่อนแก้ จึง fail (red) ก่อนเพิ่มโมดูล แล้วผ่าน (green) หลังเพิ่ม
- `npm run typecheck` — ผ่าน
- `npm run lint` — 0 errors (1 warning เดิมใน `mdx-components.tsx`)
- `npm run build` — ผ่าน

## Review evidence
pending

## Visual review
N/A — ไม่มีการเปลี่ยน UI

## Definition of Done
- [x] reject ไม่ throw และไม่ส่ง Sentry (warn เท่านั้น)
- [x] `undefined` / ไม่มี `waiting` ไม่เกิด TypeError
- [x] test red→green ใน `src/lib/__tests__/`
- [x] SW ยัง register ที่ `/sw.js` scope `/` ; `sw.ts` ไม่เปลี่ยน
- [ ] หลัง deploy ไม่มี event ใหม่ 7 วัน (owner ตรวจและ resolve)

## Release / deploy
merge เข้า `main` = deploy production ผ่าน Vercel Git; loop เปิด PR และ owner อนุมัติด้วย label `autopilot:approved`.
