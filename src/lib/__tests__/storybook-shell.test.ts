import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mockApiFetch, NAVIGATION_PATHNAME, syncStoredTheme } from "../../../.storybook/shell.ts";

// Codex review of the Storybook setup (#38):
// - the Newsletter story posted to /api/newsletter, which Storybook does not
//   serve, so it always showed the error state;
// - ThemeToggle reads localStorage on mount and overrode the toolbar theme;
// - the router mock was pinned to "/th", so English stories saw "/th" as the
//   current path and the language switcher built "/th/th".
describe("Storybook shell", () => {
  it("answers POST /api/newsletter with success and leaves other requests alone", async () => {
    const seen: string[] = [];
    const real = (async (input: RequestInfo | URL) => {
      seen.push(String(input));
      return new Response("real", { status: 200 });
    }) as typeof fetch;
    const fetchMock = mockApiFetch(real);

    const res = await fetchMock("/api/newsletter", { method: "POST", body: JSON.stringify({ email: "a@b.co" }) });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { success: true });

    const bad = await fetchMock("/api/newsletter", { method: "POST", body: JSON.stringify({ email: "fail@example.com" }) });
    assert.equal(bad.status, 400);
    assert.ok((await bad.json()).error);

    await fetchMock("/fonts/x.woff2");
    assert.deepEqual(seen, ["/fonts/x.woff2"]);
  });

  it("stores the toolbar theme so ThemeToggle mounts in the same state", () => {
    const store = new Map<string, string>([["theme", "dark"]]);
    const storage = { setItem: (k: string, v: string) => void store.set(k, v) };
    syncStoredTheme(storage, "light");
    assert.equal(store.get("theme"), "light");
    syncStoredTheme(storage, "dark");
    assert.equal(store.get("theme"), "dark");
  });

  it("mocks a pathname without a locale prefix", () => {
    assert.equal(NAVIGATION_PATHNAME, "/");
  });
});
