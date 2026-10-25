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

- **test**: ผ่าน
  ---
        duration_ms: 0.970593
        type: 'test'
        ...
      # Subtest: times out after the configured limit without throwing
      ok 7 - times out after the configured limit without throwing
        ---
        duration_ms: 20.615158
        type: 'test'
        ...
      1..7
  ok 10 - server analytics (contact_sent)
    ---
    duration_ms: 51.901277
    type: 'suite'
    ...
  1..10
  # tests 52
  # suites 10
  # pass 52
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 626.759491
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
  approve; 3 finding(s)
  [P2] public/sw.js:1 Generated minified service worker is modified in the commit; unrelated to the contrast fix. → Revert public/sw.js (git checkout main -- public/sw.js).
  [P2] src/components/footer.tsx:281 The /about fix rests on an unverified guess that axe sampled the text mid-fade; the muted-foreground colour itself looks compliant. → Confirm with the visual gate's axe run on /en/about at 375px; if the violation persists, inspect the actual computed colours and backgrounds.
  [P3] src/lib/__tests__/contrast-classes.test.ts:1 Source-string greps are a brittle guard and do not test contrast. → Rely on the a11y suite, or compute contrast from the tokens.
- Run: https://github.com/bookchaowalit-website/portfolio-site-web/actions/runs/40233247685 · 2026-10-26 04:08 ICT

## Visual review

- **visual-ai**: ผ่าน — audit {'blocker': 0, 'major': 3, 'minor': 3}; AI verdict pass; checked ['/en/live-systems @375', '/en/live-systems @1440 (first slice only)', '/en/about @375', '/en/about @1440 (first slice only)']

## Definition of Done
- [ ] ไม่มี `color-contrast` บน `/en/live-systems` และ `/en/about` (รอ visual gate / axe)
- [x] สีเตือนยังเป็นเหลือง และ ≥ 4.5:1 (yellow-700 บนพื้นสว่าง, yellow-400 บน dark)
- [ ] `npm run test:a11y` ผ่าน (รอ gate)

## Release / deploy
merge เข้า main = deploy production ผ่าน Vercel Git; loop เปิด PR และเจ้าของอนุมัติด้วย label `autopilot:approved`
