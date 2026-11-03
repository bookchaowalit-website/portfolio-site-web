# 10 — Sequence diagrams

Status: **done**. 4 request path หลัก

## 1. Contact form → Resend → contact_sent

```mermaid
sequenceDiagram
  autonumber
  actor V as Visitor
  participant UI as contact-client.tsx
  participant API as POST /api/contact
  participant RS as Resend API
  participant PH as PostHog EU capture
  V->>UI: Submit form
  UI->>UI: Client validation
  UI->>API: JSON name, email, subject, message, locale
  API->>API: Type, presence, max length, email regex
  alt invalid
    API-->>UI: 400 VALIDATION_ERROR
  else delivery not ready, no RESEND_API_KEY or prod without RESEND_FROM
    API-->>UI: 503 CONTACT_SERVICE_UNAVAILABLE
  else ready
    API->>API: escapeHtml, strip newlines in subject
    API->>RS: emails.send from RESEND_FROM to CONTACT_EMAIL, replyTo sender
    alt Resend error
      API-->>UI: 500
    else accepted
      API-->>UI: 200 success
      API--)PH: after(): POST /i/v0/e/ contact_sent locale, random distinct_id, ip null
    end
  end
  UI-->>V: Status message
```

Sources: `src/components/contact-client.tsx`, `src/app/api/contact/route.ts`, `src/lib/server-analytics.ts`

## 2. Case study view + consent-gated events

```mermaid
sequenceDiagram
  autonumber
  actor V as Visitor
  participant P as project-detail-client.tsx
  participant A as browser-analytics.ts
  participant AD as posthog-adapter.ts
  participant PH as PostHog EU
  participant S as GET /api/github-stars
  V->>P: Open /en/projects/slug
  P->>S: fetch stars
  P->>A: track view_project slug, evidence_level
  alt consent unknown or denied, or analytics off
    A-->>P: dropped, SDK not loaded
  else granted
    A->>AD: loadPostHog once, dynamic import posthog-js
    AD->>PH: capture view_project via before_send scrub
  end
  V->>P: Click Visit project
  P->>A: track click_demo
```

Sources: `src/app/[locale]/projects/[slug]/project-detail-client.tsx`, `src/lib/browser-analytics.ts`, `src/lib/posthog-adapter.ts`

## 3. Screenshot proxy

```mermaid
sequenceDiagram
  autonumber
  participant B as Browser img
  participant API as GET /api/screenshot
  participant ML as api.microlink.io
  B->>API: ?url=demo URL
  API->>API: https only and in allowedProjectUrls from publicDemoUrl
  alt not allowed
    API-->>B: 400 Project URL not allowed
  else cached under 24 h
    API-->>B: 302 to cached screenshot URL
  else
    API->>ML: url, screenshot=true
    alt success
      API-->>B: 302 to screenshot URL, cache max 100 entries
    else error
      API-->>B: 302 to /images/screenshot-placeholder.svg
    end
  end
```

Sources: `src/app/api/screenshot/route.ts`, `src/data/app-projects.ts`, `next.config.js` (`images.remotePatterns` api.microlink.io)

## 4. MCP tools/call

```mermaid
sequenceDiagram
  autonumber
  participant C as MCP client
  participant R as POST /api/mcp
  participant T as mcp tool handler
  participant G as GET /api/github, self call
  participant GH as api.github.com
  C->>R: type or method tools/call, tool, args
  R->>R: lookup toolHandlers
  alt unknown tool
    R-->>C: 404 code -32601
  else get_github_repos
    R->>T: handleGetGithubRepos
    T->>G: fetch NEXT_PUBLIC_BASE_URL/api/github
    G->>GH: users/username/repos per_page 8
    GH-->>G: repos
    G-->>T: repos, fetchedAt
    T-->>R: content text
    R-->>C: tools/call/response
  else other tools
    R->>T: handler reads catalog, blog or static data
    T-->>R: content text
    R-->>C: tools/call/response
  end
```

Sources: `src/app/api/mcp/route.ts`, `src/lib/mcp/tools/index.ts`, `src/lib/mcp/tools/get-github-repos.ts`, `src/app/api/github/route.ts`
