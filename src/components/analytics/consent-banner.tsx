import type { Consent } from '@/lib/browser-analytics'

// PDPA consent for browser analytics (ADR-0005 D-5). Shown only when analytics
// is configured; nothing is loaded or sent until "Allow analytics". Both
// choices have the same size and the same style (accepting is not nudged), and
// the choice can be changed later from "Analytics choices". Text comes from
// messages/{en,th}.json (analyticsConsent) through the provider. No imports
// besides React types, so the test can render it without the app.
export type PanelState = 'hidden' | 'banner' | 'choices'

export type ConsentText = {
  region: string
  title: string
  body: string
  decline: string
  accept: string
  choices: string
}

export function panelState(enabled: boolean, consent: Consent, reopened: boolean): PanelState {
  if (!enabled) return 'hidden'
  return consent === 'unknown' || reopened ? 'banner' : 'choices'
}

// Monochrome, sharp corners, hairline border (DESIGN.md). One class string for
// both buttons so neither choice looks preferred.
const CHOICE_BUTTON =
  'inline-flex min-h-[44px] flex-1 items-center justify-center border border-foreground bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none sm:min-w-[9rem]'

// WCAG 2.4.11: the fixed banner must not hide the focused control. While it is
// shown, its height (plus the bottom gap) is reserved as scroll padding, so
// focusing a control behind it scrolls the control above the banner, and the
// same space is added below the page so the last row can scroll clear too.
const BANNER_GAP_PX = 32

export function reserveScrollSpace(el: HTMLElement | null) {
  if (!el || typeof ResizeObserver === 'undefined') return
  const root = document.documentElement
  const apply = () => {
    // Hidden by the pre-paint consent marker: reserve nothing.
    const space = el.offsetHeight ? `${el.offsetHeight + BANNER_GAP_PX}px` : ''
    root.style.scrollPaddingBottom = space
    document.body.style.paddingBottom = space
  }
  apply()
  const observer = new ResizeObserver(apply)
  observer.observe(el)
  return () => {
    observer.disconnect()
    root.style.scrollPaddingBottom = ''
    document.body.style.paddingBottom = ''
  }
}

export function ConsentBanner({
  text,
  reopened = false,
  onAccept,
  onDecline,
}: {
  text: ConsentText
  reopened?: boolean
  onAccept: () => void
  onDecline: () => void
}) {
  return (
    <div
      ref={reserveScrollSpace}
      // "initial" is the banner in the static HTML; the <head> script marks
      // <html data-consent> for visitors who already chose and globals.css
      // hides it before first paint. A banner the visitor reopened stays.
      data-consent-banner={reopened ? 'reopened' : 'initial'}
      role="region"
      aria-label={text.region}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl border border-border bg-background p-4 text-sm shadow-lg sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{text.title}</p>
      <p className="mt-2 leading-relaxed text-foreground">{text.body}</p>
      <div className="mt-4 flex gap-2 sm:justify-end">
        <button type="button" className={CHOICE_BUTTON} onClick={onDecline}>
          {text.decline}
        </button>
        <button type="button" className={CHOICE_BUTTON} onClick={onAccept}>
          {text.accept}
        </button>
      </div>
    </div>
  )
}

export function ConsentChoicesLink({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mx-auto mb-6 flex min-h-[44px] items-center px-3 font-mono text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
    </button>
  )
}
