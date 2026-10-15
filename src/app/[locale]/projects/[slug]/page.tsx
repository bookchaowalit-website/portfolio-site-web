import { Metadata } from "next";
import { notFound } from "next/navigation";
import { allProjects, publicSourceUrl } from "@/data/app-projects";
import { ProjectDetailClient } from "./project-detail-client";
import { BreadcrumbJsonLd } from '@/components/breadcrumb-json-ld';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';
import { getTranslations } from "next-intl/server";
import { getAllBlogPosts, type BlogPost } from '@/lib/blog';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const project = allProjects.find((p) => p.slug === slug);

  if (!project) {
    return {
      title: "Project Not Found",
      robots: 'noindex, nofollow',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com';
  const projectUrl = `${baseUrl}/${locale}/projects/${slug}`;

  return {
    title: `${project.name} - Chaowalit Greepoke Portfolio`,
    description: project.description,
    authors: [{ name: 'Chaowalit Greepoke' }],
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: {
        'en': `/en/projects/${slug}`,
        'th': `/th/projects/${slug}`,
        'x-default': `/en/projects/${slug}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: projectUrl,
      title: `${project.name} | Chaowalit Greepoke`,
      description: `${project.description} — Built with ${project.tech.join(', ')}`,
      siteName: 'Chaowalit Greepoke Portfolio',
      images: [
        {
          url: `/${locale}/projects/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${project.name} - ${project.description}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.name} | Chaowalit Greepoke`,
      description: `${project.description} — Built with ${project.tech.join(', ')}`,
      creator: '@bookchaowalit',
      images: [`/${locale}/projects/${slug}/opengraph-image`],
    },
  };
}

export async function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}

// Match blog posts to projects based on tech, category, and slug keywords
function findRelatedBlogPosts(
  project: typeof allProjects[number],
  posts: BlogPost[]
): { slug: string; title: string; excerpt: string }[] {
  const projectKeywords = [
    ...project.tech.map(t => t.toLowerCase()),
    project.category.toLowerCase(),
    project.slug.toLowerCase(),
    project.name.toLowerCase(),
  ];

  const scored = posts.map(post => {
    const postTags = post.tags.map(t => t.toLowerCase());
    let score = 0;

    for (const kw of projectKeywords) {
      for (const tag of postTags) {
        if (tag.includes(kw) || kw.includes(tag)) score += 2;
      }
      if (post.content.toLowerCase().includes(kw)) score += 1;
    }

    // Bonus for specific matches
    if (project.slug === 'chat-playground' && postTags.some(t => t.includes('ai'))) score += 3;
    if (project.slug === 'solo-empire-cli' && postTags.some(t => t.includes('automation'))) score += 3;
    if (project.slug === 'mcp-server' && postTags.some(t => t.includes('mcp'))) score += 5;
    if (project.slug === 'bookchaowalit-portfolio-mobile' && postTags.some(t => t.includes('flutter'))) score += 5;
    if (project.category === 'design' && postTags.some(t => t.includes('design'))) score += 2;
    if (project.category === 'tech' && postTags.some(t => t.includes('ai'))) score += 1;
    if (postTags.some(t => t.includes('solopreneur')) && ['business', 'tech'].includes(project.category)) score += 1;

    return { post, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => ({ slug: s.post.slug, title: s.post.title, excerpt: s.post.excerpt }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug, locale } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  const t = await getTranslations({ locale, namespace: "projectDetail" });

  const breadcrumbItems = [
    { name: t('breadcrumbProjects'), href: `/${locale}/projects` },
    { name: project?.name || '' },
  ];

  if (!project) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com';
  const projectPageUrl = `${baseUrl}/${locale}/projects/${slug}`;
  const sourceUrl = publicSourceUrl(project);

  // SoftwareApplication structured data for rich Google results
  const softwareAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: project.description,
    url: project.demoUnavailable ? projectPageUrl : project.url,
    applicationCategory: project.category === 'tech' ? 'DeveloperApplication' :
      project.category === 'business' ? 'BusinessApplication' :
      project.category === 'education' ? 'EducationalApplication' :
      project.category === 'social' ? 'SocialNetworkingApplication' :
      project.category === 'marketing' ? 'DesignApplication' :
      'UtilitiesApplication',
    operatingSystem: 'Web',
    author: {
      '@type': 'Person',
      name: 'Chaowalit Greepoke',
      url: baseUrl,
    },
    softwareRequirements: project.tech.join(', '),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    ...(sourceUrl && {
      codeRepository: sourceUrl,
    }),
  };

  // SoftwareSourceCode schema for GitHub projects — richer rich snippets
  const sourceCodeJsonLd = sourceUrl ? {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.name,
    description: project.description,
    url: sourceUrl,
    codeRepository: sourceUrl,
    programmingLanguage: project.tech.map(t => ({
      '@type': 'ComputerLanguage',
      name: t,
    })),
    author: {
      '@type': 'Person',
      name: 'Chaowalit Greepoke',
      url: baseUrl,
    },
    license: 'https://opensource.org/licenses/MIT',
  } : null;

  // CreativeWork JSON-LD for projects with case studies
  const creativeWorkJsonLd = project.caseStudy ? {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${project.name} Case Study`,
    description: project.caseStudy.challenge,
    url: `${baseUrl}/${locale}/projects/${slug}`,
    author: {
      '@type': 'Person',
      name: 'Chaowalit Greepoke',
      url: baseUrl,
    },
    keywords: project.tech.join(', '),
    abstract: project.caseStudy.solution,
    text: project.caseStudy.result,
    genre: 'CaseStudy',
  } : null;

  // Find related blog posts based on project tech/category/slug
  const blogPosts = getAllBlogPosts();
  const relatedBlogPosts = findRelatedBlogPosts(project, blogPosts);

  return (
    <>
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav items={breadcrumbItems} />
      </div>
      <BreadcrumbJsonLd items={breadcrumbItems.map(item => ({ name: item.name, url: item.href ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'}${item.href}` : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'}/${locale}/projects/${slug}` }))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      {sourceCodeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sourceCodeJsonLd) }}
        />
      )}
      {creativeWorkJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkJsonLd) }}
        />
      )}
      <ProjectDetailClient project={project} relatedBlogPosts={relatedBlogPosts} />
    </>
  );
}
