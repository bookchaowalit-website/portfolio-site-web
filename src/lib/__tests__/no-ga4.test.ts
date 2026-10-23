import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

// ADR-0005 rejects GA4 as the default. GA4 used to load on every page before
// any consent; it is removed and PostHog runs behind the consent banner
// instead. This test fails while any GA4 loader or call is left in src/.
const root = path.resolve(import.meta.dirname, "../../..");
const GA_PATTERN = /googletagmanager|gtag|GoogleAnalytics|@next\/third-parties|NEXT_PUBLIC_GA_MEASUREMENT_ID/;
const SELF = path.join("src", "lib", "__tests__", "no-ga4.test.ts");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(rel);
    return /\.(tsx?|jsx?|mjs|cjs)$/.test(entry.name) ? [rel] : [];
  });
}

describe("GA4 is gone", () => {
  it("no GA4 loader, gtag call or measurement id is referenced anywhere in src/", () => {
    const hits = sourceFiles("src")
      .filter((file) => file !== SELF)
      .filter((file) => GA_PATTERN.test(fs.readFileSync(path.join(root, file), "utf8")));
    assert.deepEqual(hits, []);
  });

  it("the GA4 component file no longer exists", () => {
    assert.equal(fs.existsSync(path.join(root, "src/components/google-analytics.tsx")), false);
  });

  it("@next/third-parties is not a dependency", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    assert.equal(pkg.dependencies?.["@next/third-parties"], undefined);
  });

  it("posthog-js is pinned to an exact version", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    assert.equal(pkg.dependencies?.["posthog-js"], "1.438.7");
  });
});
