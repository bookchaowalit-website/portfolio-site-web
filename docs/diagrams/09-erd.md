# 09 — ERD (file-backed content model)

Status: **done**. ไม่มี database ([ADR-0003](08-adr/ADR-0003-file-based-content-no-database.md))
แต่มีข้อมูลที่เก็บถาวรใน repo (TS/MDX/JSON) และใน browser (localStorage) จึงวาด model ของข้อมูลเหล่านั้น
ความสัมพันธ์เป็น logical (อ้างด้วยค่า) ไม่ใช่ foreign key

```mermaid
erDiagram
  APP_PROJECT {
    string slug PK
    string name
    string category "ProjectCategory, 9 values"
    string description
    string url "demo URL"
    string repo "owner/repo, optional"
    string githubUrl "derived from repo"
    string status "live, archived, wip"
    string evidenceLevel "Live, Prototype, Internal System, Experiment"
    string problemLane "6 lanes"
    bool featured
    int featuredRank
    bool demoUnavailable
    bool sourceUnavailable "derived"
    string promise
    string problem
  }
  CASE_STUDY {
    string challenge
    string solution
    string result
    string tradeoff "optional"
  }
  PROJECT_DOMAIN {
    string id PK "book-dev .. book-research, 13"
    string labelKey
    string descriptionKey
    string icon
  }
  PROJECT_STARS {
    string slug FK
    string repo
    int stars
  }
  BLOG_POST {
    string slug PK "file name"
    string title
    string excerpt
    string author
    string publishedAt
    string readTime "computed"
    bool featured
    string image
    string content "MDX body"
  }
  BLOG_TAG {
    string tag PK
  }
  TESTIMONIAL {
    string id PK
    string name
    string role
    string company
    string quote
    string category "client, colleague, partner, mentor"
    bool featured
    string avatarInitials
  }
  DATA_PRODUCT {
    string id PK "crypto, stocks, fx, defi, seo, news, discovery"
    string repo
    string schemaVersion
    int port
    string baseUrl
  }
  ENVELOPE {
    string schema_version
    string source
    string retrieved_at
    string data_status
    string next_cursor
  }
  CONSENT_RECORD {
    string key PK "portfolio.analytics-consent.v1"
    string value "granted or denied"
  }

  APP_PROJECT ||--o| CASE_STUDY : has
  APP_PROJECT }o--o{ PROJECT_DOMAIN : "domains[]"
  APP_PROJECT ||--o| PROJECT_STARS : "matched by repo at runtime"
  BLOG_POST }o--o{ BLOG_TAG : "tags[]"
  DATA_PRODUCT ||--o{ ENVELOPE : "GET /v1/records or fixture"
```

Sources: `src/data/app-projects.ts` (`AppProject`, `CaseStudy`, `ProjectDomain`), `src/data/project-domains.ts`, `src/data/project-stars.ts`,
`src/lib/blog.ts` (`BlogPost`), `src/data/testimonials.ts`, `src/lib/data-products/types.ts`, `src/lib/data-products/catalog.ts`,
`public/data/data-products/*.json`, `src/lib/browser-analytics.ts` (`CONSENT_KEY`)

## ขนาดข้อมูล (นับจากโค้ด)

| Store | จำนวน | วิธีนับ |
|---|---|---|
| `APP_PROJECT` | 128 (live 122, archived 6, wip 0) | `src/data/__tests__/portfolio-catalog.test.ts` |
| evidenceLevel | Prototype 92, Live 24, Experiment 10, Internal System 2 | `grep -o 'evidenceLevel: [^,]*' src/data/app-projects.ts \| sort \| uniq -c` |
| `BLOG_POST` | 6 | `ls content/blog/*.mdx` |
| `DATA_PRODUCT` | 7 | `src/lib/data-products/catalog.ts` |

## Open questions

- `PRODUCT.md` และ `docs/audits/LIVE-LINK-AUDIT-2026-10.md` ยังเขียน 129 cards ขณะที่ test ยืนยัน 128 (url-shortener รวมเข้า redirect-manager 2026-10-23) — ควรอัปเดตเอกสาร
- `ProjectStatus` มี `wip` แต่ไม่มี record ใช้ — จะคงไว้หรือไม่
