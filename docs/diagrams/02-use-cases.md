# 02 — Use cases

Status: **done**. เว็บไม่มี sign-in เลย (`src/lib/browser-analytics.ts`: "The portfolio has no sign-in today")
ดังนั้น actor แบ่งตามช่องทางและระดับ consent ไม่ใช่ role ใน auth

```mermaid
flowchart LR
  V(["Visitor, anonymous"])
  CV(["Consented visitor, allowed analytics"])
  MC(["MCP or HTTP client, unauthenticated"])
  CR(["Search crawler or RSS reader"])
  OW(["Owner, via Git and Vercel"])
  AB(["Autopilot bot, GitHub Actions"])

  subgraph SYS["bookchaowalit.com portfolio-site-web"]
    UC1["Browse projects, filter by lane, domain, search"]
    UC2["Read case study, open demo or source"]
    UC3["Read blog, tags, RSS"]
    UC4["Send contact message"]
    UC5["Subscribe newsletter"]
    UC6["Choose analytics consent: Allow or Decline"]
    UC7["Switch locale en/th, theme, command palette"]
    UC8["View Live Systems data products, API or fixtures"]
    UC9["Call MCP tools: get_projects, get_skills, get_blog_posts, get_blog_post, get_github_repos, get_contact_info"]
    UC10["Crawl sitemap.xml, robots.txt, rss.xml"]
    UC11["Publish catalog, blog or code change"]
    UC12["Propose and implement backlog task as PR"]
    UC13["Send product events"]
  end

  V --> UC1
  V --> UC2
  V --> UC3
  V --> UC4
  V --> UC5
  V --> UC6
  V --> UC7
  V --> UC8
  CV --> UC13
  MC --> UC9
  CR --> UC10
  OW --> UC11
  AB --> UC12
  UC12 -. "needs owner label autopilot:approved" .-> OW
```

Sources: `src/i18n/routing.ts` (pathnames), `src/app/api/*/route.ts`, `src/lib/mcp/tools/index.ts`, `src/app/api/mcp/route.ts`,
`src/components/analytics/analytics-provider.tsx`, `src/components/command-palette.tsx`, `src/components/blog-client-wrapper.tsx`,
`src/components/live-systems-client.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/rss.xml/route.ts`, `.autopilot/README.md`

## Actor ↔ access level

| Actor | ช่องทาง | Auth | หลักฐาน |
|---|---|---|---|
| Visitor | browser, ทุกหน้า `[locale]` และ `/api/contact`, `/api/newsletter`, `/api/search`, `/api/github-stars`, `/api/screenshot` | ไม่มี | ไม่มี middleware auth; `middleware.ts` ทำแค่ next-intl |
| Consented visitor | เหมือน Visitor + PostHog SDK โหลดหลัง "Allow analytics" | ไม่มี (anonymous id ใน localStorage) | `src/lib/browser-analytics.ts` `CONSENT_KEY` |
| MCP client | `GET/POST /api/mcp`, CORS `*` | ไม่มี | `next.config.js` headers, `src/app/api/mcp/route.ts` |
| Crawler | `/sitemap.xml`, `/robots.txt` (disallow `/api/`), RSS 4 ตัว | ไม่มี | `src/app/robots.ts` |
| Owner | GitHub push to `main` (admin bypass), Vercel env vars | GitHub/Vercel account | `.autopilot/README.md` "Branch protection" |
| Autopilot bot | `GITHUB_TOKEN`, ใส่ label, เปิด PR, dispatch `ci.yml` | GitHub Actions token | `.github/workflows/autopilot.yml` permissions |

## Open questions

- `/api/mcp` เปิด public ไม่มี auth และ CORS `*` โดยตั้งใจ (DevHub Playground เรียก) — ยืนยันว่าเป็น public read-only API ถาวรหรือไม่
