// Server-side product analytics (ADR-0005 layer 2, KPI-O-01).
// Sends one event to the PostHog capture API. Off unless
// NEXT_PUBLIC_ANALYTICS_ENABLED is exactly "true" and NEXT_PUBLIC_POSTHOG_KEY is
// set. Each event gets a fresh random distinct_id, no IP, no GeoIP and no
// person profile, so it holds no personal data and needs no consent
// (docs/measurement/KPI-PLAN.md). A failure or timeout is logged with a fixed
// reason and swallowed, so it can never change an API response.

const DEFAULT_HOST = 'https://eu.i.posthog.com'
const DEFAULT_TIMEOUT_MS = 2000
const PRODUCT = 'portfolio'

// Only these events and properties, with these values, are ever sent. Name,
// email, subject and message text are dropped because they are not listed.
export const SERVER_EVENTS: Record<string, Record<string, readonly string[]>> = {
  contact_sent: { locale: ['en', 'th'] },
}

export async function trackServer(
  event: string,
  props: Record<string, unknown> = {},
  { timeoutMs = DEFAULT_TIMEOUT_MS }: { timeoutMs?: number } = {},
): Promise<void> {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') return
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
  if (!apiKey || !Object.prototype.hasOwnProperty.call(SERVER_EVENTS, event)) return

  const properties: Record<string, string> = {}
  for (const [key, values] of Object.entries(SERVER_EVENTS[event])) {
    const value = props[key]
    properties[key] = typeof value === 'string' && values.includes(value) ? value : 'unknown'
  }
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || DEFAULT_HOST).replace(/\/+$/, '')
  const body = JSON.stringify({
    api_key: apiKey,
    event,
    distinct_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    properties: {
      ...properties,
      product: PRODUCT,
      $ip: null,
      $geoip_disable: true,
      $process_person_profile: false,
    },
  })

  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timedOut = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new Error('timeout'))
    }, timeoutMs)
  })
  // Errors carry a fixed reason only: a fetch error message can contain the
  // host URL, and with it any credentials a misconfigured host includes.
  const send = fetch(`${host}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: controller.signal,
  }).then(
    (response) => {
      if (!response.ok) throw new Error(`status ${response.status}`)
    },
    () => {
      throw new Error('request failed')
    },
  )
  // Whichever loses the race must not surface as an unhandled rejection.
  send.catch(() => {})
  timedOut.catch(() => {})

  try {
    await Promise.race([send, timedOut])
  } catch (error) {
    // Event name and a fixed reason only: never the payload or key.
    console.warn(`analytics: ${event} not sent (${error instanceof Error ? error.message : 'unknown error'})`)
  } finally {
    clearTimeout(timer)
  }
}
