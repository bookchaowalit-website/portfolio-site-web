import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { allProjects, publicDemoUrl } from "../app-projects.ts";
import { shellSystem, shellSiteCount, shellGuaranteeRows, type ShellId } from "../shell-system.ts";

// 2026-11-19: about 100 sites moved onto five shared shells. The hub shows the
// shells on /projects/design-system, and every card whose repo carries a shell
// file on origin/main names that shell in its case study.

const find = (slug: string) => {
  const project = allProjects.find((candidate) => candidate.slug === slug);
  assert.ok(project, `${slug} must stay in the catalog`);
  return project;
};

describe("shell system data", () => {
  it("lists the five shells in order", () => {
    assert.deepEqual(
      shellSystem.map((shell) => shell.name),
      ["App shell", "Dashboard shell", "Reader shell", "Workbench shell", "Sales page shell"],
    );
  });

  it("counts sites from the repo list, with no duplicates across shells", () => {
    const seen = new Set<string>();
    for (const shell of shellSystem) {
      assert.equal(shellSiteCount(shell), shell.repos.length, `${shell.name} count`);
      for (const repo of shell.repos) {
        assert.match(repo, /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/, `${repo} is owner/repo`);
        assert.ok(!seen.has(repo), `${repo} is listed under one shell only`);
        seen.add(repo);
      }
    }
    // Counted with `git ls-tree origin/main` on 2026-11-19 (see the data file).
    assert.deepEqual(shellSystem.map(shellSiteCount), [48, 11, 32, 1, 1]);
  });

  it("links two or three live examples per shell where the shell has that many sites", () => {
    for (const shell of shellSystem) {
      const min = Math.min(2, shellSiteCount(shell) + (shell.id === "workbench" ? 1 : 0));
      assert.ok(shell.examples.length >= min && shell.examples.length <= 3, `${shell.name} has ${shell.examples.length} examples`);
      for (const example of shell.examples) {
        assert.match(example.url, /^https:\/\/[a-z0-9.-]+\.bookchaowalit\.com(\/[a-z0-9-]+)?$/);
        if (example.slug) {
          const project = find(example.slug);
          assert.equal(project.status, "live", `${example.slug} is not archived`);
          assert.equal(publicDemoUrl(project), example.url, `${example.slug} example uses the card's demo URL`);
          assert.ok(shell.repos.includes(project.repo ?? ""), `${example.slug} repo is on the ${shell.name}`);
        }
      }
    }
  });

  it("states each guarantee per shell instead of claiming all of them everywhere", () => {
    const rows = shellGuaranteeRows();
    const keys = rows.map((row) => row.key);
    assert.deepEqual(keys, ["floor", "forcedColors", "thai", "undo"]);
    const cell = (key: string, id: ShellId) => rows.find((row) => row.key === key)?.cells[id];
    // Verified on origin/main: forced-colors rules are in 41 of 48 App shell copies and not in the Workbench.
    assert.equal(cell("forcedColors", "app")?.state, "partial");
    assert.match(cell("forcedColors", "app")?.note.en ?? "", /41 of 48/);
    assert.equal(cell("forcedColors", "workbench")?.state, "no");
    assert.equal(cell("thai", "reader")?.state, "yes");
    assert.equal(cell("thai", "app")?.state, "no");
    assert.equal(cell("undo", "app")?.state, "yes");
    assert.equal(cell("undo", "dashboard")?.state, "na");
  });

  it("has Thai copy for every visible string", () => {
    for (const shell of shellSystem) {
      for (const text of [shell.purpose, ...shell.examples.map((example) => example.label)]) {
        assert.ok(text.en.trim() && text.th.trim(), `${shell.name} has en and th copy`);
      }
    }
  });
});

describe("cards follow the shell rollout", () => {
  for (const shell of shellSystem) {
    if (shell.id === "workbench" || shell.id === "sales") continue;
    for (const repo of shell.repos) {
      for (const project of allProjects.filter((candidate) => candidate.repo === repo)) {
        it(`${project.slug} names the ${shell.name}`, () => {
          assert.ok(JSON.stringify(project.caseStudy).includes(shell.name), `${project.slug} case study names the ${shell.name}`);
        });
      }
    }
  }

  it("drops claims the Reader and App shell moves made stale", () => {
    const stale: [string, RegExp][] = [
      ["talks", /search and (an )?upcoming\/past filter/i],
      ["history-timeline", /era rail/i],
      ["bookreviews", /"MDX"/],
      ["agencyrenting", /Radix UI/],
      ["knowledgehub", /one entry per/i],
    ];
    for (const [slug, claim] of stale) {
      assert.doesNotMatch(JSON.stringify(find(slug)), claim, `${slug} still carries stale copy`);
    }
  });
});

describe("archived and offline cards", () => {
  const archivedRepos = [
    "bookchaowalit-website/education-coursenotes-web",
    "bookchaowalit-website/content-writing-web",
    "bookchaowalit-website/content-video-gallery-web",
    "bookchaowalit-website/content-photo-web",
    "bookchaowalit-ai/ai-sentiment-analyzer-web",
    "bookchaowalit-ai/ai-recommendation-engine-web",
    "bookchaowalit-ai/data-analytics-dashboard-web",
    "bookchaowalit-website/devtools-tools-web",
  ];

  for (const repo of archivedRepos) {
    it(`${repo} shows Archived and is not featured`, () => {
      const cards = allProjects.filter((project) => project.repo === repo);
      assert.equal(cards.length, 1, `${repo} has one card`);
      assert.equal(cards[0].status, "archived");
      assert.equal(cards[0].featured, false);
      assert.equal(cards[0].featuredRank, undefined);
    });
  }

  it("keeps the down sites (podcast, music-playlist) off the featured list without a demo link", () => {
    for (const slug of ["podcast", "music-playlist"]) {
      const project = find(slug);
      assert.equal(project.featured, false);
      assert.equal(publicDemoUrl(project), "", `${slug} publishes no demo link`);
    }
    assert.equal(allProjects.find((project) => project.slug === "url-shortener"), undefined);
  });
});
