"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MixedTypographyTitle, NotebookSectionHeader } from "@/components/ui/mixed-typography";
import { SketchyFrame } from "@/components/ui/notebook-elements";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { PenLine, Mail, Check, Loader2, AlertCircle } from "lucide-react";

export function BlogHero() {
  const t = useTranslations("blog");
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="text-center space-y-8 mb-12"
      initial={reducedMotion ? false : { y: 30 }}
      animate={{ y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.8 }}
    >
      <motion.div
        initial={reducedMotion ? false : { y: 20 }}
        animate={{ y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
      >
        <MixedTypographyTitle as="h1"
          words={[
            { text: t("title"), style: "cursive", size: "xl" },
            { text: <PenLine className="inline-block" />, style: "block", size: "lg" }
          ]}
          className="mb-6"
        />
      </motion.div>

      <motion.div
        className="max-w-md mx-auto"
        initial={reducedMotion ? false : { scale: 0.9, rotate: -1 }}
        animate={{ scale: 1, rotate: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.4, ease: "backOut" }}
      >
        <div className="bg-muted border border-border p-4">
          <p className="text-foreground text-center">
            {t("subtitle")}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BlogSearchBar() {
  const t = useTranslations("blog");
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      className="max-w-md mx-auto mb-12"
      initial={reducedMotion ? false : { y: 20 }}
      animate={{ y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.6 }}
    >
      <div className="bg-muted border border-border p-2 hover:border-primary/40 transition-colors">
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full border-0 focus:ring-0 font-[family-name:var(--font-doodle)] bg-transparent"
        />
      </div>
    </motion.div>
  );
}

export function BlogNewsletter() {
  const t = useTranslations("blog");
  const reducedMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubscribed(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="mt-16"
      initial={reducedMotion ? false : { y: 30 }}
      animate={{ y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.8 }}
    >
      <SketchyFrame variant="double">
        <div className="p-8 text-center">
          <motion.div
            initial={reducedMotion ? false : { y: 20 }}
            animate={{ y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 1.0 }}
          >
            <MixedTypographyTitle
              words={[
                { text: t("stayUpdated"), style: "cursive", size: "lg" },
                { text: <Mail className="inline-block" />, style: "block", size: "md" }
              ]}
              className="mb-6"
            />
          </motion.div>

          <motion.div
            className="max-w-sm mx-auto mb-6"
            initial={reducedMotion ? false : { scale: 0.9, rotate: 2 }}
            animate={{ scale: 1, rotate: -1 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 1.2, ease: "backOut" }}
          >
            <div className="bg-muted border border-border p-3">
              <p className="text-foreground text-center text-sm">
                {t("newsletterDescription")}
              </p>
            </div>
          </motion.div>

          {subscribed ? (
            <motion.div
              initial={reducedMotion ? false : { scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-2 text-primary"
            >
              <Check className="w-5 h-5" />
              <span className="font-[family-name:var(--font-doodle)]">
                {t("subscribed") || "Thanks for subscribing!"}
              </span>
            </motion.div>
          ) : (
            <>
              <motion.form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                initial={reducedMotion ? false : { y: 20 }}
                animate={{ y: 0 }}
                transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 1.4 }}
              >
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="flex-1 font-[family-name:var(--font-doodle)]"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="font-[family-name:var(--font-comic)] gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {t("subscribe")}
                </Button>
              </motion.form>
              {error && (
                <motion.p
                  initial={false}
                  animate={false}
                  className="text-sm text-destructive mt-2 font-[family-name:var(--font-doodle)] flex items-center justify-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.p>
              )}
            </>
          )}
        </div>
      </SketchyFrame>
    </motion.section>
  );
}

export function NotebookSection({
  title,
  subtitle,
  children,
  className = ""
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`py-8 ${className}`}>
      <NotebookSectionHeader
        title={title}
        subtitle={subtitle}
        className="mb-8"
      />
      {children}
    </div>
  );
}
