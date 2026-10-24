"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";
import { TocHeading } from "@/lib/toc";
import { useTranslations } from "next-intl";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("blog");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "lg:hidden fixed bottom-20 right-6 z-40 rounded-full p-3 shadow-lg",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          "transition-all duration-300"
        )}
        aria-label="Toggle table of contents"
      >
        <List size={20} />
      </button>

      {/* TOC panel */}
      <aside
        className={cn(
          "transition-all duration-300",
          // Mobile: fixed overlay
          "fixed top-20 right-0 z-30 w-72 max-h-[calc(100vh-6rem)] overflow-y-auto",
          "bg-background/95 backdrop-blur-sm border-l border-border shadow-lg",
          "lg:sticky lg:top-24 lg:w-56 lg:shrink-0 lg:border-l-0 lg:bg-transparent lg:shadow-none",
          // Mobile visibility toggle
          // Closed: removed from layout; an off-screen fixed panel widens the page at 375px
          isOpen ? "translate-x-0" : "max-lg:hidden"
        )}
      >
        <div className="p-4 lg:p-0">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {t("onThisPage")}
          </h4>
          <nav className="space-y-1">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block text-sm py-1 transition-colors hover:text-foreground",
                  heading.level === 3 && "pl-4",
                  activeId === heading.id
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
