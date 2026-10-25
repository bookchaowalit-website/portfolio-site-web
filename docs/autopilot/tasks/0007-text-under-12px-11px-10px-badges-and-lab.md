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

- **test**: ผ่าน
  ---
        duration_ms: 0.917964
        type: 'test'
        ...
      # Subtest: times out after the configured limit without throwing
      ok 7 - times out after the configured limit without throwing
        ---
        duration_ms: 20.982141
        type: 'test'
        ...
      1..7
  ok 9 - server analytics (contact_sent)
    ---
    duration_ms: 57.545881
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
  # duration_ms 606.932557
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
  [P2] src/components/atlas-client.tsx:396 Three SVG <text> labels stay at 9–10px. If ui_review.mjs measures computed font-size on every text node without skipping aria-hidden or SVG, it will still report text-under-12px on /en and /en/projects, so the first acceptance criterion would not be met. → Confirm against ui_review.mjs output. If the checker flags them, either exclude aria-hidden SVG text in the checker or make the labels at least 12px in rendered size (e.g. via a larger viewBox scale).
  [P2] public/sw.js:1 The generated service-worker bundle (build artifact with a new Sentry debug id) is modified and committed, which is unrelated to the task. → Revert public/sw.js (git checkout main -- public/sw.js) so the PR contains only the style changes and the task record.
- Run: https://github.com/bookchaowalit-website/portfolio-site-web/actions/runs/40233247685 · 2026-10-26 04:04 ICT

## Visual review

- **visual-ai**: ผ่าน — audit {'blocker': 0, 'major': 0, 'minor': 11}; AI verdict pass; checked ['/ @375', '/ @768', '/ @1440', '/now @375', '/now @768', '/now @1440', '/live-systems @375', '/live-systems @768', '/live-systems @1440']

## Definition of Done
- [x] ไม่เหลือ `text-[9|10|11px]` ใน HTML (เหลือเฉพาะ SVG decorative 3 จุด และเป็น `aria-hidden`)
- [x] Badge/label ≥ `text-xs`
- [x] SVG label ที่เล็กกว่า 12px เป็น `aria-hidden`
- [ ] `ui_review.mjs` ที่ 375/768/1440 และ `npm run e2e:a11y` — รอ visual gate/CI

## Release / deploy
merge เข้า main = deploy production ผ่าน Vercel Git; loop เปิด PR และ owner อนุมัติด้วย label `autopilot:approved`
