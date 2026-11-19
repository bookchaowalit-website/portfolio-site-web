// The five shared shells behind the bookchaowalit.com sites (2026-11-13..19).
// Each site is its own repository, so a shell is copied in, not installed.
//
// Repo lists were counted on 2026-11-19 from each repository's origin/main with
//   git ls-tree -r --name-only origin/main | grep -E '(app|dashboard|reader)-shell\.css$|workbench\.css$'
// (the sales page shell is agency-main-web's app/globals.css, commit d3a0a0b).
// Guarantees were read from the same files and the shell rule docs
// (APP-SHELL.md, DASHBOARD.md, READER.md, WORKBENCH.md). Refresh both together.

export type ShellId = "app" | "dashboard" | "reader" | "workbench" | "sales";
export type Localized = { en: string; th: string };

export interface ShellExample {
  url: string;
  label: Localized;
  /** Card slug on /projects when the site has a card. */
  slug?: string;
}

export interface Shell {
  id: ShellId;
  name: string;
  purpose: Localized;
  /** Source of truth the other copies follow. */
  sourceRepo: string;
  repos: string[];
  /** Extra unit counted inside one repo (the Workbench serves 17 tools). */
  unitsNote?: Localized;
  examples: ShellExample[];
}

const site = (owner: string, names: string[]) => names.map((name) => `${owner}/${name}`);

export const shellSystem: Shell[] = [
  {
    id: "app",
    name: "App shell",
    purpose: {
      en: "List and tool apps: lists on the left, one list on the right, a composer that opens in place, and removal you can undo.",
      th: "แอปแบบรายการและเครื่องมือ: รายการอยู่ด้านซ้าย เนื้อหาหนึ่งรายการอยู่ด้านขวา ฟอร์มเพิ่มเปิดในหน้าเดิม และลบแล้วกด Undo ได้",
    },
    sourceRepo: "bookchaowalit-website/marketing-services-web",
    repos: [
      ...site("bookchaowalit-website", [
        "productivity-ideas-web", "productivity-calendar-app-web", "productivity-time-tracker-web", "education-certs-web",
        "content-press-web", "content-quote-generator-web", "community-guestbook-web", "content-meme-generator-web",
        "community-comments-web", "community-donation-tip-jar-web", "community-challenges-web", "community-collaborations-web",
        "community-announcements-web", "community-team-web", "community-hub-web", "sales-pipeline-web",
        "marketing-contact-forms-web", "ai-chat-playground-web", "devtools-language-forge-web", "devtools-webhook-tester-web",
        "ai-prompt-library-web", "ai-text-summarizer-web",
      ]),
      "bookchaowalit/marketing-linerichmenu-web",
      ...site("bookchaowalit-website", [
        "ai-translation-web", "marketing-giveaways-web", "devtools-design-web", "sustainability-carbon-calculator-web",
        "ai-speech-to-text-web", "marketing-testimonials-web", "marketing-redirect-manager-web", "devtools-mcpdocs-web",
        "marketing-deeplinks-web", "devtools-lab-web", "marketing-bookmarketing-web", "marketing-linktree-web",
        "commerce-invoice-generator-web", "commerce-ticket-booking-web", "marketing-services-web", "productivity-todo-board-web",
        "productivity-reminders-web", "productivity-checklists-web", "productivity-notes-app-web", "productivity-journal-web",
        "productivity-goal-tracker-web", "productivity-habit-tracker-web", "productivity-kanban-board-web",
        "productivity-ops-center-web", "productivity-pomodoro-timer-web",
      ]),
      ...site("bookchaowalit-ai", ["ai-sentiment-analyzer-web", "ai-recommendation-engine-web"]),
    ],
    examples: [
      { slug: "services", url: "https://services.bookchaowalit.com", label: { en: "Services (the pilot)", th: "Services (แอปนำร่อง)" } },
      { slug: "todo-board", url: "https://todo-board.bookchaowalit.com", label: { en: "Todo Board", th: "Todo Board" } },
      { slug: "press", url: "https://press.bookchaowalit.com", label: { en: "Press", th: "Press" } },
    ],
  },
  {
    id: "dashboard",
    name: "Dashboard shell",
    purpose: {
      en: "Read-only data pages and small calculators: one question per page, at most four stat tiles, one chart with a table view, and a Sample data label when numbers are not real.",
      th: "หน้าข้อมูลแบบอ่านอย่างเดียวและเครื่องคิดเลขเล็ก ๆ: หนึ่งหน้าตอบหนึ่งคำถาม มีตัวเลขสรุปไม่เกินสี่ช่อง กราฟหนึ่งอันที่สลับเป็นตารางได้ และมีป้าย Sample data เมื่อตัวเลขไม่ใช่ข้อมูลจริง",
    },
    sourceRepo: "bookchaowalit-website/sustainability-energy-dashboard-web",
    repos: [
      ...site("bookchaowalit-website", [
        "sustainability-energy-dashboard-web", "devtools-status-web", "devtools-uptime-monitor-web", "marketing-link-analytics-web",
        "marketing-seo-analyzer-web", "realestate-real-estate-analyzer-web", "marketing-visitor-map-web",
        "marketing-popular-pages-web", "marketing-ab-testing-web", "devtools-error-logs-web",
      ]),
      "bookchaowalit/devtools-polyglot-benchmark",
      "bookchaowalit-ai/data-analytics-dashboard-web",
    ],
    examples: [
      { slug: "energy-dashboard", url: "https://energy.bookchaowalit.com", label: { en: "Energy (the pilot)", th: "Energy (แอปนำร่อง)" } },
      { slug: "status", url: "https://status.bookchaowalit.com", label: { en: "Status Page", th: "Status Page" } },
      { slug: "seo-analyzer", url: "https://seo-analyzer.bookchaowalit.com", label: { en: "SEO Analyzer", th: "SEO Analyzer" } },
    ],
  },
  {
    id: "reader",
    name: "Reader shell",
    purpose: {
      en: "Content sites: index pages of entries, search where it helps, tag chips, article pages with a pager, and Thai line heights for Thai text.",
      th: "เว็บเนื้อหา: หน้ารวมบทความ ช่องค้นหาเมื่อจำเป็น ชิปแท็ก หน้าบทความพร้อมปุ่มก่อนหน้า/ถัดไป และระยะบรรทัดสำหรับภาษาไทย",
    },
    sourceRepo: "bookchaowalit-website/content-techblog-web",
    repos: [
      ...site("bookchaowalit-website", [
        "content-techblog-web", "education-learn-web", "content-knowledgehub-web", "education-psychology-web",
        "content-reading-web", "education-fashion-web", "education-math-workshop-web", "education-military-web",
        "content-bookreviews-web", "education-legal-web", "education-science-bench-web", "education-sports-web",
        "content-artblog-web", "content-talks-web", "content-history-archive-web", "content-news-aggregator-web",
      ]),
      "bookchaowalit-ai/ai-art-gallery-web",
      "bookchaowalit/commerce-digital-products-web",
      "bookchaowalit-game/games-game-collection-web",
      ...site("bookchaowalit-website", [
        "devtools-roadmaps-web", "devtools-devhub-web", "sales-agencyrenting-web", "devtools-mcplist-web",
        "sustainability-smart-farming-web", "travel-trip-atlas-web", "marketing-newsletter-web", "food-recipe-explorer-web",
        "devtools-changelog-web", "devtools-github-web",
      ]),
      "bookchaowalit/devtools-cloud-benchmark",
      ...site("bookchaowalit-website", ["portfolio-techspace-web", "portfolio-projects-showcase-web"]),
    ],
    examples: [
      { slug: "techblog", url: "https://techblog.bookchaowalit.com", label: { en: "Tech Blog (the pilot)", th: "Tech Blog (เว็บนำร่อง)" } },
      { slug: "learn", url: "https://learn.bookchaowalit.com", label: { en: "Learn", th: "Learn" } },
      { slug: "psychology-explorer", url: "https://psychology.bookchaowalit.com", label: { en: "Psychology", th: "Psychology" } },
    ],
  },
  {
    id: "workbench",
    name: "Workbench shell",
    purpose: {
      en: "One suite of developer tools: one job per screen, plain verbs, a live result, and Undo instead of confirm dialogs.",
      th: "ชุดเครื่องมือนักพัฒนาชุดเดียว: หนึ่งหน้าทำงานเดียว ใช้คำกริยาตรง ๆ ผลลัพธ์ขึ้นทันทีที่พิมพ์ และใช้ Undo แทนกล่องยืนยัน",
    },
    sourceRepo: "bookchaowalit-website/devtools-suite-web",
    repos: ["bookchaowalit-website/devtools-suite-web"],
    unitsNote: { en: "1 site with 17 tools", th: "1 เว็บ มี 17 เครื่องมือ" },
    examples: [
      { slug: "base64", url: "https://devtools.bookchaowalit.com/base64", label: { en: "Base64 (the pilot)", th: "Base64 (เครื่องมือนำร่อง)" } },
      { slug: "regex", url: "https://devtools.bookchaowalit.com/regex", label: { en: "Regex Tester", th: "Regex Tester" } },
    ],
  },
  {
    id: "sales",
    name: "Sales page shell",
    purpose: {
      en: "The agency's selling pages: one calm light theme, one primary action per page, a sticky header that keeps every link on phones, and local Thai fonts.",
      th: "หน้าขายของเอเจนซี: ธีมสว่างเรียบ ๆ หนึ่งหน้ามีปุ่มหลักเดียว แถบหัวที่ติดด้านบนและเก็บลิงก์ครบบนมือถือ และฟอนต์ไทยที่โหลดจากเว็บเอง",
    },
    sourceRepo: "bookchaowalit-agency/agency-main-web",
    repos: ["bookchaowalit-agency/agency-main-web"],
    examples: [
      { url: "https://agency.bookchaowalit.com", label: { en: "agency.bookchaowalit.com", th: "agency.bookchaowalit.com" } },
    ],
  },
];

export const shellSiteCount = (shell: Shell) => shell.repos.length;
export const totalShellSites = () => shellSystem.reduce((sum, shell) => sum + shellSiteCount(shell), 0);

export type GuaranteeState = "yes" | "partial" | "no" | "na";
export interface GuaranteeCell { state: GuaranteeState; note: Localized }
export interface GuaranteeRow { key: "floor" | "forcedColors" | "thai" | "undo"; label: Localized; cells: Record<ShellId, GuaranteeCell> }

const yes = (en: string, th: string): GuaranteeCell => ({ state: "yes", note: { en, th } });
const no = (en: string, th: string): GuaranteeCell => ({ state: "no", note: { en, th } });
const na: GuaranteeCell = { state: "na", note: { en: "Read-only, nothing to delete", th: "อ่านอย่างเดียว ไม่มีอะไรให้ลบ" } };

/** What each shell guarantees, as written in its stylesheet and rule doc on origin/main. */
export function shellGuaranteeRows(): GuaranteeRow[] {
  const floor = yes("Text 12px+, controls 44px+, 3px focus ring, 4.5:1 text contrast in light and dark", "ตัวอักษร 12px ขึ้นไป ปุ่ม 44px ขึ้นไป วงโฟกัส 3px คอนทราสต์ตัวอักษร 4.5:1 ทั้งโหมดสว่างและมืด");
  return [
    {
      key: "floor",
      label: { en: "WCAG 2.2 AA floor", th: "เกณฑ์ขั้นต่ำ WCAG 2.2 AA" },
      cells: {
        app: floor,
        dashboard: floor,
        reader: floor,
        workbench: floor,
        sales: yes("44px links in the header, breadcrumb and footer; reduced motion respected", "ลิงก์สูง 44px ในแถบหัว เส้นทางนำทาง และส่วนท้าย รองรับการลดภาพเคลื่อนไหว"),
      },
    },
    {
      key: "forcedColors",
      label: { en: "Forced colors (Windows high contrast)", th: "Forced colors (โหมดคอนทราสต์สูงของ Windows)" },
      cells: {
        app: { state: "partial", note: { en: "Rules in 43 of 50 copies", th: "มีในสำเนา 43 จาก 50 เว็บ" } },
        dashboard: yes("Rules in all 12 copies", "มีครบทั้ง 12 เว็บ"),
        reader: yes("Rules in all 32 copies", "มีครบทั้ง 32 เว็บ"),
        workbench: no("Not in the stylesheet yet", "ยังไม่มีในสไตล์ชีต"),
        sales: no("Not in the stylesheet yet", "ยังไม่มีในสไตล์ชีต"),
      },
    },
    {
      key: "thai",
      label: { en: "Thai typography", th: "ตัวอักษรภาษาไทย" },
      cells: {
        app: no("No Thai-specific rules in the shell", "ยังไม่มีกฎเฉพาะภาษาไทยใน shell"),
        dashboard: no("No Thai-specific rules in the shell", "ยังไม่มีกฎเฉพาะภาษาไทยใน shell"),
        reader: yes(":lang(th) line heights and Thai font fallbacks", "ระยะบรรทัด :lang(th) และฟอนต์ไทยสำรอง"),
        workbench: no("No Thai-specific rules in the shell", "ยังไม่มีกฎเฉพาะภาษาไทยใน shell"),
        sales: yes("Local Noto Sans Thai and Thai-safe heading line heights", "ฟอนต์ Noto Sans Thai ในเว็บเอง และระยะบรรทัดหัวข้อที่พอดีกับภาษาไทย"),
      },
    },
    {
      key: "undo",
      label: { en: "Undo for destructive actions", th: "Undo สำหรับการลบ" },
      cells: {
        app: yes("Remove acts at once and offers Undo in a toast; no confirm dialogs", "กดลบแล้วลบทันที มีแถบแจ้งพร้อมปุ่ม Undo ไม่มีกล่องยืนยัน"),
        dashboard: na,
        reader: na,
        workbench: yes("Delete, Clear and Reset offer Undo for a few seconds", "Delete, Clear และ Reset มีปุ่ม Undo ให้กดได้ไม่กี่วินาที"),
        sales: na,
      },
    },
  ];
}
