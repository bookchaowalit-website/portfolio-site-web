# 07 — C4 Component

Status: **done**. Component ภายใน Next.js app (container "Pages" + "API routes")

```mermaid
C4Component
  title Component view - inside portfolio-site-web
  Container_Boundary(app, "Next.js app") {
    Component(layout, "LocaleLayout", "src/app/[locale]/layout.tsx", "Fonts, JSON-LD, nav, footer, ErrorBoundary, Vercel Analytics, AnalyticsProvider")
    Component(catalog, "Project catalog", "src/data/app-projects.ts", "128 AppProject records, gh(), publicDemoUrl, publicSourceUrl")
    Component(domains, "Project domains", "src/data/project-domains.ts", "13 workspace taxonomy")
    Component(stars, "Stars matcher", "src/data/project-stars.ts", "sourceOwners, starsBySlug, totalStars")
    Component(blog, "Blog loader", "src/lib/blog.ts", "gray-matter + reading-time over content/blog")
    Component(mcp, "MCP tools", "src/lib/mcp/tools/*", "6 tool handlers")
    Component(banalytics, "Browser analytics", "src/lib/browser-analytics.ts", "Consent store, allow-listed events")
    Component(phadapter, "PostHog adapter", "src/lib/posthog-adapter.ts", "init options, before_send scrub")
    Component(sanalytics, "Server analytics", "src/lib/server-analytics.ts", "trackServer contact_sent")
    Component(sentrylib, "Sentry options", "src/lib/sentry.ts", "sentryOptions, scrubEvent")
    Component(dp, "Data-product client", "src/lib/data-products/*", "GET /v1/records, fixture fallback")
    Component(contactapi, "Contact route", "src/app/api/contact/route.ts", "Validate, escape, Resend send")
    Component(mcpapi, "MCP route", "src/app/api/mcp/route.ts", "initialize, tools/list, tools/call, ping")
    Component(shotapi, "Screenshot route", "src/app/api/screenshot/route.ts", "Allowlist of public demo URLs, Microlink, 24 h cache")
    Component(starsapi, "Stars route", "src/app/api/github-stars/route.ts", "1 h in-memory cache")
  }
  Rel(layout, banalytics, "readConfig")
  Rel(banalytics, phadapter, "dynamic import after consent")
  Rel(contactapi, sanalytics, "after()")
  Rel(mcpapi, mcp, "dispatch")
  Rel(mcp, catalog, "get_projects")
  Rel(mcp, blog, "get_blog_posts")
  Rel(shotapi, catalog, "allowedProjectUrls")
  Rel(starsapi, stars, "starsBySlug")
  Rel(stars, catalog, "repo field")
  Rel(domains, catalog, "allProjects")
```

Sources: ไฟล์ที่ระบุในแต่ละ component, `src/lib/mcp/tools/index.ts`, `src/data/__tests__/portfolio-catalog.test.ts` (128 records)
