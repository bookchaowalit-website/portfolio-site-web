"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import {
  Search,
  Home,
  FolderKanban,
  BookOpen,
  Mail,
  Sun,
  Globe,
  User,
  TrendingUp,
  FileText,
  ArrowRight,
  Compass,
  HelpCircle,
  Newspaper,
} from "lucide-react";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  group: string;
};

type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export function CommandPalette() {
  const [blogPosts, setBlogPosts] = useState<BlogPostMeta[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("command");
  const reducedMotion = useReducedMotion();

  // Fetch blog posts when palette opens
  useEffect(() => {
    if (open && blogPosts.length === 0) {
      fetch("/api/search")
        .then((res) => res.json())
        .then((data) => setBlogPosts(data))
        .catch(() => {});
    }
  }, [open, blogPosts.length]);

  useEffect(() => { setMounted(true); }, []);

  // Toggle palette with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const toggleTheme = useCallback(() => {
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", !isDark ? "dark" : "light");
  }, []);

  const switchLanguage = useCallback(() => {
    const newLocale = locale === "en" ? "th" : "en";
    const pathWithoutLocale = pathname.replace(/^\/(en|th)/, "") || "/";
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  }, [locale, pathname]);

  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(`/${locale}${href}`);
    },
    [router, locale]
  );

  const items: CommandItem[] = useMemo(
    () => {
      const navItems: CommandItem[] = [
      {
        id: "home",
        label: t("navHome"),
        description: t("navHomeDesc"),
        icon: <Home className="size-4" />,
        action: () => navigateTo("/"),
        keywords: ["home", "main", "landing"],
        group: t("groupNav"),
      },
      {
        id: "projects",
        label: t("navProjects"),
        description: t("navProjectsDesc"),
        icon: <FolderKanban className="size-4" />,
        action: () => navigateTo("/projects"),
        keywords: ["projects", "work", "portfolio", "code"],
        group: t("groupNav"),
      },
      {
        id: "blog",
        label: t("navBlog"),
        description: t("navBlogDesc"),
        icon: <BookOpen className="size-4" />,
        action: () => navigateTo("/blog"),
        keywords: ["blog", "articles", "posts", "writing"],
        group: t("groupNav"),
      },
      {
        id: "now",
        label: t("navNow"),
        description: t("navNowDesc"),
        icon: <Compass className="size-4" />,
        action: () => navigateTo("/now"),
        keywords: ["now", "focus", "current", "direction"],
        group: t("groupNav"),
      },
      {
        id: "contact",
        label: t("navContact"),
        description: t("navContactDesc"),
        icon: <Mail className="size-4" />,
        action: () => navigateTo("/contact"),
        keywords: ["contact", "email", "message", "reach"],
        group: t("groupNav"),
      },
      {
        id: "about",
        label: t("navAbout"),
        description: t("navAboutDesc"),
        icon: <User className="size-4" />,
        action: () => navigateTo("/about"),
        keywords: ["about", "story", "background", "bio"],
        group: t("groupNav"),
      },
      {
        id: "fitness",
        label: t("aboutFitness"),
        description: t("aboutFitnessDesc"),
        icon: <TrendingUp className="size-4" />,
        action: () => navigateTo("/about/fitness"),
        keywords: ["fitness", "health", "exercise", "gym"],
        group: t("groupAbout"),
      },
      {
        id: "creative",
        label: t("aboutCreative"),
        description: t("aboutCreativeDesc"),
        icon: <FileText className="size-4" />,
        action: () => navigateTo("/about/creative"),
        keywords: ["creative", "art", "design", "works"],
        group: t("groupAbout"),
      },
      {
        id: "theme",
        label: t("actionTheme"),
        description: t("actionThemeDesc"),
        icon: <Sun className="size-4" />,
        action: toggleTheme,
        keywords: ["theme", "dark", "light", "mode", "toggle"],
        group: t("groupActions"),
      },
      {
        id: "language",
        label: t("actionLanguage"),
        description: locale === "en" ? t("actionLanguageDescTo") : t("actionLanguageDescToEn"),
        icon: <Globe className="size-4" />,
        action: switchLanguage,
        keywords: ["language", "locale", "thai", "english", "switch"],
        group: t("groupActions"),
      },
      {
        id: "help",
        label: t("actionHelp"),
        description: t("actionHelpDesc"),
        icon: <HelpCircle className="size-4" />,
        action: () => {
          document.dispatchEvent(new CustomEvent("open-help"));
          setOpen(false);
        },
        keywords: ["help", "shortcuts", "keyboard", "guide", "features"],
        group: t("groupActions"),
      },
      ];

      // Add blog posts as searchable items
      const blogItems: CommandItem[] = blogPosts.map((post) => ({
        id: `blog-${post.slug}`,
        label: post.title,
        description: post.excerpt,
        icon: <Newspaper className="size-4" />,
        action: () => navigateTo(`/blog/${post.slug}`),
        keywords: [post.slug, ...post.tags, "article", "post", "blog"],
        group: t("groupArticles"),
      }));

      return [...navItems, ...blogItems];
    },
    [navigateTo, toggleTheme, switchLanguage, locale, t, blogPosts]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords.some((kw) => kw.includes(q))
    );
  }, [query, items]);

  // Group filtered items
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, [filtered]);

  const flatList = useMemo(() => filtered, [filtered]);

  // Keyboard navigation within results
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatList.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
      } else if (e.key === "Enter" && flatList[selectedIndex]) {
        e.preventDefault();
        flatList[selectedIndex].action();
      }
    },
    [flatList, selectedIndex]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Track flat index for rendering
  let flatIdx = -1;

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: "easeOut" as const };

  return (
    <>
      {/* Keyboard shortcut hint — rendered in navigation area */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] text-xs text-muted-foreground border border-border px-3 py-2 hover:border-primary/40 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("openPalette")}
      >
        <Search className="size-3.5" />
        <kbd className="font-mono">⌘K</kbd>
      </button>

      {mounted && createPortal(
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={transition}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Dialog */}
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-label={t("paletteLabel")}
              aria-modal="true"
              className="fixed left-1/2 top-[20%] z-[70] w-full max-w-lg -translate-x-1/2 border border-border bg-background"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, y: -10 }}
              transition={transition}
              onKeyDown={handleKeyDown}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  aria-label={t("searchLabel")}
                />
                <kbd className="hidden sm:inline text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-72 overflow-y-auto py-2" role="listbox">
                {flatList.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("noResults")} &ldquo;{query}&rdquo;
                  </div>
                )}
                {Object.entries(grouped).map(([group, groupItems]) => (
                  <div key={group}>
                    <div className="px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {group}
                    </div>
                    {groupItems.map((item) => {
                      flatIdx++;
                      const idx = flatIdx;
                      const isSelected = idx === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          data-index={idx}
                          role="option"
                          aria-selected={isSelected}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors focus-visible:outline-none ${
                            isSelected
                              ? "bg-muted text-foreground"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <span className="flex size-7 items-center justify-center text-muted-foreground shrink-0">
                            {item.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono border border-border px-1 py-0.5">↑↓</kbd>
                    {t("footerNavigate")}
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="font-mono border border-border px-1 py-0.5">↵</kbd>
                    {t("footerSelect")}
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono border border-border px-1 py-0.5">esc</kbd>
                  {t("footerClose")}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      , document.body)}
    </>
  );
}
