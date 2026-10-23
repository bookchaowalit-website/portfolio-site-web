"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Server,
  Activity,
  Database,
  Clock,
  ArrowRight,
  Zap,
  Shield,
  RefreshCw,
  GitBranch,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Cpu,
  Workflow,
  AlertTriangle,
} from "lucide-react";
import {
  DATA_PRODUCT_CATALOG,
  FREE_ONLY_DEFAULTS,
  fetchAllProducts,
  toHealthSummaries,
  type ConsumerLoadState,
  type ProductHealthSummary,
  type ProductLoadResult,
} from "@/lib/data-products";

const architectureSteps = [
  {
    icon: Database,
    label: "8 Data Products",
    desc: "Independent domain APIs with normalized envelopes",
    color: "text-foreground",
  },
  {
    icon: Shield,
    label: "Free-only policy",
    desc: "No paid providers or automatic paid fallbacks",
    color: "text-foreground",
  },
  {
    icon: Workflow,
    label: "Local loopback APIs",
    desc: "Development binds on 127.0.0.1:8101–8110",
    color: "text-foreground",
  },
  {
    icon: Cpu,
    label: "Typed consumers",
    desc: "Apps read GET /v1/records only — never scrape",
    color: "text-foreground",
  },
  {
    icon: Zap,
    label: "Fixture fallback",
    desc: "Sanitized offline envelopes for demos without network",
    color: "text-foreground",
  },
];

const apiSchedule = [
  { port: "8101", product: "Crypto Markets", endpoint: "GET /v1/records" },
  { port: "8102", product: "Stock Portfolio", endpoint: "GET /v1/records" },
  { port: "8103", product: "Exchange Rates", endpoint: "GET /v1/records" },
  { port: "8104", product: "DeFi Yields", endpoint: "GET /v1/records" },
  { port: "8105", product: "Flight Prices", endpoint: "GET /v1/records" },
  { port: "8106", product: "SEO Provenance", endpoint: "GET /v1/records" },
  { port: "8108", product: "News Signals", endpoint: "GET /v1/records" },
  { port: "8110", product: "Technology Discovery", endpoint: "GET /v1/records" },
];

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 border border-border bg-card">
      <div className={`p-2.5 border border-border ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function stateTone(state: ConsumerLoadState): string {
  if (state === "ready") return "text-green-500";
  if (state === "stale" || state === "timeout" || state === "empty") return "text-yellow-500";
  if (state === "loading") return "text-muted-foreground";
  return "text-red-500";
}

function stateIcon(state: ConsumerLoadState) {
  if (state === "ready") return CheckCircle2;
  if (state === "loading") return Loader2;
  if (state === "empty" || state === "stale" || state === "timeout") return AlertTriangle;
  return XCircle;
}

function stateLabel(state: ConsumerLoadState): string {
  switch (state) {
    case "loading":
      return "Loading";
    case "ready":
      return "Ready";
    case "empty":
      return "Empty";
    case "stale":
      return "Stale data";
    case "timeout":
      return "Timeout (fixture)";
    case "unavailable":
      return "API unavailable";
    case "error":
      return "Error";
    default:
      return state;
  }
}

function sourceLabel(source: ProductHealthSummary["source"]): string {
  if (source === "api") return "local API";
  if (source === "fixture") return "offline fixture";
  return "no source";
}

function SourceCard({
  summary,
  index,
}: {
  summary: ProductHealthSummary;
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  const StatusIcon = stateIcon(summary.load_state);
  const statusColor = stateTone(summary.load_state);
  const statusText = stateLabel(summary.load_state);
  const dataSource = sourceLabel(summary.source);

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.06 }}
      className="p-4 border border-border bg-card hover:border-primary/50 transition-colors"
      aria-labelledby={`product-${summary.id}-title`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            {summary.icon}
          </span>
          <span id={`product-${summary.id}-title`} className="font-medium text-sm">
            {summary.name}
          </span>
        </div>
        <StatusIcon
          className={`w-4 h-4 ${statusColor} ${summary.load_state === "loading" ? "animate-spin" : ""}`}
          aria-hidden="true"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Records</span>
          <span className="font-mono">{summary.record_count.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Port</span>
          <span className="font-mono">{summary.port}</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-muted-foreground">Status</span>
          <span
            className="font-mono"
            role="status"
            aria-label={`${summary.name} status: ${statusText}`}
          >
            {statusText}
          </span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-muted-foreground">Data source</span>
          <span
            className="font-mono"
            aria-label={`${summary.name} data source: ${dataSource}`}
          >
            {dataSource}
          </span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-muted-foreground">Schema</span>
          <span className="font-mono">{summary.schema_version}</span>
        </div>
        {summary.retrieved_at && (
          <div className="flex justify-between col-span-2">
            <span className="text-muted-foreground">Retrieved</span>
            <span className="font-mono truncate" title={summary.retrieved_at}>
              {summary.retrieved_at}
            </span>
          </div>
        )}
        {summary.errorMessage && (
          <div
            className="col-span-2 text-[11px] text-yellow-600 dark:text-yellow-400"
            role="note"
          >
            {summary.errorMessage}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export function LiveSystemsClient() {
  const reducedMotion = useReducedMotion();
  const [results, setResults] = useState<ProductLoadResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<string>("Connecting to local data-product APIs…");

  useEffect(() => {
    let cancelled = false;
    const params =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const forceFixtures =
      params?.get("fixtures") === "1" ||
      params?.get("offline") === "1" ||
      process.env.NEXT_PUBLIC_DATA_PRODUCTS_USE_FIXTURES === "true";

    (async () => {
      setLoading(true);
      const loaded = await fetchAllProducts({
        useFixtures: forceFixtures,
        timeoutMs: 3500,
      });
      if (cancelled) return;
      setResults(loaded);
      const apiCount = loaded.filter((r) => r.source === "api").length;
      const fixtureCount = loaded.filter((r) => r.source === "fixture").length;
      setBanner(
        forceFixtures
          ? `Offline fixture mode · ${fixtureCount}/8 products · free-only · no external writes`
          : `Loaded ${apiCount} from local APIs · ${fixtureCount} fixture fallbacks · free-only`,
      );
      setLoading(false);
    })().catch(() => {
      if (!cancelled) {
        setBanner("Unable to load data products");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const summaries = useMemo(
    () => (results ? toHealthSummaries(results) : []),
    [results],
  );

  const stats = useMemo(() => {
    if (!results) return null;
    const total = results.length;
    const active = results.filter((r) => r.state === "ready" || r.state === "stale").length;
    const points = results.reduce((sum, r) => sum + (r.envelope?.items.length ?? 0), 0);
    const issues = results.filter((r) =>
      ["unavailable", "timeout", "error", "empty"].includes(r.state),
    ).length;
    return {
      total_sources: total,
      active_sources: active,
      issue_sources: issues,
      total_data_points: points,
    };
  }, [results]);

  const sampleItems = useMemo(() => {
    if (!results) return [] as Array<{ product: string; line: string }>;
    const lines: Array<{ product: string; line: string }> = [];
    for (const result of results) {
      const item = result.envelope?.items[0];
      if (!item) continue;
      const product = DATA_PRODUCT_CATALOG.find((p) => p.id === result.productId);
      const preview =
        typeof item.headline === "string"
          ? `${item.headline} · ${item.publisher ?? item.source ?? ""}`
          : typeof item.title === "string"
          ? item.title
          : typeof item.name === "string"
            ? item.name
            : typeof item.symbol === "string"
              ? `${item.symbol} ${item.price ?? ""}`
              : typeof item.coin_id === "string"
                ? `${item.coin_id} ${item.price ?? ""}`
                : typeof item.keyword === "string"
                  ? item.keyword
                  : typeof item.project === "string"
                    ? `${item.project} APY ${item.apy ?? ""}`
                    : typeof item.origin === "string"
                      ? `${item.origin}-${item.destination} ฿${item.price_thb ?? ""}`
                      : typeof item.currency === "string"
                        ? `${item.base}/${item.currency} ${item.rate ?? ""}`
                        : JSON.stringify(item).slice(0, 80);
      lines.push({
        product: product?.title ?? result.productId,
        line: String(preview),
      });
      if (lines.length >= 8) break;
    }
    return lines;
  }, [results]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
      <motion.div
        className="text-center space-y-6 py-8"
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-secondary text-foreground text-xs font-medium mb-4">
          <Activity className="w-3 h-3" aria-hidden="true" />
          Free-only data products · loopback APIs
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Live <span className="text-primary">Data Products</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Portfolio consumers read versioned envelopes from nine local data-product APIs
          (`127.0.0.1:8101–8110`). No upstream scraping, no paid fallbacks, and no external
          writes from this app. Offline demos use sanitized fixtures.
        </p>
        <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
          {banner}
        </p>
      </motion.div>

      {stats && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.6 }}
        >
          <StatCard icon={Server} value={stats.total_sources} label="Data Products" color="bg-foreground" />
          <StatCard icon={Activity} value={stats.active_sources} label="Ready / Stale" color="bg-secondary" />
          <StatCard icon={AlertTriangle} value={stats.issue_sources} label="Empty / Issues" color="bg-muted" />
          <StatCard icon={Database} value={stats.total_data_points} label="Records Loaded" color="bg-foreground/80" />
        </motion.div>
      )}

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Data Product Health</h2>
            <p className="text-sm text-muted-foreground">
              Loading, stale, timeout, empty, and API-unavailable states
            </p>
          </div>
        </div>
        {loading ? (
          <div
            className="flex items-center justify-center py-12 gap-2 text-muted-foreground"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
            <span>Loading product envelopes…</span>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            role="list"
            aria-label="Data product health cards"
          >
            {summaries.map((summary, i) => (
              <div key={summary.id} role="listitem">
                <SourceCard summary={summary} index={i} />
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          free_only={String(FREE_ONLY_DEFAULTS.freeOnly)} · allow_paid_providers=
          {String(FREE_ONLY_DEFAULTS.allowPaidProviders)} · allow_external_writes=
          {String(FREE_ONLY_DEFAULTS.allowExternalWrites)} · offline tip: add{" "}
          <code className="px-1 border border-border bg-muted">?fixtures=1</code>
        </p>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Cpu className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Consumer Architecture</h2>
            <p className="text-sm text-muted-foreground">
              Applications consume contracts — data repos own ingestion
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {architectureSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.label}
                initial={reducedMotion ? false : { opacity: 0, x: -20 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: i * 0.12 }}
                className="relative"
              >
                <div className="p-4 border border-border bg-card text-center space-y-3 h-full">
                  <div className={`mx-auto w-fit p-2.5 border border-border bg-muted ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{step.label}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                {i < architectureSteps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <RefreshCw className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Local API Map</h2>
            <p className="text-sm text-muted-foreground">Development loopback endpoints</p>
          </div>
        </div>
        <div className="border border-border overflow-hidden" role="table" aria-label="Local data-product API map">
          <div className="grid grid-cols-[80px_1fr_1fr] gap-0" role="rowgroup">
            <div className="contents" role="row">
              <div className="bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground" role="columnheader">
                Port
              </div>
              <div className="bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground" role="columnheader">
                Product
              </div>
              <div className="bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground" role="columnheader">
                Contract
              </div>
            </div>
            {apiSchedule.map((item) => (
              <div key={item.port} className="contents" role="row">
                <div className="px-3 py-2.5 text-xs font-mono border-t" role="cell">
                  {item.port}
                </div>
                <div className="px-3 py-2.5 text-sm border-t" role="cell">
                  {item.product}
                </div>
                <div className="px-3 py-2.5 text-xs font-mono border-t text-muted-foreground" role="cell">
                  {item.endpoint}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Resilience (consumer-side)</h2>
            <p className="text-sm text-muted-foreground">No paid fallbacks · free-only defaults</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Fixture fallback",
              desc: "If a local API times out or is unavailable, the UI falls back to sanitized fixtures under /data/data-products/.",
              icon: Shield,
            },
            {
              title: "Envelope validation",
              desc: "Responses must include schema_version, source, retrieved_at, data_status, items, and next_cursor.",
              icon: GitBranch,
            },
            {
              title: "No external writes",
              desc: "This consumer never sends Telegram, Todoist, or email. Writes stay disabled under free-only policy.",
              icon: Clock,
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: i * 0.1 }}
                className="p-5 border border-border bg-card space-y-3"
              >
                <div className="p-2 border border-border bg-primary/10 w-fit">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {sampleItems.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Envelope Sample</h2>
              <p className="text-sm text-muted-foreground">First record from each loaded product</p>
            </div>
          </div>
          <div className="space-y-2">
            {sampleItems.map((row, i) => (
              <motion.div
                key={`${row.product}-${i}`}
                initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 border border-border bg-card text-sm"
              >
                <span className="font-medium w-36 shrink-0">{row.product}</span>
                <span className="flex-1 truncate text-muted-foreground">{row.line}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <motion.div
        className="text-center py-8"
        initial={reducedMotion ? false : { opacity: 0 }}
        whileInView={reducedMotion ? undefined : { opacity: 1 }}
        viewport={{ once: true }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6 }}
      >
        <p className="text-sm text-muted-foreground">
          Legacy scraper-dashboard JSON is no longer the live source. This page consumes
          data-product API envelopes (or fixtures) only.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          <ExternalLink className="w-3 h-3" />
          <span>Solo Empire data-product portfolio consumer</span>
        </div>
      </motion.div>
    </div>
  );
}
