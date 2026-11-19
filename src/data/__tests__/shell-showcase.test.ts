import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { allProjects, publicDemoUrl, publicSourceUrl } from "../app-projects.ts";

// 2026-11-13..19 the productivity apps, the data dashboards and the devtools
// suite were rebuilt on shared shells (App shell, Dashboard shell, Workbench).
// The cards must link the live hosts and say what each repo ships now.
const appShell: Record<string, string> = {
  services: "services",
  "todo-board": "todo-board",
  reminders: "reminders",
  checklists: "checklists",
  "notes-app": "notes-app",
  journal: "journal",
  ideas: "ideas",
  "goal-tracker": "goal-tracker",
  "habit-tracker": "habit-tracker",
  "kanban-board": "kanban-board",
  "time-tracker": "time-tracker",
  "ops-center": "ops",
  "pomodoro-timer": "pomodoro-timer",
  "calendar-app": "calendar-app",
};

const dashboardShell: Record<string, string> = {
  "energy-dashboard": "energy",
  status: "status",
  "uptime-monitor": "uptime-monitor",
  "link-analytics": "link-analytics",
  "seo-analyzer": "seo-analyzer",
  "real-estate-analyzer": "real-estate",
};

const find = (slug: string) => {
  const project = allProjects.find((candidate) => candidate.slug === slug);
  assert.ok(project, `${slug} must stay in the catalog`);
  return project;
};

describe("shell rebuild showcase", () => {
  for (const [shell, apps] of [["App shell", appShell], ["Dashboard shell", dashboardShell]] as const) {
    for (const [slug, host] of Object.entries(apps)) {
      it(`${slug} links ${host}.bookchaowalit.com and names the ${shell}`, () => {
        const project = find(slug);
        assert.equal(publicDemoUrl(project), `https://${host}.bookchaowalit.com`);
        assert.ok(publicSourceUrl(project), `${slug} links its public repository`);
        assert.ok(JSON.stringify(project.caseStudy).includes(shell), `${slug} case study names the ${shell}`);
      });
    }
  }

  it("lists the Devtools Workbench as one featured suite card over its 17 tool cards", () => {
    const suite = find("devtools-workbench");
    assert.equal(suite.url, "https://devtools.bookchaowalit.com");
    assert.equal(suite.repo, "bookchaowalit-website/devtools-suite-web");
    assert.ok(suite.featuredRank != null, "the suite is featured");
    const tools = allProjects.filter((project) => project.url.startsWith("https://devtools.bookchaowalit.com/"));
    assert.equal(tools.length, 17);
    assert.match(suite.description, /\b17\b/);
    assert.ok(JSON.stringify(suite.caseStudy).includes("Workbench shell"));
  });

  it("does not claim the Markdown Editor saves drafts (draft saving was removed)", () => {
    const editor = JSON.stringify(find("markdown-editor"));
    assert.doesNotMatch(editor, /Keep draft|opt-in draft|saves the text/);
    assert.match(editor, /nothing is saved/);
    const workbench = find("devtools-workbench").caseStudy?.result ?? "";
    assert.match(workbench, /only Clipboard Manager saves data/);
    assert.doesNotMatch(workbench, /Markdown Editor \(an opt-in draft\)/);
  });

  it("drops copy the shell rebuild made stale", () => {
    const stale: [string, RegExp][] = [
      ["kanban-board", /On deck|In rehearsal|Cleared|Back\/Advance/],
      ["energy-dashboard", /dark control-room/i],
      ["status", /24h\/7d\/30d/],
      ["goal-tracker", /cannot be added or removed/i],
      ["cron", /only checks for five fields/i],
      ["real-estate-analyzer", /ledger-style decision desk/i],
      ["ideas", /Idea Field|signal/i],
    ];
    for (const [slug, claim] of stale) {
      assert.doesNotMatch(JSON.stringify(find(slug)), claim, `${slug} still carries stale copy`);
    }
  });
});

describe("featured cards", () => {
  const featured = allProjects.filter((project) => project.featuredRank != null);

  it("feature only cards whose demo answers, or internal systems with public source", () => {
    for (const project of featured) {
      const demo = publicDemoUrl(project);
      const internal = project.evidenceLevel === "Internal System" && Boolean(publicSourceUrl(project));
      assert.ok(demo || internal, `${project.slug} is featured without a demo or source to open`);
    }
  });

  it("un-features BookNBook while consulting.bookchaowalit.com answers 503", () => {
    const booknbook = find("booknbook");
    assert.equal(booknbook.featured, false);
    assert.equal(booknbook.featuredRank, undefined);
    assert.equal(booknbook.demoUnavailable, true);
  });

  it("keeps featured ranks unique", () => {
    const ranks = featured.map((project) => project.featuredRank);
    assert.equal(new Set(ranks).size, ranks.length);
  });
});
