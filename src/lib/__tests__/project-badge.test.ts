import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readFileSync } from "node:fs";

import { allProjects } from "../../data/app-projects.ts";
import { projectBadge, projectDemoState, unavailableCopy } from "../project-badge.ts";

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

// 2026-11-19 Codex review: BookNBook (deployed, host answering 503) showed "there is no demo deployment of ours"
// on its detail page and "internal system" on its card, contradicting its own case study.
describe("unavailable demo copy", () => {
  const messages = (locale: string) => JSON.parse(readFileSync(new URL(`../../../messages/${locale}.json`, import.meta.url), "utf8"));

  it("says offline, not 'no deployment' or 'internal', for a live project whose host is down", () => {
    const booknbook = allProjects.find((project) => project.slug === "booknbook")!;
    assert.equal(projectDemoState(booknbook), "offline");
    assert.deepEqual(unavailableCopy("offline"), { cardNote: "offlinePreviewNote", detailPreview: "previewOffline", detailButton: "demoOffline" });
  });

  it("keeps the retired and internal wording for projects with no demo of ours", () => {
    assert.equal(unavailableCopy("retired").cardNote, "retiredPreviewNote");
    assert.equal(unavailableCopy("none").cardNote, "internalPreviewNote");
    assert.equal(unavailableCopy("none").detailPreview, "previewUnavailable");
    assert.equal(unavailableCopy("retired").detailButton, "demoUnavailable");
  });

  it("has every key in both locales, and the offline text never claims there is no deployment", () => {
    for (const locale of ["en", "th"]) {
      const m = messages(locale);
      for (const state of ["offline", "retired", "none"] as const) {
        const copy = unavailableCopy(state);
        assert.ok(m.projects[copy.cardNote], `${locale} projects.${copy.cardNote}`);
        assert.ok(m.projectDetail[copy.detailPreview], `${locale} projectDetail.${copy.detailPreview}`);
        assert.ok(m.projectDetail[copy.detailButton], `${locale} projectDetail.${copy.detailButton}`);
      }
    }
    const en = messages("en");
    assert.doesNotMatch(en.projectDetail.previewOffline, /no demo deployment/i);
    assert.match(en.projectDetail.previewOffline, /offline/i);
  });
});
