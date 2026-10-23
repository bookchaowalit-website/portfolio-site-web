# portfolio-site-web

[![CI](https://github.com/bookchaowalit-website/portfolio-site-web/actions/workflows/ci.yml/badge.svg)](https://github.com/bookchaowalit-website/portfolio-site-web/actions/workflows/ci.yml)

Personal portfolio website of **Chaowalit Greepoke** — Tech Generalist & Solopreneur from Bangkok, Thailand.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**. Features bilingual support (EN/TH), MDX blog, a built-in MCP server, live GitHub activity, and a Resend-powered contact form.

See [`PRODUCT.md`](./PRODUCT.md) for the interview case study — a claims
audit of this README's own accessibility/SEO/performance tables, plus the
real finding of that pass: `npm run lint` was reporting 10,867 problems
because of a broken ESLint config that was linting generated files; the
real number was 1.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Routing & Pages](#routing--pages)
- [Internationalization (i18n)](#internationalization-i18n)
- [Component Architecture](#component-architecture)
- [API Routes](#api-routes)
- [Blog CMS (MDX)](#blog-cms-mdx)
- [MCP Server](#mcp-server)
- [SEO, Sitemap & Robots](#seo-sitemap--robots)
- [Analytics](#analytics)
- [Accessibility](#accessibility)
- [Performance Optimizations](#performance-optimizations)
- [Dark Mode & Theming](#dark-mode--theming)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [License](#license)

---

## Features

- **Bilingual** — English and Thai via `next-intl` with locale-prefixed URLs (`/en/`, `/th/`)
- **MDX Blog** — File-based content in `content/blog/` with frontmatter, reading time, and syntax highlighting
- **Live GitHub Activity** — Edge-compatible API route fetching recent repos with sessionStorage client cache (5-min TTL)
- **Contact Form** — Server-side validated, Resend-powered email delivery with an explicit unavailable state when delivery is not configured
- **MCP Server** — Model Context Protocol endpoint at `/api/mcp` exposing projects, skills, blog, GitHub, and contact info as tools
- **Dark Mode** — Full dark mode support across all pages using Tailwind design tokens
- **Accessibility** — WCAG-aligned: skip-to-content link, 44px touch targets, aria attributes, ErrorBoundary fallback
- **Animations** — Framer Motion page transitions, scroll reveals, and typing effects (lazy-loaded)
- **SEO** — Per-page metadata, Open Graph, Twitter cards, dynamic sitemap, robots.txt
- **Performance** — Turbopack dev, code-split lazy loading, vendor chunking, image optimization (WebP/AVIF), immutable asset caching

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.5.9 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui (Radix UI primitives) | — |
| Animations | Framer Motion | 12.x |
| i18n | next-intl | 4.x |
| Blog Content | MDX (`@mdx-js/loader`, `next-mdx-remote`) | 3.x / 6.x |
| Email | Resend | 6.x |
| Analytics | Vercel Analytics + Google Analytics 4 | — |
| Icons | Lucide React | 0.542 |
| Fonts | Geist Sans, Geist Mono, Sarabun (Thai), Itim (Thai) | — |
| Validation | Zod | 4.x |
| Deployment | Vercel (auto-deploy on push to `main`) | — |

---

## Prerequisites

- **Node.js** 18+
- **npm** (or pnpm/yarn)
- A **Resend API key** (for contact form — optional in dev)
- A **GitHub token** (optional, avoids rate limits on `/api/github`)
- A **GA4 Measurement ID** (optional, for analytics)

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/bookchaowalit-website/portfolio-site-web.git
cd portfolio-site-web

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see below)

# 4. Start the development server (Turbopack)
npm run dev

# 5. Open http://localhost:3000
```

> **Note:** The dev server uses Turbopack by default. For webpack mode: `npm run dev:webpack`

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
# Base URL used for SEO metadata, sitemap, and Open Graph
NEXT_PUBLIC_BASE_URL=https://bookchaowalit.com

# Google Analytics 4 Measurement ID (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Contact form email recipient
CONTACT_EMAIL=contact@bookchaowalit.com

# GitHub personal access token (optional, raises rate limit from 60 to 5000 req/hr)
GITHUB_TOKEN=<YOUR_GITHUB_TOKEN>

# Resend API key for contact form email delivery
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# From-address after verifying bookchaowalit.com in Resend (recommended)
# RESEND_FROM="Contact Form <contact@bookchaowalit.com>"
# In development, omitted RESEND_FROM uses Resend's sandbox sender.
# Production requires a verified sender address.
```

The Live Systems page reads the six frozen data-product APIs (contract v3; `ai_tools` retired 2026-10-23) plus the
additive `news.v1` and `discovery.v1` APIs from loopback ports 8101–8110 during
local development.
For a hosted read-only backend, set the
URL-only public variables `NEXT_PUBLIC_DATA_PRODUCT_URL_CRYPTO`,
`NEXT_PUBLIC_DATA_PRODUCT_URL_STOCKS`, `NEXT_PUBLIC_DATA_PRODUCT_URL_FX`,
`NEXT_PUBLIC_DATA_PRODUCT_URL_DEFI`, `NEXT_PUBLIC_DATA_PRODUCT_URL_FLIGHTS`,
`NEXT_PUBLIC_DATA_PRODUCT_URL_SEO`, and
`NEXT_PUBLIC_DATA_PRODUCT_URL_NEWS`, and
`NEXT_PUBLIC_DATA_PRODUCT_URL_DISCOVERY`.
Configure the same frontend origin in each API's `CORS_ALLOWED_ORIGINS`; never
put API tokens in `NEXT_PUBLIC_*` variables.

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_BASE_URL` | Recommended | `https://bookchaowalit.com` | Used in sitemap, OG tags, canonical URLs |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | — | Enables GA4 page tracking |
| `CONTACT_EMAIL` | Yes (for contact form) | — | Recipient of contact form submissions |
| `GITHUB_TOKEN` | No | — | Without token: 60 req/hr limit |
| `RESEND_API_KEY` | No | — | Required for delivery; without it the form returns an unavailable state and keeps the user's input |
| `RESEND_FROM` | Production | `Contact Form <onboarding@resend.dev>` in development | Set a verified `bookchaowalit.com` sender for production; see `RESEND-DOMAIN-SETUP.md` |

---

## Project Structure

```
portfolio-site-web/
├── content/
│   └── blog/                          # MDX blog posts (file-based CMS)
│       ├── building-scalable-react-applications.mdx
│       ├── getting-started-with-nextjs-15.mdx
│       └── mastering-tailwind-css.mdx
├── messages/
│   ├── en.json                        # English translations
│   └── th.json                        # Thai translations
├── scripts/
│   ├── check-github.mjs               # Test GitHub API integration
│   └── test-mcp.mjs                   # Test MCP server endpoint
├── src/
│   ├── app/
│   │   ├── [locale]/                  # Dynamic locale segment (en/th)
│   │   │   ├── about/                 # About page + subpages
│   │   │   │   ├── page.tsx
│   │   │   │   ├── creative/page.tsx
│   │   │   │   ├── fitness/page.tsx
│   │   │   │   ├── growth/page.tsx
│   │   │   │   ├── journey/page.tsx
│   │   │   │   └── trading/page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx           # Blog listing
│   │   │   │   └── [slug]/page.tsx    # Individual blog post
│   │   │   ├── business/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── privacy/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── messenger-bot/page.tsx
│   │   │   │   └── web-apps/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   ├── skills/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── art/page.tsx
│   │   │   │   ├── tech/page.tsx
│   │   │   │   └── video/page.tsx
│   │   │   ├── layout.tsx             # Locale layout (providers, nav, footer)
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx               # Home page
│   │   ├── api/
│   │   │   ├── contact/route.ts       # Contact form handler (Resend)
│   │   │   ├── github/route.ts        # GitHub activity (Edge-compatible)
│   │   │   └── mcp/route.ts           # MCP server endpoint
│   │   ├── more-projects/page.tsx
│   │   ├── globals.css                # Tailwind + CSS custom properties
│   │   ├── layout.tsx                 # Root layout (fonts, html lang)
│   │   ├── page.tsx                   # Root redirect
│   │   ├── robots.ts                  # robots.txt generator
│   │   ├── sitemap.ts                 # sitemap.xml generator
│   │   ├── apple-icon.tsx             # Apple touch icon
│   │   └── icon.tsx                   # Favicon
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── doodle-elements.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── floating-doodles.tsx
│   │   │   ├── hero-typing-text.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── mixed-typography.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── notebook-elements.tsx
│   │   │   ├── scroll-reveal.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── smooth-typing-text.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── typing-text.tsx
│   │   ├── lazy/                      # Lazy-loaded below-the-fold sections
│   │   │   ├── about-section.tsx
│   │   │   ├── blog-section.tsx
│   │   │   ├── business-section.tsx
│   │   │   ├── contact-section.tsx
│   │   │   ├── featured-projects.tsx
│   │   │   ├── hero-section.tsx
│   │   │   └── skills-section.tsx
│   │   ├── about/                     # About page sub-components
│   │   │   ├── creative-works-client.tsx
│   │   │   ├── fitness-journey-client.tsx
│   │   │   ├── personal-growth-client.tsx
│   │   │   ├── tech-journey-client.tsx
│   │   │   └── trading-client.tsx
│   │   ├── skills/                    # Skills page sub-components
│   │   │   ├── art-skills-client.tsx
│   │   │   ├── tech-skills-client.tsx
│   │   │   └── video-skills-client.tsx
│   │   ├── about-client.tsx
│   │   ├── blog-client-wrapper.tsx
│   │   ├── business-client.tsx
│   │   ├── contact-client.tsx
│   │   ├── error-boundary.tsx         # React error boundary with reset
│   │   ├── footer.tsx
│   │   ├── github-activity.tsx        # GitHub repos with sessionStorage cache
│   │   ├── google-analytics.tsx       # GA4 page view tracking
│   │   ├── language-switcher.tsx      # EN/TH toggle
│   │   ├── navigation.tsx            # Main nav with mobile menu
│   │   ├── navigation-brand.tsx      # Brand/logo in nav
│   │   ├── page-transition.tsx       # Framer Motion page transitions
│   │   ├── projects-client.tsx
│   │   ├── share-button.tsx          # Web Share API with aria feedback
│   │   ├── skills-client.tsx
│   │   └── theme-toggle.tsx          # Light/dark mode toggle
│   ├── data/
│   │   └── projects.ts               # Static project data
│   ├── i18n/
│   │   ├── routing.ts                # Locale routing config (next-intl)
│   │   └── request.ts                # Server-side locale resolution
│   ├── lib/
│   │   ├── blog.ts                   # MDX blog utilities (parsing, sorting)
│   │   ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   │   └── mcp/                      # MCP server implementation
│   │       ├── config.ts             # Server info & capabilities
│   │       ├── types.ts              # TypeScript types
│   │       └── tools/                # MCP tool definitions & handlers
│   │           ├── index.ts          # Tool registry
│   │           ├── get-blog-post.ts
│   │           ├── get-blog-posts.ts
│   │           ├── get-contact-info.ts
│   │           ├── get-github-repos.ts
│   │           ├── get-projects.ts
│   │           └── get-skills.ts
│   └── middleware.ts                 # next-intl middleware (locale detection)
├── next.config.ts                    # Next.js config (MDX, i18n, caching, chunks)
├── postcss.config.mjs                # PostCSS with @tailwindcss/postcss
├── tsconfig.json                     # TypeScript config with @/ path alias
├── .env.example                      # Environment variable template
├── ANALYTICS_SETUP.md                # GA4 setup guide
├── MCP-README.md                     # MCP server documentation
└── package.json
```

---

## Routing & Pages

All user-facing routes are locale-prefixed via `next-intl`:

| Route | Description |
|-------|-------------|
| `/en` or `/th` | Home page |
| `/en/about` | About overview |
| `/en/about/creative` | Creative works |
| `/en/about/fitness` | Fitness journey |
| `/en/about/growth` | Personal growth |
| `/en/about/journey` | Tech journey |
| `/en/about/trading` | Trading |
| `/en/projects` | Projects portfolio |
| `/en/business` | Business ventures |
| `/en/blog` | Blog listing |
| `/en/blog/[slug]` | Individual blog post |
| `/en/skills` | Skills overview |
| `/en/skills/tech` | Technical skills |
| `/en/skills/art` | Art & design skills |
| `/en/skills/video` | Video production skills |
| `/en/contact` | Contact form |
| `/en/privacy` | Privacy policy |
| `/en/privacy/messenger-bot` | Messenger bot privacy |
| `/en/privacy/web-apps` | Web apps privacy |

**API Routes** (not locale-prefixed):

| Route | Method | Description |
|-------|--------|-------------|
| `/api/contact` | POST | Contact form submission (Resend) |
| `/api/github` | GET | Fetch GitHub repos (Edge-compatible) |
| `/api/mcp` | POST | MCP server endpoint |

**Meta Routes** (auto-generated):

| Route | Description |
|-------|-------------|
| `/sitemap.xml` | Dynamic sitemap (EN + TH) |
| `/robots.txt` | Robots rules (allows all, disallows `/api/`) |

---

## Internationalization (i18n)

Powered by **next-intl v4**.

- **Supported locales:** `en` (English), `th` (Thai)
- **Default locale:** `en`
- **URL strategy:** Locale prefix (`/en/about`, `/th/about`)
- **Middleware:** `src/middleware.ts` detects locale from URL, falls back to `en`
- **Translations:** `messages/en.json`, `messages/th.json`
- **Type-safe routing:** `Link`, `usePathname`, `useRouter` from `src/i18n/routing.ts`

### Adding a new locale

1. Add the locale code to `routing.locales` in `src/i18n/routing.ts`
2. Create `messages/{locale}.json` with all translation keys
3. Update `src/i18n/request.ts` to import the new messages file

### Using translations in components

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('namespace');
  return <h1>{t('key')}</h1>;
}
```

---

## Component Architecture

### Component Categories

**UI Primitives** (`src/components/ui/`)
shadcn/ui components built on Radix UI. Fully accessible, styleable via Tailwind. Button includes 44px minimum touch targets.

**Page Sections** (`src/components/lazy/`)
Below-the-fold sections lazy-loaded with `next/dynamic`. Loaded on the home page: HeroSection (eager), SkillsSection, AboutSection, FeaturedProjects, BusinessSection, BlogSection, ContactSection.

**Feature Components** (`src/components/`)
Page-specific client components with `"use client"` directive. Each handles its own state, animations, and data.

**Shared Components** (`src/components/`)
Navigation, Footer, ErrorBoundary, PageTransition, ThemeToggle, LanguageSwitcher, ShareButton, GoogleAnalytics.

### Lazy Loading Strategy

```tsx
// Components below the fold are lazy-loaded with loading skeletons
const SkillsSection = dynamic(
  () => import('@/components/lazy/skills-section').then(mod => ({ default: mod.SkillsSection })),
  { loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);
```

Framer Motion and decorative components (FloatingDoodles, Footer) are also lazy-loaded to reduce initial bundle size.

---

## API Routes

### `/api/contact` — Contact Form

- **Method:** POST
- **Runtime:** Node.js
- **Validation:** Server-side type, length, required-field, and email-format checks (with matching client constraints)
- **Email:** Resend API
- **Unavailable state:** Returns `503 CONTACT_SERVICE_UNAVAILABLE` if `RESEND_API_KEY` is not set; the client shows the direct email fallback and preserves the form
- **Security:** Server-side type/length validation, email format validation, HTML escaping, and newline normalization; rate limiting is still a deployment concern

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I'd like to discuss..."
}
```

### `/api/github` — GitHub Activity

- **Method:** GET
- **Runtime:** Edge-compatible
- **Caching:** `s-maxage=300, stale-while-revalidate=60`
- **Rate limit:** Returns 429 with `Retry-After` header if GitHub limits are hit
- **Client cache:** `sessionStorage` with 5-minute TTL (avoids refetch on navigation)

**Response:**
```json
{
  "repos": [
    {
      "name": "repo-name",
      "description": "Description",
      "url": "https://github.com/user/repo",
      "updatedAt": "2026-06-13T00:00:00Z",
      "stars": 42,
      "language": "TypeScript"
    }
  ],
  "fetchedAt": "2026-06-13T12:00:00Z"
}
```

### `/api/mcp` — MCP Server

See [MCP Server](#mcp-server) section below.

---

## Blog CMS (MDX)

Blog posts are MDX files in `content/blog/`. No database or CMS service required.

### Creating a Blog Post

1. Create a new `.mdx` file in `content/blog/`:
   ```
   content/blog/my-new-post.mdx
   ```

2. Add frontmatter:
   ```mdx
   ---
   title: "My New Post Title"
   excerpt: "A brief description for the listing page"
   author: "Chaowalit Greepoke"
   publishedAt: "2026-06-13"
   tags: ["Next.js", "TypeScript"]
   featured: true
   ---

   # Your content here

   Use standard Markdown and MDX components.
   ```

3. The post appears automatically at `/blog/my-new-post` (in both `/en/` and `/th/`).

### Blog Utilities

`src/lib/blog.ts` handles:
- Parsing frontmatter with `gray-matter`
- Calculating reading time with `reading-time`
- Sorting posts by `publishedAt` (newest first)
- Generating slugs from filenames

---

## MCP Server

The portfolio exposes a **Model Context Protocol** endpoint at `/api/mcp` that allows AI assistants to query portfolio data as tools.

### Available Tools

| Tool | Description |
|------|-------------|
| `get_projects` | List all portfolio projects with tech stacks |
| `get_skills` | Get technical, creative, and multimedia skills |
| `get_blog_posts` | List all blog posts with metadata |
| `get_blog_post` | Get a specific blog post by slug |
| `get_github_repos` | Fetch recent GitHub repositories |
| `get_contact_info` | Get contact details and social links |

### Usage

```bash
curl -X POST https://bookchaowalit.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": { "name": "get_projects", "arguments": {} },
    "id": 1
  }'
```

See [MCP-README.md](./MCP-README.md) for full documentation.

---

## SEO, Sitemap & Robots

### Per-Page Metadata

Every page exports `generateMetadata()` with:
- Localized title and description (EN/TH)
- Open Graph tags (title, description, image, locale)
- Twitter card tags
- Canonical URL
- `alternates.languages` for hreflang

### Sitemap (`/sitemap.xml`)

Auto-generated from `src/app/sitemap.ts`. Includes all EN and TH routes with appropriate `priority` and `changeFrequency`.

### Robots (`/robots.txt`)

```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://bookchaowalit.com/sitemap.xml
```

### Favicons

Generated programmatically via `src/app/icon.tsx` and `src/app/apple-icon.tsx`.

---

## Analytics

### Vercel Analytics

Automatically included via `@vercel/analytics/react` in the root layout. No configuration needed.

### Google Analytics 4

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local`. Page views are tracked automatically via `src/components/google-analytics.tsx`.

**Predefined event tracking functions:**

```typescript
import { trackProjectView, trackContactSubmission, trackBlogRead, trackBusinessView } from '@/components/google-analytics';

trackProjectView('Project Name');
trackContactSubmission();
trackBlogRead('Blog Title');
trackBusinessView('Business Name');
```

See [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) for GA4 property setup.

---

## Accessibility

The portfolio follows WCAG 2.1 guidelines:

| Feature | Implementation |
|---------|---------------|
| Skip-to-content | Hidden link becomes visible on Tab focus |
| Touch targets | Minimum 44px height/width on all buttons |
| Color contrast | Design tokens (`text-foreground`, `text-muted-foreground`) ensure AA compliance |
| Error handling | `ErrorBoundary` component with reset button and `role="alert"` |
| ARIA attributes | `aria-label` on share button, `aria-live="polite"` for screen reader feedback |
| Keyboard navigation | All interactive elements are focusable and operable via keyboard |
| Form labels | Proper `<label htmlFor>` associations on contact form |
| Language | `lang` attribute set on `<html>` per locale |

---

## Performance Optimizations

| Optimization | Details |
|-------------|---------|
| **Turbopack** | Default dev server for faster HMR |
| **Code splitting** | Below-fold sections lazy-loaded with `next/dynamic` |
| **Vendor chunking** | `node_modules` split into separate cacheable chunk |
| **Package optimization** | `lucide-react`, `@radix-ui/*` tree-shaken via `optimizePackageImports` |
| **Console removal** | `console.*` stripped in production builds |
| **Image formats** | WebP and AVIF with responsive sizes |
| **Font loading** | Google Fonts with `display: swap` and preload |
| **Asset caching** | Immutable `Cache-Control` for `/_next/static/`, images, fonts |
| **Security headers** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection` |
| **GitHub cache** | `sessionStorage` (5-min TTL) + CDN `s-maxage=300` |
| **Critters** | CSS inlining for above-fold content |

---

## Dark Mode & Theming

The site uses Tailwind CSS v4 with CSS custom properties defined in `src/app/globals.css`.

### Design Tokens

| Token | Light | Dark |
|-------|-------|------|
| `bg-background` | White | Near-black |
| `text-foreground` | Near-black | White |
| `text-muted-foreground` | Gray-500 | Gray-400 |
| `bg-muted` | Gray-100 | Gray-800 |
| `bg-card` | White | Gray-900 |
| `text-destructive` | Red-600 | Red-400 |
| `border` | Gray-200 | Gray-700 |

### Usage Pattern

```tsx
// Use semantic tokens (auto dark mode)
<div className="bg-background text-foreground">

// Use explicit dark: prefix when tokens aren't enough
<div className="bg-blue-50 dark:bg-blue-950/30">

// Links
<a className="text-blue-600 dark:text-blue-400 hover:underline">
```

### Theme Toggle

`src/components/theme-toggle.tsx` switches between light/dark/system. Preference is stored in `localStorage`.

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Add environment variables in Project Settings → Environment Variables
4. Deploy — auto-deploys on every push to `main`

### Environment Variables on Vercel

Add all variables from `.env.example` in the Vercel dashboard. Mark `GITHUB_TOKEN` and `RESEND_API_KEY` as sensitive.

### Other Platforms

- **Netlify:** Works out of the box
- **Docker:** `docker build -t portfolio . && docker run -p 3000:3000 portfolio`
- **Self-hosted:** `npm run build && npm run start`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run dev:webpack` | Start dev server with webpack |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript `tsc --noEmit` |
| `npm run e2e` | Full Playwright suite |
| `npm run e2e:a11y` | Focused a11y/keyboard Playwright suite (CI) |
| `npm run e2e:data-products` | Data-products walkthrough e2e |
| `npm run ci:local` | typecheck + lint + unit + build (no browser) |
| `npm run check:github` | Test GitHub API integration |
| `npm run mcp:test` | Test MCP server endpoint |
| `npm run mcp:dev` | Test MCP in development mode |

### CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR to `main`:

1. **quality** — `typecheck`, `lint`, data-product unit tests  
2. **a11y-e2e** — production build + `npm run e2e:a11y` (help dialog Escape, skip link, nav, locale/theme)  
3. **lighthouse** — production build + Lighthouse CI on `/en`, `/en/projects`, `/en/contact`, `/th`  
   - **error** if Accessibility &lt; 0.9  
   - **warn** only for Performance / Best Practices / SEO (noisy under CI)

**Branch protection on `main`:** required status checks (strict, up-to-date branch):

1. `Typecheck, lint, unit`  
2. `A11y / keyboard e2e`  
3. `Lighthouse (a11y gate)` — Accessibility must score ≥ 0.9 on key routes  

Force-push and branch deletion are disabled. Direct push to `main` still works for admins (bypass until checks finish); **PR merges must be green on all three**.

Local equivalent for the keyboard suite against a running server:

```bash
npm run build && npm run start -- -p 3000
# other terminal:
BASE_URL=http://127.0.0.1:3000 npm run e2e:a11y
CHROME_PATH="$(node -e "const {chromium}=require('playwright'); console.log(chromium.executablePath())")" \
  npm run lhci:ci
```

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

Made with Next.js 15, TypeScript, and Tailwind CSS by [Chaowalit Greepoke](https://bookchaowalit.com).

## Related

- **Mobile App:** [bookchaowalit-portfolio-mobile](https://github.com/bookchaowalit-mobile/bookchaowalit-portfolio-mobile)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)
