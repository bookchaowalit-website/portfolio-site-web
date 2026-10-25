import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("colour contrast guards (issue #8)", () => {
  it("live-systems 11px warning text uses yellow-700 on light, not yellow-600", () => {
    const src = read("src/components/live-systems-client.tsx");
    assert.doesNotMatch(src, /text-\[11px\][^"]*text-yellow-600/);
    assert.match(src, /text-\[11px\] text-yellow-700 dark:text-yellow-400/);
  });

  it("footer copyright text is not wrapped in an opacity fade", () => {
    const src = read("src/components/footer.tsx");
    const idx = src.indexOf('t("copyright"');
    const before = src.slice(Math.max(0, idx - 600), idx);
    assert.doesNotMatch(before, /initial=\{reducedMotion \? false : \{ opacity: 0 \}\}/);
  });
});
