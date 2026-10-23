import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  DATA_PRODUCT_CATALOG,
  FREE_ONLY_DEFAULTS,
  fetchAllProducts,
  fetchProductRecords,
  isDataProductEnvelope,
  sanitizeUserFacingMessage,
  toHealthSummaries,
} from "../index.ts";
import type { DataProductEnvelope } from "../types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

async function loadFixture(productId: string): Promise<DataProductEnvelope> {
  const raw = await readFile(
    join(root, "fixtures", "data-products", `${productId}.json`),
    "utf8",
  );
  return JSON.parse(raw) as DataProductEnvelope;
}

function mockFetch(handlers: Record<string, () => Response>): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    if (method !== "GET") {
      throw new Error(`Non-GET method forbidden in consumer: ${method}`);
    }
    for (const [prefix, handler] of Object.entries(handlers)) {
      if (url.includes(prefix)) return handler();
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };
}

it("explicit URL wins over environment and malformed empty data remains an error", async () => {
  const original = process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_CRYPTO;
  process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_CRYPTO = "http://127.0.0.1:9999";
  try {
    const fixture = await loadFixture("crypto");
    const result = await fetchProductRecords("crypto", {
      useFixtures: false,
      baseUrl: "http://127.0.0.1:8999",
      fetchImpl: async (input) => {
        assert.ok(String(input).startsWith("http://127.0.0.1:8999/"));
        return new Response(JSON.stringify({ ...fixture, data_status: "malformed", items: [] }));
      },
    });
    assert.equal(result.source, "api");
    assert.equal(result.state, "error");
  } finally {
    if (original === undefined) delete process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_CRYPTO;
    else process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_CRYPTO = original;
  }
});

describe("portfolio data-product catalog", () => {
  it("covers frozen ports 8101-8106 plus news.v1 and discovery.v1", () => {
    assert.equal(DATA_PRODUCT_CATALOG.length, 8);
    assert.deepEqual(
      DATA_PRODUCT_CATALOG.map((p) => p.port).sort(),
      [8101, 8102, 8103, 8104, 8105, 8106, 8108, 8110],
    );
    assert.equal(FREE_ONLY_DEFAULTS.freeOnly, true);
    assert.equal(FREE_ONLY_DEFAULTS.allowExternalWrites, false);
    assert.equal(FREE_ONLY_DEFAULTS.allowPaidProviders, false);
  });

  it("uses unique loopback base URLs only", () => {
    for (const product of DATA_PRODUCT_CATALOG) {
      assert.match(product.baseUrl, /^http:\/\/127\.0\.0\.1:(?:810[1-8]|8110)$/);
    }
  });
});

describe("sanitizeUserFacingMessage", () => {
  it("keeps UI messages free of raw provider or secret text", () => {
    assert.equal(
      sanitizeUserFacingMessage("unavailable", { usingFixture: true }),
      "Local API unavailable; using fixture fallback",
    );
    assert.equal(
      sanitizeUserFacingMessage("timeout", { usingFixture: true }),
      "Local API timed out; using fixture fallback",
    );
    assert.equal(
      sanitizeUserFacingMessage("http", { status: 500, usingFixture: true }),
      "Local API returned HTTP 500; using fixture fallback",
    );
  });
});

describe("portfolio client contracts", () => {
  it("loads all fixtures offline without network", async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      throw new Error("network forbidden");
    };
    const results = await fetchAllProducts({
      useFixtures: true,
      fetchImpl,
      loadFixture,
    });
    assert.equal(calls, 0);
    assert.equal(results.length, 8);
    assert.ok(results.every((r) => r.source === "fixture"));
    assert.ok(results.every((r) => r.envelope && isDataProductEnvelope(r.envelope)));
    const summaries = toHealthSummaries(results);
    assert.equal(summaries.length, 8);
  });

  it("parses mocked API envelopes", async () => {
    const fixture = await loadFixture("crypto");
    const live = { ...fixture, data_status: "ok" };
    const fetchImpl = mockFetch({
      "127.0.0.1:8101/v1/records": () =>
        new Response(JSON.stringify(live), { status: 200 }),
    });
    const result = await fetchProductRecords("crypto", {
      useFixtures: false,
      fetchImpl,
      loadFixture,
    });
    assert.equal(result.source, "api");
    assert.equal(result.state, "ready");
  });

  it("handles empty data", async () => {
    const empty: DataProductEnvelope = {
      schema_version: "stock.v1",
      source: "book-stock-data",
      retrieved_at: "2026-08-04T00:00:00Z",
      data_status: "empty",
      items: [],
      next_cursor: null,
    };
    const fetchImpl = mockFetch({
      "127.0.0.1:8102/v1/records": () =>
        new Response(JSON.stringify(empty), { status: 200 }),
    });
    const result = await fetchProductRecords("stocks", {
      useFixtures: false,
      fetchImpl,
      loadFixture,
    });
    assert.equal(result.state, "empty");
  });

  it("handles stale data", async () => {
    const fixture = await loadFixture("fx");
    const fetchImpl = mockFetch({
      "127.0.0.1:8103/v1/records": () =>
        new Response(JSON.stringify({ ...fixture, data_status: "stale" }), {
          status: 200,
        }),
    });
    const result = await fetchProductRecords("fx", {
      useFixtures: false,
      fetchImpl,
      loadFixture,
    });
    assert.equal(result.state, "stale");
  });

  it("handles timeout with fixture fallback and safe message", async () => {
    const fetchImpl: typeof fetch = async (_i, init) =>
      new Promise((_resolve, reject) => {
        const signal = init?.signal;
        const fail = () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        };
        if (signal?.aborted) fail();
        else signal?.addEventListener("abort", fail);
      });
    const result = await fetchProductRecords("defi", {
      useFixtures: false,
      fetchImpl,
      loadFixture,
      timeoutMs: 15,
    });
    assert.equal(result.source, "fixture");
    assert.equal(result.state, "timeout");
    assert.equal(result.errorMessage, "Local API timed out; using fixture fallback");
  });

  it("handles API unavailable with fixture fallback and safe message", async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new TypeError("fetch failed secret=abc FIRECRAWL_KEY=xyz");
    };
    const result = await fetchProductRecords("crypto", {
      useFixtures: false,
      fetchImpl,
      loadFixture,
    });
    assert.equal(result.source, "fixture");
    assert.ok(result.envelope);
    assert.equal(result.errorMessage, "Local API unavailable; using fixture fallback");
    assert.equal(String(result.errorMessage).includes("secret="), false);
    assert.equal(String(result.errorMessage).includes("FIRECRAWL"), false);
  });

  it("handles HTTP error with fixture fallback", async () => {
    const fetchImpl = mockFetch({
      "127.0.0.1:8105/v1/records": () =>
        new Response(JSON.stringify({ error: "provider exploded", detail: "paid tier" }), {
          status: 503,
        }),
    });
    const result = await fetchProductRecords("flights", {
      useFixtures: false,
      fetchImpl,
      loadFixture,
    });
    assert.equal(result.source, "fixture");
    assert.equal(result.errorMessage, "Local API returned HTTP 503; using fixture fallback");
    assert.equal(String(result.errorMessage).includes("paid tier"), false);
    assert.equal(String(result.errorMessage).includes("provider exploded"), false);
  });

  it("only issues GET /v1/records", async () => {
    const methods: string[] = [];
    const urls: string[] = [];
    const fixture = await loadFixture("seo");
    const fetchImpl: typeof fetch = async (input, init) => {
      methods.push((init?.method ?? "GET").toUpperCase());
      urls.push(String(input));
      return new Response(JSON.stringify({ ...fixture, data_status: "ok" }), { status: 200 });
    };
    await fetchProductRecords("seo", { useFixtures: false, fetchImpl, loadFixture });
    assert.deepEqual(methods, ["GET"]);
    assert.match(urls[0], /\/v1\/records\?/);
    assert.equal(urls[0].includes("/v1/refresh"), false);
  });

  it("never POSTs refresh and keeps user messages free of secrets in all states", async () => {
    const methods: string[] = [];
    const fixture = await loadFixture("crypto");
    const track: typeof fetch = async (input, init) => {
      methods.push((init?.method ?? "GET").toUpperCase());
      const url = String(input);
      assert.equal(url.includes("/v1/refresh"), false);
      return new Response(JSON.stringify({ ...fixture, data_status: "ok" }), { status: 200 });
    };
    await fetchProductRecords("crypto", { useFixtures: false, fetchImpl: track, loadFixture });
    assert.deepEqual(methods, ["GET"]);

    const ready = await fetchProductRecords("crypto", {
      useFixtures: false,
      loadFixture,
      fetchImpl: mockFetch({
        "127.0.0.1:8101/v1/records": () =>
          new Response(JSON.stringify({ ...fixture, data_status: "ok" }), { status: 200 }),
      }),
    });
    assert.equal(ready.state, "ready");

    const empty = await fetchProductRecords("stocks", {
      useFixtures: false,
      loadFixture,
      fetchImpl: mockFetch({
        "127.0.0.1:8102/v1/records": () =>
          new Response(
            JSON.stringify({
              schema_version: "stock.v1",
              source: "book-stock-data",
              retrieved_at: "2026-08-04T00:00:00Z",
              data_status: "empty",
              items: [],
              next_cursor: null,
            }),
            { status: 200 },
          ),
      }),
    });
    assert.equal(empty.state, "empty");

    const err = await fetchProductRecords("fx", {
      useFixtures: false,
      loadFixture: async () => {
        throw new Error("no fixture");
      },
      fetchImpl: mockFetch({
        "127.0.0.1:8103/v1/records": () =>
          new Response(JSON.stringify({ not: "envelope" }), { status: 200 }),
      }),
    });
    assert.equal(err.state, "error");
    assert.equal(sanitizeUserFacingMessage("invalid_envelope").includes("secret"), false);
  });

  it("contains no legacy scraper path references in client source", async () => {
    const src = await readFile(
      join(root, "src/lib/data-products/client.ts"),
      "utf8",
    );
    assert.equal(src.includes("scraper-dashboard"), false);
    assert.equal(src.includes("book-scraping"), false);
    assert.equal(src.includes("FIRECRAWL"), false);
    assert.equal(src.includes("domains/book-finance"), false);
    assert.match(src, /method:\s*"GET"/);
    assert.match(src, /sanitizeUserFacingMessage/);
  });

  it("service worker source purges deprecated scraper-dashboard cache entries", async () => {
    const sw = await readFile(join(root, "src/app/sw.ts"), "utf8");
    assert.match(sw, /scraper-dashboard/);
    assert.match(sw, /caches\.(keys|open|delete)|cache\.delete/);
    const nextConfig = await readFile(join(root, "next.config.js"), "utf8");
    assert.match(nextConfig, /scraper-dashboard/);
  });

  it("live systems UI labels source and status accessibly", async () => {
    const ui = await readFile(join(root, "src/components/live-systems-client.tsx"), "utf8");
    assert.match(ui, /aria-live/);
    assert.match(ui, /role="status"|role='status'/);
    assert.match(ui, /Data source|data source|sourceLabel|source:/i);
    assert.equal(ui.includes("FIRECRAWL"), false);
  });
});
