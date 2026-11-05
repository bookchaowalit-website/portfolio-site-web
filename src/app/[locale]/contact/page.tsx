import { Metadata } from 'next';
import { ContactClient } from '@/components/contact-client';
import { BreadcrumbJsonLd } from '@/components/breadcrumb-json-ld';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const seoTitles = {
    en: "Contact Chaowalit Greepoke - Get in Touch for AI & Full-Stack Development Projects",
    th: "ติดต่อเชาวลิต กรีโภค - ติดต่อสำหรับโครงการ AI และ Full-Stack Development"
  };

  const seoDescriptions = {
    en: "Ready to collaborate on your next project? Contact Chaowalit Greepoke, Bangkok-based Generalist specializing in AI integration, full-stack development, and SEO optimization. Quick response within 24-48 hours.",
    th: "พร้อมที่จะร่วมงานในโครงการต่อไปของคุณหรือยัง? ติดต่อเชาวลิต กรีโภค Generalist จากกรุงเทพฯ ที่เชี่ยวชาญด้านการรวม AI, การพัฒนา full-stack และการเพิ่มประสิทธิภาพ SEO ตอบกลับอย่างรวดเร็วภายใน 24-48 ชั่วโมง"
  };

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'),
    title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
    description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
    keywords: [
      'Contact Chaowalit Greepoke',
      'Hire Full-Stack Developer Bangkok',
      'AI Developer for Hire Thailand',
      'Freelance Next.js Developer',
      'SEO Consultant Bangkok',
      'Tech Project Collaboration',
      'Bangkok Web Developer Contact',
      'AI Integration Services Thailand',
      'React Developer Hire',
      'Python Developer Bangkok'
    ].join(', '),
    robots: 'index, follow',
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        'en': '/en/contact',
        'th': '/th/contact',
        'x-default': '/en/contact'
      }
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'}/${locale}/contact`,
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      siteName: 'Chaowalit Greepoke Portfolio',
      images: [{
        url: `/${locale}/contact/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Contact Chaowalit Greepoke - Generalist from Bangkok'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      creator: '@bookchaowalit',
      images: [`/${locale}/contact/opengraph-image`]
    }
  };
}

export default async function Contact({ params }: Props) {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com';
  const breadcrumbItems = [
    { name: locale === 'th' ? 'หน้าแรก' : 'Home', url: baseUrl },
    { name: locale === 'th' ? 'ติดต่อ' : 'Contact', url: `${baseUrl}/${locale}/contact` },
  ];

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: locale === 'th' ? 'ติดต่อเชาวลิต กรีโภค' : 'Contact Chaowalit Greepoke',
    url: `${baseUrl}/${locale}/contact`,
    description: locale === 'th'
      ? 'ติดต่อเชาวลิต กรีโภค สำหรับโครงการ AI และการพัฒนา Full-Stack'
      : 'Get in touch with Chaowalit Greepoke for AI & full-stack development projects.',
    email: 'bookchaowalit.work@gmail.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bangkok',
      addressCountry: 'TH',
    },
    areaServed: ['Thailand', 'Remote'],
    availableLanguage: ['English', 'Thai'],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <BreadcrumbNav items={[
        { name: locale === 'th' ? 'ติดต่อ' : 'Contact' },
      ]} />
      <ContactClient />
    </div>
  );
}
