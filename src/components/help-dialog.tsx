"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { Button } from "@/components/ui/button";

const shortcuts = [
  { keys: "⌘K / Ctrl+K", description: "Open command palette" },
  { keys: "/", description: "Focus search (blog page)" },
  { keys: "?", description: "Open this help dialog" },
  { keys: "Esc", description: "Close dialogs / clear search" },
  { keys: "↑ ↓", description: "Navigate palette results" },
  { keys: "↵", description: "Select palette command" },
];

const features = [
  { label: "Section navigation", description: "Left sidebar dots (desktop) or floating pill (mobile)" },
  { label: "Back to top", description: "Appears after scrolling down 400px" },
  { label: "Theme toggle", description: "Switch between light and dark mode" },
  { label: "Language switch", description: "English ↔ Thai" },
  { label: "Keyboard shortcuts", description: "⌘K for palette, ? for help" },
];

export function HelpDialog() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Keep a ref in sync so document key handlers never close over a stale `open`.
  const openRef = useRef(false);
  const reducedMotion = useReducedMotion();
  useFocusTrap(dialogRef, open);

  const close = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    // Return focus to the trigger when possible (keyboard / screen-reader UX).
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const openDialog = useCallback(() => {
    openRef.current = true;
    setOpen(true);
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "?" && !openRef.current) {
        e.preventDefault();
        openDialog();
        return;
      }

      if (e.key === "Escape" && openRef.current) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };

    // Capture phase so Escape closes help even if a child stops bubble.
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [close, openDialog]);

  // Listen for open-help event from command palette
  useEffect(() => {
    const handleOpenHelp = () => openDialog();
    document.addEventListener("open-help", handleOpenHelp);
    return () => document.removeEventListener("open-help", handleOpenHelp);
  }, [openDialog]);

  // Move focus into the dialog when it opens so Escape/Tab behave predictably.
  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (focusable ?? root).focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  // Lock body scroll while open (prevents background tab traps feeling).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Trigger button — visible in nav toolbar (44px touch target) */}
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={openDialog}
        className="hidden md:inline-flex font-mono text-sm"
        aria-label="Keyboard shortcuts help (?)"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Keyboard shortcuts (?)"
      >
        ?
      </Button>

      {mounted && createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            data-state="open"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.12 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={close}
              aria-hidden="true"
            />

            {/* Dialog */}
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard shortcuts and help"
              tabIndex={-1}
              data-help-dialog="true"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  close();
                }
              }}
              className="relative w-full max-w-md bg-background border border-border outline-none"
              style={{
                clipPath: "polygon(0% 0%, 96% 0%, 100% 4%, 100% 100%, 4% 100%, 0% 96%)"
              }}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
              transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Notebook margin line */}
              <div className="absolute left-10 top-0 bottom-0 w-px bg-border/60" />

              {/* Three-ring holes */}
              <div className="absolute left-3 top-[15%] w-3 h-3 rounded-full border border-border/60 bg-background" />
              <div className="absolute left-3 top-[50%] w-3 h-3 rounded-full border border-border/60 bg-background" />
              <div className="absolute left-3 top-[85%] w-3 h-3 rounded-full border border-border/60 bg-background" />

              <div className="p-6 pl-14">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-[family-name:var(--font-comic)] font-bold text-foreground">
                    keyboard shortcuts <Sparkles className="inline-block h-4 w-4" />
                  </h2>
                  <p className="text-xs text-muted-foreground font-[family-name:var(--font-doodle)] mt-1">
                    navigate faster with these shortcuts
                  </p>
                </div>

                {/* Shortcuts list */}
                <div className="space-y-2 mb-6">
                  {shortcuts.map((s) => (
                    <div key={s.keys} className="flex items-center justify-between gap-4">
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border text-foreground">
                        {s.keys}
                      </kbd>
                      <span className="text-sm text-muted-foreground font-[family-name:var(--font-doodle)] text-right">
                        {s.description}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-border/60 my-4" />

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-sm font-[family-name:var(--font-comic)] font-bold text-foreground mb-3">
                    site features ✎
                  </h3>
                  <div className="space-y-2">
                    {features.map((f) => (
                      <div key={f.label} className="flex items-start gap-2">
                        <span className="text-muted-foreground font-[family-name:var(--font-doodle)] text-xs mt-0.5">
                          •
                        </span>
                        <div>
                          <span className="text-sm text-foreground font-[family-name:var(--font-doodle)]">
                            {f.label}
                          </span>
                          <span className="text-xs text-muted-foreground font-[family-name:var(--font-doodle)] ml-1">
                            — {f.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <p className="text-xs text-muted-foreground font-[family-name:var(--font-doodle)]">
                    press <kbd className="px-1.5 py-0.5 font-mono bg-muted border border-border text-foreground">?</kbd> anytime
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 text-xs font-[family-name:var(--font-doodle)] border border-border bg-muted hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Close help dialog"
                  >
                    close ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      , document.body)}
    </>
  );
}
