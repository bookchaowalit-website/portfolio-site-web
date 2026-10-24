"use client"

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/sw-register'

// Registers /sw.js once the page has loaded. Replaces the Serwist plugin's own
// registration (register: false in next.config.js), which left failures unhandled.
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || !('serviceWorker' in navigator)) return
    if (document.readyState === 'complete') {
      void registerServiceWorker()
      return
    }
    const onLoad = () => void registerServiceWorker()
    window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [])
  return null
}
