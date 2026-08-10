import { test, expect } from '@playwright/test';

test.describe('Navigation & Page Loads', () => {
  test('should load Home Page cleanly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MARKA ADI/);
    await expect(page.locator('h1')).toContainText('Dijitalde görünür');
  });

  test('should navigate to Web Sitesi Tasarımı page', async ({ page }) => {
    await page.goto('/hizmetler/web-sitesi-tasarimi/');
    await expect(page.locator('h1')).toContainText('Kurumsal Web Sitesi Tasarımı');
  });

  test('should navigate to Yemeksepeti & Trendyol Yemek page', async ({ page }) => {
    await page.goto('/hizmetler/yemeksepeti-trendyol-yemek/');
    await expect(page.locator('h1')).toContainText('Yemeksepeti ve Trendyol Yemek');
  });

  test('should render custom 404 page on invalid route', async ({ page }) => {
    const response = await page.goto('/gecersiz-sayfa-999');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('Sayfa Bulunamadı');
  });
});
