import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sarabun, Kalam } from "next/font/google";
import dynamic from "next/dynamic";
import "../globals.css";
import { Navigation } from "@/components/navigation";
import { PageTransition } from "@/components/page-transition";
import { Analytics } from '@vercel/analytics/react';
import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { loadMessages } from '@/i18n/request';
import { notFound } from 'next/navigation';
import { ErrorBoundary } from '@/components/error-boundary';
import { BackToTop } from '@/components/back-to-top';

const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  loading: () => null
});

const GoogleAnalytics = dynamic(() => import("@/components/google-analytics").then(mod => ({ default: mod.GoogleAnalytics })), {
  loading: () => null
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'),
  title: "Chaowalit Greepoke - Portfolio",
  description: "Generalist - Full-stack Developer, AI Developer & SEO Specialist from Bangkok, specializing in Next.js, React, AI integration, and data analytics",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon', type: 'image/png', sizes: '32x32' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' }
    ],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/rss.xml', title: 'Chaowalit Greepoke - Blog (English)' },
        { url: '/rss-th.xml', title: 'เชาวลิต กรีโภค - บทความ (ไทย)' },
        { url: '/projects-rss.xml', title: 'Chaowalit Greepoke - Projects (English)' },
        { url: '/projects-rss-th.xml', title: 'เชาวลิต กรีโภค - โปรเจกต์ (ไทย)' },
      ],
    },
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isThai = locale === 'th';
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'en' | 'th')) {
    notFound();
  }

  // Load messages directly from route params to ensure correct locale
  const messages = await loadMessages(locale);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "name": "Chaowalit Greepoke",
        "alternateName": "Book",
        "description": "Generalist and Solopreneur who enjoys solving problems and building things end-to-end",
        "jobTitle": "Generalist & Solopreneur",
        "url": "https://bookchaowalit.com",
        "image": "https://bookchaowalit.com/profile-2026.webp",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bangkok",
          "addressCountry": "Thailand"
        },
        "worksFor": {
          "@type": "Organization",
          "name": "BookChaowa Tech Solutions"
        },
        "knowsAbout": [
          "Software Engineering",
          "Data Analytics",
          "Artificial Intelligence",
          "Digital Growth",
          "Web Development",
          "Problem Solving"
        ],
        "sameAs": [
          "https://github.com/bookchaowalit",
          "https://www.linkedin.com/in/chaowalit-greepoke-b687351a0/",
          "https://twitter.com/bookchaowalit",
          "https://dev.to/bookchaowalit",
          "https://medium.com/@bookchaowalit",
          "https://www.upwork.com/freelancers/~01bb8b7612ad1fd8bc",
          "https://fastwork.co/user/bookchao",
          "https://www.strava.com/athletes/bookchaowalit",
          "https://bookchaowalit.com"
        ]
      },
      {
        "@type": "WebSite",
        "name": "Chaowalit Greepoke - Portfolio",
        "url": "https://bookchaowalit.com",
        "description": "Generalist and Solopreneur from Bangkok, Thailand",
        "inLanguage": ["en", "th"],
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `https://bookchaowalit.com/${locale}/projects?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://icon.horse" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sarabun.variable} ${kalam.variable} antialiased ${isThai ? 'font-thai' : ''}`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            {locale === 'th' ? 'ข้ามไปที่เนื้อหา' : 'Skip to content'}
          </a>
          <Navigation />
          <main id="main-content" className="min-h-screen relative z-10">
            <ErrorBoundary>
              <PageTransition>
                {children}
              </PageTransition>
            </ErrorBoundary>
          </main>
          <Footer />
          <BackToTop />
          <Analytics mode="production" />
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
