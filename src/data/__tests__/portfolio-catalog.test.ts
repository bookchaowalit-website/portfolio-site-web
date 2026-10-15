import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  allProjects,
  getProjectStatusCounts,
  publicSourceUrl,
} from "../app-projects.ts";
import {
  getActiveProjectDomains,
  getProjectDomains,
  getProjectsForDomain,
  projectDomainOrder,
} from "../project-domains.ts";

describe("portfolio catalog integrity", () => {
  it("keeps the current catalog count and status breakdown explicit", () => {
    assert.equal(allProjects.length, 129);
    assert.deepEqual(getProjectStatusCounts(), { live: 126, wip: 0, archived: 3 });
  });

  it("keeps project records addressable and case-study complete", () => {
    const slugs = allProjects.map((project) => project.slug);
    assert.equal(new Set(slugs).size, slugs.length, "project slugs must be unique");
    assert.ok(allProjects.every((project) => project.caseStudy), "every project needs a case study");
    assert.ok(allProjects.every((project) => project.evidenceLevel), "every project needs an evidence level");
  });

  it("makes the current domain boundary honest", () => {
    assert.deepEqual(getActiveProjectDomains(), ["book-dev"]);
    assert.equal(getProjectsForDomain("book-dev").length, allProjects.length);
    assert.ok(
      projectDomainOrder
        .filter((domain) => domain !== "book-dev")
        .every((domain) => getProjectsForDomain(domain).length === 0),
      "future domains should remain explicit empty states until projects are assigned",
    );
    assert.ok(allProjects.every((project) => getProjectDomains(project).includes("book-dev")));
  });

  it("hides source links that are currently unavailable", () => {
    assert.deepEqual(
      allProjects.filter((project) => project.sourceUnavailable).map((project) => project.slug).sort(),
      ["booknbook", "digital-products", "legal-templates", "localcrm", "mcp-server", "philosophy-archive", "religion-compare", "solo-empire-cli"],
    );
  });

  it("never publishes a hidden source URL in structured data or MCP output", () => {
    for (const project of allProjects) {
      assert.equal(publicSourceUrl(project), project.sourceUnavailable ? "" : project.githubUrl, project.slug);
    }
    for (const slug of ["localcrm", "digital-products"]) {
      const project = allProjects.find((item) => item.slug === slug);
      assert.equal(project?.githubUrl, "", `${slug} ships no source URL to the client bundle`);
    }
  });

  it("describes the browser-local demos only by what they implement", () => {
    const demos = ["goal-tracker", "habit-tracker", "invoice-generator"].map((slug) => {
      const project = allProjects.find((candidate) => candidate.slug === slug);
      assert.ok(project, `${slug} must stay in the catalog`);
      return project;
    });
    for (const project of demos) {
      assert.equal(project.evidenceLevel, "Prototype", `${project.slug} is a browser demo, not a measured product`);
      assert.match(project.caseStudy!.solution, /localStorage/);
      assert.match(project.caseStudy!.solution, /no backend|nothing is sent to a server/);
      const copy = JSON.stringify(project);
      for (const claim of [/cloud sync/i, /heatmap/i, /yearly → quarterly/, /custom branding/i, /Used by freelancers/, /add (a )?milestones?/i]) {
        assert.doesNotMatch(copy, claim, `${project.slug} must not claim unimplemented behaviour`);
      }
    }
  });

  it("points the portfolio mobile card at its canonical repository and web preview", () => {
    const project = allProjects.find((candidate) => candidate.slug === "bookchaowalit-portfolio-mobile");
    assert.equal(project?.githubUrl, "https://github.com/bookchaowalit-website/portfolio-site-mobile");
    assert.equal(project?.url, "https://portfolio-mobile.bookchaowalit.com");
  });
});
