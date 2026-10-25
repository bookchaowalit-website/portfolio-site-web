"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import inventory from "@/content/domain-inventory.json";

interface DomainNode {
  id: string;
  name: string;
  category: string;
  fileCount: number;
  depth: string;
  x: number;
  y: number;
  radius: number;
  color: string;
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

function computeLayout(domains: typeof inventory.domains, width: number, height: number): DomainNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const categories = inventory.categories;
  const catCount = categories.length;
  const maxFiles = Math.max(...domains.map((d) => d.fileCount));

  // Place category centroids in a circle
  const catPositions: Record<string, { x: number; y: number }> = {};
  categories.forEach((cat, i) => {
    const angle = (2 * Math.PI * i) / catCount - Math.PI / 2;
    const rx = width * 0.32;
    const ry = height * 0.32;
    catPositions[cat.id] = {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });

  // Place domains around their category centroid
  const nodes: DomainNode[] = [];
  categories.forEach((cat) => {
    const catDomains = domains.filter((d) => d.category === cat.id);
    const centroid = catPositions[cat.id];
    const spread = Math.min(width, height) * 0.14;

    catDomains.forEach((domain, j) => {
      const angle = (2 * Math.PI * j) / catDomains.length;
      // Scale radius by file count (log scale for visual balance)
      const dist = catDomains.length === 1 ? 0 : spread * (0.4 + 0.6 * (j / catDomains.length));
      const nodeRadius = 6 + 18 * Math.log(1 + domain.fileCount) / Math.log(1 + maxFiles);

      nodes.push({
        id: domain.id,
        name: domain.name,
        category: cat.id,
        fileCount: domain.fileCount,
        depth: domain.depth,
        x: centroid.x + dist * Math.cos(angle),
        y: centroid.y + dist * Math.sin(angle),
        radius: nodeRadius,
        color: categoryColors[cat.id] || "color-mix(in srgb, var(--foreground) 55%, transparent)",
      });
    });
  });

  return nodes;
}

export function DomainMap() {
  const t = useTranslations("domainMap");
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const svgWidth = isMobile ? 360 : 700;
  const svgHeight = isMobile ? 360 : 500;

  const nodes = useMemo(
    () => computeLayout(inventory.domains, svgWidth, svgHeight),
    [svgWidth, svgHeight]
  );

  // Build edges: connect domains within the same category
  const edges = useMemo(() => {
    const result: { from: DomainNode; to: DomainNode; color: string }[] = [];
    inventory.categories.forEach((cat) => {
      const catNodes = nodes.filter((n) => n.category === cat.id);
      // Connect each node to the next (ring within category)
      for (let i = 0; i < catNodes.length; i++) {
        const next = (i + 1) % catNodes.length;
        if (catNodes.length > 1) {
          result.push({
            from: catNodes[i],
            to: catNodes[next],
            color: categoryColors[cat.id] || "color-mix(in srgb, var(--foreground) 55%, transparent)",
          });
        }
      }
    });
    return result;
  }, [nodes]);

  const hoveredData = hoveredNode ? nodes.find((n) => n.id === hoveredNode) : null;

  return (
    <div ref={ref} className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-[family-name:var(--font-script)] font-bold text-foreground mb-2">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground font-[family-name:var(--font-doodle)] max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* SVG Graph */}
      <div className="relative flex justify-center">
        <motion.svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[700px]"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.8 }}
        >
          {/* Edges */}
          <g opacity={0.15}>
            {edges.map((edge, i) => (
              <line
                key={i}
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                stroke={edge.color}
                strokeWidth={1}
              />
            ))}
          </g>

          {/* Nodes */}
          {nodes.map((node, i) => {
            const isHovered = hoveredNode === node.id;
            return (
              <g
                key={node.id}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? node.radius * 1.3 : node.radius}
                  fill={node.color}
                  fillOpacity={isHovered ? 0.9 : 0.6}
                  stroke={node.color}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={0.8}
                  initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: 0.4, delay: Math.min(i * 0.02, 0.8) }
                  }
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                />
                {/* Label for larger nodes or hovered */}
                {(node.radius > 14 || isHovered) && (
                  <text
                    x={node.x}
                    y={node.y + node.radius + 12}
                    textAnchor="middle"
                    aria-hidden="true"
                    className="text-[9px] fill-foreground pointer-events-none select-none"
                    opacity={isHovered ? 1 : 0.7}
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </motion.svg>

        {/* Tooltip */}
        {hoveredData && (
          <motion.div
            className="absolute top-4 right-4 bg-background border border-border shadow-lg p-3 z-10 max-w-[200px]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: hoveredData.color }}
              />
              <span className="text-sm font-semibold">{hoveredData.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {hoveredData.fileCount.toLocaleString()} {t("files")}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {hoveredData.depth}
            </p>
          </motion.div>
        )}
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {inventory.categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: categoryColors[cat.id] }}
            />
            <span className="text-xs text-muted-foreground">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-6">
        <Link
          href="/atlas"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
        >
          {t("exploreAtlas")}
        </Link>
      </div>
    </div>
  );
}
