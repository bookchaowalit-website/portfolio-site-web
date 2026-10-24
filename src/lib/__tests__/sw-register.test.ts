import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { registerServiceWorker } from "../sw-register.ts";

describe("registerServiceWorker", () => {
  it("does not throw when registration rejects, and only warns", async () => {
    const warnings: string[] = [];
    const ok = await registerServiceWorker({
      container: { register: () => Promise.reject(new TypeError("Failed to register a ServiceWorker")) },
      warn: (message) => warnings.push(message),
    });
    assert.equal(ok, false);
    assert.equal(warnings.length, 1);
  });

  it("does not throw when register() resolves to undefined", async () => {
    const ok = await registerServiceWorker({
      container: { register: () => Promise.resolve(undefined) },
      warn: () => {},
    });
    assert.equal(ok, false);
  });

  it("does not throw for a registration without waiting", async () => {
    const ok = await registerServiceWorker({
      container: { register: () => Promise.resolve({}) },
      warn: () => {},
    });
    assert.equal(ok, true);
  });

  it("registers /sw.js with scope / by default", async () => {
    const calls: unknown[][] = [];
    await registerServiceWorker({
      container: {
        register: (...args) => {
          calls.push(args);
          return Promise.resolve({});
        },
      },
    });
    assert.deepEqual(calls, [["/sw.js", { scope: "/" }]]);
  });
});
