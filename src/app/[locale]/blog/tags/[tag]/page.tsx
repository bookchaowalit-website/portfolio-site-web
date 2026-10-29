import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllBlogPosts, getPostsByTag, tagToSlug, findOriginalTagFromSlug } from '@/lib/blog';
import { NotebookBlogList } from '@/components/notebook-blog-list';
import { BreadcrumbJsonLd } from '@/components/breadcrumb-json-ld';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string; tag: string }>;
};

// Generate static params for all tags
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).map((tag) => ({
    tag: tagToSlug(tag),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tag } = await params;
  const displayTag = findOriginalTagFromSlug(tag);
  const posts = getPostsByTag(displayTag);
  if (posts.length === 0) return { title: 'Tag Not Found', robots: 'noindex, nofollow' };

  const seoTitles = {
    en: `${displayTag} Articles - Tech Blog | Chaowalit Greepoke`,
    th: `บทความ ${displayTag} - บล็อกเทคโนโลยี | เชาวลิต กรีโภค`,
  };

  const seoDescriptions = {
    en: `Explore ${posts.length} article${posts.length > 1 ? 's' : ''} about ${displayTag}. Read insights, tutorials, and expert perspectives on ${displayTag.toLowerCase()} from Chaowalit Greepoke.`,
    th: `สำรวจ ${posts.length} บทความเกี่ยวกับ ${displayTag} อ่านข้อมูล บทช่วยสอน และมุมมองผู้เชี่ยวชาญด้าน ${displayTag.toLowerCase()} จากเชาวลิต กรีโภค`,
  };

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'),
    title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
    description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
    keywords: [
      displayTag,
      `${displayTag} Tutorial`,
      `${displayTag} Blog`,
      'Tech Blog Bangkok',
      'Chaowalit Greepoke',
    ].join(', '),
    robots: 'index, follow',
    alternates: {
      canonical: `/${locale}/blog/tags/${tag}`,
      languages: {
        en: `/en/blog/tags/${tag}`,
        th: `/th/blog/tags/${tag}`,
        'x-default': `/en/blog/tags/${tag}`,
      },
    },
    openGraph: {
      type: 'website',
      locale,
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'}/${locale}/blog/tags/${tag}`,
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      siteName: 'Chaowalit Greepoke Portfolio',
      images: [{ url: '/og-blog-post.jpg', width: 1200, height: 630, alt: `${displayTag} Articles` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitles[locale as keyof typeof seoTitles] || seoTitles.en,
      description: seoDescriptions[locale as keyof typeof seoDescriptions] || seoDescriptions.en,
      creator: '@bookchaowalit',
      images: ['/og-blog-post.jpg'],
    },
  };
}

export default async function BlogTagPage({ params }: Props) {
  const { locale, tag } = await params;
  const displayTag = findOriginalTagFromSlug(tag);
  const posts = getPostsByTag(displayTag);
  const t = await getTranslations({ locale, namespace: 'blog' });

  if (posts.length === 0) {
    notFound();
  }

  const featuredPosts = posts.filter((p) => p.featured);
  const recentPosts = posts.filter((p) => !p.featured);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com';
  const tagUrl = `${baseUrl}/${locale}/blog/tags/${tag}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${displayTag} Articles - Chaowalit Greepoke`,
    url: tagUrl,
    description: `Articles about ${displayTag} from the tech blog of Chaowalit Greepoke.`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Chaowalit Greepoke Portfolio',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Chaowalit Greepoke',
      url: baseUrl,
    },
    about: {
      '@type': 'Thing',
      name: displayTag,
    },
    numberOfItems: posts.length,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          headline: post.title,
          url: `${baseUrl}/${locale}/blog/${post.slug}`,
          datePublished: post.publishedAt,
          inLanguage: locale === 'th' ? 'th' : 'en',
          author: {
            '@type': 'Person',
            name: 'Chaowalit Greepoke',
          },
        },
      })),
    },
  };

  const breadcrumbItems = [
    { name: t('breadcrumbBlog'), href: `/${locale}/blog` },
    { name: `#${displayTag}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbNav items={breadcrumbItems} />
      <BreadcrumbJsonLd items={breadcrumbItems.map(item => ({ name: item.name, url: item.href ? `${baseUrl}${item.href}` : tagUrl }))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Tag header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <span className="font-[family-name:var(--font-doodle)] text-sm text-muted-foreground uppercase tracking-wider">
            {t('tagLabel')}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[family-name:var(--font-thai)]">
          #{displayTag}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {posts.length === 1
            ? t('tagArticleCountSingular', { count: posts.length, tag: displayTag.toLowerCase() })
            : t('tagArticleCount', { count: posts.length, tag: displayTag.toLowerCase() })}
        </p>
        <div className="mt-6">
          <Button variant="ghost" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('allArticles')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Posts list */}
      <NotebookBlogList
        featuredPosts={featuredPosts}
        recentPosts={recentPosts}
      />
    </div>
  );
}
