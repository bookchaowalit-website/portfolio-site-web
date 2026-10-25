"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MixedTypographyTitle, NotebookSectionHeader } from "@/components/ui/mixed-typography";
import { StickyNote } from "@/components/ui/notebook-elements";
import {
  Network, FileText, Folder, Plug,
  X, ArrowRight, Sparkles, Eye, Layers, Briefcase, ExternalLink,
  Github, Linkedin, Twitter, Activity, Globe
} from "lucide-react";
import inventory from "@/content/domain-inventory.json";
import { categoryMeta, allProjects, publicDemoUrl, type ProjectCategory } from "@/data/app-projects";

// Map atlas categories → portfolio project categories
const atlasToProjectCategories: Record<string, ProjectCategory[]> = {
  "tech-engineering": ["tech"],
  "business-finance": ["business", "marketing"],
  "creative-design": ["design"],
  "life-health": ["health"],
  "professional": ["education", "content"],
  "legal-governance": ["business"],
  "humanities": ["education", "content"],
  "infrastructure": ["tech", "business"],
};

// Platform-specific icon helper
function getPlatformIcon(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('github.com')) return Github;
    if (hostname.includes('linkedin.com')) return Linkedin;
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return Twitter;
    if (hostname.includes('strava.com')) return Activity;
    if (hostname.includes('dev.to')) return FileText;
    if (hostname.includes('medium.com')) return FileText;
    if (hostname.includes('upwork.com')) return Briefcase;
    if (hostname.includes('fastwork.co')) return Briefcase;
    if (hostname.includes('bookchaowalit.com')) return Globe;
    return ExternalLink;
  } catch {
    return ExternalLink;
  }
}

// ── Types ──
interface DomainNode {
  id: string;
  name: string;
  category: string;
  fileCount: number;
  depth: string;
  description: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  integrations: string[];
  subdirectories: { name: string; files: number; description: string }[];
  notableArtifacts: string[];
  portfolioUrl?: string;
  portfolioUrl2?: string;
}

const categoryColors: Record<string, string> = {
  "tech-engineering": "color-mix(in srgb, var(--foreground) 100%, transparent)",
  "business-finance": "color-mix(in srgb, var(--foreground) 90%, transparent)",
  "creative-design": "color-mix(in srgb, var(--foreground) 80%, transparent)",
  "life-health": "color-mix(in srgb, var(--foreground) 70%, transparent)",
  "professional": "color-mix(in srgb, var(--foreground) 60%, transparent)",
  "legal-governance": "color-mix(in srgb, var(--foreground) 52%, transparent)",
  "humanities": "color-mix(in srgb, var(--foreground) 44%, transparent)",
  "infrastructure": "color-mix(in srgb, var(--foreground) 36%, transparent)",
};

const depthColors: Record<string, string> = {
  expert: "color-mix(in srgb, var(--foreground) 100%, transparent)",
  advanced: "color-mix(in srgb, var(--foreground) 78%, transparent)",
  intermediate: "color-mix(in srgb, var(--foreground) 56%, transparent)",
  foundational: "color-mix(in srgb, var(--foreground) 34%, transparent)",
};

// ── Layout ──
function computeLayout(
  domains: typeof inventory.domains,
  width: number,
  height: number
): DomainNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const categories = inventory.categories;
  const catCount = categories.length;
  const maxFiles = Math.max(...domains.map((d) => d.fileCount));

  const catPositions: Record<string, { x: number; y: number }> = {};
  categories.forEach((cat, i) => {
    const angle = (2 * Math.PI * i) / catCount - Math.PI / 2;
    const rx = width * 0.33;
    const ry = height * 0.33;
    catPositions[cat.id] = {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });

  const nodes: DomainNode[] = [];
  categories.forEach((cat) => {
    const catDomains = domains.filter((d) => d.category === cat.id);
    const centroid = catPositions[cat.id];
    const spread = Math.min(width, height) * 0.15;

    catDomains.forEach((domain, j) => {
      const angle = (2 * Math.PI * j) / catDomains.length;
      const dist =
        catDomains.length === 1
          ? 0
          : spread * (0.35 + 0.65 * (j / catDomains.length));
      const nodeRadius =
        8 + 22 * Math.log(1 + domain.fileCount) / Math.log(1 + maxFiles);

      nodes.push({
        id: domain.id,
        name: domain.name,
        category: cat.id,
        fileCount: domain.fileCount,
        depth: domain.depth,
        description: domain.description,
        x: centroid.x + dist * Math.cos(angle),
        y: centroid.y + dist * Math.sin(angle),
        radius: nodeRadius,
        color: categoryColors[cat.id] || "#888",
        integrations: domain.integrations,
        subdirectories: domain.subdirectories,
        notableArtifacts: domain.notableArtifacts,
        portfolioUrl: (domain as any).portfolioUrl,
        portfolioUrl2: (domain as any).portfolioUrl2,
      });
    });
  });

  return nodes;
}

// ── Component ──
export function AtlasClient() {
  const t = useTranslations("atlas");
  const reducedMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<"graph" | "grid">("graph");

  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!selectedDomain) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setSelectedDomain(null);
      }
    };
    // Use mousedown for snappier feel; delay to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [selectedDomain]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const svgWidth = isMobile ? 380 : 900;
  const svgHeight = isMobile ? 380 : 650;

  const nodes = useMemo(
    () => computeLayout(inventory.domains, svgWidth, svgHeight),
    [svgWidth, svgHeight]
  );

  const edges = useMemo(() => {
    const result: { from: DomainNode; to: DomainNode; color: string }[] = [];
    inventory.categories.forEach((cat) => {
      const catNodes = nodes.filter((n) => n.category === cat.id);
      for (let i = 0; i < catNodes.length; i++) {
        const next = (i + 1) % catNodes.length;
        if (catNodes.length > 1) {
          result.push({
            from: catNodes[i],
            to: catNodes[next],
            color: categoryColors[cat.id] || "#888",
          });
        }
      }
    });
    return result;
  }, [nodes]);

  // Cross-domain integration edges (between categories)
  const crossEdges = useMemo(() => {
    const cross: { from: DomainNode; to: DomainNode }[] = [];
    const integrationMap: [string, string][] = [
      ["dev", "ai"],
      ["dev", "marketing"],
      ["dev", "design"],
      ["ai", "research"],
      ["ai", "finance"],
      ["health", "sports"],
      ["work", "leadership"],
      ["communication", "marketing"],
      ["sales", "marketing"],
      ["operations", "strategy"],
    ];
    integrationMap.forEach(([a, b]) => {
      const nodeA = nodes.find((n) => n.id === a);
      const nodeB = nodes.find((n) => n.id === b);
      if (nodeA && nodeB && nodeA.category !== nodeB.category) {
        cross.push({ from: nodeA, to: nodeB });
      }
    });
    return cross;
  }, [nodes]);

  const selectedData = selectedDomain
    ? nodes.find((n) => n.id === selectedDomain)
    : null;
  const hoveredData = hoveredNode
    ? nodes.find((n) => n.id === hoveredNode)
    : null;

  const filteredNodes = useMemo(() => {
    if (activeCategory === "all") return nodes;
    return nodes.filter((n) => n.category === activeCategory);
  }, [nodes, activeCategory]);

  const filteredEdges = useMemo(() => {
    if (activeCategory === "all") return edges;
    return edges.filter(
      (e) => e.from.category === activeCategory && e.to.category === activeCategory
    );
  }, [edges, activeCategory]);

  const stats = inventory.summaryStats;
  const totalFiles = inventory.domains.reduce((s, d) => s + d.fileCount, 0);

  const handleNodeClick = useCallback(
    (id: string) => {
      setSelectedDomain(selectedDomain === id ? null : id);
    },
    [selectedDomain]
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-10">
      {/* Hero */}
      <motion.div
        className="text-center space-y-6"
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8 }}
      >
        {/* Page-level h1 lives in atlas/page.tsx — keep this as visual section title only */}
        <MixedTypographyTitle as="h2"
          words={[
            { text: t("heroWord1"), style: "cursive", size: "xl" },
            { text: t("heroWord2"), style: "bubble", size: "xl" },
            { text: t("heroWord3"), style: "filled", size: "lg" },
          ]}
          className="mb-4"
        />
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t("heroDescription")}
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
      >
        {[
          { icon: <Network className="w-5 h-5" />, value: inventory.domains.length, label: t("statDomains"), color: "yellow" as const },
          { icon: <FileText className="w-5 h-5" />, value: totalFiles.toLocaleString(), label: t("statFiles"), color: "pink" as const },
          { icon: <Folder className="w-5 h-5" />, value: stats.totalSubdirectories, label: t("statFolders"), color: "green" as const },
          { icon: <Plug className="w-5 h-5" />, value: stats.domainsWithLiveIntegrations, label: t("statIntegrations"), color: "blue" as const },
            { icon: <Briefcase className="w-5 h-5" />, value: allProjects.length, label: t("statProjects"), color: "pink" as const },
        ].map((stat, i) => (
          <StickyNote key={stat.label} rotation={(i % 2 === 0 ? 1 : -1) * 1.5} color={stat.color} className="text-center py-3">
            <div className="flex flex-col items-center gap-1">
              <div className="text-primary">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </StickyNote>
        ))}
      </motion.div>

      {/* View Toggle + Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* View toggle */}
        <div className="flex items-center gap-2 border border-border/60 bg-secondary/50 p-1">
          <button
            onClick={() => setViewMode("graph")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
              viewMode === "graph" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-4 h-4" /> {t("viewGraph")}
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
              viewMode === "grid" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" /> {t("viewGrid")}
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          <button
            onClick={() => setActiveCategory("all")}
            className={`border border-border px-3 py-1 text-xs font-medium transition-all ${
              activeCategory === "all"
                ? "bg-foreground text-background"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("filterAll")}
          </button>
          {inventory.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-3 py-1 text-xs font-medium transition-all"
              style={{
                backgroundColor: activeCategory === cat.id ? "var(--foreground)" : "transparent",
                color: activeCategory === cat.id ? "var(--background)" : categoryColors[cat.id],
                border: `1.5px solid ${activeCategory === cat.id ? "var(--foreground)" : categoryColors[cat.id]}`,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRAPH VIEW ── */}
      <AnimatePresence mode="wait">
        {viewMode === "graph" && (
          <motion.div
            key="graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="relative bg-secondary/20 border border-border/50 overflow-hidden">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full"
                style={{ minHeight: isMobile ? 300 : 500 }}
                onClick={() => setSelectedDomain(null)}
              >
                {/* Category labels */}
                {inventory.categories.map((cat) => {
                  const catNodes = nodes.filter((n) => n.category === cat.id);
                  if (catNodes.length === 0) return null;
                  const avgX = catNodes.reduce((s, n) => s + n.x, 0) / catNodes.length;
                  const avgY = catNodes.reduce((s, n) => s + n.y, 0) / catNodes.length;
                  const isActive = activeCategory === "all" || activeCategory === cat.id;
                  return (
                    <text
                      key={cat.id}
                      x={avgX}
                      y={avgY - (isMobile ? 30 : 45)}
                      textAnchor="middle"
                      aria-hidden="true"
                      className="text-[10px] font-semibold pointer-events-none select-none"
                      fill={isActive ? categoryColors[cat.id] : "#999"}
                      opacity={isActive ? 0.8 : 0.25}
                    >
                      {cat.label}
                    </text>
                  );
                })}

                {/* Same-category edges */}
                <g>
                  {filteredEdges.map((edge, i) => {
                    const isHighlighted =
                      hoveredNode === edge.from.id || hoveredNode === edge.to.id;
                    return (
                      <line
                        key={`e-${i}`}
                        x1={edge.from.x}
                        y1={edge.from.y}
                        x2={edge.to.x}
                        y2={edge.to.y}
                        stroke={edge.color}
                        strokeWidth={isHighlighted ? 2 : 0.8}
                        opacity={isHighlighted ? 0.5 : 0.12}
                      />
                    );
                  })}
                </g>

                {/* Cross-category edges */}
                {activeCategory === "all" && (
                  <g>
                    {crossEdges.map((edge, i) => {
                      const isHighlighted =
                        hoveredNode === edge.from.id || hoveredNode === edge.to.id;
                      return (
                        <line
                          key={`ce-${i}`}
                          x1={edge.from.x}
                          y1={edge.from.y}
                          x2={edge.to.x}
                          y2={edge.to.y}
                          stroke="#888"
                          strokeWidth={isHighlighted ? 1.5 : 0.5}
                          strokeDasharray={isHighlighted ? "4 2" : "2 4"}
                          opacity={isHighlighted ? 0.4 : 0.06}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Nodes */}
                {filteredNodes.map((node) => {
                  const isHovered = hoveredNode === node.id;
                  const isSelected = selectedDomain === node.id;
                  const dimmed =
                    activeCategory !== "all" && node.category !== activeCategory;

                  return (
                    <g
                      key={node.id}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                      className="cursor-pointer"
                      opacity={dimmed ? 0.15 : 1}
                    >
                      {/* Glow for selected */}
                      {isSelected && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.radius + 6}
                          fill="none"
                          stroke={node.color}
                          strokeWidth={2}
                          opacity={0.4}
                        />
                      )}
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={isHovered || isSelected ? node.radius * 1.2 : node.radius}
                        fill={node.color}
                        fillOpacity={isHovered || isSelected ? 0.85 : 0.55}
                        stroke={node.color}
                        strokeWidth={isHovered || isSelected ? 2.5 : 1}
                        strokeOpacity={0.8}
                        initial={reducedMotion ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: reducedMotion ? 0 : 0.4,
                          type: "spring",
                          stiffness: 200,
                        }}
                        style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                      />
                      {/* Label */}
                      {(node.radius > 12 || isHovered || isSelected) && (
                        <text
                          x={node.x}
                          y={node.y + node.radius + 13}
                          textAnchor="middle"
                          aria-hidden="true"
                          className="text-[9px] fill-foreground pointer-events-none select-none"
                          fontWeight={isHovered || isSelected ? 600 : 400}
                          opacity={isHovered || isSelected ? 1 : 0.65}
                        >
                          {node.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Hover tooltip */}
              <AnimatePresence>
                {hoveredData && !selectedData && (
                  <motion.div
                    className="absolute top-4 right-4 bg-background/95 backdrop-blur border border-border shadow-lg p-3 z-10 max-w-[220px]"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredData.color }} />
                      <span className="text-sm font-semibold">{hoveredData.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{hoveredData.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{hoveredData.fileCount.toLocaleString()} files</span>
                      <span className="capitalize">{hoveredData.depth}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Depth Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {[
                { depth: "expert", desc: "1000+ files" },
                { depth: "advanced", desc: "15-100 files" },
                { depth: "intermediate", desc: "5-14 files" },
                { depth: "foundational", desc: "4 files" },
              ].map((item) => (
                <div key={item.depth} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: depthColors[item.depth] }} />
                  <span className="text-xs text-muted-foreground">
                    {t(`depth${item.depth.charAt(0).toUpperCase() + item.depth.slice(1)}` as any)} ({item.desc})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {inventory.domains
              .filter((d) => activeCategory === "all" || d.category === activeCategory)
              .sort((a, b) => b.fileCount - a.fileCount)
              .map((domain, i) => {
                const catColor = categoryColors[domain.category] || "color-mix(in srgb, var(--foreground) 55%, transparent)";
                return (
                  <motion.div
                    key={domain.id}
                    initial={reducedMotion ? false : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
                  >
                    <StickyNote
                      color={(["yellow", "pink", "green", "blue"] as const)[i % 4]}
                      rotation={((i % 5) - 2) * 0.4}
                      className="h-full cursor-pointer"
                    >
                      <div
                        className="space-y-2"
                        onClick={() => handleNodeClick(domain.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                          <h3 className="text-sm font-bold">{domain.name}</h3>
                          <Badge variant="secondary" className="text-xs ml-auto shrink-0">{domain.depth}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{domain.description}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{domain.fileCount.toLocaleString()} files</span>
                          <span>{domain.subdirectories.length} folders</span>
                        </div>
                        {domain.integrations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {domain.integrations.slice(0, 3).map((int) => (
                              <Badge key={int} variant="outline" className="text-xs">{int}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </StickyNote>
                  </motion.div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DOMAIN DETAIL PANEL ── */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="sticky bottom-4 z-20"
          >
            <div className="bg-background/95 backdrop-blur-md border border-border shadow-2xl p-6 max-w-4xl mx-auto max-h-[70vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedData.color }} />
                  <div>
                    <h3 className="text-xl font-bold">{selectedData.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {inventory.categories.find((c) => c.id === selectedData.category)?.label} · {selectedData.depth}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDomain(null)}
                  className="p-1 hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{selectedData.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-secondary/40 p-3 text-center">
                  <div className="text-lg font-bold">{selectedData.fileCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{t("files")}</div>
                </div>
                <div className="bg-secondary/40 p-3 text-center">
                  <div className="text-lg font-bold">{selectedData.subdirectories.length}</div>
                  <div className="text-xs text-muted-foreground">{t("subdirectories")}</div>
                </div>
                <div className="bg-secondary/40 p-3 text-center">
                  <div className="text-lg font-bold">{selectedData.integrations.length}</div>
                  <div className="text-xs text-muted-foreground">{t("integrations")}</div>
                </div>
                <div className="bg-secondary/40 p-3 text-center">
                  <div className="text-lg font-bold">{selectedData.notableArtifacts.length}</div>
                  <div className="text-xs text-muted-foreground">{t("artifacts")}</div>
                </div>
              </div>

              {/* Subdirectories */}
              {selectedData.subdirectories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("subdirectories")}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedData.subdirectories.map((sub) => (
                      <Badge key={sub.name} variant="secondary" className="text-xs">
                        {sub.name} <span className="text-muted-foreground ml-1">({sub.files})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notable Artifacts */}
              {selectedData.notableArtifacts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("notableArtifacts")}</h4>
                  <ul className="text-xs space-y-1">
                    {selectedData.notableArtifacts.map((a, i) => (
                      <li key={i} className="text-muted-foreground flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-primary" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Integrations */}
              {selectedData.integrations.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("integrations")}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedData.integrations.map((int) => (
                      <Badge key={int} variant="default" className="text-xs">{int}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Links */}
              {(selectedData.portfolioUrl || selectedData.portfolioUrl2) && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("portfolio" as any)}</h4>
                  <div className="flex flex-col gap-2">
                    {selectedData.portfolioUrl && (() => {
                      const Icon = getPlatformIcon(selectedData.portfolioUrl);
                      return (
                        <a
                          href={selectedData.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-2 border border-primary/20"
                        >
                          <Icon className="w-4 h-4" />
                          {t("viewPortfolio" as any)}
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {(() => { try { return new URL(selectedData.portfolioUrl).hostname.replace('www.', ''); } catch { return ''; } })()}
                          </span>
                        </a>
                      );
                    })()}
                    {selectedData.portfolioUrl2 && (() => {
                      const Icon = getPlatformIcon(selectedData.portfolioUrl2);
                      return (
                        <a
                          href={selectedData.portfolioUrl2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary/80 hover:text-primary/60 transition-colors bg-muted/50 hover:bg-muted px-3 py-2 border border-border/50"
                        >
                          <Icon className="w-4 h-4" />
                          {t("viewPortfolio" as any)}
                          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {(() => { try { return new URL(selectedData.portfolioUrl2).hostname.replace('www.', ''); } catch { return ''; } })()}
                          </span>
                        </a>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Related Projects */}
              {(() => {
                const relatedCats = atlasToProjectCategories[selectedData.category] || [];
                const relatedProjects = allProjects.filter(p => relatedCats.includes(p.category));
                const featuredProjects = relatedProjects.filter(p => p.featured).slice(0, 3);
                if (relatedProjects.length === 0) return null;
                const catLabels = relatedCats.map(c => categoryMeta[c].label).join(" & ");
                return (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">{t("relatedProjects" as any)}</h4>
                        <p className="text-xs text-muted-foreground">{relatedProjects.length} projects in {catLabels}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/projects">
                          {t("viewProjects" as any)} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                    {featuredProjects.length > 0 && (
                      <div className="space-y-2">
                        {featuredProjects.map(project => (
                          <div key={project.slug} className="bg-muted/30 p-3 border border-border/30">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h5 className="text-sm font-medium leading-tight">{project.name}</h5>
                              {publicDemoUrl(project) && (
                                <a href={publicDemoUrl(project)} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {project.tech.slice(0, 3).map(tech => (
                                <Badge key={tech} variant="outline" className="text-xs px-1.5 py-0">{tech}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CROSS-DOMAIN CONNECTIONS ── */}
      <NotebookSectionHeader
        title={t("crossDomainTitle")}
        subtitle={t("crossDomainSubtitle")}
        className="mt-16"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { domains: ["dev", "ai", "finance"], emoji: "🤖💰", label: t("cross1Label"), desc: t("cross1Desc"), color: "pink" as const },
          { domains: ["dev", "marketing", "sales"], emoji: "🚀📈", label: t("cross2Label"), desc: t("cross2Desc"), color: "yellow" as const },
          { domains: ["design", "dev", "creative"], emoji: "🎨⚡", label: t("cross3Label"), desc: t("cross3Desc"), color: "blue" as const },
          { domains: ["ai", "research", "education"], emoji: "🧠📚", label: t("cross4Label"), desc: t("cross4Desc"), color: "green" as const },
          { domains: ["operations", "strategy", "dev"], emoji: "🏗️🌐", label: t("cross5Label"), desc: t("cross5Desc"), color: "pink" as const },
          { domains: ["health", "ai", "science"], emoji: "💪🔬", label: t("cross6Label"), desc: t("cross6Desc"), color: "yellow" as const },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={reducedMotion ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: i * 0.08 }}
          >
            <StickyNote color={item.color} rotation={((i % 3) - 1) * 1.5} className="p-4 h-full">
              <div className="space-y-2">
                <div className="text-xl">{item.emoji}</div>
                <h3 className="font-bold text-sm">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.domains.map((d) => {
                    const domain = inventory.domains.find((dom) => dom.id === d);
                    return domain ? (
                      <Badge key={d} variant="secondary" className="text-xs">{domain.name}</Badge>
                    ) : null;
                  })}
                </div>
              </div>
            </StickyNote>
          </motion.div>
        ))}
      </div>

      {/* ── Top Integrations ── */}
      <NotebookSectionHeader
        title={t("integrationsTitle")}
        subtitle={t("integrationsSubtitle")}
        className="mt-12"
      />

      <div className="flex flex-wrap justify-center gap-2">
        {stats.topIntegrations.map((integration, i) => (
          <motion.div
            key={integration}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: i * 0.05 }}
          >
            <Badge variant="outline" className="px-3 py-1.5 text-sm">
              {integration}
            </Badge>
          </motion.div>
        ))}
      </div>

      {/* ── CTA ── */}
      <motion.div
        className="text-center py-8"
        initial={reducedMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6 }}
      >
        <h2 className="text-2xl font-[family-name:var(--font-script)] font-bold mb-3">
          {t("ctaTitle")}
        </h2>
        <p className="text-muted-foreground font-[family-name:var(--font-doodle)] mb-6 max-w-2xl mx-auto">
          {t("ctaDesc")}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button asChild>
            <Link href="/about">{t("ctaSkills")}<ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/projects">{t("ctaProjects")}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/contact">{t("ctaContact")}</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
