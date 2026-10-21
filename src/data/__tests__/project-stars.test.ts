import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { allProjects } from "../app-projects.ts";
import { sourceOwners, starsBySlug, totalStars } from "../project-stars.ts";

describe("project stars", () => {
  it("asks GitHub for every owner the cards link to, not one hard-coded user", () => {
    const owners = sourceOwners(allProjects);
    assert.ok(owners.includes("bookchaowalit-website"));
    assert.ok(owners.includes("bookchaowalit-ai"));
    assert.ok(owners.includes("bookchaowalit-game"));
    assert.equal(new Set(owners).size, owners.length);
  });

  it("matches stars to cards by full owner/repo name", () => {
    const projects = [
      { slug: "booktrading", repo: "bookchaowalit-ai/finance-booktrading" },
      { slug: "base64", repo: "bookchaowalit-website/devtools-suite-web" },
      { slug: "localcrm" },
    ];
    const stars = starsBySlug(
      [
        { full_name: "bookchaowalit-ai/finance-booktrading", stargazers_count: 4 },
        { full_name: "bookchaowalit-website/devtools-suite-web", stargazers_count: 2 },
        { full_name: "bookchaowalit-website/bookchaowalit-booktrading-frontend", stargazers_count: 99 },
      ],
      projects,
    );
    assert.deepEqual(stars, [
      { slug: "booktrading", repo: "bookchaowalit-ai/finance-booktrading", stars: 4 },
      { slug: "base64", repo: "bookchaowalit-website/devtools-suite-web", stars: 2 },
    ]);
  });

  it("counts a repository shared by several cards once in the total", () => {
    const total = totalStars([
      { slug: "base64", repo: "bookchaowalit-website/devtools-suite-web", stars: 2 },
      { slug: "regex", repo: "bookchaowalit-website/devtools-suite-web", stars: 2 },
      { slug: "booktrading", repo: "bookchaowalit-ai/finance-booktrading", stars: 4 },
    ]);
    assert.equal(total, 6);
  });
});
