import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully in English', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/Chaowalit/);
    // Hero section visible
    await expect(page.locator('#hero')).toBeVisible();
  });

  // IMPROVEMENT-GOAL.md, performance: the hero heading is the LCP element.
  // It must be painted from the server HTML, not wait for hydration, so it
  // has to be visible (no opacity 0 on it or an ancestor) with JS disabled.
  test('hero name is visible before JavaScript runs', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/en');
    const heading = page.locator('#hero h1');
    await expect(heading).toContainText('Chaowalit');
    const hiddenAncestor = await heading.evaluate((el) => {
      for (let node: Element | null = el; node; node = node.parentElement) {
        if (getComputedStyle(node).opacity === '0') return node.outerHTML.slice(0, 120);
      }
      return null;
    });
    expect(hiddenAncestor).toBeNull();
    await context.close();
  });

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
