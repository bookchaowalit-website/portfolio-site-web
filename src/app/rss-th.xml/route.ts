import { getAllBlogPosts } from '@/lib/blog';

export const dynamic = 'force-static';
export const revalidate = 3600;

const baseUrl = 'https://bookchaowalit.com';

function generateThaiRssFeed(): string {
  const posts = getAllBlogPosts();
  
  const items = posts.map(post => {
    const postUrl = `${baseUrl}/th/blog/${post.slug}`;
    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <author>bookchaowalit.work@gmail.com (เชาวลิต กรีโภค)</author>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      ${post.tags.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>เชาวลิต กรีโภค - บล็อกเทคโนโลยี</title>
    <link>${baseUrl}/th/blog</link>
    <description>Generalist และ Solopreneur จากกรุงเทพฯ เขียนเกี่ยวกับการพัฒนาเว็บ AI ข้อมูล และการเป็นผู้ประกอบการ</description>
    <language>th</language>
    <atom:link href="${baseUrl}/rss-th.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>bookchaowalit.work@gmail.com (เชาวลิต กรีโภค)</managingEditor>
    <webMaster>bookchaowalit.work@gmail.com (เชาวลิต กรีโภค)</webMaster>
${items}
  </channel>
</rss>`;
}

export async function GET() {
  const rssFeed = generateThaiRssFeed();

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
