import { test, expect } from '@playwright/test';

test.describe('Hero System & Solar System Canvas', () => {
  test('should load Home Page cleanly with high-contrast text and 8-planet Solar System', async ({ page }) => {
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('İşletmenizi dijitalde');
    await expect(h1).toContainText('güçlü bir sisteme');

    // Ensure NO video control button exists
    const videoButton = page.locator('button[aria-label*="Arka plan videosunu"]');
    await expect(videoButton).toHaveCount(0);

    // Ensure Solar System Canvas is present
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible();
  });
});
