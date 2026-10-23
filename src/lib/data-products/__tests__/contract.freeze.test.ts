/**
 * Compatibility freeze test against data-product v3 contracts.
 * SSOT: bookchaowalit/architecture-docs systems/architecture/data-product-contracts-v3.yaml
 * Breaking changes require a new schema_version (e.g. crypto.v2).
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  DATA_PRODUCT_CATALOG,
  FREE_ONLY_DEFAULTS,
  isDataProductEnvelope,
} from "../index.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

/** Frozen v3 map — must match systems/architecture/data-product-contracts-v3.yaml (ai_tools / 8107 retired 2026-10-23) */
const FROZEN = [
  { id: "crypto", port: 8101, schemaVersion: "crypto.v1", repo: "book-crypto-data" },
  { id: "stocks", port: 8102, schemaVersion: "stock.v1", repo: "book-stock-data" },
  { id: "fx", port: 8103, schemaVersion: "fx.v1", repo: "book-fx-data" },
  { id: "defi", port: 8104, schemaVersion: "defi.v1", repo: "book-defi-data" },
  { id: "flights", port: 8105, schemaVersion: "flight.v1", repo: "book-flight-data" },
  { id: "seo", port: 8106, schemaVersion: "seo.v1", repo: "book-seo-data" },
] as const;

const ENVELOPE_KEYS = [
  "schema_version",
  "source",
  "retrieved_at",
  "data_status",
  "items",
  "next_cursor",
] as const;

describe("data-product v3 contract freeze (portfolio consumer)", () => {
  it("catalog matches frozen ports and schema_version values", () => {
    // The v3 six-product freeze; news.v1 and discovery.v1 are additive. ai_tools was retired in v3.
    assert.equal(DATA_PRODUCT_CATALOG.length, 8);
    assert.equal(DATA_PRODUCT_CATALOG.find((p) => p.id === "ai_tools"), undefined);
    assert.ok(!DATA_PRODUCT_CATALOG.some((p) => p.port === 8107), "retired port 8107 must not come back");
    for (const frozen of FROZEN) {
      const product = DATA_PRODUCT_CATALOG.find((p) => p.id === frozen.id);
      assert.ok(product, `missing product ${frozen.id}`);
      assert.equal(product.port, frozen.port);
      assert.equal(product.schemaVersion, frozen.schemaVersion);
      assert.equal(product.repo, frozen.repo);
      assert.equal(product.baseUrl, `http://127.0.0.1:${frozen.port}`);
    }
    const news = DATA_PRODUCT_CATALOG.find((p) => p.id === "news");
    assert.deepEqual(news && { port: news.port, schemaVersion: news.schemaVersion }, {
      port: 8108,
      schemaVersion: "news.v1",
    });
    const discovery = DATA_PRODUCT_CATALOG.find((p) => p.id === "discovery");
    assert.deepEqual(
      discovery && { port: discovery.port, schemaVersion: discovery.schemaVersion },
      { port: 8110, schemaVersion: "discovery.v1" },
    );
  });

  it("free-only consumer policy is frozen", () => {
    assert.equal(FREE_ONLY_DEFAULTS.freeOnly, true);
    assert.equal(FREE_ONLY_DEFAULTS.allowPaidProviders, false);
    assert.equal(FREE_ONLY_DEFAULTS.allowExternalWrites, false);
  });

  it("envelope validator requires all v2 envelope keys", () => {
    const good = {
      schema_version: "crypto.v1",
      source: "book-crypto-data",
      retrieved_at: "2026-08-04T00:00:00Z",
      data_status: "ok",
      items: [{ title: "x" }],
      next_cursor: null,
    };
    assert.equal(isDataProductEnvelope(good), true);
    for (const key of ENVELOPE_KEYS) {
      const bad = { ...good } as Record<string, unknown>;
      delete bad[key];
      assert.equal(isDataProductEnvelope(bad), false, `should reject missing ${key}`);
    }
  });

  it("client source remains GET-only for v2 contracts", async () => {
    const src = await readFile(join(root, "src/lib/data-products/client.ts"), "utf8");
    assert.match(src, /method:\s*"GET"/);
    assert.equal(/method:\s*["']POST["']/.test(src), false);
    assert.match(src, /never POST \/v1\/refresh|GET \/v1\/records only/i);
  });

  it("fixtures declare frozen schema_version values", async () => {
    for (const frozen of FROZEN) {
      const raw = await readFile(
        join(root, "fixtures/data-products", `${frozen.id}.json`),
        "utf8",
      );
      const env = JSON.parse(raw) as Record<string, unknown>;
      assert.equal(env.schema_version, frozen.schemaVersion);
      for (const key of ENVELOPE_KEYS) {
        assert.ok(key in env, `${frozen.id} fixture missing ${key}`);
      }
    }
  });
});
