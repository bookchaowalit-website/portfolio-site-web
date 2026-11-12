import { sentryOptions } from "@/lib/sentry";

// Errors-only Sentry (see src/lib/sentry.ts). The SDK is loaded after the
// `load` event, when the browser is idle, so its ~100 KB of JavaScript is not
// evaluated during hydration. Errors thrown before that are not reported.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

function startSentry() {
  void import("@sentry/nextjs").then((Sentry) => Sentry.init(sentryOptions(dsn)));
}

function whenIdle() {
  if ("requestIdleCallback" in window) window.requestIdleCallback(startSentry, { timeout: 4000 });
  else setTimeout(startSentry, 1500);
}

if (dsn && typeof window !== "undefined") {
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}
