import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import {
  shellGuaranteeRows,
  shellSiteCount,
  shellSystem,
  totalShellSites,
  type GuaranteeState,
} from "@/data/shell-system";

type Props = { params: Promise<{ locale: string }> };
type Lang = "en" | "th";

const copy = {
  title: { en: "Design system: five shared shells", th: "ระบบดีไซน์: shell กลางห้าแบบ" },
  description: {
    en: "How the bookchaowalit.com sites share five copy-in shells (App, Dashboard, Reader, Workbench and Sales page), what each one guarantees, and how many sites use it.",
    th: "เว็บของ bookchaowalit.com ใช้ shell กลางห้าแบบ (App, Dashboard, Reader, Workbench และ Sales page) แต่ละแบบรับประกันอะไร และมีกี่เว็บที่ใช้",
  },
  crumb: { en: "Design system", th: "ระบบดีไซน์" },
  projects: { en: "Projects", th: "โปรเจกต์" },
  lede: {
    en: "Between 13 and 19 November 2026 the small sites behind this portfolio moved onto five shared shells instead of being redesigned one by one. Each site is its own repository, so a shell is copied in (a stylesheet, a component file and a rule doc), not installed as a package.",
    th: "ระหว่างวันที่ 13 ถึง 19 พฤศจิกายน 2026 เว็บเล็ก ๆ ในพอร์ตโฟลิโอนี้ย้ายมาใช้ shell กลางห้าแบบ แทนการออกแบบใหม่ทีละเว็บ แต่ละเว็บเป็น repository ของตัวเอง จึงคัดลอก shell เข้าไป (สไตล์ชีต ไฟล์คอมโพเนนต์ และเอกสารกฎ) ไม่ได้ติดตั้งเป็นแพ็กเกจ",
  },
  total: {
    en: (n: number) => `${n} repositories carry one of the shells on their main branch.`,
    th: (n: number) => `มี ${n} repository ที่ใช้ shell แบบใดแบบหนึ่งบน branch main`,
  },
  sites: { en: (n: number) => (n === 1 ? "1 site" : `${n} sites`), th: (n: number) => `${n} เว็บ` },
  guarantees: { en: "What it guarantees", th: "สิ่งที่รับประกัน" },
  examples: { en: "Examples", th: "ตัวอย่าง" },
  source: { en: "Source of truth", th: "ต้นฉบับ" },
  card: { en: "Project card", th: "การ์ดโปรเจกต์" },
  method: { en: "How this was counted", th: "นับอย่างไร" },
  methodBody: {
    en: [
      "Counts come from each repository's origin/main on 19 November 2026.",
      "A repository counts when it holds the shell's stylesheet: app-shell.css, dashboard-shell.css, reader-shell.css or workbench.css. The sales page shell is the agency site's globals.css.",
      "Guarantees are read from those stylesheets and from each shell's rule doc.",
      "A shell move is not a user study, so no visitor numbers are claimed. A live site can lag its main branch until its next deploy.",
    ],
    th: [
      "ตัวเลขนับจาก origin/main ของแต่ละ repository วันที่ 19 พฤศจิกายน 2026",
      "นับ repository ที่มีสไตล์ชีตของ shell คือ app-shell.css, dashboard-shell.css, reader-shell.css หรือ workbench.css ส่วน shell หน้าขายคือ globals.css ของเว็บเอเจนซี",
      "สิ่งที่รับประกันอ่านจากสไตล์ชีตเหล่านั้นและเอกสารกฎของแต่ละ shell",
      "การย้าย shell ไม่ใช่การทดสอบกับผู้ใช้ หน้านี้จึงไม่อ้างตัวเลขผู้เข้าชม และเว็บที่ออนไลน์อาจยังไม่ตรงกับ main จนกว่าจะ deploy รอบถัดไป",
    ],
  },
  state: {
    yes: { en: "Yes", th: "มี" },
    partial: { en: "Partly", th: "บางส่วน" },
    no: { en: "Not yet", th: "ยังไม่มี" },
    na: { en: "Not needed", th: "ไม่จำเป็น" },
  } satisfies Record<GuaranteeState, { en: string; th: string }>,
};

const stateMark: Record<GuaranteeState, string> = { yes: "✓", partial: "◐", no: "–", na: "·" };

const langOf = (locale: string): Lang => (locale === "th" ? "th" : "en");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = langOf(locale);
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://bookchaowalit.com";
  const title = `${copy.title[lang]} | ${lang === "th" ? "เชาวลิต กรีโภค" : "Chaowalit Greepoke"}`;
  return {
    metadataBase: new URL(base),
    title,
    description: copy.description[lang],
    robots: "index, follow",
    alternates: {
      canonical: `/${locale}/projects/design-system`,
      languages: { en: "/en/projects/design-system", th: "/th/projects/design-system", "x-default": "/en/projects/design-system" },
    },
    openGraph: {
      type: "article",
      locale,
      url: `${base}/${locale}/projects/design-system`,
      title,
      description: copy.description[lang],
      siteName: "Chaowalit Greepoke Portfolio",
    },
  };
}

export default async function DesignSystemPage({ params }: Props) {
  const { locale } = await params;
  const lang = langOf(locale);
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://bookchaowalit.com";
  const rows = shellGuaranteeRows();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: base },
          { name: copy.projects[lang], url: `${base}/${locale}/projects` },
          { name: copy.crumb[lang], url: `${base}/${locale}/projects/design-system` },
        ]}
      />
      <BreadcrumbNav items={[{ name: copy.projects[lang], href: "/projects" }, { name: copy.crumb[lang] }]} />

      <header className="max-w-3xl space-y-4 pb-8 pt-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.title[lang]}</h1>
        <p className="leading-relaxed text-muted-foreground">{copy.lede[lang]}</p>
        <p className="font-medium">{copy.total[lang](totalShellSites())}</p>
      </header>

      <ol role="list" className="grid gap-px border border-border bg-border">
        {shellSystem.map((shell) => (
          <li key={shell.id} className="bg-background p-5 sm:p-6">
            <section aria-labelledby={`shell-${shell.id}`} className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 id={`shell-${shell.id}`} className="text-2xl font-semibold tracking-tight">
                  {shell.name}
                </h2>
                <p className="font-mono text-sm tabular-nums">
                  {shell.unitsNote ? shell.unitsNote[lang] : copy.sites[lang](shellSiteCount(shell))}
                </p>
              </div>
              <p className="max-w-3xl text-sm leading-relaxed">{shell.purpose[lang]}</p>

              <div>
                <h3 className="mb-2 text-sm font-semibold">{copy.guarantees[lang]}</h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  {rows.map((row) => {
                    const cell = row.cells[shell.id];
                    return (
                      <div key={row.key} className="border border-border p-3">
                        <dt className="font-medium">{row.label[lang]}</dt>
                        <dd className="mt-1 text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            <span aria-hidden="true">{stateMark[cell.state]} </span>
                            {copy.state[cell.state][lang]}
                          </span>
                          {" · "}
                          {cell.note[lang]}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">{copy.examples[lang]}</h3>
                <ul role="list" className="flex flex-wrap gap-2">
                  {shell.examples.map((example) => (
                    <li key={example.url} className="flex flex-wrap items-center gap-x-1">
                      <a
                        href={example.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 border border-border px-3 text-sm underline-offset-4 hover:underline"
                      >
                        {example.label[lang]}
                        <ArrowUpRight size={14} aria-hidden="true" />
                        <span className="sr-only">{lang === "th" ? "(เปิดแท็บใหม่)" : "(opens in a new tab)"}</span>
                      </a>
                      {example.slug && (
                        <Link
                          href={{ pathname: "/projects/[slug]", params: { slug: example.slug } }}
                          className="inline-flex min-h-11 items-center px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                          aria-label={`${copy.card[lang]}: ${example.label[lang]}`}
                        >
                          {copy.card[lang]}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                {copy.source[lang]}:{" "}
                <a
                  href={`https://github.com/${shell.sourceRepo}`}
                  className="inline-flex min-h-11 items-center font-mono underline underline-offset-4 hover:text-foreground"
                >
                  {shell.sourceRepo}
                </a>
              </p>
            </section>
          </li>
        ))}
      </ol>

      <section aria-labelledby="shell-method" className="mt-10 max-w-3xl space-y-2">
        <h2 id="shell-method" className="text-xl font-semibold">
          {copy.method[lang]}
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
          {copy.methodBody[lang].map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
