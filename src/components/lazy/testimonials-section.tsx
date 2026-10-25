"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";
import { SketchyFrame } from "@/components/ui/notebook-elements";
import { MixedTypographyTitle } from "@/components/ui/mixed-typography";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocale, useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const t = useTranslations("testimonials");
  const locale = useLocale();
  const reducedMotion = useReducedMotion();

  const getCategoryLabel = (category: Testimonial["category"]) => {
    const key = `category${category.charAt(0).toUpperCase() + category.slice(1)}` as const;
    return t(key);
  };

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.8 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <MixedTypographyTitle as="h2"
          words={[
            { text: t("featuredTitle"), style: "cursive", size: "lg" },
            { text: "★", style: "bubble", size: "lg" },
          ]}
        />
        <p className="text-muted-foreground font-[family-name:var(--font-doodle)]">
          {t("featuredSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={reducedMotion ? false : { opacity: 0, y: 20, rotate: -1 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.2 + index * 0.15 }
            }
            viewport={{ once: true }}
            whileHover={reducedMotion ? undefined : { y: -5, scale: 1.02 }}
          >
            <SketchyFrame variant="dashed">
              <div className="p-5 h-full flex flex-col">
                <Quote className="w-6 h-6 text-primary/40 mb-3" />
                <p className="text-foreground font-[family-name:var(--font-doodle)] text-sm leading-relaxed flex-1 mb-4 line-clamp-4">
                  {locale === "th" ? (testimonial.quoteTh ?? testimonial.quote) : testimonial.quote}
                </p>
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-[family-name:var(--font-comic)]">
                      {testimonial.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-[family-name:var(--font-comic)] font-bold text-foreground text-xs truncate">
                      {locale === "th" ? (testimonial.nameTh ?? testimonial.name) : testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-[family-name:var(--font-doodle)] truncate">
                      {locale === "th" ? (testimonial.roleTh ?? testimonial.role) : testimonial.role}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-muted text-foreground text-xs font-[family-name:var(--font-doodle)]"
                  >
                    {getCategoryLabel(testimonial.category)}
                  </Badge>
                </div>
              </div>
            </SketchyFrame>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center pt-4"
        initial={reducedMotion ? false : { opacity: 0 }}
        whileInView={reducedMotion ? undefined : { opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.8 }}
        viewport={{ once: true }}
      >
        <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }}>
          <Button size="lg" variant="outline" asChild>
            <Link href="/testimonials">{t("viewAll")}</Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
