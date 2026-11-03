# 11 — State machines

Status: **done**. ไม่มี entity ใน DB; state ที่มี lifecycle จริงในโค้ดมี 5 ตัว

## Analytics consent (`Consent`)

```mermaid
stateDiagram-v2
  [*] --> off: flag not true or no key
  [*] --> unknown: analytics enabled, no stored choice
  unknown --> granted: Allow analytics
  unknown --> denied: Decline
  granted --> denied: Decline from Analytics choices, optOut and reset
  denied --> granted: Allow from Analytics choices
  off --> [*]
```

Sources: `src/lib/browser-analytics.ts` (`readConsent`, `setConsent`), `src/components/analytics/consent-banner.tsx` (`panelState`)

## Contact form submit status

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> invalid: client validation fails
  invalid --> idle: user edits field
  idle --> submitting: valid submit
  submitting --> success: 200
  submitting --> unavailable: 503 CONTACT_SERVICE_UNAVAILABLE
  submitting --> error: 400 or 500 or network
  success --> idle: user types again
  unavailable --> idle: user types again
  error --> idle: user types again
```

Sources: `src/components/contact-client.tsx` (`isSubmitting`, `submitStatus`), `src/app/api/contact/route.ts`

## Data-product load (`ConsumerLoadState`)

`fetchProductRecords` คืนผลครั้งเดียวต่อ product (ไม่มี transition ต่อหลังจากนั้น) จึงวาดเป็นทางเลือกของผลลัพธ์

```mermaid
stateDiagram-v2
  [*] --> loading
  loading --> fromApi: GET /v1/records ok
  loading --> invalid: response not a v2 envelope
  loading --> fallback: HTTP error, network error or timeout
  loading --> fallback: fixture mode forced
  fromApi --> ready: data_status ok
  fromApi --> empty: empty or no items
  fromApi --> stale: data_status stale
  fromApi --> error: data_status malformed
  invalid --> error: source api
  fallback --> timeout: request timed out, source fixture
  fallback --> ready: fixture envelope ok, source fixture
  fallback --> empty: fixture empty
  fallback --> unavailable: fixture failed, source none
```

Sources: `src/lib/data-products/types.ts`, `src/lib/data-products/client.ts` (`fetchProductRecords`, `stateFromEnvelope`), `src/lib/data-products/__tests__/client.contract.test.ts`

## Project card status (`ProjectStatus`)

```mermaid
stateDiagram-v2
  [*] --> wip
  wip --> live: public first release shipped
  live --> archived: merged or retired
  wip --> archived
```

Sources: `src/data/app-projects.ts` (`ProjectStatus`), `PRODUCT.md` ("WIP closure"), `src/app/[locale]/projects/[slug]/status-config.ts`.
การเปลี่ยน state ทำโดยแก้ไฟล์ด้วยมือ ไม่มีโค้ดบังคับ transition

## Autopilot issue labels

```mermaid
stateDiagram-v2
  [*] --> proposed: planner
  proposed --> todo: owner approves
  todo --> in_progress: loop picks
  in_progress --> needs_human: PR opened or question
  in_progress --> blocked: 3 failed attempts, repeat fingerprint, cost cap, cannot_do
  in_progress --> todo: run timeout
  needs_human --> approved: owner adds approved label on PR
  approved --> merged: CI green and Vercel quota at least 20
  approved --> needs_human: ci_failed or branch protection refuses bot
  merged --> [*]
```

Sources: `.autopilot/README.md` (labels, เงื่อนไขหยุด), `.autopilot/config.json`, `.autopilot/tests/test_ci_gate.py`
