import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as core from "../browser-analytics.ts";
import { CONSENT_ATTRIBUTE, consentBootScript } from "../consent-boot.ts";

// The consent banner is in the server HTML (static pages) so first-time
// visitors see it at first paint. Visitors who already answered must never
// see it flash: the answer lives in a cookie that a tiny <head> script reads
// before the first paint, marking <html data-consent="…"> so CSS hides the
// server-rendered banner. Legacy answers in localStorage still count.
const ON = { enabled: "true", key: "phc_test_only", host: "https://eu.i.posthog.com" };
const noLoad = async () => {
  throw new Error("must not load");
};

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

function memoryCookies(initial: Record<string, string> = {}) {
  const jar = new Map(Object.entries(initial));
  return {
    get: (name: string) => jar.get(name) ?? null,
    set: (name: string, value: string) => void jar.set(name, value),
    jar,
  };
}

describe("consent cookie", () => {
  it("stores the answer in a cookie", () => {
    const cookies = memoryCookies();
    const a = core.createAnalytics({ config: core.readConfig(ON), load: noLoad, storage: memoryStorage(), cookies });
    a.setConsent("denied");
    assert.equal(cookies.get(core.CONSENT_KEY), "denied");
  });

  it("reads the answer from the cookie", () => {
    const cookies = memoryCookies({ [core.CONSENT_KEY]: "granted" });
    const a = core.createAnalytics({ config: core.readConfig(ON), load: noLoad, storage: memoryStorage(), cookies });
    assert.equal(a.consent(), "granted");
  });

  it("honours a legacy localStorage answer and copies it into the cookie", () => {
    const cookies = memoryCookies();
    const storage = memoryStorage({ [core.CONSENT_KEY]: "denied" });
    const a = core.createAnalytics({ config: core.readConfig(ON), load: noLoad, storage, cookies });
    assert.equal(a.consent(), "denied");
    assert.equal(cookies.get(core.CONSENT_KEY), "denied");
  });

  it("ignores values that are not granted/denied", () => {
    const cookies = memoryCookies({ [core.CONSENT_KEY]: "<script>" });
    const a = core.createAnalytics({ config: core.readConfig(ON), load: noLoad, storage: memoryStorage(), cookies });
    assert.equal(a.consent(), "unknown");
  });
});

describe("pre-paint consent script", () => {
  function run(cookie: string, stored: string | null = null) {
    const attrs: Record<string, string> = {};
    const document = { cookie, documentElement: { setAttribute: (k: string, v: string) => void (attrs[k] = v) } };
    const localStorage = { getItem: () => stored };
    new Function("document", "localStorage", consentBootScript())(document, localStorage);
    return attrs[CONSENT_ATTRIBUTE];
  }

  it("marks <html> from the cookie", () => {
    assert.equal(run(`x=1; ${core.CONSENT_KEY}=granted; y=2`), "granted");
    assert.equal(run(`${core.CONSENT_KEY}=denied`), "denied");
  });

  it("falls back to the legacy localStorage answer", () => {
    assert.equal(run("", "denied"), "denied");
  });

  it("leaves first-time visitors unmarked and ignores junk", () => {
    assert.equal(run(""), undefined);
    assert.equal(run(`${core.CONSENT_KEY}=maybe`), undefined);
  });

  it("never throws (storage blocked)", () => {
    const document = { cookie: "", documentElement: { setAttribute: () => {} } };
    const localStorage = { getItem: () => { throw new Error("blocked"); } };
    assert.doesNotThrow(() => new Function("document", "localStorage", consentBootScript())(document, localStorage));
  });
});
