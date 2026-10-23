"use client"

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { analytics } from '@/lib/browser-analytics'
import { ConsentBanner, ConsentChoicesLink, panelState } from './consent-banner'

// Sends a page view per route (path only) after consent and shows the consent
// banner. Rendered from the locale layout only when analytics is enabled; it
// renders nothing while analytics is off. The portfolio has no sign-in, so
// there is no identify() / forgetIdentity() here.
export function AnalyticsProvider() {
  const pathname = usePathname()
  const t = useTranslations('analyticsConsent')
  const consent = useSyncExternalStore(analytics.subscribe, analytics.consent, () => 'unknown' as const)
  const [reopened, setReopened] = useState(false)

  useEffect(() => {
    if (consent === 'granted' && pathname) analytics.page(pathname)
  }, [pathname, consent])

  const choose = (value: 'granted' | 'denied') => {
    analytics.setConsent(value)
    setReopened(false)
  }

  const state = panelState(analytics.enabled, consent, reopened)
  if (state === 'hidden') return null
  if (state === 'choices') return <ConsentChoicesLink label={t('choices')} onOpen={() => setReopened(true)} />
  return (
    <ConsentBanner
      text={{
        region: t('region'),
        title: t('title'),
        body: t('body'),
        decline: t('decline'),
        accept: t('accept'),
        choices: t('choices'),
      }}
      onAccept={() => choose('granted')}
      onDecline={() => choose('denied')}
    />
  )
}
