import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/en", "/en/about", "/en/projects", "/en/projects/real-estate-analyzer", "/th"];

test.describe("axe accessibility smoke", () => {
  for (const route of ROUTES) {
    test(`${route} has no critical/serious axe violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      // Entrance fades (motion) start at opacity 0, and below-the-fold
      // sections only fade in once scrolled into view; axe would read their
      // mid-fade colours as contrast failures. Scroll through so every section
      // animates, then check the settled page.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        window.scrollTo(0, 0);
      });
      // Decorative loops (the typing cursor blinks between 1 and 0 forever) are marked
      // data-motion-loop: they never settle, so they are left out of the wait and of axe.
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll<HTMLElement>("[style*='opacity']")]
            .filter((el) => !el.closest("[data-motion-loop]"))
            .every((el) => el.style.opacity === "" || Number(el.style.opacity) >= 1),
        undefined,
        { timeout: 10_000 },
      );
      const results = await new AxeBuilder({ page })
        .exclude("[data-motion-loop]")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const blocking = results.violations.filter((v) =>
        ["critical", "serious"].includes(String(v.impact)),
      );

      if (blocking.length > 0) {
        const summary = blocking
          .map(
            (v) =>
              `${v.id} (${v.impact}): ${v.help} — nodes=${v.nodes.length}`,
          )
          .join("\n");
        expect(blocking, summary).toEqual([]);
      }
    });
  }
});
