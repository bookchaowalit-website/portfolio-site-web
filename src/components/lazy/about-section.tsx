"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { MixedTypographyTitle } from "@/components/ui/mixed-typography";
import { SketchyFrame } from "@/components/ui/notebook-elements";
import { Lightbulb, BarChart3, Palette, Compass, MapPin, Briefcase, Globe } from "lucide-react";

export function AboutSection() {
  const t = useTranslations('home');
  const reducedMotion = useReducedMotion();
  
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
            { text: t('aboutWord1'), style: "cursive", size: "lg" },
            { text: t('aboutWord2'), style: "bubble", size: "lg" },
            { text: <Lightbulb className="inline-block" />, style: "block", size: "md" }
          ]}
          className="mb-6"
        />
      </div>

      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.9, rotate: -1 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <SketchyFrame variant="dashed">
          <div className="p-8">
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <Badge variant="secondary" className="gap-1.5 bg-muted text-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {t('bangkokBased')}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-muted text-foreground">
                  <Briefcase className="size-3.5" aria-hidden="true" />
                  {t('yearsExperience')}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-muted text-foreground">
                  <Globe className="size-3.5" aria-hidden="true" />
                  {t('techGeneralist')}
                </Badge>
              </div>
              
              <p className="text-center text-muted-foreground max-w-3xl mx-auto text-lg font-[family-name:var(--font-doodle)] leading-relaxed text-pretty">
                {t('aboutDescription')}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl text-foreground flex justify-center"><Lightbulb className="w-8 h-8" /></div>
                  <p className="text-sm font-[family-name:var(--font-comic)] font-bold text-muted-foreground">{t('problemSolving')}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl text-foreground flex justify-center"><BarChart3 className="w-8 h-8" /></div>
                  <p className="text-sm font-[family-name:var(--font-comic)] font-bold text-muted-foreground">{t('dataAnalysis')}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl text-foreground flex justify-center"><Palette className="w-8 h-8" /></div>
                  <p className="text-sm font-[family-name:var(--font-comic)] font-bold text-muted-foreground">{t('creativeDesign')}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl text-foreground flex justify-center"><Compass className="w-8 h-8" /></div>
                  <p className="text-sm font-[family-name:var(--font-comic)] font-bold text-muted-foreground">{t('strategicThinking')}</p>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }}>
                  <Button size="lg" asChild>
                    <Link href="/about">{t('learnMore')}</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </SketchyFrame>
      </motion.div>
    </motion.section>
  );
}