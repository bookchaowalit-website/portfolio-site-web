import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as adapter from "../posthog-adapter.ts";

// PostHog adapter: privacy-first init options, URL scrubbing before send, and
// a thin mapping from the provider-neutral calls. posthog-js is replaced by a
// recorder; the real SDK is never loaded here.
function fakePostHog() {
  const calls: unknown[][] = [];
  const posthog = new Proxy(
    {},
    {
      get:
        (_, name) =>
        (...args: unknown[]) => {
          calls.push([name, ...args]);
        },
    },
  );
  return { calls, importer: async () => ({ default: posthog as any }) };
}

describe("posthog adapter", () => {
  it("init options: no autocapture, no recordings, no surveys, no flags, masked text, manual pageviews", () => {
    const options = adapter.posthogOptions("https://eu.i.posthog.com") as Record<string, unknown>;
    assert.equal(options.api_host, "https://eu.i.posthog.com");
    for (const key of [
      "autocapture",
      "capture_pageview",
      "capture_pageleave",
      "capture_heatmaps",
      "capture_dead_clicks",
      "capture_exceptions",
      "rageclick",
      "save_campaign_params",
    ]) {
      assert.equal(options[key], false, key);
    }
    for (const key of [
      "disable_session_recording",
      "disable_surveys",
      "disable_web_experiments",
      "disable_external_dependency_loading",
      "advanced_disable_flags",
      "mask_all_text",
      "mask_all_element_attributes",
    ]) {
      assert.equal(options[key], true, key);
    }
    assert.equal((options.session_recording as { maskAllInputs: boolean }).maskAllInputs, true);
    assert.equal(options.persistence, "localStorage", "no cookies even after consent");
    assert.equal(options.person_profiles, "identified_only");
    assert.equal(typeof options.before_send, "function");
  });

  it("before_send strips query strings, fragments, ids, referrer paths and the IP", () => {
    const scrubbed = adapter.scrubCapture({
      uuid: "u",
      event: "$pageview",
      properties: {
        $current_url: "https://bookchaowalit.com/en/blog/123?token=abc#x",
        $pathname: "/en/blog/123",
        $referrer: "https://mail.example.test/inbox/a@example.test?id=9",
        $referring_domain: "mail.example.test",
        $initial_current_url: "https://bookchaowalit.com/th?utm_source=x&email=a@example.test",
        $ip: "203.0.113.9",
        product: "portfolio",
      },
      $set: { $current_url: "https://bookchaowalit.com/en?q=private" },
      $set_once: { $initial_referrer: "https://mail.example.test/inbox?id=9" },
    } as any)!;
    assert.deepEqual(scrubbed.properties, {
      $current_url: "https://bookchaowalit.com/en/blog/:id",
      $pathname: "/en/blog/:id",
      $referrer: "https://mail.example.test",
      $referring_domain: "mail.example.test",
      $initial_current_url: "https://bookchaowalit.com/th",
      $geoip_disable: true,
      product: "portfolio",
    });
    assert.equal(scrubbed.$set?.$current_url, "https://bookchaowalit.com/en");
    assert.equal(scrubbed.$set_once?.$initial_referrer, "https://mail.example.test");
    assert.doesNotMatch(JSON.stringify(scrubbed), /token|private|@|utm|203\.0/);
    assert.equal(adapter.scrubCapture(null), null);
  });

  it("loadPostHog maps the neutral calls and registers product = portfolio", async () => {
    const { calls, importer } = fakePostHog();
    const a = await adapter.loadPostHog({ key: "phc_test_only", host: "https://eu.i.posthog.com" }, importer);
    a.track("view_project", { project_slug: "booktrading", evidence_level: "live", product: "portfolio" });
    a.identify("clx0abcdef0000000000000000");
    a.page("/en");
    a.optOut();
    a.reset();
    const names = calls.map(([name]) => name);
    assert.deepEqual(names, ["init", "register", "capture", "identify", "capture", "opt_out_capturing", "reset", "reset"]);
    assert.equal(calls[0][1], "phc_test_only");
    assert.deepEqual(calls[1][1], { product: "portfolio" });
    assert.deepEqual(calls[2].slice(1), ["view_project", { project_slug: "booktrading", evidence_level: "live", product: "portfolio" }]);
    assert.equal(calls[4][1], "$pageview");
    assert.equal((calls[4][2] as { $pathname: string }).$pathname, "/en");
  });
});
