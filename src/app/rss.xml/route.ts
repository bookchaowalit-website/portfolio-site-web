import { NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog';

export const dynamic = 'force-static';
export const revalidate = 3600;

const BASE_URL = 'https://bookchaowalit.com';

export async function GET() {
  const posts = getAllBlogPosts();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Chaowalit Greepoke - Tech Blog</title>
    <link>${BASE_URL}/en/blog</link>
    <description>Web development, AI integration, and solopreneur insights from Bangkok-based developer Chaowalit Greepoke.</description>
    <language>en</language>
    <managingEditor>bookchaowalit.work@gmail.com (Chaowalit Greepoke)</managingEditor>
    <webMaster>bookchaowalit.work@gmail.com (Chaowalit Greepoke)</webMaster>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${posts.map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${BASE_URL}/en/blog/${post.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/en/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <author>bookchaowalit.work@gmail.com (Chaowalit Greepoke)</author>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
