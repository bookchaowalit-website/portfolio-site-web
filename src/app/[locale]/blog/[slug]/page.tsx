import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@/i18n/routing";
import { getBlogPost, getAllBlogPosts } from "@/lib/blog";
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ShareButton } from "@/components/share-button";
import { ReadingProgressBar } from "@/components/reading-progress-bar";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { TableOfContents } from "@/components/table-of-contents";
import { extractHeadings } from "@/lib/toc";
import { getTranslations } from 'next-intl/server';
import { ArrowRight, ArrowLeft } from 'lucide-react';

async function RelatedPosts({ currentSlug, currentTags, locale }: { currentSlug: string; currentTags: string[]; locale: string }) {
  const t = await getTranslations({ locale, namespace: 'blog' });
  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({
      ...p,
      relevance: p.tags.filter((t) => currentTags.includes(t)).length,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">
        {t('relatedPosts')}
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}` as "/blog"}
            className="group border border-border p-5 hover:border-foreground/40 transition-colors"
          >
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h3 className="font-semibold mb-2 group-hover:underline line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-1 text-sm text-primary">
              <span>{t('readNext')}</span>
              <ArrowRight className="size-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getBlogPost(slug);
  const t = await getTranslations({ locale, namespace: 'blog' });

  if (!post) {
    return {
      title: t('postNotFound'),
      robots: 'noindex, nofollow'
    };
  }

  const baseTitle = `${post.title} | Chaowalit Greepoke`;
  const blogUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'}/${locale === 'en' ? '' : locale + '/'}blog/${slug}`;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'),
    title: baseTitle,
    description: post.excerpt,
    keywords: [
      ...post.tags,
      'Chaowalit Greepoke Blog',
      'Tech Tutorial Bangkok',
      'Web Development Article',
      'AI Development Guide',
      'SEO Tips Thailand',
      'Next.js Tutorial',
      'React Development',
      'Python FastAPI Guide'
    ].join(', '),
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: 'Chaowalit Greepoke',
    robots: 'index, follow',
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: {
        'en': `/en/blog/${slug}`,
        'th': `/th/blog/${slug}`,
        'x-default': `/en/blog/${slug}`
      }
    },
    openGraph: {
      type: 'article',
      locale: locale,
      url: blogUrl,
      title: baseTitle,
      description: post.excerpt,
      siteName: 'Chaowalit Greepoke Portfolio',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [{
        url: post.image || `/${locale}/blog/${slug}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: `${post.title} - ${post.author}`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: baseTitle,
      description: post.excerpt,
      creator: '@bookchaowalit',
      images: [post.image || `/${locale}/blog/${slug}/opengraph-image`]
    },
    other: {
      'article:author': post.author,
      'article:published_time': post.publishedAt,
      'article:tag': post.tags.join(', ')
    }
  };
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { slug, locale } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'blog' });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com';
  const currentUrl = `${baseUrl}/${locale === 'en' ? '' : locale + '/'}blog/${slug}`;

  // Extract headings for table of contents
  const headings = extractHeadings(post.content);

  // MDX components with heading IDs for scroll spy
  const mdxComponents = {
    h2: ({ children, ...props }: { children?: React.ReactNode }) => {
      const text = String(children || '');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: { children?: React.ReactNode }) => {
      const text = String(children || '');
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return <h3 id={id} {...props}>{children}</h3>;
    },
  };

  // Strip MDX/markdown to plain text for articleBody (truncated to 5000 chars)
  const plainText = post.content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/>\s*/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
    .slice(0, 5000);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    articleBody: plainText,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Chaowalit Greepoke',
      url: baseUrl,
    },
    url: currentUrl,
    image: post.image || `${baseUrl}/og-blog-post.jpg`,
    keywords: post.tags.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.prose p:first-child', 'h2'],
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ReadingProgressBar />
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: baseUrl },
        { name: 'Blog', url: `${baseUrl}/${locale}/blog` },
        { name: post.title, url: currentUrl },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <BreadcrumbNav items={[
        { name: t('title'), href: '/blog' },
        { name: post.title },
      ]} />

      {/* Back button */}
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/blog">{t("backToBlog")}</Link>
        </Button>
      </div>

      {/* Article header */}
      <header className="mb-12 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <Separator />

        {/* Author info */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/profile-2026.webp" alt={post.author} />
              <AvatarFallback>CG</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author}</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <time>{new Date(post.publishedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center space-x-2">
            <ShareButton
              title={post.title}
              url={currentUrl}
            />
          </div>
        </div>
      </header>

      {/* Article content with TOC sidebar */}
      <div className="flex gap-8">
        <article className="prose prose-lg max-w-none flex-1 min-w-0">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>
        {headings.length >= 3 && (
          <div className="hidden lg:block">
            <TableOfContents headings={headings} />
          </div>
        )}
      </div>

      {/* Mobile TOC */}
      {headings.length >= 3 && (
        <div className="lg:hidden">
          <TableOfContents headings={headings} />
        </div>
      )}

      <Separator className="my-12" />

      {/* Related Posts */}
      <RelatedPosts currentSlug={slug} currentTags={post.tags} locale={locale} />

      {/* Author bio */}
      <section className="bg-muted/50 p-8">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="/profile-2026.webp" alt={post.author} />
            <AvatarFallback className="text-lg">CG</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{t("aboutAuthor", { author: post.author })}</h3>
            <p className="text-muted-foreground mb-4">
              {t("authorBio")}
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/about">{t("learnMore")}</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact">{t("getInTouch")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation to other posts */}
      <section className="mt-12">
        {(() => {
          const allPosts = getAllBlogPosts();
          const currentIndex = allPosts.findIndex((p) => p.slug === slug);
          const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
          const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
          return (
            <div className="flex justify-between items-center gap-4">
              {prevPost ? (
                <Button variant="ghost" asChild className="gap-2">
                  <Link href={`/blog/${prevPost.slug}` as "/blog"}>
                    <ArrowLeft className="size-4" />
                    <span className="hidden sm:inline">{t("previousPost")}</span>
                    <span className="sm:hidden truncate max-w-[120px]">{prevPost.title}</span>
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" asChild>
                  <Link href="/blog">{t("allPosts")}</Link>
                </Button>
              )}
              {nextPost ? (
                <Button variant="outline" asChild className="gap-2">
                  <Link href={`/blog/${nextPost.slug}` as "/blog"}>
                    <span className="hidden sm:inline">{t("nextPost")}</span>
                    <span className="sm:hidden truncate max-w-[120px]">{nextPost.title}</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/projects">{t("viewProjects")}</Link>
                </Button>
              )}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
