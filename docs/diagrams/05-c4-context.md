# 05 — C4 Context

Status: **done**

```mermaid
C4Context
  title System Context - bookchaowalit.com portfolio-site-web
  Person(visitor, "Visitor", "Recruiter, interviewer, prospective client; anonymous")
  Person(owner, "Owner", "bookchaowalit; publishes via Git, reads contact email")
  System_Ext(mcpc, "MCP or HTTP client", "e.g. DevHub Playground, AI agents")
  System(portfolio, "portfolio-site-web", "Next.js 15 site on Vercel: catalog, blog, contact, MCP endpoint")
  System_Ext(resend, "Resend", "Email delivery for contact and newsletter audience")
  System_Ext(github, "GitHub", "REST API for repos and stars; source hosting; Actions CI")
  System_Ext(microlink, "Microlink API", "Screenshots of demo URLs")
  System_Ext(posthog, "PostHog Cloud EU", "Product events after consent; server contact_sent")
  System_Ext(sentry, "Sentry", "Scrubbed error events")
  System_Ext(vercelan, "Vercel Web Analytics and Speed Insights", "Cookieless page counts")
  System_Ext(dataapis, "Data-product APIs", "crypto, stocks, fx, defi, seo, news, discovery; GET /v1/records")
  System_Ext(demos, "Project demos", "*.bookchaowalit.com deployments linked from cards")

  Rel(visitor, portfolio, "Browses, sends contact", "HTTPS")
  Rel(mcpc, portfolio, "Calls /api/mcp", "HTTPS JSON")
  Rel(owner, portfolio, "Pushes main, sets env vars", "Git, Vercel")
  Rel(portfolio, resend, "Send email, add audience contact", "HTTPS")
  Rel(resend, owner, "Contact email", "SMTP")
  Rel(portfolio, github, "List repos, stars", "HTTPS REST")
  Rel(portfolio, microlink, "Screenshot lookup", "HTTPS")
  Rel(portfolio, posthog, "contact_sent", "HTTPS")
  Rel(visitor, posthog, "Events after Allow", "HTTPS")
  Rel(portfolio, sentry, "Errors", "HTTPS")
  Rel(visitor, vercelan, "Page views", "HTTPS")
  Rel(visitor, dataapis, "Live Systems fetch from browser", "HTTP")
  Rel(visitor, demos, "Visit project link", "HTTPS")
```

Sources: `src/app/api/contact/route.ts`, `src/app/api/newsletter/route.ts`, `src/app/api/github/route.ts`, `src/app/api/github-stars/route.ts`,
`src/app/api/screenshot/route.ts`, `src/app/api/mcp/route.ts`, `src/lib/server-analytics.ts`, `src/lib/posthog-adapter.ts`, `src/lib/sentry.ts`,
`src/app/layout.tsx` (`@vercel/analytics`, `@vercel/speed-insights`), `src/lib/data-products/catalog.ts`, `src/data/app-projects.ts`, `next.config.js` (CORS comment on DevHub)

## Open questions

- Data-product APIs มี hosted URL สำหรับ production หรือเป็น loopback เท่านั้น (ดู [03-user-flows.md](03-user-flows.md))
