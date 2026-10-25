"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useTranslations } from "next-intl";
import { Github, Linkedin, Twitter, PenTool, BookOpen, Briefcase, Zap, Mail, Rss } from "lucide-react";

const SUPPORT_LINKS = [
  { key: "supportMatcha", emoji: "🍵", href: "https://buy.stripe.com/5kQ6oI8Z17mS4lL7Ei3ks03" },
  { key: "supportCocoa", emoji: "🍫", href: "https://buy.stripe.com/9B65kE8Z1gXsbOdf6K3ks04" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const currentYear = new Date().getFullYear();
  const reducedMotion = useReducedMotion();

  const hoverPrimary = reducedMotion ? {} : { y: -3, scale: 1.08 };
  const hoverSecondary = reducedMotion ? {} : { y: -2, scale: 1.05 };

  return (
    <footer className="mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            {/* Hand-drawn title */}
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.6 }}
              className="relative"
            >
              <h2 className="text-3xl font-[family-name:var(--font-script)] text-foreground mb-4">
                {t("thanksVisiting")}
              </h2>
            </motion.div>

            {/* Navigation with doodle style */}
            <motion.nav
              className="flex flex-wrap justify-center gap-6 mb-8"
              aria-label={t("footerNavigation")}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
            >
              <motion.div whileHover={hoverSecondary}>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary font-[family-name:var(--font-doodle)] text-lg transition-colors duration-200"
                  style={{ transform: `rotate(1deg)` }}
                >
                  {tNav("home")}
                </Link>
              </motion.div>
              <motion.div whileHover={hoverSecondary}>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary font-[family-name:var(--font-doodle)] text-lg transition-colors duration-200"
                  style={{ transform: `rotate(-0.5deg)` }}
                >
                  {tNav("about")}
                </Link>
              </motion.div>
              <motion.div whileHover={hoverSecondary}>
                <Link
                  href="/projects"
                  className="text-muted-foreground hover:text-primary font-[family-name:var(--font-doodle)] text-lg transition-colors duration-200"
                  style={{ transform: `rotate(0.5deg)` }}
                >
                  {tNav("projects")}
                </Link>
              </motion.div>
              <motion.div whileHover={hoverSecondary}>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary font-[family-name:var(--font-doodle)] text-lg transition-colors duration-200"
                  style={{ transform: `rotate(-1deg)` }}
                >
                  {tNav("blog")}
                </Link>
              </motion.div>
              <motion.div whileHover={hoverSecondary}>
                <Link
                  href="/now"
                  className="text-muted-foreground hover:text-primary font-[family-name:var(--font-doodle)] text-lg transition-colors duration-200"
                  style={{ transform: `rotate(-0.5deg)` }}
                >
                  {tNav("now")}
                </Link>
              </motion.div>
              <motion.div whileHover={hoverSecondary}>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary font-[family-name:var(--font-doodle)] text-lg transition-colors duration-200"
                  style={{ transform: `rotate(0.5deg)` }}
                >
                  {tNav("contact")}
                </Link>
              </motion.div>
            </motion.nav>

            {/* Social Media Links */}
            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-6"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
            >
              <motion.a
                href="https://github.com/bookchaowalit"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/chaowalit-greepoke-b687351a0/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://twitter.com/bookchaowalit"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://dev.to/bookchaowalit"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="Dev.to"
              >
                <PenTool className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://medium.com/@bookchaowalit"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="Medium"
              >
                <BookOpen className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.upwork.com/freelancers/~01bb8b7612ad1fd8bc"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="Upwork"
              >
                <Briefcase className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://fastwork.co/user/bookchao"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="Fastwork"
              >
                <Zap className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="mailto:bookchaowalit@gmail.com"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="/rss.xml"
                whileHover={hoverPrimary}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label={t("rssFeed")}
              >
                <Rss className="w-5 h-5" />
              </motion.a>
            </motion.div>

            {/* Support links (Stripe Payment Links) */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-3 mb-6"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.35 }}
            >
              <span className="text-sm text-muted-foreground font-[family-name:var(--font-doodle)]">
                {t("supportLabel")}
              </span>
              {SUPPORT_LINKS.map((link) => (
                <motion.a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={hoverSecondary}
                  className="rounded-full border border-border px-3 py-1 text-sm text-foreground hover:border-primary hover:text-primary transition-colors duration-200"
                >
                  <span aria-hidden="true">{link.emoji}</span> {t(link.key)}
                </motion.a>
              ))}
            </motion.div>

            {/* Hand-drawn doodle symbols */}
            <motion.div
              className="flex justify-center items-center gap-8 mb-6"
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.4 }}
            >
              {/* Star doodle */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="text-primary/60"
                aria-hidden="true"
              >
                <path
                  d="M12 2l1.5 4.5H18l-3.5 2.5 1.5 4.5L12 15l-3.5 2.5L10 13l-3.5-2.5h4.5L12 2z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>

              {/* Heart doodle */}
              <svg
                width="24"
                height="20"
                viewBox="0 0 24 20"
                className="text-foreground/60"
                aria-hidden="true"
              >
                <path
                  d="M12 18s-8-4-8-10c0-3 2-5 5-5 2 0 3 1 3 1s1-1 3-1c3 0 5 2 5 5 0 6-8 10-8 10z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* Squiggle doodle */}
              <svg
                width="40"
                height="16"
                viewBox="0 0 40 16"
                className="text-secondary/60"
                aria-hidden="true"
              >
                <path
                  d="M2 8c4-3 8 3 12-2 4-3 8 2 12-1 4-2 8 3 10 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Simple copyright */}
            {/* No opacity fade: axe samples mid-fade text and reports false contrast failures */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground font-[family-name:var(--font-doodle)]">
                {t("copyright", { year: currentYear })}
              </p>
              <p className="text-xs text-foreground mt-1 flex items-center justify-center gap-1" dangerouslySetInnerHTML={{ __html: t.raw("madeWith") }} />
              <p className="text-xs text-foreground mt-1">
                {t("roles")}
              </p>
            </div>
          </div>
        </div>
      </footer>
  );
}
