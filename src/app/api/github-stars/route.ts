import { NextResponse } from "next/server";

import { allProjects } from "@/data/app-projects";
import { sourceOwners, starsBySlug, type ProjectStars } from "@/data/project-stars";

const CACHE_TTL = 3600_000; // 1 hour
const MAX_PAGES_PER_OWNER = 3;

let cached: { data: ProjectStars[]; timestamp: number } | null = null;

async function listRepos(owner: string): Promise<{ full_name: string; stargazers_count: number }[]> {
  const repos: { full_name: string; stargazers_count: number }[] = [];
  for (let page = 1; page <= MAX_PAGES_PER_OWNER; page += 1) {
    const res = await fetch(
      `https://api.github.com/users/${owner}/repos?per_page=100&type=owner&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(process.env.GITHUB_TOKEN && {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          }),
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) throw new Error(`GitHub ${res.status} for ${owner}`);
    const batch: { full_name: string; stargazers_count: number }[] = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

export async function GET() {
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const repos = (await Promise.all(sourceOwners(allProjects).map(listRepos))).flat();
    const data = starsBySlug(repos, allProjects);
    cached = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
