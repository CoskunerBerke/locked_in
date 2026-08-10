import { test, expect } from '@playwright/test';

const viewports = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920, 2560];

test.describe('Responsive & Overflow Verification', () => {
  for (const width of viewports) {
    test(`should have no horizontal overflow at ${width}px width`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');

      const hasHorizontalScrollbar = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScrollbar).toBe(false);
    });
  }
});
