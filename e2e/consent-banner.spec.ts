import { test, expect } from '@playwright/test';

// Consent banner (PDPA, ADR-0005). It is part of the static HTML so a
// first-time visitor sees it at first paint (it used to mount after hydration
// and be the late LCP element). A visitor who already answered must never see
// it, not even for one frame: a <head> script reads the consent cookie before
// paint. Needs a build with analytics on (NEXT_PUBLIC_ANALYTICS_ENABLED=true +
// a PostHog key) — production, or a local build — so it runs with E2E_CONSENT=1.
test.skip(!process.env.E2E_CONSENT, 'needs a build with analytics enabled (E2E_CONSENT=1)');

const KEY = 'portfolio.analytics-consent.v1';
const banner = '[role="region"][data-consent-banner]';

function hostOf(baseURL: string | undefined) {
  return new URL(baseURL ?? 'http://127.0.0.1:3000').hostname;
}

test('first-time visitor: banner is in the HTML and visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en');
  await expect(page.locator(banner)).toBeVisible();
  await context.close();
});

test('first-visit banner comes before the page content in the HTML (paints with the first frame)', async ({ request }) => {
  for (const path of ['/en', '/th', '/en/projects']) {
    const html = await (await request.get(path)).text();
    const bannerAt = html.indexOf('data-consent-banner="initial"');
    const mainAt = html.indexOf('<main');
    expect(bannerAt, `banner on ${path}`).toBeGreaterThan(-1);
    expect(bannerAt, `banner before <main> on ${path}`).toBeLessThan(mainAt);
  }
});

test('banner stays on top of the open mobile menu (short landscape phone)', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 568, height: 320 } });
  const page = await context.newPage();
  await page.goto('/en', { waitUntil: 'networkidle' });
  await page.locator('nav[aria-label="Main navigation"]').getByRole('button', { name: /menu/i }).click();
  await expect(page.locator('#mobile-navigation')).toBeVisible();
  for (const name of [/^decline$/i, /^allow analytics$/i]) {
    const button = page.locator(banner).getByRole('button', { name });
    const hit = await button.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!top && (top === el || el.contains(top));
    });
    expect(hit, `${name} is clickable above the menu`).toBe(true);
  }
  await context.close();
});

test('keyboard: skip link first, then the consent choices', async ({ page }) => {
  await page.goto('/en');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText(/skip to content/i);
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText(/decline/i);
});

for (const answer of ['granted', 'denied'] as const) {
  test(`returning visitor (${answer}): banner never painted, not even one frame`, async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    await context.addCookies([{ name: KEY, value: answer, domain: hostOf(baseURL), path: '/' }]);
    const page = await context.newPage();
    const hydrationWarnings: string[] = [];
    page.on('console', (m) => {
      if (/hydrat|did not match|server rendered HTML/i.test(m.text())) hydrationWarnings.push(m.text().slice(0, 160));
    });
    await page.addInitScript((selector) => {
      const w = window as unknown as { __bannerFrames: number; __frames: number };
      w.__bannerFrames = 0;
      w.__frames = 0;
      const tick = () => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el && el.getBoundingClientRect().height > 0) w.__bannerFrames++;
        w.__frames++;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, banner);
    await page.goto('/en', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const seen = await page.evaluate(() => {
      const w = window as unknown as { __bannerFrames: number; __frames: number };
      return { banner: w.__bannerFrames, frames: w.__frames };
    });
    expect(seen.frames).toBeGreaterThan(10);
    expect(seen.banner, 'frames with the banner visible').toBe(0);
    // The pre-paint script adds data-consent to <html>; React must accept it.
    expect(hydrationWarnings).toEqual([]);
    // The choice can still be changed: the small control reopens the banner.
    await page.getByRole('button', { name: /analytics choices|ตัวเลือก/i }).click();
    await expect(page.locator(banner)).toBeVisible();
    await context.close();
  });
}

test('answering stores the choice in a cookie', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/en', { waitUntil: 'networkidle' });
  await page.locator(banner).getByRole('button', { name: /^(decline|don.t allow|no)/i }).first().click();
  await expect(page.locator(banner)).toHaveCount(0);
  const cookie = (await context.cookies()).find((c) => c.name === KEY);
  expect(cookie?.value).toBe('denied');
  await context.close();
});
