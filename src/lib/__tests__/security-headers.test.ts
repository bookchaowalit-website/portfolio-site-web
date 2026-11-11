import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { securityHeaders } from "../../../security-headers.mjs";

// IMPROVEMENT-GOAL.md, security: every page must send a Content-Security-Policy
// and Cross-Origin-Opener-Policy next to the existing hardening headers.
// The first CSP only restricts what cannot break the site (base tag, plugins,
// framing, form targets); script/style sources need nonces and come later.
const byKey = new Map(securityHeaders.map((h: { key: string; value: string }) => [h.key, h.value]));

describe("security headers", () => {
  it("sends a CSP that blocks base-tag injection, plugins, framing and foreign form posts", () => {
    const csp = byKey.get("Content-Security-Policy");
    assert.ok(csp, "Content-Security-Policy header is missing");
    const directives = new Map(
      csp.split(";").map((d: string) => d.trim()).filter(Boolean).map((d: string) => {
        const [name, ...values] = d.split(/\s+/);
        return [name, values.join(" ")];
      }),
    );
    assert.equal(directives.get("base-uri"), "'self'");
    assert.equal(directives.get("object-src"), "'none'");
    assert.equal(directives.get("frame-ancestors"), "'none'");
    assert.equal(directives.get("form-action"), "'self'");
    assert.ok(directives.has("upgrade-insecure-requests"));
  });

  it("isolates the browsing context with COOP", () => {
    assert.equal(byKey.get("Cross-Origin-Opener-Policy"), "same-origin");
  });

  it("keeps the existing hardening headers", () => {
    assert.equal(byKey.get("X-Content-Type-Options"), "nosniff");
    assert.equal(byKey.get("X-Frame-Options"), "DENY");
    assert.equal(byKey.get("Referrer-Policy"), "strict-origin-when-cross-origin");
    assert.equal(byKey.get("Permissions-Policy"), "camera=(), microphone=(), geolocation=()");
    assert.match(byKey.get("Strict-Transport-Security") ?? "", /max-age=31536000/);
  });

  it("turns off the legacy XSS auditor instead of enabling it (OWASP)", () => {
    assert.equal(byKey.get("X-XSS-Protection"), "0");
  });
});
