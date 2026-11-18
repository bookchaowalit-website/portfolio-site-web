"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from 'next-intl';
import { StickyNote } from '@/components/ui/notebook-elements';
import { MixedTypographyTitle } from '@/components/ui/mixed-typography';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: string;
}

export function BlogSection({ blogPosts = [] }: { blogPosts?: BlogPost[] }) {
  const t = useTranslations('home');
  const locale = useLocale();

  return (
    <section className="space-y-8">
      <MixedTypographyTitle as="h2"
        words={[
          { text: t('blogTitleWord1'), style: "cursive", size: "lg" },
          { text: t('blogTitleWord2'), style: "bubble", size: "lg" },
          { text: t('blogTitleWord3'), style: "filled", size: "lg" }
        ]}
      />
      <div className="py-8">
        {blogPosts.length === 0 ? (
          <div className="border border-dashed border-border px-6 py-12 text-center space-y-4">
            <p className="text-sm text-muted-foreground">{t('blogEmpty')}</p>
            <Button asChild>
              <Link href="/blog">{t('blogEmptyCta')}</Link>
            </Button>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:[&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
          {blogPosts.map((post, index) => {
            const colors: Array<"yellow" | "pink" | "green" | "blue"> = ["yellow", "pink", "green"];
            const rotations = [-2, 1, -1];
            return (
            // The sticky note is rotated and clip-pathed, which cuts off a ring
            // drawn on it; the focus outline goes on this unclipped link.
            <Link
              key={post.slug || index}
              href={{pathname: '/blog/[slug]', params: {slug: post.slug}}}
              className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <StickyNote color={colors[index % 3]} rotation={rotations[index % 3]} className="cursor-pointer h-full p-5">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold line-clamp-2 text-[#161616] dark:text-[#ededed]">{post.title}</h3>
                  <p className="text-sm line-clamp-2 text-[#595959] dark:text-[#b4b4b4]">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[#595959] dark:text-[#b4b4b4]">
                    <span>{new Date(post.publishedAt).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { timeZone: 'UTC' })}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </StickyNote>
            </Link>
            );
          })}
        </div>
        )}
      </div>
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/blog">{t('readAllPosts')}</Link>
        </Button>
      </div>
    </section>
  );
}
