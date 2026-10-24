import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const post = readFileSync(
  new URL("../../../content/blog/building-100-micro-frontends.mdx", import.meta.url),
  "utf8"
);

describe("blog post building-100-micro-frontends", () => {
  it("does not claim 100 apps, per-app analytics or unsourced metrics", () => {
    assert.doesNotMatch(post, /\b100\b/);
    assert.doesNotMatch(post, /separate analytics/i);
    assert.doesNotMatch(post, /cross-app production incidents/i);
    assert.doesNotMatch(post, /~4\.5s/);
  });
});

describe("table of contents panel", () => {
  it("is removed from layout on mobile when closed (no 375px overflow)", () => {
    const toc = readFileSync(
      new URL("../../components/table-of-contents.tsx", import.meta.url),
      "utf8"
    );
    assert.doesNotMatch(toc, /translate-x-full/);
    assert.match(toc, /max-lg:hidden/);
  });
});
