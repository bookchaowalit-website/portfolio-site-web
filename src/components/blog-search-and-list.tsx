"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Search, X, Filter } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { NotebookBlogList } from "@/components/notebook-blog-list";
import { Link } from "@/i18n/routing";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
};

export function BlogSearchAndList({
  allPosts,
}: {
  allPosts: BlogPost[];
}) {
  const t = useTranslations("blog");
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allPosts.forEach((p) => p.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [allPosts]);

  // Filter posts by search query + active tag
  const { featuredPosts, recentPosts } = useMemo(() => {
    let filtered = allPosts;

    // Filter by tag
    if (activeTag) {
      filtered = filtered.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      );
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return {
      featuredPosts: filtered.filter((p) => p.featured),
      recentPosts: filtered.filter((p) => !p.featured),
    };
  }, [allPosts, query, activeTag]);

  const hasActiveFilters = query.trim() !== "" || activeTag !== null;

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <motion.div
        className="max-w-md mx-auto mb-6"
        initial={reducedMotion ? false : { y: 20 }}
        animate={{ y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.6 }}
      >
        <div className="bg-muted border border-border p-2 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border-0 focus:ring-0 font-[family-name:var(--font-doodle)] bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] h-[44px] w-[44px] hover:bg-muted-foreground/10 rounded transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <motion.div
          className="flex flex-wrap justify-center gap-2"
          initial={false}
          animate={false}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.8 }}
        >
          <button
            onClick={() => setActiveTag(null)}
            className={`font-[family-name:var(--font-doodle)] text-xs px-3 py-1.5 border transition-all ${
              activeTag === null
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="inline-block h-3 w-3 mr-1" />
            {t("allTags")}
          </button>
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={{pathname: '/blog/tags/[tag]', params: {tag: tag.toLowerCase().replace(/[\/\s]+/g, '-')}}}
              className={`font-[family-name:var(--font-doodle)] text-xs px-3 py-1.5 border transition-all inline-block ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              #{tag}
            </Link>
          ))}
        </motion.div>
      )}

      {/* Results count when filtering */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-[family-name:var(--font-doodle)] text-sm text-muted-foreground">
              {featuredPosts.length + recentPosts.length === 0
                ? t("noResults")
                : t("showingResults", {
                    count: featuredPosts.length + recentPosts.length,
                  })}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="ml-2 text-primary hover:underline"
                >
                  {t("clearTag")}
                </button>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog posts list */}
      <NotebookBlogList
        featuredPosts={featuredPosts}
        recentPosts={recentPosts}
      />
    </div>
  );
}
