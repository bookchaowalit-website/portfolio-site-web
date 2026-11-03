# 06 — C4 Container

Status: **done**. ทั้งหมดเป็น Next.js app เดียว deploy เป็น Vercel project `bookchaowalit-portfolio-frontend`
แยก container ตาม runtime ที่โค้ดประกาศ (`export const runtime`)

```mermaid
C4Container
  title Container view - portfolio-site-web
  Person(visitor, "Visitor")
  System_Boundary(vercel, "Vercel project bookchaowalit-portfolio-frontend") {
    Container(edge_mw, "next-intl middleware", "Edge middleware", "Locale routing; skips api, _next, _vercel, files")
    Container(pages, "Pages", "Next.js App Router, SSG + React 19 client components", "[locale] routes, projects, blog, contact, atlas, live-systems")
    Container(node_api, "Node API routes", "Route handlers nodejs", "/api/contact, /api/mcp, /api/github-stars, /api/screenshot, /api/search")
    Container(edge_api, "Edge API routes", "Route handlers edge", "/api/github, /api/newsletter, OG images")
    Container(static, "Static assets", "public/, sw.js Serwist PWA", "Fixtures, icons, service worker")
    ContainerDb(content, "Build-time content", "TS + MDX + JSON in repo", "app-projects.ts, content/blog, messages, domain-inventory.json")
  }
  Container(browser_sdk, "Browser analytics", "posthog-js, lazy import", "Loaded only after consent")
  System_Ext(resend, "Resend")
  System_Ext(github, "GitHub API")
  System_Ext(microlink, "Microlink")
  System_Ext(posthog, "PostHog EU")
  System_Ext(sentry, "Sentry")

  Rel(visitor, edge_mw, "HTTPS")
  Rel(edge_mw, pages, "Rewrites to locale")
  Rel(pages, content, "Reads at build")
  Rel(node_api, content, "Reads catalog, blog")
  Rel(pages, node_api, "fetch from client")
  Rel(pages, edge_api, "fetch from client")
  Rel(node_api, resend, "emails.send")
  Rel(node_api, posthog, "capture contact_sent")
  Rel(edge_api, resend, "audiences contacts")
  Rel(node_api, github, "users/owner/repos")
  Rel(edge_api, github, "users/username/repos")
  Rel(node_api, microlink, "screenshot")
  Rel(browser_sdk, posthog, "events")
  Rel(pages, sentry, "client errors")
  Rel(node_api, sentry, "server errors")
```

Sources: `middleware.ts`, `src/app/api/*/route.ts` (`runtime` exports), `src/app/sw.ts`, `next.config.js` (Serwist, Sentry wrapper),
`src/lib/blog.ts`, `src/data/app-projects.ts`, `src/instrumentation.ts`, `instrumentation-client.ts`, `.autopilot/README.md` (Vercel project name)

หมายเหตุ: `/api/contact`, `/api/github-stars`, `/api/screenshot`, `/api/search` ไม่ได้ประกาศ `runtime` จึงใช้ค่า default ของ Next.js (Node.js);
`/api/mcp` ประกาศ `nodejs` เอง
