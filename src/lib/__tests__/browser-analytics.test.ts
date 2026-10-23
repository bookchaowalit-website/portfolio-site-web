import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import * as core from "../browser-analytics.ts";

// Browser analytics core (Big Loop W4 pilot): off unless the flag and a key are
// set, nothing before consent, allow-listed properties only. The adapter is a
// recorder, and fetch / sendBeacon / XMLHttpRequest are traps: a test fails if
// anything tries to leave the process.
const ON = { enabled: "true", key: "phc_test_only", host: "https://eu.i.posthog.com" };
const VIEW = { project_slug: "booktrading", evidence_level: "live" };

type Call = unknown[];
let network: Call[];
const saved: Record<string, PropertyDescriptor | undefined> = {};
const g = globalThis as Record<string, unknown>;

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => {
      data.set(k, String(v));
    },
    removeItem: (k: string) => {
      data.delete(k);
    },
    data,
  };
}

function recorder() {
  const calls: Call[] = [];
  let loads = 0;
  const adapter: core.AnalyticsAdapter = {
    track: (event, props) => calls.push(["track", event, props]),
    identify: (id) => calls.push(["identify", id]),
    page: (p) => calls.push(["page", p]),
    optOut: () => calls.push(["optOut"]),
    reset: () => calls.push(["reset"]),
  };
  return {
    calls,
    load: async () => {
      loads += 1;
      return adapter;
    },
    loads: () => loads,
  };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  network = [];
  for (const key of ["fetch", "XMLHttpRequest", "navigator"]) saved[key] = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    writable: true,
    value: async (...args: unknown[]) => {
      network.push(["fetch", ...args]);
      return new Response("{}");
    },
  });
  Object.defineProperty(globalThis, "XMLHttpRequest", {
    configurable: true,
    writable: true,
    value: function XMLHttpRequest() {
      network.push(["xhr"]);
    },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      sendBeacon: (...args: unknown[]) => {
        network.push(["beacon", ...args]);
        return true;
      },
    },
  });
});

afterEach(() => {
  for (const [key, descriptor] of Object.entries(saved)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete g[key];
  }
});

describe("browser analytics", () => {
  it('readConfig: on only when the flag is exactly "true" and a key is set', () => {
    assert.equal(core.readConfig({}), null);
    assert.equal(core.readConfig({ enabled: "true" }), null);
    assert.equal(core.readConfig({ enabled: "true", key: "   " }), null);
    assert.equal(core.readConfig({ key: "phc_x" }), null);
    for (const enabled of ["false", "1", "TRUE", "yes", " true"]) {
      assert.equal(core.readConfig({ enabled, key: "phc_x" }), null, enabled);
    }
    assert.deepEqual(core.readConfig({ enabled: "true", key: " phc_x " }), { key: "phc_x", host: "https://eu.i.posthog.com" });
    assert.deepEqual(core.readConfig({ ...ON, host: "https://eu.example.test/" }), { key: "phc_test_only", host: "https://eu.example.test" });
  });

  it("flag off or no key: no network call (fetch/XHR/sendBeacon trapped) and no adapter load, even after consent", async () => {
    for (const env of [{}, { enabled: "false", key: "phc_x" }, { enabled: "true" }, { enabled: "true", key: "" }]) {
      const r = recorder();
      const storage = memoryStorage({ [core.CONSENT_KEY]: "granted" });
      const a = core.createAnalytics({ config: core.readConfig(env), load: r.load, storage });
      assert.equal(a.enabled, false);
      a.setConsent("granted");
      a.page("/en");
      a.track("view_project", VIEW);
      a.track("click_demo", VIEW);
      a.identify("clx0abcdef0000000000000000");
      a.forgetIdentity();
      await flush();
      assert.equal(r.loads(), 0);
      assert.deepEqual(r.calls, []);
      assert.equal(storage.data.size, 1, "nothing written to storage");
    }
    assert.deepEqual(network, []);
  });

  it("the default singleton is off in tests (no NEXT_PUBLIC_* set) and never loads PostHog", async () => {
    assert.equal(core.analytics.enabled, false);
    core.analytics.setConsent("granted");
    core.analytics.page("/en");
    core.analytics.track("view_project", VIEW);
    await flush();
    assert.deepEqual(network, []);
  });

  it("nothing before consent: nothing loads, nothing is sent, nothing is queued", async () => {
    const r = recorder();
    const a = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage: memoryStorage() });
    assert.equal(a.enabled, true);
    assert.equal(a.consent(), "unknown");
    a.page("/en");
    a.track("view_project", VIEW);
    a.identify("clx0abcdef0000000000000000");
    await flush();
    assert.equal(r.loads(), 0);
    a.setConsent("granted");
    await flush();
    assert.deepEqual(r.calls, [], "events from before consent are dropped, not replayed");
    assert.deepEqual(network, []);
  });

  it("nothing after decline: nothing loads, and the choice is remembered", async () => {
    const r = recorder();
    const storage = memoryStorage();
    const a = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage });
    a.setConsent("denied");
    a.page("/en");
    a.track("click_source", VIEW);
    await flush();
    assert.equal(r.loads(), 0);
    assert.equal(storage.getItem(core.CONSENT_KEY), "denied");
    const again = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage });
    assert.equal(again.consent(), "denied");
    assert.deepEqual(network, []);
  });

  it("granted: loads the adapter once and forwards clean calls with product = portfolio", async () => {
    const r = recorder();
    const storage = memoryStorage();
    const a = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage });
    a.setConsent("granted");
    a.page("/en/projects/booktrading");
    a.track("view_project", VIEW);
    a.track("click_demo", { project_slug: "booktrading", evidence_level: "prototype" });
    a.track("click_source", { project_slug: "devtools-suite", evidence_level: "none" });
    await flush();
    assert.equal(r.loads(), 1);
    assert.equal(storage.getItem(core.CONSENT_KEY), "granted");
    assert.equal(core.CONSENT_KEY, "portfolio.analytics-consent.v1");
    assert.deepEqual(r.calls, [
      ["page", "/en/projects/booktrading"],
      ["track", "view_project", { project_slug: "booktrading", evidence_level: "live", product: "portfolio" }],
      ["track", "click_demo", { project_slug: "booktrading", evidence_level: "prototype", product: "portfolio" }],
      ["track", "click_source", { project_slug: "devtools-suite", evidence_level: "none", product: "portfolio" }],
    ]);
  });

  it("withdrawing consent opts out and stops sending", async () => {
    const r = recorder();
    const a = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage: memoryStorage() });
    a.setConsent("granted");
    a.page("/en");
    await flush();
    a.setConsent("denied");
    await flush();
    a.track("view_project", VIEW);
    await flush();
    assert.deepEqual(r.calls, [["page", "/en"], ["optOut"]]);
  });

  it("no PII in event properties: unknown keys, emails, URLs, ids and free text are dropped", async () => {
    const r = recorder();
    const a = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage: memoryStorage() });
    a.setConsent("granted");
    a.track("view_project", {
      ...VIEW,
      name: "Book Chaowalit",
      email: "a@example.test",
      message: "hello, my private message",
      url: "https://x.test/?t=1",
      query: "q=secret",
    });
    a.track("view_project", { project_slug: "a@example.test", evidence_level: "live" });
    a.track("view_project", { project_slug: "https://x.test/?token=abc", evidence_level: "live" });
    a.track("view_project", { project_slug: "two words", evidence_level: "live" });
    a.track("view_project", { project_slug: "123456", evidence_level: "live" });
    a.track("view_project", { project_slug: "550e8400-e29b-41d4-a716-446655440000", evidence_level: "live" });
    a.track("view_project", { project_slug: "x".repeat(80), evidence_level: "live" });
    a.track("view_project", { project_slug: "booktrading", evidence_level: "Very Live" });
    a.track("view_project", { project_slug: "booktrading" });
    a.track("contact_sent", { locale: "en" });
    a.track("unknown_event", VIEW);
    await flush();
    assert.deepEqual(r.calls, [["track", "view_project", { ...VIEW, product: "portfolio" }]]);
    assert.doesNotMatch(JSON.stringify(r.calls), /@|private|https?:|Book|token|secret|550e8400/);
  });

  it("identify accepts only a pseudonymous id, never an email or free text", async () => {
    const r = recorder();
    const a = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage: memoryStorage() });
    a.setConsent("granted");
    for (const id of ["a@example.test", "Book Chaowalit", "", "  ", "x".repeat(200)]) a.identify(id);
    await flush();
    assert.deepEqual(r.calls, []);
  });

  it("page paths lose query strings, fragments and id-like segments", () => {
    const cases: Record<string, string> = {
      "/": "/",
      "/en?q=secret&token=abc": "/en",
      "/th/projects/booktrading#case-study": "/th/projects/booktrading",
      "https://bookchaowalit.com/en/blog/123?x=1": "/en/blog/:id",
      "/en/items/clx0abcdef0000000000000000/edit": "/en/items/:id/edit",
      "/u/550e8400-e29b-41d4-a716-446655440000": "/u/:id",
      "/u/a@example.test": "/u/:id",
      "/hash/deadbeefcafe1234": "/hash/:id",
    };
    for (const [input, expected] of Object.entries(cases)) assert.equal(core.sanitizePath(input), expected, input);
  });

  it("evidenceLevelProp maps catalog evidence levels to the enumerated values", () => {
    assert.equal(core.evidenceLevelProp("Live"), "live");
    assert.equal(core.evidenceLevelProp("Prototype"), "prototype");
    assert.equal(core.evidenceLevelProp("Internal System"), "internal_system");
    assert.equal(core.evidenceLevelProp("Experiment"), "experiment");
    assert.equal(core.evidenceLevelProp(undefined), "none");
    assert.equal(core.evidenceLevelProp("anything else"), "none");
  });

  it("identity marker: identify sets it, forgetIdentity resets PostHog only when marked, decline clears it", async () => {
    const r = recorder();
    const storage = memoryStorage();
    const a = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage });
    assert.equal(core.IDENTIFIED_KEY, "portfolio.analytics-identified.v1");
    a.setConsent("granted");
    a.forgetIdentity();
    await flush();
    assert.deepEqual(r.calls, [], "anonymous visitor: no reset");
    a.identify("clx0abcdef0000000000000000");
    await flush();
    assert.equal(storage.getItem(core.IDENTIFIED_KEY), "1");
    // A later page load (new instance, same storage) still resets after sign-out.
    const later = core.createAnalytics({ config: core.readConfig(ON), load: r.load, storage });
    later.forgetIdentity();
    await flush();
    assert.deepEqual(r.calls.slice(-1), [["reset"]]);
    assert.equal(storage.getItem(core.IDENTIFIED_KEY), null);
    a.identify("clx0abcdef0000000000000000");
    await flush();
    a.setConsent("denied");
    await flush();
    assert.equal(storage.getItem(core.IDENTIFIED_KEY), null, "decline clears the marker");
  });

  it("storage that throws (private mode) is treated as no choice made", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem() {},
    };
    const a = core.createAnalytics({ config: core.readConfig(ON), load: recorder().load, storage: broken });
    assert.equal(a.consent(), "unknown");
    assert.doesNotThrow(() => a.setConsent("granted"));
    assert.equal(a.consent(), "granted");
  });

  it("subscribers hear consent changes", () => {
    const a = core.createAnalytics({ config: core.readConfig(ON), load: recorder().load, storage: memoryStorage() });
    const heard: string[] = [];
    const off = a.subscribe((value) => heard.push(value));
    a.setConsent("granted");
    off();
    a.setConsent("denied");
    assert.deepEqual(heard, ["granted"]);
  });

  it("a failed SDK download never throws into the page", async () => {
    const a = core.createAnalytics({
      config: core.readConfig(ON),
      load: async () => {
        throw new Error("blocked by an ad blocker");
      },
      storage: memoryStorage(),
    });
    a.setConsent("granted");
    assert.doesNotThrow(() => a.track("view_project", VIEW));
    await flush();
  });
});
