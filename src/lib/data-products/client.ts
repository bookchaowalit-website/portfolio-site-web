/**
 * Typed read-only client for free-only data-product APIs (ports 8101–8110).
 *
 * - Never scrapes upstream providers
 * - Never imports legacy scraper modules or paths
 * - Never calls POST /v1/refresh or any external write endpoint
 * - Offline demos use sanitized fixtures under /data/data-products/
 * - UI-facing messages never include secrets, stack traces, or raw provider errors
 */

import { DATA_PRODUCT_CATALOG, FREE_ONLY_DEFAULTS, getProduct } from "./catalog.ts";
import type {
  ConsumerLoadState,
  DataProductEnvelope,
  FetchOptions,
  ProductHealthSummary,
  ProductLoadResult,
} from "./types.ts";

/**
 * Public API URL overrides for a hosted frontend. Local loopback URLs remain
 * the default; these variables must contain URLs only and never credentials.
 */
function configuredBaseUrl(productId: string, fallback: string): string {
  const configured =
    productId === "crypto"
      ? process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_CRYPTO
      : productId === "stocks"
        ? process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_STOCKS
        : productId === "fx"
          ? process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_FX
          : productId === "defi"
            ? process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_DEFI
            : productId === "flights"
              ? process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_FLIGHTS
              : productId === "seo"
                ? process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_SEO
                : productId === "news"
                    ? process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_NEWS
                    : productId === "discovery"
                      ? process.env.NEXT_PUBLIC_DATA_PRODUCT_URL_DISCOVERY
                  : undefined;
  return configured?.trim() || fallback;
}

const ENVELOPE_KEYS = [
  "schema_version",
  "source",
  "retrieved_at",
  "data_status",
  "items",
  "next_cursor",
] as const;

/** Safe, non-secret messages for UI and logs. Never include raw provider/network payloads. */
export function sanitizeUserFacingMessage(
  kind:
    | "timeout"
    | "unavailable"
    | "http"
    | "invalid_envelope"
    | "unknown_product"
    | "fixture_failed"
    | "generic",
  detail?: { status?: number; productId?: string; usingFixture?: boolean },
): string {
  const fixtureSuffix = detail?.usingFixture ? "; using fixture fallback" : "";
  switch (kind) {
    case "timeout":
      return `Local API timed out${fixtureSuffix}`;
    case "unavailable":
      return `Local API unavailable${fixtureSuffix}`;
    case "http":
      return `Local API returned HTTP ${detail?.status ?? "error"}${fixtureSuffix}`;
    case "invalid_envelope":
      return "Response is not a versioned data-product envelope";
    case "unknown_product":
      return `Unknown product id: ${detail?.productId ?? "?"}`;
    case "fixture_failed":
      return "Offline fixture unavailable";
    default:
      return "Unable to load data product";
  }
}

export function isDataProductEnvelope(value: unknown): value is DataProductEnvelope {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  for (const key of ENVELOPE_KEYS) {
    if (!(key in obj)) return false;
  }
  if (!Array.isArray(obj.items)) return false;
  return typeof obj.schema_version === "string" && typeof obj.source === "string";
}

function stateFromEnvelope(envelope: DataProductEnvelope): ConsumerLoadState {
  if (envelope.data_status === "malformed") return "error";
  if (envelope.data_status === "empty" || envelope.items.length === 0) return "empty";
  if (envelope.data_status === "stale") return "stale";
  return "ready";
}

function preferFixturesEnv(): boolean {
  if (typeof process !== "undefined" && process.env) {
    const v =
      process.env.NEXT_PUBLIC_DATA_PRODUCTS_USE_FIXTURES ??
      process.env.DATA_PRODUCTS_USE_FIXTURES ??
      process.env.OFFLINE_FIXTURES;
    if (v != null) {
      return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
    }
  }
  return false;
}

async function defaultFixtureLoader(productId: string): Promise<DataProductEnvelope> {
  // Browser: public static path. Node tests can override loadFixture.
  const path = `/data/data-products/${productId}.json`;
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Fixture HTTP ${response.status} for ${productId}`);
  }
  const body = (await response.json()) as unknown;
  if (!isDataProductEnvelope(body)) {
    throw new Error(`Fixture for ${productId} is not a valid envelope`);
  }
  return body;
}

function isTimeoutError(err: unknown): boolean {
  if (err instanceof Error && err.name === "AbortError") return true;
  const message = err instanceof Error ? err.message : String(err);
  return /timeout|aborted/i.test(message);
}

function combineSignals(
  timeoutSignal: AbortSignal,
  userSignal?: AbortSignal,
): AbortSignal {
  if (!userSignal) return timeoutSignal;
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([userSignal, timeoutSignal]);
  }
  return userSignal;
}

function baseResult(
  productId: string,
  partial: Omit<ProductLoadResult, "productId" | "freeOnly" | "allowExternalWrites">,
): ProductLoadResult {
  return {
    productId,
    freeOnly: true,
    allowExternalWrites: false,
    ...partial,
  };
}

export async function fetchProductRecords(
  productId: string,
  options: FetchOptions = {},
): Promise<ProductLoadResult> {
  const product = getProduct(productId);
  if (!product) {
    return baseResult(productId, {
      state: "error",
      envelope: null,
      source: "none",
      errorMessage: sanitizeUserFacingMessage("unknown_product", { productId }),
    });
  }

  const useFixtures = options.useFixtures ?? preferFixturesEnv();
  const loadFixture = options.loadFixture ?? defaultFixtureLoader;

  if (useFixtures) {
    try {
      const envelope = await loadFixture(productId);
      return baseResult(productId, {
        state: stateFromEnvelope(envelope),
        envelope,
        source: "fixture",
      });
    } catch {
      return baseResult(productId, {
        state: "unavailable",
        envelope: null,
        source: "none",
        errorMessage: sanitizeUserFacingMessage("fixture_failed"),
      });
    }
  }

  const baseUrl = (options.baseUrl ?? configuredBaseUrl(product.id, product.baseUrl)).replace(/\/$/, "");
  const limit = options.limit ?? 50;
  const cursor = options.cursor ? `&cursor=${encodeURIComponent(options.cursor)}` : "";
  // Read-only contract: GET /v1/records only (never POST /v1/refresh).
  const url = `${baseUrl}/v1/records?limit=${limit}${cursor}`;
  const timeoutMs = options.timeoutMs ?? 4000;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = combineSignals(controller.signal, options.signal);

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      try {
        const envelope = await loadFixture(productId);
        return baseResult(productId, {
          state: stateFromEnvelope(envelope),
          envelope,
          source: "fixture",
          errorMessage: sanitizeUserFacingMessage("http", {
            status: response.status,
            usingFixture: true,
          }),
        });
      } catch {
        return baseResult(productId, {
          state: "unavailable",
          envelope: null,
          source: "none",
          errorMessage: sanitizeUserFacingMessage("http", { status: response.status }),
        });
      }
    }

    const body = (await response.json()) as unknown;
    if (!isDataProductEnvelope(body)) {
      return baseResult(productId, {
        state: "error",
        envelope: null,
        source: "api",
        errorMessage: sanitizeUserFacingMessage("invalid_envelope"),
      });
    }

    // Never surface envelope.error / envelope.detail (may contain provider internals).
    return baseResult(productId, {
      state: stateFromEnvelope(body),
      envelope: body,
      source: "api",
    });
  } catch (err) {
    clearTimeout(timer);
    const timedOut = isTimeoutError(err);

    try {
      const envelope = await loadFixture(productId);
      return baseResult(productId, {
        state: timedOut ? "timeout" : stateFromEnvelope(envelope),
        envelope,
        source: "fixture",
        errorMessage: sanitizeUserFacingMessage(timedOut ? "timeout" : "unavailable", {
          usingFixture: true,
        }),
      });
    } catch {
      return baseResult(productId, {
        state: timedOut ? "timeout" : "unavailable",
        envelope: null,
        source: "none",
        errorMessage: sanitizeUserFacingMessage(timedOut ? "timeout" : "unavailable"),
      });
    }
  }
}

export async function fetchAllProducts(
  options: FetchOptions = {},
): Promise<ProductLoadResult[]> {
  return Promise.all(DATA_PRODUCT_CATALOG.map((p) => fetchProductRecords(p.id, options)));
}

export function toHealthSummaries(results: ProductLoadResult[]): ProductHealthSummary[] {
  return results.map((result) => {
    const product = getProduct(result.productId)!;
    const count = result.envelope?.items.length ?? 0;
    const status =
      result.state === "ready"
        ? "active"
        : result.state === "stale"
          ? "stale"
          : result.state === "empty"
            ? "empty"
            : result.state === "timeout"
              ? "timeout"
              : result.state === "unavailable"
                ? "unavailable"
                : result.source === "fixture"
                  ? "fixture"
                  : "error";
    return {
      id: product.id,
      name: product.title,
      icon: product.icon,
      repo: product.repo,
      port: product.port,
      schema_version: product.schemaVersion,
      record_count: count,
      data_status: result.envelope?.data_status ?? result.state,
      retrieved_at: result.envelope?.retrieved_at ?? null,
      status,
      load_state: result.state,
      source: result.source,
      errorMessage: result.errorMessage,
    };
  });
}

export { DATA_PRODUCT_CATALOG, FREE_ONLY_DEFAULTS, getProduct };
