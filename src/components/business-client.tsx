"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { MixedTypographyTitle, NotebookSectionHeader } from "@/components/ui/mixed-typography";
import { SketchyFrame } from "@/components/ui/notebook-elements";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { TrendingUp, DollarSign, BarChart3, Target, Rocket, Briefcase, Globe, Github, Twitter, Mail, Bot } from "lucide-react";

export function BusinessClient() {
  const reducedMotion = useReducedMotion();
  const t = useTranslations('business');

  const businesses = [
    {
      title: t("ionomadTitle"),
      description: t("ionomadDescDetail"),
      category: t("ionomadCategory"),
      services: [
        t("service1"), t("service2"), t("service3"), t("service4"), t("service5"), t("service6"), t("service7")
      ],
      socialMedia: {
        website: "https://www.ionomad.net",
        linkedin: "https://www.linkedin.com/in/chaowalit-greepoke-b687351a0/",
        github: "https://github.com/bookchaowalit",
        twitter: "",
        email: "bookchaowalit.work@gmail.com"
      },
      status: t("activeStatus")
    }
  ];

  const futureVentures = [
    {
      icon: <TrendingUp className="w-6 h-6 text-foreground" />,
      title: t("future1Title"),
      badge: t("comingSoon"),
      desc: t("future1Desc"),
      tags: [t("tagPython"), t("tagML"), t("tagAlgo"), t("tagRisk")]
    },
    {
      icon: <DollarSign className="w-6 h-6 text-foreground" />,
      title: t("future2Title"),
      badge: t("serviceOffering"),
      desc: t("future2Desc"),
      tags: [t("tagFinTech"), t("tagBlockchain"), t("tagAI"), t("tagDigital")]
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-foreground" />,
      title: t("future3Title"),
      badge: t("inDev"),
      desc: t("future3Desc"),
      tags: [t("tagDataViz"), t("tagPortfolio"), t("tagRealTime"), t("tagRiskAnalytics")]
    },
    {
      icon: <Target className="w-6 h-6 text-foreground" />,
      title: t("future4Title"),
      badge: t("serviceOffering"),
      desc: t("future4Desc"),
      tags: [t("tagTechnical"), t("tagRisk"), t("tagMentorship"), t("tagEducation")]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        className="text-center space-y-8 mb-16"
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 }}
        >
          <MixedTypographyTitle as="h1"
            words={[
              { text: t("journeyWord1"), style: "cursive", size: "xl" },
              { text: t("journeyWord2"), style: "bubble", size: "xl" },
              { text: t("journeyWord3"), style: "filled", size: "xl" },
              { text: <Rocket className="inline-block" />, style: "block", size: "lg" }
            ]}
            className="mb-6"
          />
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.9, rotate: -1 }}
          animate={{ opacity: 1, scale: 1, rotate: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.4, ease: "backOut" }}
        >
          <SketchyFrame variant="dashed">
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> {t("solopreneurBadge")}
                  </Badge>
                  <Badge variant="secondary" className="text-lg px-4 py-2 flex items-center gap-1">
                    <span className="mono-emoji">🇹🇭</span> {t("bangkokBasedBadge")}
                  </Badge>
                </div>

                <h2 className="text-2xl font-[family-name:var(--font-script)] font-bold text-foreground mb-4">
                  {t("heroTitle")}
                </h2>

                <p className="text-lg text-muted-foreground font-[family-name:var(--font-doodle)] leading-relaxed" dangerouslySetInnerHTML={{ __html: t.raw('heroDescription') }} />

                <div className="flex flex-wrap gap-3 justify-center">
                  <Badge variant="outline" className="font-[family-name:var(--font-comic)] text-sm flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" /> {t("badgeAI")}
                  </Badge>
                  <Badge variant="outline" className="font-[family-name:var(--font-comic)] text-sm flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" /> {t("badgeData")}
                  </Badge>
                  <Badge variant="outline" className="font-[family-name:var(--font-comic)] text-sm flex items-center gap-1">
                    <Rocket className="w-3.5 h-3.5" /> {t("badgeDeeptech")}
                  </Badge>
                  <Badge variant="outline" className="font-[family-name:var(--font-comic)] text-sm flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> {t("badgeGrowth")}
                  </Badge>
                </div>
              </div>
            </div>
          </SketchyFrame>
        </motion.div>
      </motion.div>

      {/* Business Cards */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.8 }}
        className="mb-16"
      >
        <NotebookSectionHeader
          title={t("activeVenturesTitle")}
          subtitle={t("activeVenturesSubtitle")}
          className="mb-8"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {businesses.map((business, index) => (
            <motion.div
              key={index}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={reducedMotion ? { duration: 0 } : {
                duration: 0.6,
                delay: 1 + index * 0.2,
                ease: "backOut"
              }}
            >
              <SketchyFrame variant="double" className="h-full">
                <div className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={business.status === t('activeStatus') ? 'default' : 'secondary'}
                        >
                          {business.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {business.category}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xl font-[family-name:var(--font-script)] font-bold text-foreground mb-2">
                          {business.title}
                        </h3>
                        <p className="text-muted-foreground font-[family-name:var(--font-doodle)] leading-relaxed text-sm">
                          {business.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-[family-name:var(--font-comic)] font-bold text-foreground uppercase text-xs tracking-wide">
                          {t("servicesHeader")}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {business.services.map((service) => (
                            <Badge key={service} variant="outline" className="text-xs font-[family-name:var(--font-doodle)]">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-[family-name:var(--font-comic)] font-bold text-foreground uppercase text-xs tracking-wide">
                          {t("connectHeader")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {business.socialMedia.website && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={business.socialMedia.website} target="_blank" rel="noopener noreferrer">
                                <Globe className="w-4 h-4 mr-1" /> {t("socialWebsite")}
                              </a>
                            </Button>
                          )}
                          {business.socialMedia.linkedin && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={business.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
                                <Briefcase className="w-4 h-4 mr-1" /> {t("socialLinkedin")}
                              </a>
                            </Button>
                          )}
                          {business.socialMedia.github && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={business.socialMedia.github} target="_blank" rel="noopener noreferrer">
                                <Github className="w-4 h-4 mr-1" /> {t("socialGithub")}
                              </a>
                            </Button>
                          )}
                          {business.socialMedia.twitter && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={business.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                                <Twitter className="w-4 h-4 mr-1" /> {t("socialTwitter")}
                              </a>
                            </Button>
                          )}
                          {business.socialMedia.email && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={`mailto:${business.socialMedia.email}`}>
                                <Mail className="w-4 h-4 mr-1" /> {t("socialEmail")}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SketchyFrame>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Future Ventures */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 1.5 }}
        className="mt-16"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-[family-name:var(--font-script)] font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Rocket className="w-6 h-6" /> {t("futureVenturesTitle")}
            </h2>
            <p className="text-muted-foreground font-[family-name:var(--font-doodle)]">
              {t("futureVenturesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {futureVentures.map((venture, index) => (
              <SketchyFrame key={index} variant="dashed">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl text-foreground">{venture.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{venture.title}</h3>
                      <Badge variant="outline" className="text-xs mt-1">{venture.badge}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {venture.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {venture.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </SketchyFrame>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.6, delay: 2 }}
        className="text-center space-y-6"
      >
        <div className="p-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-[family-name:var(--font-script)] font-bold text-foreground mb-4">
            {t("workTogetherTitle")}
          </h2>
          <p className="text-muted-foreground font-[family-name:var(--font-doodle)] mb-6 leading-relaxed">
            {t("workTogetherDesc")}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }}>
              <Button size="lg" asChild>
                <Link href="/contact">{t("getInTouchButton")}</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }}>
              <Button variant="outline" size="lg" asChild>
                <Link href="/projects">{t("viewProjectsButton")}</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={reducedMotion ? undefined : { scale: 1.05 }} whileTap={reducedMotion ? undefined : { scale: 0.95 }}>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">{t("learnAboutButton")}</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
