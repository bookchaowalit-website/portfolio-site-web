import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  allProjects,
  getProjectStatusCounts,
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
});
