# 16 — Deployment

Status: **done**

```mermaid
flowchart TB
  subgraph DNS["Domain"]
    D1["bookchaowalit.com"]
  end
  subgraph VER["Vercel project bookchaowalit-portfolio-frontend, team free plan 100 deploys/24 h"]
    PROD["Production: branch main"]
    PREV["Preview: other branches, disabled for autopilot/*"]
    EDGE["Edge runtime: middleware, /api/github, /api/newsletter, OG images"]
    NODE["Node runtime: /api/contact, /api/mcp, /api/github-stars, /api/screenshot, /api/search"]
    CDN["Static: SSG pages, /_next/static immutable, public/, sw.js"]
    ENVP[("Env: NEXT_PUBLIC_ANALYTICS_ENABLED, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_SENTRY_DSN, RESEND_API_KEY, RESEND_FROM, CONTACT_EMAIL, GITHUB_TOKEN")]
  end
  D1 --> PROD
  PROD --> EDGE
  PROD --> NODE
  PROD --> CDN
  ENVP --> PROD
  GH["GitHub main"] -->|"Git integration"| PROD
  GH -->|"other branches"| PREV
  NODE --> RS["Resend"]
  NODE --> GHA["api.github.com"]
  NODE --> ML["Microlink"]
  NODE --> PH["PostHog EU"]
  EDGE --> RS
  EDGE --> GHA
  PROD --> ST["Sentry"]
```

Sources: `vercel.json`, `.autopilot/README.md` / `.autopilot/config.json` (`deploy.note`), `specs/001-truthful-portfolio/spec.md` §4 (Sentry DSN set as Vercel env 2026-10-21) และ §6,
`docs/measurement/GO-LIVE.md` (3 PostHog vars in Production 2026-10-26), `README.md` env table, `next.config.js` (headers, Serwist), `src/app/api/*/route.ts` runtimes

| Environment | Branch | URL | หลักฐาน |
|---|---|---|---|
| Production | `main` | https://bookchaowalit.com | `deploy-smoke.yml`, GitHub Deployments `Production` by `vercel[bot]` |
| Preview | branch อื่น (ยกเว้น `autopilot/*`) | Vercel preview URL | GitHub Deployments `Preview`, `vercel.json` |
| Local | — | `next dev --turbopack`; Playwright :4318; CI :3000 | `package.json`, `playwright.config.ts`, `ci.yml` |

## Open questions

- README "Other Platforms" อ้าง Docker แต่ repo ไม่มี `Dockerfile`
- Vercel region / function region ไม่ระบุใน repo
- domain alias อื่น (www, `*.vercel.app`) ไม่มีใน repo
