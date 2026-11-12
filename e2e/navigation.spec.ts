import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('desktop nav links are present', async ({ page }) => {
    await page.goto('/en');
    const nav = page.locator('nav[aria-label="Main navigation"]');
    // Labels come from next-intl `nav.*` keys (portfolio, not "Projects").
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Portfolio' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Blog' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  test('navigates to Projects page', async ({ page }) => {
    await page.goto('/en');
    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole('link', { name: 'Portfolio' })
      .click();
    await expect(page).toHaveURL(/\/en\/projects/);
  });

  test('navigates to Blog page', async ({ page }) => {
    await page.goto('/en');
    await page
      .locator('nav[aria-label="Main navigation"]')
      .getByRole('link', { name: 'Blog' })
      .click();
    await expect(page).toHaveURL(/\/en\/blog/);
  });

  test('footer has aria-label', async ({ page }) => {
    await page.goto('/en');
    const footerNav = page.locator('footer nav[aria-label="Footer navigation"]');
    await expect(footerNav).toBeVisible();
  });
});

test.describe('Navigation (mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('mobile menu toggles', async ({ page }) => {
    await page.goto('/en');
    const menuBtn = page.getByRole('button', { name: /navigation menu|open menu|close menu/i });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();
    await expect(page.locator('#mobile-navigation')).toBeVisible();
    await menuBtn.click();
    await expect(page.locator('#mobile-navigation')).toBeHidden();
  });
});

// IMPROVEMENT-GOAL.md, UX: on the smallest phones the site name ran under the
// theme toggle (UI review at 320 px). The brand and the header controls must
// not overlap, and the header must not scroll sideways.
test.describe('Header at phone widths', () => {
  for (const width of [320, 375]) {
    for (const path of ['/en', '/th']) {
      test(`brand and controls do not overlap at ${width}px (${path})`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width, height: 700 } });
        const page = await context.newPage();
        await page.goto(path);
        const nav = page.locator('nav[aria-label="Main navigation"]');
        // ThemeToggle renders a placeholder until hydration; measure the real button.
        await expect(nav.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeVisible();
        // The text can overflow a flex-shrunk link box, so measure what is drawn.
        const brand = await nav.locator('a').first().evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.left, width: Math.max(r.width, el.scrollWidth) };
        });
        const controls = await nav.locator('button:visible').evaluateAll((els) =>
          els.map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0 && r.top < 100).map((r) => r.left));
        expect(controls.length, 'header controls found').toBeGreaterThanOrEqual(3);
        expect(Math.min(...controls), 'first header control starts after the brand ends').toBeGreaterThanOrEqual(brand!.x + brand!.width);
        // The header itself must fit (hero entrance animations can overflow the
        // page for a moment after hydration; that is tracked separately).
        const navOverflow = await nav.evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(navOverflow).toBeLessThanOrEqual(0);
        await context.close();
      });
    }
  }
});

// The mobile menu must not be covered by page-level floating controls
// (back-to-top) on short screens after scrolling. The consent cookie keeps the
// analytics banner away in builds that have it; the banner is meant to cover.
test('open mobile menu is fully clickable after scrolling on a short screen', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 568, height: 320 } });
  await context.addCookies([
    { name: 'portfolio.analytics-consent.v1', value: 'denied', domain: new URL(baseURL ?? 'http://127.0.0.1:3000').hostname, path: '/' },
  ]);
  const page = await context.newPage();
  await page.goto('/en', { waitUntil: 'networkidle' });
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(600);
  await page.locator('nav[aria-label="Main navigation"]').getByRole('button', { name: /menu/i }).click();
  const links = page.locator('#mobile-navigation a');
  await expect(links.first()).toBeVisible();
  const covered = await links.evaluateAll((els) =>
    els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      })
      .filter((el) => {
        const r = el.getBoundingClientRect();
        // Check the right end too: floating buttons sit bottom-right.
        for (const x of [r.left + 8, r.right - 8]) {
          const top = document.elementFromPoint(x, r.top + r.height / 2);
          if (!top || !(top === el || el.contains(top))) return true;
        }
        return false;
      })
      .map((el) => el.textContent?.trim()),
  );
  expect(covered).toEqual([]);
  await context.close();
});
