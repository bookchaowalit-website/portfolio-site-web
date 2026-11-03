# 03 — User flows

Status: **done**. Route ทั้งหมดอยู่ใต้ `/[locale]` (`en` | `th`, default `en`) จาก `src/i18n/routing.ts`;
path ที่ไม่มี locale ถูก redirect ไป `/en/...` (`next.config.js` `redirects()`), `/` → `/en` (`src/app/page.tsx`)

## Flow 1 — Visitor: ตรวจหลักฐานของ project

```mermaid
flowchart TD
  A["/ redirects to /en"] --> B["/en home"]
  B --> C["Nav: Portfolio /projects"]
  B --> CP["Command palette, fetch /api/search"]
  C --> D["Project grid, fetch /api/github-stars"]
  D --> D1["Search input filters cards"]
  D --> D2["/projects/domains and /projects/domains/domain"]
  D --> E["/projects/slug detail"]
  E --> E0["view_project event, only after consent"]
  E --> E1["Screenshot img: /api/screenshot?url=demo"]
  E --> F{"Link available?"}
  F -- "demo" --> G["Visit project, click_demo event"]
  F -- "source" --> H["View source, click_source event"]
  F -- "none" --> I["Status and evidence badge only"]
```

Sources: `src/i18n/routing.ts`, `next.config.js`, `src/components/projects-client.tsx`, `src/components/command-palette.tsx`,
`src/app/[locale]/projects/[slug]/project-detail-client.tsx`, `e2e/pages.spec.ts`

## Flow 2 — Visitor: ส่ง contact

```mermaid
flowchart TD
  A["/en/contact"] --> B["Fill name, email, subject, message"]
  B --> C{"Client validation ok?"}
  C -- "no" --> C1["errorFixErrors, fields marked"]
  C -- "yes" --> D["POST /api/contact with locale"]
  D --> E{"Response"}
  E -- "200" --> F["success message"]
  E -- "503 CONTACT_SERVICE_UNAVAILABLE" --> G["error keeps input and points to direct email"]
  E -- "400 or 500" --> H["error message"]
```

Sources: `src/components/contact-client.tsx`, `src/app/api/contact/route.ts`, `e2e/pages.spec.ts` (Contact Page)

## Flow 3 — Visitor: consent banner

```mermaid
flowchart TD
  A["Any page, analytics enabled build"] --> B{"Stored choice in localStorage portfolio.analytics-consent.v1"}
  B -- "none" --> C["Banner: Decline / Allow analytics, same size"]
  C -- "Decline" --> D["denied: SDK never loads"]
  C -- "Allow" --> E["granted: posthog-js dynamic import, $pageview per route"]
  B -- "granted or denied" --> F["Small Analytics choices control"]
  F -- "open" --> C
  E -- "later Decline" --> G["opt_out_capturing and reset"]
```

Sources: `src/components/analytics/analytics-provider.tsx`, `src/components/analytics/consent-banner.tsx`, `src/lib/browser-analytics.ts`, `src/lib/posthog-adapter.ts`

## Flow 4 — Visitor: blog, newsletter, อื่น ๆ

```mermaid
flowchart LR
  A["/en/blog"] --> B["/en/blog/slug MDX post, TOC, reading progress, related posts"]
  A --> C["/en/blog/tags/tag"]
  A --> D["Newsletter form, POST /api/newsletter"]
  E["/about and 5 sub pages"]
  F["/atlas knowledge atlas from domain-inventory.json"]
  G["/live-systems data products"]
  H["/testimonials, /uses, /now, /colophon, /privacy x3"]
```

Sources: `src/app/[locale]/blog/**`, `src/components/blog-client-wrapper.tsx`, `src/app/[locale]/atlas/page.tsx`, `src/i18n/routing.ts`

## Flow 5 — Visitor: Live Systems

```mermaid
flowchart TD
  A["/en/live-systems"] --> B{"?fixtures=1 or ?offline=1 or NEXT_PUBLIC_DATA_PRODUCTS_USE_FIXTURES"}
  B -- "yes" --> C["Load /data/data-products/id.json fixtures"]
  B -- "no" --> D["GET baseUrl/v1/records per product, timeout 3500 ms"]
  D -- "ok" --> E["source api"]
  D -- "timeout, unavailable, HTTP error" --> C
  C --> F["Banner: counts of api vs fixture"]
  E --> F
```

Sources: `src/components/live-systems-client.tsx`, `src/lib/data-products/client.ts`, `src/lib/data-products/catalog.ts`, `e2e/data-products-walkthrough.spec.ts`

## Flow 6 — MCP client

```mermaid
flowchart LR
  A["GET /api/mcp: server info and tool list"] --> B["POST initialize"]
  B --> C["POST tools/list"]
  C --> D["POST tools/call with tool and args"]
  D --> E["JSON result text"]
```

Sources: `src/app/api/mcp/route.ts`, `MCP-README.md`

## Flow 7 — Owner: release

ดู [01-business-process.md](01-business-process.md) และ [18-git-release-workflow.md](18-git-release-workflow.md)

## Open questions

- `/live-systems` บน production: ถ้าไม่ได้ตั้ง `NEXT_PUBLIC_DATA_PRODUCT_URL_*` browser ของผู้มาเยือนจะยิงไป `127.0.0.1:8101–8110` ของเครื่องตัวเองแล้ว fallback เป็น fixture — ตั้งใจหรือไม่ และตั้งค่าใน Vercel ไว้หรือยัง
- `NewsletterCTA` (`src/components/lazy/newsletter-cta.tsx`) ไม่มีที่ import — ใช้อยู่ที่ blog page ผ่าน `blog-client-wrapper.tsx` เท่านั้น
