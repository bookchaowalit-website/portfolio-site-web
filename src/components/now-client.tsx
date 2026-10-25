"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BarChart3, Bot, Code2, ExternalLink, PenLine } from "lucide-react";
import { Link } from "@/i18n/routing";
import { MixedTypographyTitle, NotebookSectionHeader } from "@/components/ui/mixed-typography";

type FocusStatus = "building" | "shipping" | "maintaining" | "exploring";

type ProjectProof =
  | { label: string; slug: string }
  | { label: string; href: "/projects" | "/blog" };

interface FocusLane {
  icon: React.ElementType;
  title: string;
  description: string;
  status: FocusStatus;
  proof: ProjectProof[];
}

function ProofLink({ proof }: { proof: ProjectProof }) {
  const className =
    "inline-flex min-h-[44px] items-center gap-1.5 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if ("slug" in proof) {
    return (
      <Link
        href={{ pathname: "/projects/[slug]", params: { slug: proof.slug } }}
        className={className}
      >
        {proof.label}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <Link href={proof.href} className={className}>
      {proof.label}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

function FocusLaneCard({
  item,
  statusLabel,
  proofLabel,
}: {
  item: FocusLane;
  statusLabel: string;
  proofLabel: string;
}) {
  const Icon = item.icon;

  return (
    <motion.article
      initial={false}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex h-full flex-col bg-background p-6 md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-muted/40">
          <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
        </div>
        <span className="border border-border px-2 py-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {statusLabel}
        </span>
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-tight">{item.title}</h3>
      <p className="mt-3 max-w-[42ch] text-sm leading-7 text-muted-foreground">
        {item.description}
      </p>

      <div className="mt-auto border-t border-border pt-5">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {proofLabel}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {item.proof.map((proof) => (
            <ProofLink key={proof.label} proof={proof} />
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export function NowClient() {
  const t = useTranslations("now");

  const focusLanes: FocusLane[] = [
    {
      icon: Bot,
      title: t("aiTitle"),
      description: t("aiDesc"),
      status: "building",
      proof: [
        { label: t("aiProof1"), slug: "mcp-server" },
        { label: t("aiProof2"), slug: "chat-playground" },
      ],
    },
    {
      icon: Code2,
      title: t("systemsTitle"),
      description: t("systemsDesc"),
      status: "shipping",
      proof: [
        { label: t("systemsProof1"), slug: "webhook-tester" },
        { label: t("systemsProof2"), slug: "recommendation-engine" },
      ],
    },
    {
      icon: BarChart3,
      title: t("growthTitle"),
      description: t("growthDesc"),
      status: "maintaining",
      proof: [
        { label: t("growthProof1"), slug: "bookmarketing" },
        { label: t("growthProof2"), slug: "analytics-dashboard" },
      ],
    },
    {
      icon: PenLine,
      title: t("publicTitle"),
      description: t("publicDesc"),
      status: "exploring",
      proof: [
        { label: t("publicProof1"), href: "/projects" },
        { label: t("publicProof2"), href: "/blog" },
      ],
    },
  ];

  return (
    <div className="space-y-12 py-8 md:space-y-16 md:py-12">
      <header className="max-w-3xl space-y-6">
        <MixedTypographyTitle
          as="h1"
          words={[
            { text: t("titleWord1"), style: "cursive", size: "xl" },
            { text: t("titleWord2"), style: "filled", size: "xl" },
          ]}
        />
        <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
          {t("subtitle")}
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {t("lastUpdated")}
        </p>
      </header>

      <aside className="border border-border bg-muted/30 p-6 md:p-8" aria-label={t("boundaryTitle")}>
        <div className="flex items-start gap-4">
          <div className="mt-1 h-2 w-2 shrink-0 bg-foreground" aria-hidden="true" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{t("boundaryTitle")}</h2>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              {t("boundaryNote")}
            </p>
          </div>
        </div>
      </aside>

      <section aria-label={t("nowSectionTitle")}>
        <NotebookSectionHeader
          title={t("nowSectionTitle")}
          subtitle={t("nowSectionSubtitle")}
        />

        <div
          className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2"
        >
          {focusLanes.map((item) => (
            <FocusLaneCard
              key={item.title}
              item={item}
              statusLabel={t(`status${item.status[0].toUpperCase()}${item.status.slice(1)}` as const)}
              proofLabel={t("proofLabel")}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-border pt-8" aria-labelledby="focus-principle-heading">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-2 w-2 shrink-0 bg-foreground" aria-hidden="true" />
          <div>
            <h2 id="focus-principle-heading" className="text-lg font-semibold">
              {t("principleTitle")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              {t("principleNote")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
