import { NextResponse } from 'next/server';
import { allProjects } from '@/data/app-projects';

export const dynamic = 'force-static';
export const revalidate = 3600;

const BASE_URL = 'https://bookchaowalit.com';

export async function GET() {
  const featured = allProjects.filter((p) => p.featured);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>เชาวลิต กรีโภค - โปรเจกต์</title>
    <link>${BASE_URL}/th/projects</link>
    <description>100+ โปรเจกต์ที่ deploy อย่างอิสระโดยนักพัฒนาจากกรุงเทพฯ เชาวลิต กรีโภค — เครื่องมือ, AI, ออกแบบ, ธุรกิจ, แอปมือถือ และอื่นๆ</description>
    <language>th</language>
    <atom:link href="${BASE_URL}/projects-rss-th.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>bookchaowalit.work@gmail.com (เชาวลิต กรีโภค)</managingEditor>
    <webMaster>bookchaowalit.work@gmail.com (เชาวลิต กรีโภค)</webMaster>
${featured.map(project => `    <item>
      <title><![CDATA[${project.name}]]></title>
      <link>${BASE_URL}/th/projects/${project.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/th/projects/${project.slug}</guid>
      <description><![CDATA[${project.description}]]></description>
      <author>bookchaowalit.work@gmail.com (เชาวลิต กรีโภค)</author>
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
