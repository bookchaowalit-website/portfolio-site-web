import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

// IMPROVEMENT-GOAL.md, security: no known advisories in production deps.
// GHSA-3g3m-2fjr-6pw4 (glob >= 9.0.0, <= 14.0.1) and GHSA-g3hv-75wg-m249
// (minimatch >= 7.0.0, < 11.0.1) reach us through the Serwist and Sentry
// build plugins. This reads package-lock.json, so it fails while any copy
// in those ranges is still locked.
const root = path.resolve(import.meta.dirname, "../../..");
const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));

type Version = [number, number, number];
const parse = (v: string): Version => v.split("-")[0].split(".").map(Number) as Version;
const cmp = (a: Version, b: Version) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

function locked(name: string): { where: string; version: string }[] {
  return Object.entries(lock.packages as Record<string, { version?: string }>)
    .filter(([where]) => where.endsWith(`node_modules/${name}`))
    .map(([where, meta]) => ({ where, version: meta.version ?? "0.0.0" }));
}

describe("dependency advisories", () => {
  it("no glob in the GHSA-3g3m-2fjr-6pw4 range (>= 9.0.0, <= 14.0.1)", () => {
    const bad = locked("glob").filter(({ version }) => {
      const v = parse(version);
      return cmp(v, [9, 0, 0]) >= 0 && cmp(v, [14, 0, 1]) <= 0;
    });
    assert.deepEqual(bad, []);
  });

  it("no minimatch in the GHSA-g3hv-75wg-m249 range (>= 7.0.0, < 11.0.1)", () => {
    const bad = locked("minimatch").filter(({ version }) => {
      const v = parse(version);
      return cmp(v, [7, 0, 0]) >= 0 && cmp(v, [11, 0, 1]) < 0;
    });
    assert.deepEqual(bad, []);
  });
});
