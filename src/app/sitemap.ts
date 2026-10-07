import { MetadataRoute } from 'next'
import { allProjects } from '@/data/app-projects'
import { getActiveProjectDomains } from '@/data/project-domains'
import { getAllBlogPosts } from '@/lib/blog'

type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority?: number
  alternates?: {
    languages?: Record<string, string>
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookchaowalit.com'

  // Helper: create an entry with EN/TH hreflang alternates
  function entry(
    path: string,
    opts: { changeFrequency?: SitemapEntry['changeFrequency']; priority?: number; lastModified?: Date } = {}
  ): SitemapEntry[] {
    // The locale root has no trailing slash; `/en/` would 308 to `/en`.
    const suffix = path === '/' ? '' : path
    const enUrl = `${baseUrl}/en${suffix}`
    const thUrl = `${baseUrl}/th${suffix}`
    // Only emit lastModified when a real content date is known; a build-time
    // timestamp on every URL tells crawlers nothing.
    const shared = {
      ...(opts.lastModified ? { lastModified: opts.lastModified } : {}),
      changeFrequency: opts.changeFrequency || 'monthly' as const,
      priority: opts.priority ?? 0.5,
    }
    return [
      { ...shared, url: enUrl, alternates: { languages: { en: enUrl, th: thUrl, 'x-default': enUrl } } },
      { ...shared, url: thUrl, alternates: { languages: { en: enUrl, th: thUrl, 'x-default': enUrl } } },
    ]
  }

  // Static pages
  const staticPages: SitemapEntry[] = [
    ...entry('/', { changeFrequency: 'weekly', priority: 1 }),
    ...entry('/about', { changeFrequency: 'monthly', priority: 0.8 }),
    ...entry('/about/fitness', { priority: 0.6 }),
    ...entry('/about/creative', { priority: 0.6 }),
    ...entry('/about/growth', { priority: 0.6 }),
    ...entry('/about/journey', { priority: 0.6 }),
    ...entry('/about/trading', { priority: 0.6 }),
    ...entry('/projects', { changeFrequency: 'weekly', priority: 0.9 }),
    ...entry('/projects/domains', { changeFrequency: 'monthly', priority: 0.8 }),
    ...entry('/blog', { changeFrequency: 'weekly', priority: 0.8 }),
    ...entry('/contact', { priority: 0.7 }),
    ...entry('/atlas', { changeFrequency: 'weekly', priority: 0.8 }),
    ...entry('/testimonials', { changeFrequency: 'weekly', priority: 0.8 }),
    ...entry('/uses', { priority: 0.7 }),
    ...entry('/now', { changeFrequency: 'monthly', priority: 0.5 }),
    ...entry('/colophon', { priority: 0.6 }),
    ...entry('/live-systems', { changeFrequency: 'weekly', priority: 0.7 }),
    ...entry('/privacy', { changeFrequency: 'yearly', priority: 0.3 }),
    ...entry('/privacy/messenger-bot', { changeFrequency: 'yearly', priority: 0.2 }),
    ...entry('/privacy/web-apps', { changeFrequency: 'yearly', priority: 0.2 }),
  ]

  // Dynamic project pages
  const projectPages: SitemapEntry[] = allProjects.flatMap((project) =>
    entry(`/projects/${project.slug}`, { changeFrequency: 'monthly', priority: 0.7 })
  )

  const projectDomainPages: SitemapEntry[] = getActiveProjectDomains().flatMap((domain) =>
    entry(`/projects/domains/${domain}`, { changeFrequency: 'monthly', priority: 0.6 })
  )

  // Dynamic blog post pages
  const blogPosts = getAllBlogPosts()
  const blogPages: SitemapEntry[] = blogPosts.flatMap((post) =>
    entry(`/blog/${post.slug}`, { changeFrequency: 'monthly', priority: 0.7, lastModified: new Date(post.publishedAt) })
  )

  // Dynamic blog tag pages
  const tagSet = new Set<string>()
  blogPosts.forEach((p) => p.tags.forEach((tag) => tagSet.add(tag)))
  const blogTagPages: SitemapEntry[] = Array.from(tagSet).flatMap((tag) => {
    const slug = tag.toLowerCase().replace(/[\/\s]+/g, '-')
    return entry(`/blog/tags/${slug}`, { changeFrequency: 'weekly', priority: 0.5 })
  })

  return [...staticPages, ...projectPages, ...projectDomainPages, ...blogPages, ...blogTagPages]
}
