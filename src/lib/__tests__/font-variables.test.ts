import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

// Tailwind resolves --default-font-family and the --font-* theme variables on
// <html>, so the next/font variables (Geist, Kalam, Noto Sans Thai) and the
// Thai remap class must be set there. On <body> they are undefined where they
// are read and the whole site falls back to the browser's system font.
const root = path.resolve(import.meta.dirname, "../../..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");
const layout = read("src/app/[locale]/layout.tsx");

const tag = (name: string) => {
  const match = layout.match(new RegExp(`<${name}\\b[\\s\\S]*?>`));
  assert.ok(match, `<${name}> not found in layout`);
  return match[0];
};

describe("font variables", () => {
  it("are set on <html>, not <body>", () => {
    for (const font of ["geistSans", "geistMono", "notoSansThai", "kalam"]) {
      assert.match(tag("html"), new RegExp(`${font}\\.variable`), font);
      assert.doesNotMatch(tag("body"), new RegExp(`${font}\\.variable`), font);
    }
  });

  it("Thai remap class sits on <html> with them", () => {
    assert.match(tag("html"), /font-thai/);
    assert.doesNotMatch(tag("body"), /font-thai/);
  });

  it("app theme no longer pins body to the system font stack", () => {
    assert.doesNotMatch(read("src/app/app-theme.css"), /BlinkMacSystemFont/);
  });
});
