"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { motion, useReducedMotion } from "framer-motion";
import { MixedTypographyTitle } from "@/components/ui/mixed-typography";
import { SketchyFrame } from "@/components/ui/notebook-elements";
import { Handshake, Mail, Globe, MessageCircle, Monitor, TrendingUp, Briefcase, Github, Wrench, Zap, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

export function ContactSection() {
  const reducedMotion = useReducedMotion();
  const t = useTranslations('contact');

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.8 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <div className="text-center">
        <MixedTypographyTitle as="h2"
          words={[
            { text: t('letsConnectWord1'), style: "cursive", size: "lg" },
            { text: t('letsConnectWord2'), style: "bubble", size: "lg" },
            { text: <Handshake className="inline-block" />, style: "block", size: "md" }
          ]}
          className="mb-6"
        />
      </div>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.9, rotate: 1 }}
        whileInView={{ opacity: 1, scale: 1, rotate: -0.5 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <SketchyFrame variant="double">
          <div className="p-8">
            <div className="space-y-6 text-center">
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-muted text-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {t('quickResponse')}
                  </Badge>
                  <Badge variant="secondary" className="bg-muted text-foreground flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> {t('availableGlobally')}
                  </Badge>
                  <Badge variant="secondary" className="bg-muted text-foreground flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> {t('multipleChannels')}
                  </Badge>
                </div>

                <h3 className="text-2xl font-[family-name:var(--font-script)] font-bold text-foreground mb-4">
                  {t('readyToWork')}
                </h3>

                <p className="text-muted-foreground font-[family-name:var(--font-doodle)] leading-relaxed max-w-2xl mx-auto text-pretty">
                  {t.rich('contactDescription', {
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }}>
                  <div className="p-4 bg-muted border border-border">
                    <div className="text-2xl mb-2 flex justify-center text-foreground" aria-hidden="true"><Monitor className="w-8 h-8" /></div>
                    <p className="font-[family-name:var(--font-comic)] font-bold text-muted-foreground text-sm">
                      {t('digitalProducts')}
                    </p>
                  </div>
                </motion.div>

                <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }}>
                  <div className="p-4 bg-muted border border-border">
                    <div className="text-2xl mb-2 flex justify-center text-foreground" aria-hidden="true"><TrendingUp className="w-8 h-8" /></div>
                    <p className="font-[family-name:var(--font-comic)] font-bold text-muted-foreground text-sm">
                      {t('businessStrategy')}
                    </p>
                  </div>
                </motion.div>

                <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }}>
                  <div className="p-4 bg-muted border border-border">
                    <div className="text-2xl mb-2 flex justify-center text-foreground" aria-hidden="true"><Palette className="w-8 h-8" /></div>
                    <p className="font-[family-name:var(--font-comic)] font-bold text-muted-foreground text-sm">
                      {t('creativeSolutions')}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="flex gap-4 justify-center flex-wrap pt-4">
                <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }}>
                  <Button size="lg" asChild>
                    <Link href="/contact">{t('getInTouchButton')}</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }}>
                  <Button variant="outline" size="lg" asChild>
                    <a href="mailto:bookchaowalit.work@gmail.com">
                      <Mail className="w-4 h-4 mr-2" /> {t('emailMe')}
                    </a>
                  </Button>
                </motion.div>
              </div>

              <div className="flex justify-center gap-4 text-2xl" role="list" aria-label="Social links">
                <div role="listitem">
                  <motion.a
                    href="https://www.linkedin.com/in/chaowalit-greepoke-b687351a0/"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={reducedMotion ? undefined : { scale: 1.2, y: -2 }}
                    className="inline-flex min-h-[44px] min-w-[44px] h-[44px] w-[44px] items-center justify-center hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="LinkedIn"
                  >
                    <Briefcase className="w-6 h-6" />
                  </motion.a>
                </div>
                <div role="listitem">
                  <motion.a
                    href="https://github.com/bookchaowalit"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={reducedMotion ? undefined : { scale: 1.2, y: -2 }}
                    className="inline-flex min-h-[44px] min-w-[44px] h-[44px] w-[44px] items-center justify-center hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="GitHub"
                  >
                    <Github className="w-6 h-6" />
                  </motion.a>
                </div>
                <div role="listitem">
                  <motion.a
                    href="https://www.upwork.com/freelancers/~01bb8b7612ad1fd8bc"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={reducedMotion ? undefined : { scale: 1.2, y: -2 }}
                    className="inline-flex min-h-[44px] min-w-[44px] h-[44px] w-[44px] items-center justify-center hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Upwork"
                  >
                    <Wrench className="w-6 h-6" />
                  </motion.a>
                </div>
                <div role="listitem">
                  <motion.a
                    href="https://fastwork.co/user/bookchao"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={reducedMotion ? undefined : { scale: 1.2, y: -2 }}
                    className="inline-flex min-h-[44px] min-w-[44px] h-[44px] w-[44px] items-center justify-center hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Fastwork"
                  >
                    <Zap className="w-6 h-6" />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </SketchyFrame>
      </motion.div>
    </motion.section>
  );
}
