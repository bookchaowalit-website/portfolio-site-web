"use client";

import { useTranslations } from "next-intl";
import type { AppProject } from "@/data/app-projects";
import { badgeClass, projectBadge } from "@/lib/project-badge";

/** Evidence badge shared by the Featured cards, the preview modal and the /projects grid. */
export function ProjectStatusBadge({ project, className = "" }: { project: AppProject; className?: string }) {
  const t = useTranslations("projects");
  const badge = projectBadge(project);
  return (
    <span
      data-badge={badge.variant}
      className={`inline-flex shrink-0 items-center whitespace-nowrap px-1.5 py-0.5 font-mono text-xs uppercase tracking-wider ${badgeClass[badge.variant]} ${className}`}
    >
      {t(badge.labelKey)}
    </span>
  );
}
