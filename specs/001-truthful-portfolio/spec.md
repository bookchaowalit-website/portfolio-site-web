---
title: "SPEC-001 — Truthful portfolio cards, canonical source links and an L3 baseline"
status: implemented
tags: [spec, sdd, tdd, portfolio, ci, sentry]
created: 2026-10-21
updated: 2026-10-21
description: "Every card links its canonical repository and its own deployment, describes only what that repository ships, and the repository runs the shared CI, a post-deploy smoke check and privacy-safe Sentry."
---

# SPEC-001 — Truthful portfolio cards, canonical source links and an L3 baseline

Standard: ADR-0004 (TDD + SDD). Plan: Big Loop Plan 2026-10-21, Wave 5 / P1 (repository-catalog).

## Document control

| Field | Value |
|---|---|
| Spec ID / version | SPEC-001 / 1.0 |
| Status | implemented |
| Repository | bookchaowalit-website/portfolio-site-web |
| Owner (maker) | Claude Code (Wave 5 P1 session) |
| Approver | Owner (bookchaowalit) |
| Requirement links | PORTFOLIO-PLAN P1 items 1 and 3; tier-a roadmap pf-g1, pf-g2 (pf-t1–pf-t4); Definition of Done L1–L3 |

## 1. Problem and intent

- **Problem:** `gh(slug)` hard-coded `bookchaowalit-website/bookchaowalit-<slug>-frontend`, so after the
  October renames most source links pointed at old names or the wrong twin. Most website cards claimed
  backends, integrations or adoption their repositories do not have, four cards linked `vercel.app` sites
  that are not ours, and the last live-link audit was from 2026-08-11. The repository had its own CI,
  no deploy verification, and Sentry without a DSN (with session replay on).
- **Outcome:** every card carries its canonical `owner/repo` and links only what exists and is ours; its copy
  matches its repository's code; a fresh audit shows no broken published link; CI is the shared v1.1.1
  workflow; production deploys are smoke-checked; runtime errors reach Sentry without visitor data.

## 2. Scope

| In scope | Out of scope |
|---|---|
| `src/data/app-projects.ts`, `src/data/project-stars.ts`, the stars API route, MCP `get_projects`, screenshot allowlist, atlas links, `src/lib/sentry.ts` and Sentry configs, `.github/workflows/*`, `scripts/live-link-audit.mjs`, `scripts/deploy-smoke.sh`, docs | Visual redesign; changes inside the linked repositories; GA4 events and consent (see `docs/measurement/KPI-PLAN.md`); Resend sender verification (owner action) |

## 3. Behaviour — scenarios

### AC-01 — Source links come from the card's owner/repo
- **Given** a card with a public source **Then** it has `repo` = `owner/name` and `githubUrl` = `https://github.com/<repo>`
- **And** `gh()` throws on a bare slug instead of guessing an owner
- **Test:** `src/data/__tests__/source-links.test.ts` ("card source links"); red run recorded before the change (5/5 failing)

### AC-02 — Canonical twins and consolidated repositories
- **Given** the twin and Tier A products (booktrading, bookreading, bookmarketing, game-collection, the four `bookchaowalit-ai` apps, portfolio-mobile) and the 17 devtools now in `devtools-suite-web` **Then** each links its canonical repository
- **Test:** `source-links.test.ts` "uses the canonical owner …" and "links consolidated devtools straight to their route"

### AC-03 — Hidden sources and demos stay hidden everywhere
- **Given** a card whose repository is private or gone **Then** it carries no `repo`, ships `githubUrl: ""` and no source link reaches the UI, JSON-LD or MCP output
- **Given** a card whose demo is not a bookchaowalit.com deployment **Then** `demoUnavailable` is set and `publicDemoUrl()` returns `""` (used by the atlas, MCP `get_projects` and the screenshot allowlist)
- **Test:** `portfolio-catalog.test.ts` "hides source links …", `source-links.test.ts` "card demo links"

### AC-04 — Cards claim only what ships
- **Given** any card **Then** it makes no unevidenced scale claim ("100+ projects", "45+ domains", "21K+") and names Stripe, Strava or escrow only to say they are absent
- **Test:** `portfolio-catalog.test.ts` "portfolio claims"; per-card evidence in `docs/audits/CARD-CLAIMS-REVIEW-2026-10.md`

### AC-05 — Stars match cards by full repository name
- **Given** GitHub repositories of every owner the cards link **Then** stars are matched on `owner/repo`, and a repository shared by several cards is counted once in the total
- **Test:** `src/data/__tests__/project-stars.test.ts`

### AC-06 — Sentry reports errors only
- **Given** no `NEXT_PUBLIC_SENTRY_DSN` **Then** Sentry is disabled; **given** a DSN **then** no PII, tracing, trace headers, breadcrumbs or session replay, and `request`, `user`, `extra` and frame locals are removed before sending
- **Test:** `src/lib/__tests__/sentry.test.ts`

### AC-07 — Shared CI and deploy verification
- **Given** a push to `main` **Then** `ci-node.yml` (lint, typecheck, `npm test` required, `npm run build`) and `security.yml` run pinned to v1.1.1 (`87dc5e1`), plus the repository's a11y (keyboard + axe) and Lighthouse jobs
- **Given** Vercel reports a successful Production deployment **Then** `deploy-smoke.yml` checks key pages return 200 and `/en/projects` has no legacy `bookchaowalit-<slug>-frontend` link
- **Test:** the GitHub Actions runs for the release commit; `scripts/deploy-smoke.sh` failed against the pre-release production site (legacy links) and must pass after the deploy

## 4. Interfaces and data

| Interface | Change |
|---|---|
| `AppProject` | new optional `repo`; `githubUrl` and `sourceUnavailable` are derived from it |
| Exports | `gh(repo)`, `publicDemoUrl(project)`; `src/data/project-stars.ts` |
| `/api/github-stars` | returns `{ slug, repo, stars }[]` for every owner the cards link to |
| Environment | `NEXT_PUBLIC_SENTRY_DSN` set as a Vercel project env var (production, preview) on 2026-10-21; never committed |
| Dependencies | `npm audit fix` (non-breaking) and a `postcss` override; remaining dev-only advisories are listed with reasons and expiry in `osv-scanner.toml` |

## 5. Non-functional requirements

| NFR | Target | How it is tested |
|---|---|---|
| Honesty | 0 broken published links, 0 overclaiming cards | `npm run audit:links`, AC-04 tests, deploy smoke |
| Privacy | No URL, header, cookie, body, user or local variable leaves in a Sentry event | AC-06 |
| Supply chain | OSV scan clean except reviewed, expiring exceptions | `security.yml` |

## 6. Deployment

Vercel project `bookchaowalit-portfolio-frontend` deploys `main` through its Git integration. The
UI review gate (`solo:qa-testing` ui_review, 375/768/1440) runs before the push and again on the live
site after the deploy; evidence is linked from the release notes in the commit message.
