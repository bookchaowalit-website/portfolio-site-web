import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'th'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the locale in the URL
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/about/fitness': '/about/fitness',
    '/about/creative': '/about/creative',
    '/about/growth': '/about/growth',
    '/about/journey': '/about/journey',
    '/about/trading': '/about/trading',
    '/projects': '/projects',
    '/projects/design-system': '/projects/design-system',
    '/projects/domains': '/projects/domains',
    '/projects/domains/[domain]': '/projects/domains/[domain]',
    '/projects/[slug]': '/projects/[slug]',
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/blog/tags/[tag]': '/blog/tags/[tag]',
    '/contact': '/contact',
    '/atlas': '/atlas',
    '/privacy': '/privacy',
    '/privacy/messenger-bot': '/privacy/messenger-bot',
    '/privacy/web-apps': '/privacy/web-apps',
    '/testimonials': '/testimonials',
    '/uses': '/uses',
    '/now': '/now',
    '/colophon': '/colophon',
    '/live-systems': '/live-systems'
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
