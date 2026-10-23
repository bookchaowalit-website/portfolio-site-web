import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { SERVER_EVENTS, trackServer } from "../server-analytics.ts";

// Server event contact_sent (KPI-O-01): off unless the flag and a key are set;
// payload carries locale + product only, a fresh random distinct_id, no IP, no
// GeoIP and no person profile; failures are swallowed with a fixed message.
const ENV_KEYS = ["NEXT_PUBLIC_ANALYTICS_ENABLED", "NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"] as const;
const savedEnv: Record<string, string | undefined> = {};
const savedFetch = globalThis.fetch;
const savedWarn = console.warn;
let requests: { url: string; init: RequestInit }[];
let warnings: string[];
let respond: () => Promise<Response>;

const PII = { name: "Book Chaowalit", email: "a@example.test", subject: "Hire me", message: "my private message" };

beforeEach(() => {
  for (const key of ENV_KEYS) savedEnv[key] = process.env[key];
  for (const key of ENV_KEYS) delete process.env[key];
  requests = [];
  warnings = [];
  respond = async () => new Response("{}", { status: 200 });
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    requests.push({ url: String(url), init });
    return respond();
  }) as typeof fetch;
  console.warn = (message: string) => {
    warnings.push(message);
  };
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  globalThis.fetch = savedFetch;
  console.warn = savedWarn;
});

function enable() {
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "true";
  process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_only";
}

describe("server analytics (contact_sent)", () => {
  it("flag off or no key: no fetch", async () => {
    await trackServer("contact_sent", { locale: "en" });
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "true";
    await trackServer("contact_sent", { locale: "en" });
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = "false";
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_only";
    await trackServer("contact_sent", { locale: "en" });
    assert.deepEqual(requests, []);
  });

  it("enabled: posts to the EU capture endpoint with locale and product only, no name/email/message", async () => {
    enable();
    await trackServer("contact_sent", { locale: "th", ...PII });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "https://eu.i.posthog.com/i/v0/e/");
    assert.equal(requests[0].init.method, "POST");
    const body = JSON.parse(String(requests[0].init.body));
    assert.equal(body.event, "contact_sent");
    assert.equal(body.api_key, "phc_test_only");
    assert.match(body.distinct_id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.deepEqual(body.properties, {
      locale: "th",
      product: "portfolio",
      $ip: null,
      $geoip_disable: true,
      $process_person_profile: false,
    });
    assert.doesNotMatch(JSON.stringify(body), /Book|example\.test|Hire|private/);
  });

  it("a fresh distinct_id per event (nothing links two messages)", async () => {
    enable();
    await trackServer("contact_sent", { locale: "en" });
    await trackServer("contact_sent", { locale: "en" });
    const [a, b] = requests.map((r) => JSON.parse(String(r.init.body)).distinct_id);
    assert.notEqual(a, b);
  });

  it("only allow-listed events and enumerated locale values are sent", async () => {
    enable();
    await trackServer("contact_failed", { locale: "en" });
    await trackServer("contact_sent", { locale: "a@example.test" });
    const body = JSON.parse(String(requests.at(-1)!.init.body));
    assert.equal(requests.length, 1);
    assert.equal(body.properties.locale, "unknown");
    assert.deepEqual(Object.keys(SERVER_EVENTS), ["contact_sent"]);
  });

  it("custom host is used without a trailing slash", async () => {
    enable();
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "https://eu.example.test/";
    await trackServer("contact_sent", { locale: "en" });
    assert.equal(requests[0].url, "https://eu.example.test/i/v0/e/");
  });

  it("network errors and bad statuses are swallowed with a fixed message (never the payload or key)", async () => {
    enable();
    respond = async () => {
      throw new Error("connect ECONNREFUSED https://user:secret@eu.i.posthog.com");
    };
    await assert.doesNotReject(trackServer("contact_sent", { locale: "en" }));
    respond = async () => new Response("no", { status: 500 });
    await assert.doesNotReject(trackServer("contact_sent", { locale: "en" }));
    assert.deepEqual(warnings, [
      "analytics: contact_sent not sent (request failed)",
      "analytics: contact_sent not sent (status 500)",
    ]);
  });

  it("times out after the configured limit without throwing", async () => {
    enable();
    respond = () => new Promise(() => {});
    const started = Date.now();
    await trackServer("contact_sent", { locale: "en" }, { timeoutMs: 20 });
    assert.ok(Date.now() - started < 1000);
    assert.deepEqual(warnings, ["analytics: contact_sent not sent (timeout)"]);
  });
});
