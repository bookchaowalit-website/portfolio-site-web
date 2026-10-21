import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { allProjects, gh, publicDemoUrl } from "../app-projects.ts";

const OWNER_REPO = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;

describe("card source links", () => {
  it("builds a GitHub URL from the owner/repo a card carries", () => {
    assert.equal(gh("bookchaowalit-ai/finance-booktrading"), "https://github.com/bookchaowalit-ai/finance-booktrading");
    assert.equal(gh("bookchaowalit-website/portfolio-site-web"), "https://github.com/bookchaowalit-website/portfolio-site-web");
  });

  it("refuses a bare slug instead of guessing an owner", () => {
    assert.throws(() => gh("calendar-app"), /owner\/repo/);
    assert.throws(() => gh(""), /owner\/repo/);
  });

  it("gives every card with a public source an owner/repo and derives githubUrl from it", () => {
    for (const project of allProjects) {
      if (project.sourceUnavailable) {
        assert.equal(project.repo, undefined, `${project.slug} hides its source, so it carries no repo`);
        assert.equal(project.githubUrl, "", `${project.slug} ships no source URL`);
        continue;
      }
      assert.match(project.repo ?? "", OWNER_REPO, `${project.slug} needs an owner/repo`);
      assert.equal(project.githubUrl, `https://github.com/${project.repo}`, project.slug);
    }
  });

  it("no longer points at the pre-rename bookchaowalit-<slug>-frontend names", () => {
    const legacy = allProjects.filter((project) => /\/bookchaowalit-[^/]+-frontend$/.test(project.githubUrl));
    assert.deepEqual(legacy.map((project) => project.slug), []);
  });

  it("uses the canonical owner for the twin and Tier A products", () => {
    const expected: Record<string, string> = {
      booktrading: "bookchaowalit-ai/finance-booktrading",
      bookreading: "bookchaowalit-website/content-bookreading",
      bookmarketing: "bookchaowalit-website/marketing-bookmarketing-web",
      "game-collection": "bookchaowalit-game/games-game-collection-web",
      "analytics-dashboard": "bookchaowalit-ai/data-analytics-dashboard-web",
      "ai-art-gallery": "bookchaowalit-ai/ai-art-gallery-web",
      "recommendation-engine": "bookchaowalit-ai/ai-recommendation-engine-web",
      "sentiment-analyzer": "bookchaowalit-ai/ai-sentiment-analyzer-web",
      "bookchaowalit-portfolio-mobile": "bookchaowalit-website/portfolio-site-mobile",
      base64: "bookchaowalit-website/devtools-suite-web",
      regex: "bookchaowalit-website/devtools-suite-web",
    };
    for (const [slug, repo] of Object.entries(expected)) {
      assert.equal(allProjects.find((project) => project.slug === slug)?.repo, repo, slug);
    }
  });
});

describe("card demo links", () => {
  const OWN_HOST = /(^|\.)bookchaowalit\.com$/;

  it("only links a demo on a host we own; anything else is marked unavailable", () => {
    for (const project of allProjects) {
      if (project.demoUnavailable) continue;
      const host = new URL(project.url).hostname;
      assert.match(host, OWN_HOST, `${project.slug} links ${project.url}, which is not a bookchaowalit.com deployment`);
    }
  });

  it("never publishes the URL of a card whose demo is unavailable", () => {
    for (const project of allProjects) {
      assert.equal(publicDemoUrl(project), project.demoUnavailable ? "" : project.url, project.slug);
    }
  });

  it("links consolidated devtools straight to their route in the suite", () => {
    for (const slug of ["base64", "regex", "cron", "snippets"]) {
      assert.equal(allProjects.find((project) => project.slug === slug)?.url, `https://devtools.bookchaowalit.com/${slug}`, slug);
    }
  });
});
