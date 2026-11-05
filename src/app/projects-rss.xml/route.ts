import { NextResponse } from 'next/server';
import { allProjects } from '@/data/app-projects';

export const dynamic = 'force-static';
export const revalidate = 3600;

const BASE_URL = 'https://bookchaowalit.com';

export async function GET() {
  const featured = allProjects.filter((p) => p.featured);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Chaowalit Greepoke - Projects</title>
    <link>${BASE_URL}/en/projects</link>
    <description>100+ independently deployed projects by Bangkok-based developer Chaowalit Greepoke — tools, AI, design, business, mobile apps, and more.</description>
    <language>en</language>
    <managingEditor>bookchaowalit.work@gmail.com (Chaowalit Greepoke)</managingEditor>
    <webMaster>bookchaowalit.work@gmail.com (Chaowalit Greepoke)</webMaster>
    <atom:link href="${BASE_URL}/projects-rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${featured.map(project => `    <item>
      <title><![CDATA[${project.name}]]></title>
      <link>${BASE_URL}/en/projects/${project.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/en/projects/${project.slug}</guid>
      <description><![CDATA[${project.description}]]></description>
      <author>bookchaowalit.work@gmail.com (Chaowalit Greepoke)</author>
      ${project.tech.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ')}
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
