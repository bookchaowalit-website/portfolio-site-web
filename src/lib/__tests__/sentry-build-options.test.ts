import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { sentryBuildOptions } from "../../../sentry-build-options.mjs";

// IMPROVEMENT-GOAL.md, performance: Sentry runs errors-only (src/lib/sentry.ts),
// yet its tracing and logger code was the biggest client chunk (~350 KB raw,
// ~0.7 s of mobile scripting). The build must tree-shake what we never use.
describe("Sentry build options", () => {
  it("tree-shakes tracing, debug logging and replay code from the client bundle", () => {
    const t = sentryBuildOptions.webpack?.treeshake ?? {};
    assert.equal(t.removeTracing, true);
    assert.equal(t.removeDebugLogging, true);
    assert.equal(t.excludeReplayIframe, true);
    assert.equal(t.excludeReplayShadowDOM, true);
    assert.equal(t.excludeReplayCompressionWorker, true);
  });

  it("keeps source maps hidden and only uploads them in production builds", () => {
    assert.equal(sentryBuildOptions.hideSourceMaps, true);
    assert.equal(typeof sentryBuildOptions.sourcemaps?.disable, "boolean");
  });
});

// The SDK is still ~100 KB of JavaScript. Loading it statically in
// instrumentation-client.ts puts its evaluation inside the hydration window
// (Lighthouse TBT). It must be imported lazily, after the page has loaded.
import { readFileSync } from "node:fs";

describe("Sentry client loading", () => {
  const src = readFileSync(new URL("../../../instrumentation-client.ts", import.meta.url), "utf8");
  it("does not import @sentry/nextjs statically", () => {
    assert.doesNotMatch(src, /^\s*import\s[^;]*from\s+["']@sentry\/nextjs["']/m);
  });
  it("imports it dynamically after the load event", () => {
    assert.match(src, /import\(\s*["']@sentry\/nextjs["']\s*\)/);
    assert.match(src, /["']load["']/);
  });
});
