import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { BROWSER_EVENTS, sanitizeProps } from "../browser-analytics.ts";
import { SERVER_EVENTS } from "../server-analytics.ts";
import { allProjects } from "../../data/app-projects.ts";

// The event catalog (docs/measurement/EVENTS.md) and the code must agree:
// every listed event has a call site and a test, and the code cannot send an
// event the catalog does not list. The dashboard spec only uses catalog events.
const root = path.resolve(import.meta.dirname, "../../..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const catalog = read("docs/measurement/EVENTS.md");

const rows = catalog
  .slice(catalog.indexOf("## Events"), catalog.indexOf("## Identity"))
  .split("\n")
  .filter((line) => /^\| `/.test(line))
  .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));
const events = rows.map(([name, emittedBy, , , callSite, tests]) => ({
  name: name.replace(/`/g, ""),
  emittedBy,
  callFile: callSite.match(/`([^`]+)`/)![1],
  tests: [...tests.matchAll(/`([^`]+)`/g)].map((m) => m[1]),
}));
const listed = new Set(events.map((e) => e.name));

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : sourceFiles(rel);
    return /\.tsx?$/.test(entry.name) ? [rel] : [];
  });
}

describe("event catalog", () => {
  it("lists the five pilot events", () => {
    assert.deepEqual([...listed].sort(), ["$pageview", "click_demo", "click_source", "contact_sent", "view_project"]);
  });

  it("every catalog event has a call site that names it", () => {
    for (const event of events) {
      const source = read(event.callFile);
      if (event.name === "$pageview") assert.match(source, /analytics\.page\(/, event.callFile);
      else if (event.emittedBy.startsWith("server")) assert.match(source, new RegExp(`trackServer\\(\\s*['"]${event.name}['"]`), event.callFile);
      else assert.match(source, new RegExp(`analytics\\.track\\(\\s*['"]${event.name}['"]`), `${event.name} in ${event.callFile}`);
    }
  });

  it("every catalog event has a test that names it", () => {
    for (const event of events) {
      assert.ok(event.tests.length > 0, event.name);
      const named = event.tests.some((file) => read(file).includes(event.name === "$pageview" ? "page(" : event.name));
      assert.ok(named, `${event.name} named in ${event.tests.join(", ")}`);
    }
  });

  it("the code cannot send an event the catalog does not list", () => {
    for (const name of Object.keys(BROWSER_EVENTS)) assert.ok(listed.has(name), `browser ${name}`);
    for (const name of Object.keys(SERVER_EVENTS)) assert.ok(listed.has(name), `server ${name}`);
  });

  it("every analytics.track / trackServer call in src/ uses a catalog event", () => {
    let calls = 0;
    for (const file of sourceFiles("src")) {
      for (const [, name] of read(file).matchAll(/(?:analytics\.track|trackServer)\(\s*['"]([^'"]+)['"]/g)) {
        calls += 1;
        assert.ok(listed.has(name), `${file}: ${name}`);
      }
    }
    assert.ok(calls >= 4, "call sites found");
  });

  it("every catalog project slug passes the slug rule, so view_project is never silently dropped", () => {
    for (const project of allProjects) {
      assert.ok(sanitizeProps("view_project", { project_slug: project.slug, evidence_level: "none" }), project.slug);
    }
  });

  it("dashboard spec: valid JSON, PostHog KPIs covered, min-volume guarded, product filter, catalog events only", () => {
    const spec = JSON.parse(read("analytics/posthog/dashboard.json"));
    assert.equal(spec.product, "portfolio");
    const kpis = new Set(spec.insights.map((i: { kpi: string | null }) => i.kpi).filter(Boolean));
    for (const kpi of ["KPI-O-01", "KPI-L-01", "KPI-L-02"]) assert.ok(kpis.has(kpi), kpi);
    assert.ok(spec.insights.some((i: { kpi: string | null; name: string }) => i.kpi === null && /first-event/i.test(i.name)));
    for (const insight of spec.insights) {
      assert.equal(insight.query.kind, "HogQLQuery");
      assert.match(insight.query.query, /properties\.product = 'portfolio'/, insight.name);
      if (insight.kpi && insight.kpi !== "KPI-O-01") {
        assert.ok(insight.min_volume, `${insight.name} has min_volume`);
        assert.match(insight.query.query, /if\(/, `${insight.name} guards the rate`);
      }
      for (const name of insight.events) assert.ok(listed.has(name), `${insight.name}: ${name}`);
      for (const [, name] of insight.query.query.matchAll(/event = '([^']+)'/g)) assert.ok(listed.has(name), `${insight.name}: ${name}`);
      for (const [, list] of insight.query.query.matchAll(/event IN \(([^)]+)\)/g)) {
        for (const [, name] of list.matchAll(/'([^']+)'/g)) assert.ok(listed.has(name), `${insight.name}: ${name}`);
      }
    }
  });

  it("outcome review OR-201 and experiment log follow the learn-file rules", () => {
    const review = read("docs/measurement/OUTCOME-REVIEW-001.md");
    const front = review.slice(0, review.indexOf("\n---", 4));
    assert.doesNotMatch(front, /status:\s*template/);
    assert.match(review, /\| Review ID \| OR-201 \|/);
    assert.match(review, /\| Status \| pending go-live \|/);
    assert.match(review, /^\| # \| Decision \| Type \| Owner \| Due \| Tracked in \|$/m);
    assert.match(review, /^\| 1 \| \[[^\]]+\] \|/m);
    assert.ok(fs.existsSync(path.join(root, "docs/measurement/EXPERIMENT-LOG.md")));
  });
});
