import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test('loads and shows project cards', async ({ page }) => {
    await page.goto('/en/projects');
    // Should have search input
    const search = page.locator('input[aria-label="Search projects"]');
    await expect(search).toBeVisible();
  });

  test('project detail keeps status and evidence localized', async ({ page }) => {
    await page.goto('/th/projects/real-estate-analyzer');
    await expect(page.getByRole('heading', { name: 'Yield Line — Property Decision Desk' })).toBeVisible();
    await expect(page.getByText('ใช้งานจริง', { exact: true })).toBeVisible();
    await expect(page.getByText('Evidence:', { exact: false })).not.toBeVisible();
    await expect(page.getByText('หลักฐาน: ใช้งานจริง', { exact: true })).toBeVisible();
  });

  test('search input filters projects', async ({ page }) => {
    await page.goto('/en/projects');
    const search = page.locator('input[aria-label="Search projects"]');
    await search.fill('kanban');
    // Results count should update
    const results = page.locator('p[aria-live="polite"]');
    await expect(results).toBeVisible();
    await expect(page).toHaveURL(/\/en\/projects\?q=kanban/);
  });

  test('domain navigation and pagination are available', async ({ page }) => {
    await page.goto('/en/projects');
    await expect(page.locator('[role="group"][aria-label="Browse by domain"]')).toBeVisible();
    const pagination = page.locator('nav[aria-label="Projects pagination"]');
    await expect(pagination).toBeVisible();
    const pageTwo = pagination.getByRole('link', { name: 'Page 2' });
    await expect(pageTwo).toHaveAttribute('href', /page=2/);
    await pageTwo.click();
    await expect(page).toHaveURL(/\/en\/projects\?page=2/);
    await expect(page.locator('p[aria-live="polite"]')).toContainText('page 2 of 5');
  });
});

test.describe('Contact Page', () => {
  test('contact form has proper labels', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="subject"]')).toBeVisible();
    await expect(page.locator('label[for="message"]')).toBeVisible();
  });

  test('contact form fields have aria-describedby', async ({ page }) => {
    await page.goto('/en/contact');
    const nameInput = page.locator('#name');
    await nameInput.fill('A');
    await page.locator('#email').fill('hello@example.com');
    await page.locator('#subject').fill('Hi');
    await page.locator('#message').fill('Short');
    await page.getByRole('button', { name: /send/i }).click();
    await expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
  });
});

test.describe('Blog Page', () => {
  test('blog page loads', async ({ page }) => {
    await page.goto('/en/blog');
    // Should have blog content
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('SEO metadata', () => {
  for (const path of ['/en', '/th', '/en/projects', '/en/blog']) {
    test(`${path} puts the meta description in <head> for a normal browser`, async ({ request }) => {
      const res = await request.get(path, {
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' },
      });
      const html = await res.text();
      const headEnd = html.indexOf('</head>');
      const desc = html.indexOf('name="description"');
      expect(desc).toBeGreaterThan(-1);
      expect(desc).toBeLessThan(headEnd);
    });
  }
});
