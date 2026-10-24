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

- **test**: ผ่าน
  ---
        duration_ms: 1.244944
        type: 'test'
        ...
      # Subtest: times out after the configured limit without throwing
      ok 7 - times out after the configured limit without throwing
        ---
        duration_ms: 20.803904
        type: 'test'
        ...
      1..7
  ok 11 - server analytics (contact_sent)
    ---
    duration_ms: 52.531465
    type: 'suite'
    ...
  1..11
  # tests 52
  # suites 11
  # pass 52
  # fail 0
  # cancelled 0
  # skipped 0
  # todo 0
  # duration_ms 751.279158
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
    ├ chunks/4952-1190d6011ab3e00f.js                   106 kB
    ├ chunks/4bd1b696-72b775907cb33954.js              54.4 kB
    └ other shared chunks (total)                      4.07 kB


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
  [P3] public/sw.js:1 Generated service-worker build artifact is modified in the diff; unrelated to the task. → Drop the sw.js change from the commit (git checkout public/sw.js) unless it is intentionally tracked.
  [P3] src/app/[locale]/projects/opengraph-image.tsx:1 The OG image still carries the '100 Micro-Frontends' claim, which the card-claims review rules out. → Open a follow-up issue as the task record notes, and fix it there.
- Run: https://github.com/bookchaowalit-website/portfolio-site-web/actions/runs/40142406942 · 2026-10-25 06:29 ICT

## Visual review

- **visual-ai**: ผ่าน — audit {'blocker': 0, 'major': 0, 'minor': 0}; AI verdict pass; checked ['/en/blog/building-100-micro-frontends @375', '/en/blog/building-100-micro-frontends @768', '/en/blog/building-100-micro-frontends @1440']

## Definition of Done
- [x] ไม่มีตัวเลข "100" / analytics ต่อแอป / metrics ที่ไม่มีแหล่ง
- [x] Title/excerpt เขียนใหม่, slug คงเดิม (ไม่ต้อง redirect)
- [x] N/A — ไม่มีเวอร์ชันไทย
- [ ] ไม่มี overflow ที่ 375px — แก้ที่ต้นเหตุแล้ว รอ visual gate ยืนยัน

## Release / deploy
Merge เข้า `main` = deploy production ผ่าน Vercel Git; loop เปิด PR และเจ้าของอนุมัติด้วย label `autopilot:approved`

## Attempt 2 (หมายเหตุ)
- แยกย่อหน้ายาว 415 ตัวอักษรในบทนำเป็นสองย่อหน้า และเปลี่ยน "(where it needs one)" เป็น "(if needed)" เพื่อแก้ `long-text-block` / `split-bracket` จาก visual audit
- `npm test`, `npm run typecheck`, `npm run lint` ผ่าน
