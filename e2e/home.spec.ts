import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully in English', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/Chaowalit/);
    // Hero section visible
    await expect(page.locator('#hero')).toBeVisible();
  });

  // IMPROVEMENT-GOAL.md, performance: the hero heading (/en) and the value
  // prop paragraph (/th, longer text) are the LCP elements. They must be
  // painted from the server HTML, not wait for hydration, so they have to be
  // visible (no opacity 0 on them or an ancestor) with JavaScript disabled.
  for (const locale of ['en', 'th']) {
    test(`hero text is visible before JavaScript runs (${locale})`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(`/${locale}`);
      for (const selector of ['#hero h1', '#hero p.text-lg']) {
        const el = page.locator(selector).first();
        await expect(el).not.toBeEmpty();
        const hiddenAncestor = await el.evaluate((node) => {
          for (let n: Element | null = node; n; n = n.parentElement) {
            if (getComputedStyle(n).opacity === '0') return n.outerHTML.slice(0, 120);
          }
          return null;
        });
        expect(hiddenAncestor, `${selector} on /${locale}`).toBeNull();
      }
      await context.close();
    });
  }

  test('has all major sections', async ({ page }) => {
    await page.goto('/en');
    // Keep the homepage focused on identity, work, writing, and contact.
    const sections = ['#hero', '#about', '#projects', '#blog', '#contact'];
    for (const id of sections) {
      await expect(page.locator(id)).toBeVisible();
    }

    for (const removedSection of ['#atlas', '#business', '#testimonials', '#newsletter']) {
      await expect(page.locator(removedSection)).toHaveCount(0);
    }
  });

  test('skip-to-content link works', async ({ page }) => {
    await page.goto('/en');
    const skipLink = page.locator('a.sr-only:has-text("Skip to content")');
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test('navigation has aria-label', async ({ page }) => {
    await page.goto('/en');
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
  });

  test('main content has correct id', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('main#main-content')).toBeVisible();
  });
});
