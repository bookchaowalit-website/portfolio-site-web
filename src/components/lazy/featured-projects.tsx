"use client";

import { useState } from "react";
import { allProjects, categoryMeta, type AppProject } from "@/data/app-projects";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { projectDemoState } from "@/lib/project-badge";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowUpRight, ExternalLink, Github, X, Globe } from "lucide-react";
import { StickyNote } from "@/components/ui/notebook-elements";
import { MixedTypographyTitle } from "@/components/ui/mixed-typography";

const stickyColors = ["yellow", "pink", "green", "blue"] as const;
const rotations = [-1.5, 1, -0.5, 1.5, -1, 0.5];

// Sticky notes sit on oklch 0.89–0.95 (light) and 0.22–0.28 (dark). Solid
// #161616 / #595959 text keeps every label at 4.5:1 or more on all of them
// (2026-11-18 UX review: 10px text-foreground/70 labels fell short).
const INK = "text-[#161616] dark:text-[#ededed]";
const INK_MUTED = "text-[#595959] dark:text-[#b4b4b4]";

function ProjectPreviewModal({
  project,
  onClose,
}: {
  project: AppProject;
  onClose: () => void;
}) {
  const t = useTranslations("projects");
  const hasCaseStudy = Boolean(project.caseStudy);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} ${t("preview")}`}
    >
      <div
        className="bg-background border border-border max-w-lg w-full p-6 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 min-h-[44px] min-w-[44px] h-[44px] w-[44px] inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("closePreview")}
        >
          <X className="size-4" />
        </button>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold">{project.name}</h3>
            <ProjectStatusBadge project={project} />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description}
          </p>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {t("techStack")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 bg-muted text-foreground border border-border"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wider font-medium">{t("category")}:</span>
            <span>{categoryMeta[project.category].label}</span>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            {!project.demoUnavailable && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Globe className="size-3.5" />
                {t("liveDemo")}
                <ExternalLink className="size-3" />
              </a>
            )}
            {!project.sourceUnavailable && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border text-foreground hover:bg-muted transition-colors"
              >
                <Github className="size-3.5" />
                {t("sourceCode")}
              </a>
            )}
            {hasCaseStudy && (
              <Link
                href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors"
              >
                {t("readCaseStudy")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedCardAction({ project }: { project: AppProject }) {
  const t = useTranslations("projects");
  const state = projectDemoState(project);
  const iconLink = `inline-flex min-h-11 min-w-11 items-center justify-center gap-1 text-xs uppercase tracking-wider hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${INK}`;
  if (state === "demo") {
    return (
      <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${t("liveDemo")} — ${project.name}`} className={iconLink}>
        {t("liveDemo")}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </a>
    );
  }
  if (project.githubUrl && !project.sourceUnavailable) {
    return (
      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t("sourceCode")} — ${project.name}`} className={iconLink}>
        <Github className="size-4" aria-hidden="true" />
        {t("sourceCode")}
      </a>
    );
  }
  const label = state === "offline" ? t("demoOffline") : state === "retired" ? t("demoRetired") : t("sourceOnly");
  return <span className={`inline-flex min-h-11 items-center text-xs uppercase tracking-wider ${INK_MUTED}`}>{label}</span>;
}

export function FeaturedProjects() {
  const t = useTranslations("home");
  const tProjects = useTranslations("projects");
  const [preview, setPreview] = useState<AppProject | null>(null);

  const featured = allProjects
    .filter((p) => p.featuredRank != null)
    .sort((a, b) => (a.featuredRank ?? 0) - (b.featuredRank ?? 0));

  return (
    <section className="space-y-8">
      <div className="text-center">
        <MixedTypographyTitle as="h2"
          words={[
            { text: tProjects("featuredWord1"), style: "cursive", size: "lg" },
            { text: tProjects("featuredWord2"), style: "filled", size: "lg" },
          ]}
          className="mb-2"
        />
      </div>

      {featured.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">{tProjects("featuredEmpty")}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:[&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
        {featured.map((project, index) => (
          <StickyNote
            key={project.slug}
            color={stickyColors[index % 4]}
            rotation={rotations[index % rotations.length]}
            className="h-full flex flex-col"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between gap-2 mb-2">
                {project.promise ? (
                  <Link
                    href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }}
                    className="inline-block py-1 text-sm font-bold leading-tight hover:underline"
                  >
                    {project.name}
                  </Link>
                ) : (
                  <h3 className="text-sm font-bold leading-tight">
                    {project.name}
                  </h3>
                )}
                <ProjectStatusBadge project={project} />
              </div>

              {project.promise && (
                <p className={`text-sm font-medium leading-relaxed mb-1 ${INK}`}>
                  {project.promise}
                </p>
              )}

              <p className={`text-sm leading-relaxed mb-3 flex-1 ${INK_MUTED}`}>
                {project.problem ?? project.description}
              </p>

              <ul className="flex flex-wrap gap-1 mb-3" aria-label={tProjects("techStack")}>
                {project.tech.slice(0, 3).map((tech) => (
                  <li
                    key={tech}
                    className={`text-xs px-1.5 py-0.5 border border-[#595959]/40 ${INK}`}
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              {/* Every footer has the same two slots and height: the case study
                  (or preview) on the left; the demo, the source, or a plain
                  Offline / Source only label on the right. */}
              <div className="mt-auto flex min-h-11 items-center justify-between gap-2 pt-2 border-t border-[#595959]/30">
                {project.promise ? (
                  <Link
                    href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }}
                    className={`inline-flex min-h-11 items-center text-xs uppercase tracking-wider underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${INK}`}
                  >
                    {tProjects("readCaseStudy")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPreview(project)}
                    className={`inline-flex min-h-11 items-center text-xs uppercase tracking-wider underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${INK}`}
                    aria-label={`${tProjects("preview")} ${project.name}`}
                  >
                    {tProjects("preview")}
                  </button>
                )}
                <FeaturedCardAction project={project} />
              </div>
            </div>
          </StickyNote>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/projects"
          className="inline-flex items-center px-6 py-2.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t("viewAllProjects")}
        </Link>
      </div>

      {preview && (
        <ProjectPreviewModal
          project={preview}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}
