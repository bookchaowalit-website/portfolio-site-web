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

// IMPROVEMENT-GOAL.md, SEO: search engines and link previews only trust
// metadata inside <head>. Next streams async metadata into <body> unless told
// otherwise, which made Lighthouse fail `meta-description` on every page.
test.describe('Metadata in <head>', () => {
  for (const path of ['/en', '/th', '/en/blog', '/en/projects']) {
    test(`description and Open Graph tags are in <head> (${path})`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), `${path} must answer itself, not redirect`).toBe(200);
      const html = await response.text();
      // Each locale serves its own description, so a broken route that falls
      // back to another page would not pass silently.
      const lang = path.startsWith('/th') ? 'th' : 'en';
      expect(html).toContain(`<html lang="${lang}"`);
      const headEnd = html.indexOf('</head>');
      expect(headEnd).toBeGreaterThan(0);
      for (const tag of ['name="description"', 'property="og:title"', 'property="og:description"']) {
        const at = html.indexOf(tag);
        expect(at, `${tag} missing on ${path}`).toBeGreaterThan(-1);
        expect(at, `${tag} is after </head> on ${path}`).toBeLessThan(headEnd);
      }
    });
  }
});

// IMPROVEMENT-GOAL.md, UX: at 320 px the hero sticky note's entrance spring
// overshot to ~1.13x and the page scrolled sideways for a moment.
test.describe('No sideways scroll while the hero animates', () => {
  for (const path of ['/en', '/th']) {
    test(`page never overflows horizontally at 320px while the hero animates (${path})`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 320, height: 700 } });
      const page = await context.newPage();
      // Record the worst overflow on every animation frame from the first paint.
      await page.addInitScript(() => {
        const w = window as unknown as { __maxOverflow: number; __frames: number };
        w.__maxOverflow = 0;
        w.__frames = 0;
        const tick = () => {
          const el = document.documentElement;
          if (el) w.__maxOverflow = Math.max(w.__maxOverflow, el.scrollWidth - window.innerWidth);
          w.__frames++;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await page.goto(path);
      // The sticky note is the element that animates in; wait until it has
      // settled at its final scale so the whole entrance was observed.
      const note = page.locator('#hero .sticky-note').first();
      await expect(note).toBeVisible();
      await expect
        .poll(() => note.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a), { timeout: 5000 })
        .toBeLessThan(1.01);
      await page.waitForTimeout(500);
      const { max, frames } = await page.evaluate(() => {
        const w = window as unknown as { __maxOverflow: number; __frames: number };
        return { max: w.__maxOverflow, frames: w.__frames };
      });
      expect(frames, 'frames observed').toBeGreaterThan(30);
      expect(max, `max horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
      await context.close();
    });
  }
});

// IMPROVEMENT-GOAL.md, UX: Thai line breaking split the surname "กรีโภค" into
// "กรี / โภค" at 320 px. The hero name may wrap only at its spaces.
test.describe('Hero name wraps only between words', () => {
  for (const path of ['/en', '/th']) {
    test(`no word of the name is split across lines at 320px (${path})`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: 320, height: 700 } });
      const page = await context.newPage();
      await page.goto(path);
      const name = page.locator('#hero h1 .font-bold').first();
      await expect(name).not.toBeEmpty();
      const splitWords = await name.evaluate((el) => {
        const text = el.textContent ?? '';
        const node = [...el.childNodes].length ? el : el;
        const range = document.createRange();
        const words: string[] = [];
        let offset = 0;
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        const nodes: Text[] = [];
        while (walker.nextNode()) nodes.push(walker.currentNode as Text);
        for (const word of text.split(/\s+/).filter(Boolean)) {
          const start = text.indexOf(word, offset);
          offset = start + word.length;
          // Map the word back to text nodes and count its line boxes.
          let pos = 0;
          const rects: DOMRect[] = [];
          for (const t of nodes) {
            const len = t.data.length;
            const a = Math.max(start, pos), b = Math.min(start + word.length, pos + len);
            if (a < b) {
              range.setStart(t, a - pos);
              range.setEnd(t, b - pos);
              rects.push(...Array.from(range.getClientRects()));
            }
            pos += len;
          }
          const lines = new Set(rects.filter((r) => r.width > 0).map((r) => Math.round(r.top)));
          if (lines.size > 1) words.push(word);
        }
        return words;
      });
      expect(splitWords, `words split across lines on ${path}`).toEqual([]);
      await context.close();
    });
  }
});

// IMPROVEMENT-GOAL.md, a11y (WCAG 2.5.3 Label in Name): a control's accessible
// name must contain its visible text, so voice-control users can say what they
// see. The header showed "⌘K" and "?" on buttons named "... (Cmd+K)" and
// "Keyboard shortcuts help". axe 4.13 here does not flag these (4.14 does), so
// the check is done directly; emoji and flags are ignored, symbols such as ⌘ are not.
test.describe('Label in name', () => {
  for (const path of ['/en', '/th']) {
    for (const width of [375, 768, 1440]) {
      test(`header controls name what they show at ${width}px (${path})`, async ({ browser }) => {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        const page = await context.newPage();
        await page.goto(path, { waitUntil: 'networkidle' });
        const nav = page.locator('nav[aria-label="Main navigation"]');
        await expect(nav.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeVisible();
        if (width >= 768) {
          // CommandPalette and HelpDialog load separately; make sure both are in.
          await expect(nav.locator('button', { hasText: '⌘K' })).toBeVisible();
          await expect(nav.locator('button', { hasText: '?' })).toBeVisible();
        }
        const mismatches = await nav.locator('button[aria-label], a[aria-label]').evaluateAll((els) =>
          els
            .filter((el) => (el as HTMLElement).offsetParent !== null)
            .map((el) => {
              const shown = (el as HTMLElement).innerText
                .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F]/gu, '')
                .replace(/\s+/g, ' ')
                .trim();
              const name = el.getAttribute('aria-label') ?? '';
              return { shown, name };
            })
            .filter(({ shown, name }) => {
              // Like axe: punctuation-only text ("?") names nothing; otherwise the
              // visible words must appear as whole words in the name ("(⌘K)" is
              // not "⌘K"). Trailing sentence punctuation on name words is ignored.
              if (!/[\p{L}\p{N}]/u.test(shown)) return false;
              const words = (t: string) => t.toLowerCase().split(/\s+/).map((w) => w.replace(/[.,:;!]+$/, '')).filter(Boolean);
              const want = words(shown);
              const have = words(name);
              return !have.some((_, i) => want.every((w, j) => have[i + j] === w));
            }),
        );
        expect(mismatches).toEqual([]);
        await context.close();
      });
    }
  }
});
