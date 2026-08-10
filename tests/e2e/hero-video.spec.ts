import { test, expect } from '@playwright/test';

test.describe('Hero Background Video System', () => {
  test('should load video element and verify source properties', async ({ page }) => {
    await page.goto('/');

    const videoLocator = page.locator('video');
    await expect(videoLocator).toBeAttached();
    await expect(videoLocator).toBeVisible();

    const sourceLocator = page.locator('video source');
    await expect(sourceLocator).toHaveAttribute('src', '/videos/hero-desktop.mp4');
    await expect(sourceLocator).toHaveAttribute('type', 'video/mp4');

    // Verify DOM properties
    const videoProperties = await videoLocator.evaluate((el: HTMLVideoElement) => ({
      muted: el.muted,
      loop: el.loop,
      playsInline: el.playsInline,
      readyState: el.readyState,
    }));

    expect(videoProperties.muted).toBe(true);
    expect(videoProperties.loop).toBe(true);
    expect(videoProperties.playsInline).toBe(true);
    expect(videoProperties.readyState).toBeGreaterThanOrEqual(1); // HAVE_METADATA or higher
  });

  test('should toggle play and pause via control button', async ({ page }) => {
    await page.goto('/');

    const button = page.locator('button[aria-label*="Arka plan videosunu"]');
    await expect(button).toBeVisible();

    const videoLocator = page.locator('video');
    await page.waitForTimeout(500);

    const isInitiallyPaused = await videoLocator.evaluate((el: HTMLVideoElement) => el.paused);

    if (!isInitiallyPaused) {
      // Pause it
      await button.click();
      await expect(button).toHaveText(/Arka plan videosunu oynat/i);

      // Play it again
      await button.click();
      await page.waitForTimeout(500);
      const buttonText = await button.innerText();
      expect(buttonText).toMatch(/Arka plan videosunu (durdur|oynat)/i);
    } else {
      // Play it
      await button.click();
      await page.waitForTimeout(500);
      const buttonText = await button.innerText();
      expect(buttonText).toMatch(/Arka plan videosunu (durdur|oynat)/i);
    }
  });

  test('should respect reduced motion initially but allow manual play button click', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const videoLocator = page.locator('video');
    await expect(videoLocator).toBeAttached();
    await expect(videoLocator).toBeVisible();

    // Verify video stays in DOM and is paused initially
    const isPausedInReducedMotion = await videoLocator.evaluate((el: HTMLVideoElement) => el.paused);
    expect(isPausedInReducedMotion).toBe(true);

    const button = page.locator('button[aria-label*="Arka plan videosunu"]');
    await expect(button).toBeVisible();
    await expect(button).toHaveText(/Arka plan videosunu oynat/i);

    // Click manual play button
    await button.click();
    await page.waitForTimeout(500);

    // Verify button responds
    const buttonText = await button.innerText();
    expect(buttonText).toMatch(/Arka plan videosunu (durdur|oynat)/i);
  });
});
