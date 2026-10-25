"use client";

import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { NotebookSectionHeader } from "@/components/ui/mixed-typography";
import { StickyNote } from "@/components/ui/notebook-elements";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Globe2,
  HeartPulse,
  Laptop,
  Palette,
  Scale,
  type LucideIcon,
} from "lucide-react";
import inventory from "@/content/domain-inventory.json";

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

const categoryIcons: Record<string, LucideIcon> = {
  "tech-engineering": Laptop,
  "business-finance": ChartNoAxesCombined,
  "creative-design": Palette,
  "life-health": HeartPulse,
  "professional": BriefcaseBusiness,
  "legal-governance": Scale,
  "humanities": BookOpen,
  "infrastructure": Globe2,
};

export function KnowledgeAtlasSection() {
  const t = useTranslations("home");
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <ScrollReveal>
      <div className="py-8">
        <NotebookSectionHeader
          title={t("skillsTitle")}
          subtitle={t("skillsSubtitle")}
        />

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {inventory.categories.map((cat, i) => {
            const color = categoryColors[cat.id] || "color-mix(in srgb, var(--foreground) 55%, transparent)";
            const Icon = categoryIcons[cat.id] || BookOpen;
            const domainCount = cat.domains.length;
            const noteColor = (["yellow", "pink", "green", "blue"] as const)[i % 4];

            return (
              <motion.div key={cat.id} variants={itemVariants} transition={reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}>
                <Link href="/atlas">
                  <StickyNote
                    color={noteColor}
                    rotation={((i % 5) - 2) * 0.5}
                    className="h-full cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          className="size-5 shrink-0"
                          style={{ color }}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                        <h3 className="text-sm font-bold leading-tight">{cat.label}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant="secondary"
                          className="text-xs py-0 px-1.5"
                          style={{ borderColor: color, color }}
                        >
                          {domainCount} {domainCount === 1 ? "domain" : "domains"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cat.domains.slice(0, 4).map((d) => {
                          const domain = inventory.domains.find((dom) => dom.id === d);
                          return domain ? (
                            <span key={d} className="text-xs text-muted-foreground">
                              {domain.name}
                            </span>
                          ) : null;
                        })}
                        {cat.domains.length > 4 && (
                          <span className="text-xs text-muted-foreground/60">
                            +{cat.domains.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </StickyNote>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="text-center mt-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/atlas">
              {t("exploreAtlas")}
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </ScrollReveal>
  );
}
