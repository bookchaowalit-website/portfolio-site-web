"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  allProjects,
  type AppProject,
} from "@/data/app-projects";
import { getProjectDomains, projectDomainMeta } from "@/data/project-domains";
import { statusConfig } from "./status-config";
import { SketchArrow } from "@/components/ui/notebook-elements";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  Star,
  Monitor,
  ImageOff,
  Target,
  Lightbulb,
  TrendingUp,
  FileText,
} from "lucide-react";

type RelatedBlogPost = { slug: string; title: string; excerpt: string };

const statusLabelKey = {
  live: "status_live",
  wip: "status_wip",
  archived: "status_archived",
} as const;

const evidenceLabelKey = {
  Live: "evidence_live",
  Prototype: "evidence_prototype",
  "Internal System": "evidence_internal",
  Experiment: "evidence_experiment",
} as const;

const evidenceDescriptionKey = {
  Live: "evidenceDescription_live",
  Prototype: "evidenceDescription_prototype",
  "Internal System": "evidenceDescription_internal",
  Experiment: "evidenceDescription_experiment",
} as const;

export function ProjectDetailClient({ project, relatedBlogPosts = [] }: { project: AppProject; relatedBlogPosts?: RelatedBlogPost[] }) {
  const t = useTranslations("projectDetail");
  const [stars, setStars] = useState(0);
  const [starsError, setStarsError] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const tProjects = useTranslations("projects");

  useEffect(() => {
    fetch("/api/github-stars")
      .then((r) => r.json())
      .then((data: { slug: string; stars: number }[]) => {
        const found = data.find((d) => d.slug === project.slug);
        if (found) setStars(found.stars);
      })
      .catch((err) => {
        console.error('Failed to fetch GitHub stars:', err);
        setStarsError(true);
      });
  }, [project.slug]);

  const status = statusConfig[project.status];
  const domains = getProjectDomains(project).map((domain) => tProjects(projectDomainMeta[domain].labelKey));
  const primaryDomain = getProjectDomains(project)[0] ?? "book-dev";
  const screenshotUrl = `/api/screenshot?url=${encodeURIComponent(project.url)}`;

  // Prev/next navigation within the same workspace
  const domainProjects = allProjects.filter(
    (p) => getProjectDomains(p).includes(primaryDomain)
  );
  const currentIndex = domainProjects.findIndex(
    (p) => p.slug === project.slug
  );
  const prevProject =
    currentIndex > 0 ? domainProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < domainProjects.length - 1
      ? domainProjects[currentIndex + 1]
      : null;

  // Related work prioritises the same problem lane and category instead of
  // simply taking the first four records in the catalog.
  const catalogOrder = new Map(domainProjects.map((candidate, index) => [candidate.slug, index]));
  const relatedScore = (candidate: AppProject) =>
    (candidate.problemLane === project.problemLane ? 3 : 0) +
    (candidate.category === project.category ? 2 : 0);
  const relatedProjects = domainProjects
    .filter((p) => p.slug !== project.slug)
    .sort((a, b) =>
      relatedScore(b) - relatedScore(a) ||
      (catalogOrder.get(a.slug) ?? 0) - (catalogOrder.get(b.slug) ?? 0)
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Screenshot hero — full bleed */}
      <div className="relative w-full aspect-[21/9] min-h-48 bg-secondary overflow-hidden">
        {project.demoUnavailable ? (
          <div
            className="relative flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
            role="img"
            aria-label={t("previewUnavailable")}
          >
            <div className="absolute inset-6 border border-dashed border-border" aria-hidden="true" />
            <ImageOff className="size-8 relative" aria-hidden="true" />
            <span className="text-sm relative max-w-md px-10 text-center">{t("previewUnavailable")}</span>
          </div>
        ) : !screenshotError ? (
          <Image
            src={screenshotUrl}
            alt={`${project.name} live preview`}
            fill
            className="w-full h-full object-cover object-top"
            priority
            decoding="async"
            sizes="100vw"
            unoptimized
            onError={() => setScreenshotError(true)}
          />
        ) : (
          <div
            className="relative w-full h-full flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
            role="img"
            aria-label={t("screenshotUnavailable")}
          >
            <div className="absolute inset-6 border border-dashed border-border" aria-hidden="true" />
            <ImageOff className="size-8 relative" aria-hidden="true" />
            <span className="text-sm relative">{t("screenshotUnavailable")}</span>
          </div>
        )}
        {/* Gradient fade into page background */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-3xl -mt-8 relative">
        {/* Back link */}
        <Link
          href="/projects"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" />
          {t("backToProjects")}
        </Link>

        {/* Title block */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-balance">
          {project.name}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-2xl">
          {project.promise ?? project.description}
        </p>
        {project.problem && (
          <p className="text-sm text-foreground/80 leading-relaxed mb-8 max-w-2xl border-l-2 border-border pl-4">
            {project.problem}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm mb-10">
          <span className="text-xs text-muted-foreground">{domains.join(" · ")}</span>
          <span className="text-muted-foreground/40">|</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${status.dot}`}
              aria-hidden="true"
            />
            <span className={status.text}>{tProjects(statusLabelKey[project.status])}</span>
          </span>
          {project.evidenceLevel && (
            <>
              <span className="text-muted-foreground/40">|</span>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t("evidence")}: {tProjects(evidenceLabelKey[project.evidenceLevel])}
              </span>
            </>
          )}
          {(stars > 0 || starsError) && (
            <>
              <span className="text-muted-foreground/40">|</span>
              <span className="flex items-center gap-1">
                <Star className="size-3.5 text-muted-foreground" />
                {starsError && stars === 0 ? '—' : stars}
              </span>
            </>
          )}
          <span className="text-muted-foreground/40">|</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Monitor className="size-3.5" />
            <span className="font-mono text-xs">{project.tech.join(", ")}</span>
          </span>
        </div>

        {project.evidenceLevel && (
          <p className="-mt-6 mb-8 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {tProjects(evidenceDescriptionKey[project.evidenceLevel])}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-border mb-10" />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-16">
          {project.demoUnavailable ? (
            <span
              className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
              title={t("demoUnavailable")}
            >
              <ExternalLink className="size-4" />
              {t("demoUnavailable")}
            </span>
          ) : (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="size-4" />
              {t("visitProject")}
            </a>
          )}
          {project.githubUrl && !project.sourceUnavailable && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Github className="size-4" />
              {t("viewSource")}
            </a>
          )}
        </div>

        {/* Case Study Section */}
        {project.caseStudy && (
          <>
            <div className="h-px bg-border mb-10" />
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Target className="size-6" />
                {t("caseStudy")}
              </h2>
              <div className="space-y-6">
                {/* Before / After comparison */}
                {(project.caseStudy.challenge || project.caseStudy.result) && (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                    {project.caseStudy.challenge && (
                      <div className="border border-border p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                          <Lightbulb className="size-4" />
                          {t("before")}
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {project.caseStudy.challenge}
                        </p>
                      </div>
                    )}
                    {project.caseStudy.challenge && project.caseStudy.result && (
                      <div className="flex items-center justify-center">
                        <SketchArrow direction="down" className="md:hidden" />
                        <SketchArrow direction="right" className="hidden md:block" />
                      </div>
                    )}
                    {project.caseStudy.result && (
                      <div className="border border-border p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                          <TrendingUp className="size-4" />
                          {t("after")}
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {project.caseStudy.result}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {project.caseStudy.solution && (
                  <div className="border border-border p-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-foreground">
                      <Target className="size-4" />
                      {t("solution")}
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {project.caseStudy.solution}
                    </p>
                  </div>
                )}
                {project.caseStudy.tradeoff && (
                  <div className="border border-border p-6">
                    <h3 className="font-semibold mb-2 text-muted-foreground">
                      {t("tradeoffs")}
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {project.caseStudy.tradeoff}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Related Blog Posts Section */}
        {relatedBlogPosts.length > 0 && (
          <>
            <div className="h-px bg-border mb-10" />
            <section className="mb-16">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <FileText className="size-5" />
                {t("relatedPosts")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t("relatedPostsDesc")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedBlogPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={{pathname: '/blog/[slug]', params: {slug: post.slug}}}
                    className="group border border-border p-4 hover:border-foreground/40 transition-colors"
                  >
                    <h3 className="font-medium group-hover:underline mb-1 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Related Projects Section */}
        {relatedProjects.length > 0 && (
          <>
            <div className="h-px bg-border mb-10" />
            <section className="mb-16">
              <h2 className="text-xl font-bold mb-2">
                {t("relatedProjects")}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t("moreInDomain", { domain: domains.join(" · ") })}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedProjects.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={{pathname: '/projects/[slug]', params: {slug: rp.slug}}}
                    className="group border border-border p-4 hover:border-foreground/40 transition-colors"
                  >
                    <h3 className="font-medium group-hover:underline mb-1">
                      {rp.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {rp.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {rp.tech.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-0.5 border border-border bg-muted text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Prev / Next navigation */}
        <nav
          className="flex justify-between gap-4 py-6 border-t border-border"
          aria-label="Project navigation"
        >
          {prevProject ? (
            <Link
              href={{pathname: '/projects/[slug]', params: {slug: prevProject.slug}}}
              className="group flex min-h-11 flex-col justify-center gap-1 min-w-0 max-w-[45%] text-left"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowLeft className="size-3" /> {t("previous")}
              </span>
              <span className="text-sm font-medium truncate group-hover:underline">
                {prevProject.name}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextProject ? (
            <Link
              href={{pathname: '/projects/[slug]', params: {slug: nextProject.slug}}}
              className="group flex min-h-11 flex-col justify-center gap-1 min-w-0 max-w-[45%] text-right ml-auto"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                {t("next")} <ArrowRight className="size-3" />
              </span>
              <span className="text-sm font-medium truncate group-hover:underline">
                {nextProject.name}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </div>

      {/* Bottom spacing */}
      <div className="h-16" />
    </div>
  );
}
