import type { AppProject } from "./app-projects";

export interface ProjectStars {
  slug: string;
  repo: string;
  stars: number;
}

interface GitHubRepoStars {
  full_name: string;
  stargazers_count: number;
}

/** Distinct GitHub owners the cards link to; the stars route lists each one's repositories. */
export function sourceOwners(projects: readonly Pick<AppProject, "repo">[]): string[] {
  return [...new Set(projects.flatMap((project) => (project.repo ? [project.repo.split("/")[0]] : [])))];
}

/** Stars per card, matched on the card's full owner/repo; cards without a public repo get none. */
export function starsBySlug(
  repos: readonly GitHubRepoStars[],
  projects: readonly Pick<AppProject, "slug" | "repo">[],
): ProjectStars[] {
  const byRepo = new Map(repos.map((repo) => [repo.full_name.toLowerCase(), repo.stargazers_count]));
  return projects.flatMap((project) => {
    const stars = project.repo ? byRepo.get(project.repo.toLowerCase()) : undefined;
    return stars === undefined ? [] : [{ slug: project.slug, repo: project.repo!, stars }];
  });
}

/** Total stars with each repository counted once, even when several cards share it. */
export function totalStars(stars: readonly ProjectStars[]): number {
  const byRepo = new Map(stars.map((entry) => [entry.repo, entry.stars]));
  return [...byRepo.values()].reduce((sum, count) => sum + count, 0);
}
