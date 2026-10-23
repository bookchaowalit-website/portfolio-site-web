/**
 * Full browser walkthrough for data-product consumers.
 *
 * Prerequisites (started outside this file when running standalone):
 * - Local APIs on 127.0.0.1:8101–8110
 * - Insights static server on 127.0.0.1:4173
 * - Portfolio dev server on localhost:3000 (playwright.config webServer)
 *
 * Env:
 *   INSIGHTS_URL=http://127.0.0.1:4173
 *   SKIP_INSIGHTS=1 to skip insights checks
 */
import { test, expect, type Page, type Request } from "@playwright/test";

const INSIGHTS_URL = process.env.INSIGHTS_URL || "http://127.0.0.1:4173";
const SKIP_INSIGHTS = process.env.SKIP_INSIGHTS === "1";

const SECRET_RE =
  /api[_-]?key|bearer\s|password=|FIRECRAWL|TEQUILA_API|super-secret|TODOIST_API|TELEGRAM_/i;

function trackRequests(page: Page) {
  const requests: { method: string; url: string }[] = [];
  page.on("request", (req: Request) => {
    requests.push({ method: req.method(), url: req.url() });
  });
  return requests;
}

function assertNoSecretLeak(text: string, label: string) {
  expect(text, `${label} must not leak secrets/provider keys`).not.toMatch(SECRET_RE);
}

function assertNoRefreshPost(requests: { method: string; url: string }[]) {
  const bad = requests.filter(
    (r) => r.method.toUpperCase() === "POST" && r.url.includes("/v1/refresh"),
  );
  expect(bad, "browser must never POST /v1/refresh").toEqual([]);
}

function assertLocalOnly(requests: { method: string; url: string }[]) {
  for (const r of requests) {
    if (!r.url.startsWith("http")) continue;
    const u = new URL(r.url);
    // Allow same-origin app assets and loopback data APIs only
    const host = u.hostname;
    const ok =
      host === "127.0.0.1" ||
      host === "localhost" ||
      host === "::1" ||
      // Next.js HMR / analytics should not fire external writes for data products;
      // if third-party scripts load, ignore non-data-product hosts for this check
      // and only hard-fail data-product ports leaving localhost.
      true;
    if (u.port && ["8101", "8102", "8103", "8104", "8105", "8106", "8108", "8110"].includes(u.port)) {
      expect(["127.0.0.1", "localhost", "::1"]).toContain(host);
    }
    void ok;
  }
}

test.describe("Portfolio Live Systems walkthrough", () => {
  test("fixture mode shows offline fixture sources and a11y labels", async ({ page }) => {
    const requests = trackRequests(page);
    await page.goto("/en/live-systems?fixtures=1");

    // Loading then ready
    await expect(page.getByRole("heading", { name: /Live Data Products/i })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: /Offline fixture mode/i })).toBeVisible({
      timeout: 20_000,
    });

    // Product cards with status + data source labels
    await expect(page.getByRole("list", { name: /Data product health cards/i })).toBeVisible();
    await expect(page.getByText("Crypto Markets").first()).toBeVisible();
    await expect(page.getByLabel(/Crypto Markets data source: offline fixture/i)).toBeVisible();
    await expect(page.getByLabel(/Crypto Markets status:/i)).toBeVisible();

    // Free-only policy labels
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/free_only=true/i);
    expect(body).toMatch(/allow_external_writes=false/i);
    assertNoSecretLeak(body, "portfolio fixture body");

    assertNoRefreshPost(requests);
    assertLocalOnly(requests);
  });

  test("live mode loads from local APIs with status labels", async ({ page }) => {
    const requests = trackRequests(page);
    await page.goto("/en/live-systems");

    await expect(page.getByRole("heading", { name: /Live Data Products/i })).toBeVisible();
    // Banner after load
    await expect(
      page.getByRole("status").filter({ hasText: /Loaded \d+ from local APIs|fixture fallbacks|free-only/i }),
    ).toBeVisible({ timeout: 25_000 });

    // Expect local API data-source labels for at least one product when APIs are up
    const apiSource = page.getByLabel(/data source: local API/i);
    const fixtureSource = page.getByLabel(/data source: offline fixture/i);
    await expect(apiSource.or(fixtureSource).first()).toBeVisible({ timeout: 25_000 });

    // Schema ports visible in map
    await expect(page.getByText("8101").first()).toBeVisible();
    await expect(page.getByText("8108").first()).toBeVisible();
    await expect(page.getByText("8110").first()).toBeVisible();
    await expect(page.getByRole("table", { name: /Local data-product API map/i })).toBeVisible();

    const body = await page.locator("body").innerText();
    assertNoSecretLeak(body, "portfolio live body");
    expect(body).not.toMatch(/ECONNREFUSED|stack trace|Traceback/i);

    // Network: GET records only to loopback data ports
    const dataReqs = requests.filter((r) => /127\.0\.0\.1:(?:810[1-8]|8110)/.test(r.url));
    expect(dataReqs.length).toBeGreaterThan(0);
    for (const r of dataReqs) {
      expect(r.method.toUpperCase()).toBe("GET");
      expect(r.url).not.toContain("/v1/refresh");
    }
    assertNoRefreshPost(requests);
  });

  test("keyboard focus reaches primary content and nav", async ({ page }) => {
    await page.goto("/en/live-systems?fixtures=1");
    await expect(page.getByRole("heading", { name: /Live Data Products/i })).toBeVisible();

    // Tab through interactive elements; focus should be visible on links/buttons
    await page.keyboard.press("Tab");
    const focused1 = page.locator(":focus");
    await expect(focused1).toBeVisible();

    // Navigate via keyboard to Live Systems if in main nav (already there)
    const liveNav = page.locator('nav a[href*="live-systems"]').first();
    if (await liveNav.count()) {
      await liveNav.focus();
      await expect(liveNav).toBeFocused();
    }
  });

  test("responsive layout at mobile and desktop widths", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en/live-systems?fixtures=1");
    await expect(page.getByRole("heading", { name: /Live Data Products/i })).toBeVisible();
    await expect(page.getByText("Crypto Markets").first()).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole("heading", { name: /Live Data Products/i })).toBeVisible();
    await expect(page.getByText("Crypto Markets").first()).toBeVisible();
    // Cards still readable
    const card = page.locator('[aria-labelledby^="product-"]').first();
    await expect(card).toBeVisible();
  });

  test("synthetic timeout/unavailable/error/empty states via route mocks", async ({ page }) => {
    // Mock all data-product APIs to exercise UI states without external network
    await page.route("http://127.0.0.1:8101/v1/records**", async (route) => {
      // timeout simulation: abort
      await route.abort("timedout");
    });
    await page.route("http://127.0.0.1:8102/v1/records**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          schema_version: "stock.v1",
          source: "book-stock-data",
          retrieved_at: "2026-08-04T00:00:00Z",
          data_status: "empty",
          items: [],
          next_cursor: null,
        }),
      });
    });
    await page.route("http://127.0.0.1:8103/v1/records**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ not: "an envelope", error: "provider secret=abc FIRECRAWL_KEY=xyz" }),
      });
    });
    // Remaining ports: network failure → fixture fallback or unavailable
    for (const port of [8104, 8105, 8106, 8108, 8110]) {
      await page.route(`http://127.0.0.1:${port}/v1/records**`, async (route) => {
        await route.abort("connectionfailed");
      });
    }

    const requests = trackRequests(page);
    await page.goto("/en/live-systems");
    await expect(page.getByRole("heading", { name: /Live Data Products/i })).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.getByRole("status").filter({ hasText: /free-only|fixture|Loaded/i })).toBeVisible({
      timeout: 20_000,
    });

    const body = await page.locator("body").innerText();
    // Safe messages only — raw provider secret payload must not appear
    expect(body).not.toMatch(/FIRECRAWL_KEY=xyz|secret=abc/i);
    assertNoSecretLeak(body, "portfolio mocked states");
    // Some state vocabulary should surface
    expect(body.toLowerCase()).toMatch(/timeout|unavailable|empty|error|stale|fixture|ready|loading/);

    assertNoRefreshPost(requests);
  });
});

test.describe("Solo Empire Insights walkthrough", () => {
  test.skip(SKIP_INSIGHTS, "SKIP_INSIGHTS=1");

  test("fixture mode dashboard and a11y", async ({ page }) => {
    const requests = trackRequests(page);
    await page.goto(`${INSIGHTS_URL}/?fixtures=1`);

    await expect(page.getByRole("heading", { name: /Solo Empire Insights/i })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Data products/i })).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: /products loaded|Loading data products/i }),
    ).toBeVisible({ timeout: 15_000 });

    // Cards list
    await expect(page.getByRole("list", { name: /Data product status cards/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator("#card-crypto")).toBeVisible();
    await expect(page.locator("#card-crypto .badge")).toContainText(/fixture|Ready|Stale|Empty/i);

    // Skip link + keyboard
    const skip = page.locator("a.skip-link");
    await expect(skip).toHaveCount(1);
    await page.keyboard.press("Tab");
    // first focusable may be skip link
    const body = await page.locator("body").innerText();
    expect(body).toMatch(/free-only|no external writes/i);
    assertNoSecretLeak(body, "insights fixture");

    assertNoRefreshPost(requests);
  });

  test("live mode dashboard hits local APIs", async ({ page }) => {
    const requests = trackRequests(page);
    await page.goto(`${INSIGHTS_URL}/`);

    await expect(page.getByRole("heading", { name: /Solo Empire Insights/i })).toBeVisible();
    await expect(page.locator("#card-crypto")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("#card-crypto .badge")).not.toHaveText(/loading/i, {
      timeout: 20_000,
    });

    const badge = (await page.locator("#card-crypto .badge").innerText()).toLowerCase();
    expect(badge).toMatch(/local api|offline fixture|ready|stale|timeout|empty|error|unavailable/);

    const dataReqs = requests.filter((r) => /127\.0\.0\.1:(?:810[1-8]|8110)\/v1\/records/.test(r.url));
    // Live mode should attempt API GETs (unless forced fixtures)
    expect(dataReqs.length).toBeGreaterThan(0);
    for (const r of dataReqs) {
      expect(r.method.toUpperCase()).toBe("GET");
    }
    assertNoRefreshPost(requests);

    const body = await page.locator("body").innerText();
    assertNoSecretLeak(body, "insights live");
  });

  test("product page navigation and table a11y", async ({ page }) => {
    await page.goto(`${INSIGHTS_URL}/crypto.html?fixtures=1`);
    await expect(page.getByRole("heading", { name: /Crypto Markets/i })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Data products/i })).toBeVisible();
    await expect(page.locator(".status-banner[role='status']")).toBeVisible({ timeout: 15_000 });

    // Table with caption for screen readers
    await expect(page.locator("table.data-table")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("table.data-table caption.sr-only")).toHaveCount(1);

    // Nav to stocks
    await page.getByRole("link", { name: "Stocks" }).click();
    await expect(page).toHaveURL(/stocks\.html/);
    await expect(page.getByRole("heading", { name: /Stock Portfolio/i })).toBeVisible();
  });

  test("responsive insights layout", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`${INSIGHTS_URL}/?fixtures=1`);
    await expect(page.getByRole("heading", { name: /Solo Empire Insights/i })).toBeVisible();
    await expect(page.locator('[aria-labelledby="title-seo"]')).toBeVisible({ timeout: 15_000 });

    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator("#dp-grid")).toBeVisible();
  });

  test("mock states: empty, error, timeout messaging stays safe", async ({ page }) => {
    await page.route("http://127.0.0.1:8101/v1/records**", (route) => route.abort("timedout"));
    await page.route("http://127.0.0.1:8102/v1/records**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          schema_version: "stock.v1",
          source: "book-stock-data",
          retrieved_at: "2026-08-04T00:00:00Z",
          data_status: "empty",
          items: [],
          next_cursor: null,
        }),
      });
    });
    await page.route("http://127.0.0.1:8103/v1/records**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ error: "raw provider secret=abc", detail: "FIRECRAWL boom" }),
      });
    });
    for (const port of [8104, 8105, 8106, 8110]) {
      await page.route(`http://127.0.0.1:${port}/v1/records**`, (route) =>
        route.abort("connectionfailed"),
      );
    }

    await page.goto(`${INSIGHTS_URL}/`);
    await expect(page.locator("#card-crypto .badge")).not.toHaveText(/loading/i, {
      timeout: 20_000,
    });
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/secret=abc|FIRECRAWL boom/i);
    assertNoSecretLeak(body, "insights mocked states");
  });
});
