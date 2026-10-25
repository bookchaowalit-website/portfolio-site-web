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

- **test**: ผ่าน
  ---
        duration_ms: 0.937492
        type: 'test'
        ...
      # Subtest: times out after the configured limit without throwing
      ok 7 - times out after the configured limit without throwing
        ---
        duration_ms: 21.045198
        type: 'test'
        ...
      1..7
  ok 9 - server analytics (contact_sent)
    ---
    duration_ms: 49.494307
    type: 'suite'
    ...
  1..9
  # tests 50
  # suites 9
  # pass 50
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 624.588451
- **typecheck**: ผ่าน
  > bookchaowalit-portfolio@0.1.0 typecheck
  > tsc --noEmit
- **lint**: ผ่าน
  > bookchaowalit-portfolio@0.1.0 lint
  > eslint


  /home/runner/work/portfolio-site-web/portfolio-site-web/mdx-components.tsx
    50:7  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

  ✖ 1 problem (0 errors, 1 warning)
- **build**: ผ่าน
  ├ ○ /projects-rss.xml                                  430 B         165 kB          1h      1y
  ├ ○ /robots.txt                                        430 B         165 kB
  ├ ○ /rss-th.xml                                        429 B         165 kB          1h      1y
  ├ ○ /rss.xml                                           429 B         165 kB          1h      1y
  └ ○ /sitemap.xml                                       429 B         165 kB
  + First Load JS shared by all                         165 kB
    ├ chunks/4952-f9d357887781d5fe.js                   106 kB
    ├ chunks/4bd1b696-72b775907cb33954.js              54.4 kB
    └ other shared chunks (total)                      4.08 kB


  ○  (Static)   prerendered as static content
  ●  (SSG)      prerendered as static HTML (uses generateStaticParams)
  ƒ  (Dynamic)  server-rendered on demand


  [@sentry/nextjs] Importing `withSentryConfig` from `@sentry/nextjs` is deprecated and will stop working in v11. Import it from `@sentry/nextjs/config` instead:
    import { withSentryConfig } from '@sentry/nextjs/config';
  [@sentry/nextjs - Node.js] Warning: No auth token provided. Will not create release. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/
  [@sentry/nextjs - Node.js] Warning: No auth token provided. Will not upload source maps. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/
  [@sentry/nextjs - Edge] Warning: No auth token provided. Will not create release. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/
  [@sentry/nextjs - Edge] Warning: No auth token provided. Will not upload source maps. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/
  [@sentry/nextjs - Client] Warning: No auth token provided. Will not create release. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/
  [@sentry/nextjs - Client] Warning: No auth token provided. Will not upload source maps. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/
   ⚠ Using edge runtime on a page currently disables static generation for that page
- **claude-review**: ผ่าน
  approve; 2 finding(s)
  [P2] public/sw.js:1 Regenerated minified service worker build artifact is included in the change; unrelated to the issue. → Revert public/sw.js (git checkout main -- public/sw.js) so the commit only contains the a11y fix.
  [P3] src/components/section-nav.tsx:106 aria-label `Go to ${section.label}` does not start with the visible (hover-revealed) span text section.label; could still trigger label-content-name-mismatch if axe treats the opacity-0 text as visible. → Confirm axe result; if flagged, make the label start with section.label (e.g. `${section.label} — go to section`) or use aria-hidden on the label span.
- Run: https://github.com/bookchaowalit-website/portfolio-site-web/actions/runs/40233247685 · 2026-10-26 04:12 ICT

## Visual review

- **visual-ai**: ผ่าน — audit {'blocker': 0, 'major': 6, 'minor': 8}; AI verdict pass; checked ['/en @375', '/en @768', '/en @1440', '/en/blog @375', '/en/blog @768', '/en/blog @1440']

## Definition of Done
- [x] ชื่อ accessible ขึ้นต้นด้วยข้อความที่เห็น · [x] อัปเดตทั้งสอง locale · [ ] axe ผ่านบน CI
## Release / deploy
merge เข้า main = deploy production ผ่าน Vercel; loop เปิด PR และเจ้าของอนุมัติด้วย label autopilot:approved
