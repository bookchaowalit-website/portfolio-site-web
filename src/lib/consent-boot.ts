// Pre-paint consent marker (tested in src/lib/__tests__/consent-cookie.test.ts).
//
// The consent banner is part of the static server HTML, so first-time visitors
// see it at first paint (it used to appear only after hydration and was the
// late LCP element). Visitors who already answered must not see it flash: this
// script runs in <head> before the body is painted, reads the answer from the
// consent cookie (or the legacy localStorage key) and sets
// <html data-consent="granted|denied">. globals.css hides the server-rendered
// banner while that attribute is present. Nothing here sends data anywhere.
import { CONSENT_KEY } from './browser-analytics.ts'

export const CONSENT_ATTRIBUTE = 'data-consent'

export function consentBootScript(): string {
  const key = JSON.stringify(CONSENT_KEY)
  const attr = JSON.stringify(CONSENT_ATTRIBUTE)
  return `try{var k=${key},v=null,c=document.cookie.split("; ");for(var i=0;i<c.length;i++){var p=c[i].indexOf("=");if(p>0&&c[i].slice(0,p)===k){v=c[i].slice(p+1)}}if(v!=="granted"&&v!=="denied"){try{v=localStorage.getItem(k)}catch(e){v=null}}if(v==="granted"||v==="denied"){document.documentElement.setAttribute(${attr},v)}}catch(e){}`
}
