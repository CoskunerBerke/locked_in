import { test, expect } from '@playwright/test';

test.describe('Navigation & Corporate Page Loads', () => {
  test('should load Home Page cleanly with new corporate title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Rent Yazılım/);
    await expect(page.locator('h1')).toContainText('İşletmenizi dijitalde');
  });

  test('should open Mega Menu and navigate to Web Sitesi Tasarımı page', async ({ page }) => {
    await page.goto('/');

    const megaMenuBtn = page.locator('button[aria-haspopup="true"]', { hasText: 'Hizmetler' }).first();
    if (await megaMenuBtn.isVisible()) {
      await megaMenuBtn.click();
      const link = page.locator('a', { hasText: 'Kurumsal Web Sitesi' }).first();
      await expect(link).toBeVisible();
      await link.click();
    } else {
      await page.goto('/hizmetler/web-sitesi-tasarimi/');
    }

    await expect(page.locator('h1')).toContainText('Kurumsal Web Sitesi Tasarımı');
  });

  test('should navigate to Hakkımızda page', async ({ page }) => {
    await page.goto('/hakkimizda/');
    await expect(page.locator('h1')).toContainText('Dijitalde güçlü ve sürdürülebilir');
  });

  test('should navigate to Projeler page and display real client showcase', async ({ page }) => {
    await page.goto('/projeler/');
    await expect(page.locator('h1')).toContainText('Canlı Proje ve Referanslarımız');
    await expect(page.locator('text=RN Vize Danışmanlık')).toBeVisible();
  });

  test('should navigate to Akademi blog index and detail post', async ({ page }) => {
    await page.goto('/akademi/');
    await expect(page.locator('h1')).toContainText('İşletmenizi dijitalde öne geçirecek');

    await page.goto('/akademi/kurumsal-web-sitesi-nedir/');
    await expect(page.locator('h1')).toContainText('Kurumsal Web Sitesi Nedir?');
  });

  test('should navigate to İletişim page', async ({ page }) => {
    await page.goto('/iletisim/');
    await expect(page.locator('h1')).toContainText('Sorularınız ve projeniz için her zaman buradayız');
  });

  test('should render custom 404 page on invalid route', async ({ page }) => {
    const response = await page.goto('/gecersiz-sayfa-999');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('Sayfa Bulunamadı');
  });
});
