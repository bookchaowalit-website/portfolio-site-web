// Registers the service worker without ever throwing. Registration can fail
// for ordinary reasons (offline, blocked by the browser, network error), and
// register() may resolve to nothing usable, so neither case may reach Sentry.

export type ServiceWorkerLike = {
  register: (
    url: string,
    options?: { scope?: string },
  ) => Promise<{ waiting?: { postMessage: (message: unknown) => void } | null } | undefined>
}

type Options = {
  url?: string
  scope?: string
  container?: ServiceWorkerLike
  warn?: (message: string, error?: unknown) => void
}

/** Resolves true when a registration exists, false when it failed or was empty. */
export async function registerServiceWorker({
  url = "/sw.js",
  scope = "/",
  container = typeof navigator === "undefined" ? undefined : navigator.serviceWorker,
  warn = (message, error) => console.warn(message, error),
}: Options = {}): Promise<boolean> {
  if (!container) return false
  try {
    const registration = await container.register(url, { scope })
    // The worker uses skipWaiting, so a waiting worker is only activated early.
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" })
    return Boolean(registration)
  } catch (error) {
    warn("Service worker registration failed", error)
    return false
  }
}
