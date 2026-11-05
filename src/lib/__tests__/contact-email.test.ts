import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

// Client and freelance contact moved to the work address on 2026-11-05. The
// personal address must not be published anywhere on the site: pages, copy,
// RSS feeds, the media kit or the MCP contact tool.
const root = path.resolve(import.meta.dirname, "../../..");
const WORK_EMAIL = "bookchaowalit.work@gmail.com";
const PERSONAL_PATTERN = /bookchaowalit@gmail\.com/;
const SELF = path.join("src", "lib", "__tests__", "contact-email.test.ts");

function files(dir: string): string[] {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(rel);
    return /\.(tsx?|jsx?|mjs|json|html|xml|md|mdx)$/.test(entry.name) ? [rel] : [];
  });
}

describe("contact email", () => {
  it("the personal address is not published in src/, messages/, public/ or content/", () => {
    const hits = ["src", "messages", "public", "content"]
      .filter((dir) => fs.existsSync(path.join(root, dir)))
      .flatMap(files)
      .filter((file) => file !== SELF)
      .filter((file) => PERSONAL_PATTERN.test(fs.readFileSync(path.join(root, file), "utf8")));
    assert.deepEqual(hits, []);
  });

  it("the contact page, footer and MCP contact tool use the work address", () => {
    for (const file of [
      "src/app/[locale]/contact/page.tsx",
      "src/components/footer.tsx",
      "src/lib/mcp/tools/get-contact-info.ts",
    ]) {
      assert.ok(fs.readFileSync(path.join(root, file), "utf8").includes(WORK_EMAIL), file);
    }
  });
});
