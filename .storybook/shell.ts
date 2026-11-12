// Helpers for .storybook/preview.tsx, kept free of React so node tests can
// import them (src/lib/__tests__/storybook-shell.test.ts).

// next-intl strips the locale prefix itself; a prefixed mock path ("/th")
// would stay "/th" under the English toolbar and break active-link and
// language-switch logic.
export const NAVIGATION_PATHNAME = "/";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/**
 * Storybook has no API routes. Answer the app's own endpoints with canned
 * responses so interactive stories reach their success state; any email
 * starting with "fail@" returns the error state. Everything else passes
 * through to the real fetch (fonts, images, HMR).
 */
export function mockApiFetch(realFetch: typeof fetch): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    if (path === "/api/newsletter" && (init?.method ?? "GET").toUpperCase() === "POST") {
      const email = (() => {
        try {
          return String(JSON.parse(String(init?.body ?? "{}")).email ?? "");
        } catch {
          return "";
        }
      })();
      return email.startsWith("fail@")
        ? json(400, { error: "Storybook mock: subscription failed" })
        : json(200, { success: true });
    }
    return realFetch(input, init);
  }) as typeof fetch;
}

/** ThemeToggle reads localStorage on mount; keep it in step with the toolbar. */
export function syncStoredTheme(storage: Pick<Storage, "setItem">, theme: "light" | "dark") {
  storage.setItem("theme", theme);
}
