"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Pencil, Star } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useTranslations } from "next-intl";

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

function NotebookPostEntry({
  post,
  index,
  featured = false,
}: {
  post: BlogPost;
  index: number;
  featured?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const t = useTranslations('blog');
  const date = new Date(post.publishedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.article
      className={`group relative ${featured ? "col-span-1 md:col-span-2" : ""}`}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: index * 0.08 }}
    >
      {/* Notebook entry container */}
      <div className="relative bg-background border border-border overflow-hidden hover:border-primary/30 transition-colors">
        {/* Notebook lines background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px bg-border/50"
              style={{ top: `${(i + 1) * 8}%` }}
            />
          ))}
          {/* Margin line */}
          <div className="absolute left-10 top-0 bottom-0 w-px bg-border/60" />
          {/* Three-ring holes */}
          <div className="absolute left-3 top-[20%] w-2.5 h-2.5 rounded-full bg-muted shadow-inner" />
          <div className="absolute left-3 top-[50%] w-2.5 h-2.5 rounded-full bg-muted shadow-inner" />
          <div className="absolute left-3 top-[80%] w-2.5 h-2.5 rounded-full bg-muted shadow-inner" />
        </div>

        <div className="relative z-10 p-5 pl-14">
          {/* Top row: date + read time in margin style */}
          <div className="flex items-center gap-3 mb-2">
            {featured && (
              <span className="font-[family-name:var(--font-doodle)] text-xs text-primary border border-primary/30 px-2 py-0.5 rotate-[-1deg] inline-flex items-center gap-1">
                <Star className="h-3 w-3" /> {t('featuredBadge')}
              </span>
            )}
            <time
              className="font-[family-name:var(--font-doodle)] text-xs text-foreground/70"
              dateTime={post.publishedAt}
            >
              {date}
            </time>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-[family-name:var(--font-doodle)] text-xs text-foreground/70">
              {post.readTime}
            </span>
          </div>

          {/* Title — handwritten style */}
          <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-primary transition-colors text-balance font-[family-name:var(--font-sarabun)]">
            <Link href={{pathname: '/blog/[slug]', params: {slug: post.slug}}} className="after:content-[''] after:block after:h-px after:bg-primary/0 group-hover:after:bg-primary/40 after:transition-colors">
              {post.title}
            </Link>
          </h3>

          {/* Excerpt — like a notebook annotation */}
          <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mb-3 text-pretty">
            {post.excerpt}
          </p>

          {/* Bottom row: tags + read link */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="font-[family-name:var(--font-doodle)] text-xs text-foreground/70 border border-border/60 px-1.5 py-0.5 hover:border-primary/30 transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="font-[family-name:var(--font-doodle)] text-xs text-foreground/70">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>

            <Link
              href={{pathname: '/blog/[slug]', params: {slug: post.slug}}}
              className="font-[family-name:var(--font-doodle)] text-sm text-primary hover:underline underline-offset-4 decoration-primary/40 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('readArrow')}
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function NotebookBlogList({
  featuredPosts,
  recentPosts,
}: {
  featuredPosts: BlogPost[];
  recentPosts: BlogPost[];
}) {
  const reducedMotion = useReducedMotion();
  const t = useTranslations('blog');

  return (
    <div className="space-y-12">
      {/* Featured posts */}
      {featuredPosts.length > 0 && (
        <section>
          <motion.div
            className="mb-6"
            initial={reducedMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4 }}
          >
            <h2 className="font-[family-name:var(--font-script)] text-2xl md:text-3xl text-foreground">
              {t('featuredTitle')}{" "}
              <span className="font-[family-name:var(--font-doodle)] text-muted-foreground text-lg">
                {t('featuredSubtitle')}
              </span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredPosts.map((post, i) => (
              <NotebookPostEntry key={post.slug} post={post} index={i} featured />
            ))}
          </div>
        </section>
      )}

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section>
          <motion.div
            className="mb-6"
            initial={reducedMotion ? false : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.1 }}
          >
            <h2 className="font-[family-name:var(--font-script)] text-2xl md:text-3xl text-foreground">
              {t('recentTitle')}{" "}
              <span className="font-[family-name:var(--font-doodle)] text-muted-foreground text-lg">
                {t('recentSubtitle')}
              </span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentPosts.map((post, i) => (
              <NotebookPostEntry key={post.slug} post={post} index={i} />
            ))}
          </div>
        </section>
      )}

      {featuredPosts.length === 0 && recentPosts.length === 0 && (
        <div className="text-center py-16">
          <p className="font-[family-name:var(--font-doodle)] text-lg text-muted-foreground">
            {t('emptyNotebook')} <Pencil className="inline-block h-4 w-4" />
          </p>
        </div>
      )}
    </div>
  );
}
