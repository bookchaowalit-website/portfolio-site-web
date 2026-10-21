"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  allProjects,
  problemLaneOrder,
  type AppProject,
  type ProblemLane,
  type ProjectDomain,
  type ProjectStatus,
} from "@/data/app-projects";
import { getActiveProjectDomains, getProjectsForDomain, getProjectDomains, projectDomainMeta } from "@/data/project-domains";
import { MixedTypographyTitle } from "@/components/ui/mixed-typography";
import { laneFrameVariant } from "@/components/lane-icon";
import { SketchyFrame } from "@/components/ui/notebook-elements";
import { totalStars as countRepoStars, type ProjectStars } from "@/data/project-stars";
import {
  ExternalLink,
  Search,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Github,
  ImageOff,
} from "lucide-react";

const PAGE_SIZE = 24;
const FEATURED_LIMIT = 9;
type PageItem = number | "ellipsis";

const statusConfig: Record<
  ProjectStatus,
  { label: string; dot: string; text: string }
> = {
  live: { label: "Live", dot: "bg-foreground", text: "text-foreground" },
  wip: { label: "WIP", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  archived: { label: "Archived", dot: "bg-muted-foreground/50", text: "text-muted-foreground/50" },
};

const evidenceLabelKey: Record<string, string> = {
  Live: "evidence_live",
  Prototype: "evidence_prototype",
  "Internal System": "evidence_internal",
  Experiment: "evidence_experiment",
};

function getFaviconUrl(projectUrl: string): string {
  try {
    const url = new URL(projectUrl);
    return `https://icon.horse/icon/${url.hostname}`;
  } catch {
    return "";
  }
}

function getPaginationItems(totalPages: number, currentPage: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const orderedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const items: PageItem[] = [];

  orderedPages.forEach((page, index) => {
    if (index > 0 && page - orderedPages[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });

  return items;
}

function ProjectCard({
  project,
  stars,
  starsError,
  showScreenshot = false,
}: {
  project: AppProject;
  stars: number;
  starsError?: boolean;
  showScreenshot?: boolean;
}) {
  const t = useTranslations("projects");
  const [imgError, setImgError] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);
  const favicon = getFaviconUrl(project.url);
  const status = statusConfig[project.status];
  const domains = getProjectDomains(project);
  const screenshotUrl = `/api/screenshot?url=${encodeURIComponent(project.url)}`;

  // Generate a unique gray tone from the project name for the placeholder
  const lightness = 0.80 + (project.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 10) * 0.015;

  return (
    <div className="group relative flex h-full flex-col border border-transparent bg-background p-5 transition-colors hover:bg-secondary card-hover-lift">
      <Link
        href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }}
        className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${project.name} — ${t("readCaseStudy")}`}
      />
      {showScreenshot && (
        <SketchyFrame variant={laneFrameVariant[project.problemLane]} className="mb-5 aspect-video overflow-hidden">
          {project.demoUnavailable ? (
            <div
              className="flex h-full flex-col items-center justify-center gap-2 bg-secondary px-5 text-center text-muted-foreground"
              role="img"
              aria-label={t("previewUnavailable")}
            >
              <ImageOff className="size-5" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-wider">{t("previewUnavailable")}</span>
              <span className="max-w-xs text-xs leading-relaxed">{t("internalPreviewNote")}</span>
            </div>
          ) : !screenshotError ? (
            <Image
              src={screenshotUrl}
              alt={`${project.name} live preview`}
              fill
              className="object-cover object-top"
              loading="lazy"
              decoding="async"
              unoptimized
              onError={() => setScreenshotError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `oklch(${lightness} 0 0)` }}
            >
              <span className="px-4 text-center text-xl font-bold font-[family-name:var(--font-doodle)] text-foreground/70">
                {t("previewLoadFailed")}
              </span>
            </div>
          )}
        </SketchyFrame>
      )}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {favicon && !imgError ? (
            <Image
              src={favicon}
              alt=""
              width={16}
              height={16}
              className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
              onError={() => setImgError(true)}
              loading="lazy"
              unoptimized
            />
          ) : null}
          <h3 className="text-sm font-semibold leading-tight group-hover:underline truncate">
            {project.name}
          </h3>
        </div>
        {!project.demoUnavailable && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} — ${t("tryDemo")}`}
            className="relative z-10 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-muted-foreground transition-all hover:-translate-y-0.5 hover:translate-x-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </div>
      {project.promise && (
        <p className="text-xs font-medium text-foreground/90 leading-relaxed mb-1">
          {project.promise}
        </p>
      )}
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        {project.problem ?? project.description}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-y-2 pt-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-muted-foreground/90">
            {domains.map((domain) => t(projectDomainMeta[domain].labelKey)).join(" · ")}
          </span>
          <span className="flex items-center gap-1">
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            <span className={`text-xs font-mono ${status.text}`}>
              {project.evidenceLevel
                ? t(evidenceLabelKey[project.evidenceLevel])
                : t("status_" + project.status)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {stars > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-mono text-muted-foreground/80">
              <Star className="size-2.5" />
              {stars}
            </span>
          )}
          {starsError && stars === 0 && project.githubUrl && !project.sourceUnavailable && (
            <span className="text-xs font-mono text-muted-foreground/60" title="Stars unavailable">
              —
            </span>
          )}
          {project.githubUrl && !project.sourceUnavailable && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center justify-center min-h-[44px] min-w-[44px] h-[44px] w-[44px] text-muted-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${project.name} GitHub repository`}
            >
              <Github className="size-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectsClient({
  initialDomain,
  initialLane,
  initialPage = 1,
  initialSearch = "",
}: {
  initialDomain?: ProjectDomain;
  initialLane?: ProblemLane;
  initialPage?: number;
  initialSearch?: string;
} = {}) {
  const t = useTranslations("projects");
  const startDomain = initialDomain ?? "all";
  const startLane = initialLane ?? "all";
  const startPage = Math.max(1, initialPage);
  const startSearch = initialSearch;
  const pathname = usePathname();
  const [activeDomain] = useState<ProjectDomain | "all">(startDomain);
  const [activeLane, setActiveLane] = useState<ProblemLane | "all">(startLane);
  const [search, setSearch] = useState(startSearch);
  const [page, setPage] = useState(startPage);
  const [starsMap, setStarsMap] = useState<Record<string, number>>({});
  const [totalStars, setTotalStars] = useState(0);
  const [starsError, setStarsError] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const activeDomains = getActiveProjectDomains();

  const replaceQuery = useCallback((nextPage: number, nextSearch: string, nextLane?: ProblemLane | "all") => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const normalizedSearch = nextSearch.trim();
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    } else {
      params.delete("page");
    }
    if (normalizedSearch) {
      params.set("q", normalizedSearch);
    } else {
      params.delete("q");
    }
    if (nextLane !== undefined) {
      if (nextLane === "all") {
        params.delete("focus");
      } else {
        params.set("focus", nextLane);
      }
    }

    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, []);

  useEffect(() => {
    setActiveLane(startLane);
    setPage(startPage);
    setSearch(startSearch);
  }, [startLane, startPage, startSearch]);

  // Fetch GitHub stars
  useEffect(() => {
    fetch("/api/github-stars")
      .then((r) => r.json())
      .then((data: ProjectStars[]) => {
        const map: Record<string, number> = {};
        for (const d of data) {
          map[d.slug] = d.stars;
        }
        setStarsMap(map);
        setTotalStars(countRepoStars(data));
      })
      .catch((err) => {
        console.error('Failed to fetch GitHub stars:', err);
        setStarsError(true);
      });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" to focus search
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setSearch("");
        setPage(1);
        replaceQuery(1, "");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [replaceQuery]);

  // Featured projects
  const featuredProjects = useMemo(
    () =>
      allProjects
        .filter((p) => p.featured)
        .sort((a, b) => (a.featuredRank ?? Number.MAX_SAFE_INTEGER) - (b.featuredRank ?? Number.MAX_SAFE_INTEGER))
        .slice(0, FEATURED_LIMIT),
    []
  );
  const featuredSlugs = useMemo(
    () => new Set(featuredProjects.map((project) => project.slug)),
    [featuredProjects]
  );

  const scopedProjects = useMemo(
    () => activeDomain === "all"
      ? allProjects
      : allProjects.filter((project) => getProjectDomains(project).includes(activeDomain)),
    [activeDomain]
  );

  const focusScopedProjects = useMemo(
    () => activeLane === "all"
      ? scopedProjects
      : scopedProjects.filter((project) => project.problemLane === activeLane),
    [activeLane, scopedProjects]
  );

  // Stats
  const stats = useMemo(() => {
    const live = focusScopedProjects.filter((p) => p.status === "live").length;
    const wip = focusScopedProjects.filter((p) => p.status === "wip").length;
    const archived = focusScopedProjects.filter((p) => p.status === "archived").length;
    return { live, wip, archived };
  }, [focusScopedProjects]);

  const hasFeaturedSection = activeDomain === "all" && activeLane === "all" && !search.trim();

  // Filtered projects
  const filtered = useMemo(() => {
    let list = focusScopedProjects;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tech.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [focusScopedProjects, search]);

  const projectsToDisplay = useMemo(
    () => (hasFeaturedSection ? filtered.filter((project) => !featuredSlugs.has(project.slug)) : filtered),
    [featuredSlugs, filtered, hasFeaturedSection]
  );
  const pageCount = Math.max(1, Math.ceil(projectsToDisplay.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const showFeatured = hasFeaturedSection && currentPage === 1;
  const visible = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return projectsToDisplay.slice(start, start + PAGE_SIZE);
  }, [currentPage, projectsToDisplay]);
  const paginationItems = useMemo(
    () => getPaginationItems(pageCount, currentPage),
    [currentPage, pageCount],
  );
  const isEmptyDomain = activeDomain !== "all" && scopedProjects.length === 0 && !search.trim();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    replaceQuery(1, value);
  }, [replaceQuery]);

  const handleClearFilters = useCallback(() => {
    setActiveLane("all");
    setSearch("");
    setPage(1);
    replaceQuery(1, "", "all");
  }, [replaceQuery]);

  const pageHref = useCallback((targetPage: number) => {
    const params = new URLSearchParams();
    const normalizedSearch = search.trim();
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    }
    if (normalizedSearch) {
      params.set("q", normalizedSearch);
    }
    if (activeLane !== "all") {
      params.set("focus", activeLane);
    }
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [activeLane, pathname, search]);

  const focusHref = useCallback((lane: ProblemLane | "all") => {
    const params = new URLSearchParams();
    const normalizedSearch = search.trim();
    if (normalizedSearch) {
      params.set("q", normalizedSearch);
    }
    if (lane !== "all") {
      params.set("focus", lane);
    }
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, search]);

  const domainLabel = activeDomain === "all" ? "" : t(projectDomainMeta[activeDomain].labelKey);
  const focusLabel = activeLane === "all" ? "" : t(`focus_${activeLane}`);
  const domainProjectCount = focusScopedProjects.length;
  const displayedStars = activeDomain === "all"
    ? (activeLane === "all" ? totalStars : focusScopedProjects.reduce((sum, project) => sum + (starsMap[project.slug] ?? 0), 0))
    : focusScopedProjects.reduce((sum, project) => sum + (starsMap[project.slug] ?? 0), 0);

  return (
    <div className="w-full space-y-10 pb-12 pt-8">
      {/* Header */}
      <div className="py-8">
        <div className="text-center space-y-4">
          <MixedTypographyTitle
            as="h1"
            words={activeDomain === "all"
              ? [
                { text: t("titleWord1"), style: "cursive", size: "xl" },
                { text: t("titleWord2"), style: "filled", size: "xl" },
              ]
              : [
                { text: domainLabel, style: "cursive", size: "lg" },
                { text: t("titleWord2"), style: "filled", size: "lg" },
              ]}
            className="mb-4"
          />
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            {activeDomain === "all"
              ? t("subtitle", { count: focusScopedProjects.length })
              : t("domainSubtitle", { count: domainProjectCount, domain: domainLabel })}
            {activeLane !== "all" && (
              <span className="block mt-1 text-xs font-mono uppercase tracking-wider text-foreground/70">
                {t("focusLabel", { focus: focusLabel })}
              </span>
            )}
          </p>
        </div>

        {/* Stats Banner — uses the same gap-px grid language */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 max-w-lg mx-auto mt-8 gap-px bg-border">
          <div className="bg-background flex flex-col items-center py-3 px-2">
            <span className="text-lg font-bold tabular-nums">{scopedProjects.length}</span>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("statTotal")}</span>
          </div>
          <div className="bg-background flex flex-col items-center py-3 px-2">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-foreground" />
              <span className="text-lg font-bold tabular-nums">{stats.live}</span>
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("statLive")}</span>
          </div>
          <div className="bg-background flex flex-col items-center py-3 px-2">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              <span className="text-lg font-bold tabular-nums">{stats.wip}</span>
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("statWip")}</span>
          </div>
          <div className="bg-background flex flex-col items-center py-3 px-2">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
              <span className="text-lg font-bold tabular-nums">{stats.archived}</span>
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("statArchived")}</span>
          </div>
          <div className="bg-background flex flex-col items-center py-3 px-2 col-span-2 sm:col-span-1">
            <span className="flex items-center gap-1.5">
              <Star className="size-3.5 text-muted-foreground" />
              <span className="text-lg font-bold tabular-nums">{starsError ? '—' : displayedStars}</span>
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("statStars")}</span>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-lg text-center text-xs leading-relaxed text-muted-foreground">
          {t("statusNote")}
        </p>
      </div>

      {/* Domain navigation — the portfolio's only browse dimension */}
      <div className="py-4">
        <p className="text-center text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
          {t("browseByDomain")}
        </p>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t("browseByDomain")}>
          {activeDomains.map((domain) => {
            const isActive = activeDomain === domain;
            const label = t(projectDomainMeta[domain].labelKey);
            const count = getProjectsForDomain(domain).length;
            return (
              <Link
                key={domain}
                href={{ pathname: "/projects/domains/[domain]", params: { domain } }}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                {label}
                <span className={`text-xs tabular-nums ${isActive ? "opacity-60" : "text-muted-foreground"}`}>{count}</span>
              </Link>
            );
          })}
        </div>
        {activeDomain === "all" && (
          <div className="mt-4 text-center">
            <Link
              href="/projects/domains"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("exploreAllDomains")}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      {/* Visitor-facing problem lanes */}
      <div className="py-4">
        <p className="text-center text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
          {t("browseByFocus")}
        </p>
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t("browseByFocus")}>
          <NextLink
            href={focusHref("all")}
            aria-current={activeLane === "all" ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeLane === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-muted"
            }`}
          >
            {t("focusAll")}
          </NextLink>
          {problemLaneOrder.map((lane) => {
            const isActive = activeLane === lane;
            const count = scopedProjects.filter((project) => project.problemLane === lane).length;
            return (
              <NextLink
                key={lane}
                href={focusHref(lane)}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                {t(`focus_${lane}`)}
                <span className={`text-xs tabular-nums ${isActive ? "opacity-60" : "text-muted-foreground"}`}>{count}</span>
              </NextLink>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="py-8 space-y-4">
        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              aria-label={t("searchLabel")}
              aria-keyshortcuts="/"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary text-foreground placeholder:text-muted-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      {showFeatured && (
        <div className="py-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Star className="size-3.5 text-foreground" />
            {t("featured")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                stars={starsMap[project.slug] ?? 0}
                starsError={starsError}
                showScreenshot={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Project Grid Section */}
      <div className="py-8">
        {/* Results count */}
        <div className="mb-6">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider" aria-live="polite" aria-atomic="true">
            {projectsToDisplay.length} {projectsToDisplay.length === 1 ? t("singleProject") : t("pluralProjects")}
            {activeDomain !== "all" && ` ${t("inDomain")} ${domainLabel}`}
            {activeLane !== "all" && ` ${t("inFocus")} ${focusLabel}`}
            {search && ` ${t("matchingSearch")} "${search}"`}
            {pageCount > 1 && ` · ${t("pageStatus", { page: currentPage, total: pageCount })}`}
          </p>
        </div>

        {isEmptyDomain ? (
          <div className="border border-dashed border-border px-6 py-16 text-center">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {t("domainNoProjects")}
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              {t("domainEmptyTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("domainEmptyDescription")}
            </p>
            <Link
              href="/projects/domains"
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("exploreAllDomains")}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
            {visible.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                stars={starsMap[project.slug] ?? 0}
                starsError={starsError}
                showScreenshot={false}
              />
            ))}
          </div>
        )}

        {pageCount > 1 && !isEmptyDomain && (
          <nav aria-label={t("paginationLabel")} className="mt-10 flex flex-wrap items-center justify-center gap-1">
            {currentPage > 1 ? (
              <NextLink
                href={pageHref(currentPage - 1)}
                aria-label={t("previousPage")}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </NextLink>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground/40"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </span>
            )}

            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="inline-flex min-h-11 min-w-7 items-center justify-center text-sm text-muted-foreground" aria-hidden="true">
                  …
                </span>
              ) : (
                <NextLink
                  key={item}
                  href={pageHref(item)}
                  aria-current={item === currentPage ? "page" : undefined}
                  aria-label={t("page", { page: item })}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    item === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item}
                </NextLink>
              ),
            )}

            {currentPage < pageCount ? (
              <NextLink
                href={pageHref(currentPage + 1)}
                aria-label={t("nextPage")}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </NextLink>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground/40"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </span>
            )}
          </nav>
        )}

        {/* Empty state */}
        {filtered.length === 0 && !isEmptyDomain && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">{t("noProjectsFound")}</p>
            <button
              onClick={handleClearFilters}
              className="mt-4 text-sm underline underline-offset-4 text-foreground hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("clearFilters")}
            </button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="py-8">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("footerDescription")}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/atlas"
              className="inline-flex items-center px-6 py-2.5 text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              {t("exploreAtlas")}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-2.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("getInTouch")}
            </Link>
            <a
              href="https://github.com/bookchaowalit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="size-3.5" />
              {t("github")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
