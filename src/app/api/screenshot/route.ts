import { NextRequest, NextResponse } from 'next/server';
import { allProjects, publicDemoUrl } from '@/data/app-projects';

export const dynamic = 'force-dynamic';

// Simple in-memory cache for screenshot URLs
const screenshotCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const allowedProjectUrls = new Set(allProjects.map(publicDemoUrl).filter(Boolean));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectUrl = searchParams.get('url');

  if (!projectUrl) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  let parsedProjectUrl: URL;
  try {
    parsedProjectUrl = new URL(projectUrl);
  } catch {
    return NextResponse.json({ error: 'Valid project URL required' }, { status: 400 });
  }

  if (parsedProjectUrl.protocol !== 'https:' || !allowedProjectUrls.has(projectUrl)) {
    return NextResponse.json({ error: 'Project URL not allowed' }, { status: 400 });
  }

  // Check cache first
  const cached = screenshotCache.get(projectUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.redirect(cached.url, 302);
  }

  try {
    // Use Microlink API for screenshots
    const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(projectUrl)}&screenshot=true&meta=false`;
    
    const response = await fetch(microlinkUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`Microlink API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.data?.screenshot?.url) {
      const screenshotUrl = data.data.screenshot.url;
      
      // Cache the result
      screenshotCache.set(projectUrl, {
        url: screenshotUrl,
        timestamp: Date.now(),
      });

      // Clean old cache entries (keep last 100)
      if (screenshotCache.size > 100) {
        const oldest = Array.from(screenshotCache.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, screenshotCache.size - 100);
        oldest.forEach(([key]) => screenshotCache.delete(key));
      }

      return NextResponse.redirect(screenshotUrl, 302);
    }

    throw new Error('No screenshot URL in response');
  } catch (error) {
    console.error('Screenshot proxy error:', error);
    
    // Return a placeholder or fallback image
    // Redirect to a simple placeholder image
    const fallbackUrl = new URL('/images/screenshot-placeholder.svg', request.url);
    return NextResponse.redirect(fallbackUrl, 302);
  }
}
