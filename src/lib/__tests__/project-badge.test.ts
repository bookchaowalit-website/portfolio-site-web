import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { projectBadge, projectDemoState } from "../project-badge.ts";

// 2026-11-18 UX review: Live, Prototype and Internal System badges all looked
// the same, and archived projects showed a grey "Prototype".
describe("project badge", () => {
  it("shows Archived for archived projects whatever their evidence level", () => {
    assert.deepEqual(projectBadge({ status: "archived", evidenceLevel: "Prototype" }), { labelKey: "status_archived", variant: "archived" });
    assert.deepEqual(projectBadge({ status: "archived", evidenceLevel: "Experiment" }), { labelKey: "status_archived", variant: "archived" });
  });

  it("gives each evidence level its own style", () => {
    assert.equal(projectBadge({ status: "live", evidenceLevel: "Live" }).variant, "solid");
    assert.equal(projectBadge({ status: "live", evidenceLevel: "Prototype" }).variant, "outline");
    assert.equal(projectBadge({ status: "live", evidenceLevel: "Internal System" }).variant, "dashed");
    assert.equal(projectBadge({ status: "live", evidenceLevel: "Experiment" }).variant, "dotted");
    const variants = (["Live", "Prototype", "Internal System", "Experiment"] as const).map(
      (evidenceLevel) => projectBadge({ status: "live", evidenceLevel }).variant,
    );
    assert.equal(new Set(variants).size, variants.length);
  });

  it("labels evidence levels from the projects messages", () => {
    assert.equal(projectBadge({ status: "live", evidenceLevel: "Live" }).labelKey, "evidence_live");
    assert.equal(projectBadge({ status: "live", evidenceLevel: "Internal System" }).labelKey, "evidence_internal");
    assert.equal(projectBadge({ status: "wip" }).labelKey, "status_wip");
  });
});

describe("project demo state", () => {
  it("links a demo that answers", () => {
    assert.equal(projectDemoState({ url: "https://todo-board.bookchaowalit.com", status: "live" }), "demo");
  });

  it("says Offline when a live project's host is down", () => {
    assert.equal(projectDemoState({ url: "https://consulting.bookchaowalit.com", status: "live", demoUnavailable: true }), "offline");
  });

  it("says retired for an archived project without a demo, and source-only when there is no URL", () => {
    assert.equal(projectDemoState({ url: "https://podcast.bookchaowalit.com", status: "archived", demoUnavailable: true }), "retired");
    assert.equal(projectDemoState({ url: "", status: "live", demoUnavailable: true }), "none");
  });
});
