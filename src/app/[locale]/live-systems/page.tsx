import { Metadata } from 'next';
import { LiveSystemsClient } from '@/components/live-systems-client';
import { BreadcrumbJsonLd } from '@/components/breadcrumb-json-ld';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const seoTitles = {
    en: "Live Systems - Data Product APIs | Chaowalit Greepoke",
    th: "ระบบสด - Data Product APIs | เชาวลิต กรีโภค"
  };

  const seoDescriptions = {
    en: "Portfolio consumer for seven free-only local data-product APIs (ports 8101–8110) with fixture fallback, envelope contracts, and no external writes.",
    th: "หน้า consumer สำหรับ data-product API แบบ free-only ทั้ง 7 ตัว (พอร์ต 8101–8110) พร้อม fixture fallback และไม่มีการ write ภายนอก"
  };

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'),
    title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
    description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
    keywords: [
      'Data Products',
      'Local API',
      'Free-only',
      'Portfolio',
      'TypeScript',
      'Chaowalit Greepoke',
      'Solo Empire'
    ].join(', '),
    robots: 'index, follow',
    alternates: {
      canonical: `/${locale}/live-systems`,
      languages: {
        'en': '/en/live-systems',
        'th': '/th/live-systems',
        'x-default': '/en/live-systems'
      }
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'}/${locale}/live-systems`,
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      siteName: 'Chaowalit Greepoke Portfolio',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Live Systems - Automation Ecosystem' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      creator: '@bookchaowalit',
      images: ['/og-image.jpg'],
    }
  };
}

export default async function LiveSystemsPage({ params }: Props) {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: locale === 'th' ? 'ระบบสด - Data Product APIs' : 'Live Systems - Data Product APIs',
    url: `${baseUrl}/${locale}/live-systems`,
    description: locale === 'th'
      ? 'Consumer สำหรับ data-product API แบบ free-only พร้อม fixture fallback'
      : 'Consumer for free-only data-product APIs with sanitized fixture fallback.',
    inLanguage: locale === 'th' ? 'th' : 'en',
    author: {
      '@type': 'Person',
      name: 'Chaowalit Greepoke',
      url: baseUrl,
      sameAs: [
        'https://github.com/bookchaowalit',
        'https://linkedin.com/in/bookchaowalit',
      ],
    },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: 'Solo Empire Automation Ecosystem',
      applicationCategory: 'DataPipeline',
      operatingSystem: 'Linux VPS',
      description: locale === 'th'
        ? 'ระบบ consumer สำหรับ data-product API แบบ free-only พร้อม fixture fallback และไม่มี external writes'
        : 'Free-only data-product API consumer with sanitized fixture fallback and no external writes',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  };

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: locale === 'th' ? 'ระบบอัตโนมัติ' : 'Live Systems', url: `${baseUrl}/${locale}/live-systems` },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <BreadcrumbNav items={[
        { name: locale === 'th' ? 'ระบบอัตโนมัติ' : 'Live Systems' },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LiveSystemsClient />
    </div>
  );
}
