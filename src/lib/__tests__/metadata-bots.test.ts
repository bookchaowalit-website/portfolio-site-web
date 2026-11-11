import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { htmlLimitedBots } from "../../../metadata-bots.mjs";

// IMPROVEMENT-GOAL.md, SEO: Next 15 streams metadata into <body> for user
// agents that are not in `htmlLimitedBots`. Googlebot and ordinary browsers
// then see <meta name="description"> after </head>. Every user agent must get
// blocking metadata so the tags land in <head>.
const agents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  "",
];

describe("metadata placement", () => {
  for (const ua of agents) {
    it(`serves blocking metadata to ${ua.slice(0, 40) || "an empty user agent"}`, () => {
      assert.ok(htmlLimitedBots.test(ua));
    });
  }
});
