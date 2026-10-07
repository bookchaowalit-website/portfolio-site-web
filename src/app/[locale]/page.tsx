import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { HeroSection } from '@/components/lazy/hero-section';
import { SectionNav } from '@/components/section-nav';
import { ErrorBoundary } from '@/components/error-boundary';
import { getAllBlogPosts } from '@/lib/blog';

// Loading skeleton with notebook theme
const SectionSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`${height} animate-pulse bg-muted border border-border relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent animate-shimmer" />
  </div>
);

// Lazy load below-the-fold components
const AboutSection = dynamic(() => import('@/components/lazy/about-section').then(mod => ({ default: mod.AboutSection })), {
  loading: () => <SectionSkeleton height="h-80" />
});

const FeaturedProjects = dynamic(() => import('@/components/lazy/featured-projects').then(mod => ({ default: mod.FeaturedProjects })), {
  loading: () => <SectionSkeleton height="h-[500px]" />
});

const BlogSection = dynamic(() => import('@/components/lazy/blog-section').then(mod => ({ default: mod.BlogSection })), {
  loading: () => <SectionSkeleton height="h-64" />
});

const ContactSection = dynamic(() => import('@/components/lazy/contact-section').then(mod => ({ default: mod.ContactSection })), {
  loading: () => <SectionSkeleton height="h-96" />
});

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const seoTitles = {
    en: "Chaowalit Greepoke - Generalist & Solopreneur | Problem Solver Bangkok",
    th: "เชาวลิต กรีโภค - Generalist และ Solopreneur | นักแก้ปัญหา กรุงเทพฯ"
  };

  const seoDescriptions = {
    en: "Generalist and Solopreneur from Bangkok, Thailand. Working across 45 knowledge domains — from digital products and business strategy to creative design and data — to build practical, scalable solutions. Turning cross-domain thinking into real-world results.",
    th: "Generalist และ Solopreneur จากกรุงเทพฯ ประเทศไทย ทำงานครอบคลุม 45 สาขาความรู้ — ตั้งแต่ผลิตภัณฑ์ดิจิทัล กลยุทธ์ธุรกิจ การออกแบบสร้างสรรค์ และข้อมูล — เพื่อสร้างโซลูชันที่ใช้งานได้จริงและขยายตัวได้ เปลี่ยนการคิดข้ามสาขาให้เป็นผลลัพธ์จริง"
  };

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'),
    title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
    description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
    keywords: [
      'Generalist Problem Solver',
      'Solopreneur Bangkok',
      'Multi-Domain Thinker',
      'Knowledge Atlas Creator',
      '45 Domain Portfolio',
      'Digital Products Strategist',
      'Business Growth Consultant',
      'Creative Generalist',
      'Chaowalit Greepoke'
    ].join(', '),
    authors: [{ name: 'Chaowalit Greepoke' }],
    creator: 'Chaowalit Greepoke',
    publisher: 'Chaowalit Greepoke',
    robots: 'index, follow',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'th': '/th',
        'x-default': '/en'
      }
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'}/${locale}`,
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      siteName: 'Chaowalit Greepoke Portfolio',
      images: [{
        url: `/${locale}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Chaowalit Greepoke - Generalist & Solopreneur'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      creator: '@bookchaowalit',
      images: [`/${locale}/opengraph-image`]
    }
  };
}

const faqData = {
  en: [
    {
      q: "Who is Chaowalit Greepoke?",
      a: "Chaowalit Greepoke is a Generalist and Solopreneur from Bangkok, Thailand, working across 45 knowledge domains — from digital products and business strategy to creative design and data — building practical, scalable solutions."
    },
    {
      q: "What services does Chaowalit offer?",
      a: "Chaowalit offers full-stack web development, AI integration, SEO optimization, mobile app development (Flutter), data architecture, and business strategy consulting. All services are delivered with a cross-domain generalist perspective."
    },
    {
      q: "How many projects has Chaowalit built?",
      a: "Chaowalit has built and independently deployed 100+ projects across 9 categories including business tools, AI & technology, design, content platforms, marketing tools, and mobile apps — all managed as a solopreneur."
    },
    {
      q: "What is the Knowledge Atlas?",
      a: "The Knowledge Atlas is an interactive visualization of 45 knowledge domains across 8 categories that Chaowalit works in. It showcases cross-domain thinking and the breadth of expertise spanning tech, business, creative, and life sciences."
    },
    {
      q: "Where is Chaowalit based and does he work remotely?",
      a: "Chaowalit is based in Bangkok, Thailand, and works both remotely and locally with clients and partners worldwide. All projects are delivered with modern tools and agile methodologies."
    }
  ],
  th: [
    {
      q: "เชาวลิต กรีโภค คือใคร?",
      a: "เชาวลิต กรีโภค เป็น Generalist และ Solopreneur จากกรุงเทพฯ ประเทศไทย ทำงานครอบคลุม 45 สาขาความรู้ ตั้งแต่ผลิตภัณฑ์ดิจิทัล กลยุทธ์ธุรกิจ การออกแบบสร้างสรรค์ และข้อมูล เพื่อสร้างโซลูชันที่ใช้งานได้จริงและขยายตัวได้"
    },
    {
      q: "เชาวลิตให้บริการอะไรบ้าง?",
      a: "เชาวลิตให้บริการพัฒนาเว็บแบบ full-stack, การรวม AI, การเพิ่มประสิทธิภาพ SEO, การพัฒนาแอปมือถือ (Flutter), สถาปัตยกรรมข้อมูล และให้คำปรึกษากลยุทธ์ธุรกิจ มุมมอง generalist ข้ามสาขา"
    },
    {
      q: "เชาวลิตสร้างโปรเจกต์กี่โปรเจกต์?",
      a: "เชาวลิตสร้างและ deploy 100+ โปรเจกต์อย่างอิสระใน 9 หมวดหมู่ รวมถึงเครื่องมือธุรกิจ, AI และเทคโนโลยี, การออกแบบ, แพลตฟอร์มเนื้อหา, เครื่องมือการตลาด และแอปมือถือ — ทั้งหมดจัดการในฐานะ solopreneur"
    },
    {
      q: "Knowledge Atlas คืออะไร?",
      a: "Knowledge Atlas เป็น visualization แบบโต้ตอบของ 45 สาขาความรู้ใน 8 หมวดหมู่ที่เชาวลิตทำงาน แสดงให้เห็นการคิดข้ามสาขาและความเชี่ยวชาญที่ครอบคลุมเทคโนโลยี ธุรกิจ ศิลปะ และวิทยาศาสตร์ชีวิต"
    },
    {
      q: "เชาวลิตอยู่ที่ไหนและทำงานระยะไกลไหม?",
      a: "เชาวลิตอยู่ที่กรุงเทพฯ ประเทศไทย ทำงานทั้งระยะไกลและในท้องถิ่นกับลูกค้าและพันธมิตรทั่วโลก ทุกโปรเจกต์ส่งมอบด้วยเครื่องมือทันสมัยและ agile methodologies"
    }
  ]
};

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const blogPosts = getAllBlogPosts().slice(0, 3);
  const faqs = faqData[locale as keyof typeof faqData] || faqData.en;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SectionNav />
      <div className="container mx-auto px-4 space-y-16 md:space-y-20 lg:space-y-24">
      <div id="hero">
        <HeroSection />
      </div>
      <ErrorBoundary>
        <div id="about">
          <AboutSection />
        </div>
      </ErrorBoundary>
      <ErrorBoundary>
        <div id="projects">
          <FeaturedProjects />
        </div>
      </ErrorBoundary>
      <ErrorBoundary>
        <div id="blog">
          <BlogSection blogPosts={blogPosts} />
        </div>
      </ErrorBoundary>
      <ErrorBoundary>
        <div id="contact">
          <ContactSection />
        </div>
      </ErrorBoundary>
      </div>
    </>
  );
}
