import { test, expect, type Page } from '@playwright/test';

/**
 * ARAC DEGERLEME — sitenin kabugu icinde calisan public demo.
 * Fiyat mantigi birim testlerde (publicVehicleDemo.test.ts); burada yalnizca
 * tarayicidaki akis: site Header/Footer'i, parite sonucu, kilit ve kanitsiz durum.
 */

const chainSelects = (page: Page) => page.locator('.rv-fields select');
const yearSelect = (page: Page) => page.locator('select', { has: page.locator('option[value="2000"]') });
// Mobil menu cekmecesi de kapaliyken role="dialog" tasir; tam surum paneli adiyla secilir.
const upgradeDialog = (page: Page) => page.locator('[role="dialog"][aria-labelledby="rv-upgrade-title"]');

async function pick(page: Page, ids: string[]) {
  for (const [depth, id] of ids.entries()) {
    await chainSelects(page).nth(depth).selectOption(id);
  }
}

test.describe('Araç Değerleme public demo', () => {
  test('site kabugunda, hatasiz yuklenir', async ({ page, isMobile }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

    await page.goto('/arac-degerleme/');
    await expect(page).toHaveTitle(/Araç Değerleme/);
    await expect(page.locator('h1')).toContainText('Araç Değerleme Sistemi');
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').last()).toBeVisible();
    await expect(chainSelects(page).first()).toBeVisible();

    if (isMobile) {
      await page.getByRole('button', { name: 'Menüyü aç' }).click();
      await expect(
        page.locator('[aria-label="Mobil Gezinme Menüsü"] a[href="/arac-degerleme/"]'),
      ).toBeVisible();
    } else {
      await expect(
        page.locator('nav[aria-label="Ana Gezinme"] a[href="/arac-degerleme/"]'),
      ).toHaveClass(/active-link/);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'yatay tasma').toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('Opel Corsa 1.5 TD ECO 2000 kabul edilmis sonucu verir', async ({ page }) => {
    await page.goto('/arac-degerleme/');
    await pick(page, ['opel', 'opel/corsa', 'opel/corsa/1-5-td', 'opel/corsa/1-5-td/eco']);
    await yearSelect(page).selectOption('2000');

    const result = page.locator('.rv-result');
    await expect(result).toContainText('225.000', { timeout: 10_000 });
    await expect(result).toContainText('190.000');
    await expect(result).toContainText('20 gerçek emsal');
    await expect(result).toContainText('Güven: %88');
  });

  test('kilitli markaya gecince eski fiyat kalkar ve tam surum paneli acilir', async ({ page }) => {
    await page.goto('/arac-degerleme/');
    await pick(page, ['opel', 'opel/corsa', 'opel/corsa/1-5-td', 'opel/corsa/1-5-td/eco']);
    await yearSelect(page).selectOption('2000');
    await expect(page.locator('.rv-result')).toContainText('225.000', { timeout: 10_000 });

    await chainSelects(page).nth(0).selectOption('abarth');
    await expect(page.locator('.rv-result')).toHaveCount(0);

    const dialog = upgradeDialog(page);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Kapat' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Tam Sürüm Bilgisi' })).toBeVisible();
  });

  test('kaniti olmayan acik arac fiyat gostermez, kilitli sayilmaz', async ({ page }) => {
    await page.goto('/arac-degerleme/');
    await pick(page, ['audi', 'audi/a3', 'audi/a3/a3-sedan', 'audi/a3/a3-sedan/2-0-tfsi']);

    await expect(page.getByText('yeterli güncel emsal bulunamadı')).toBeVisible();
    await expect(page.locator('.rv-result')).toHaveCount(0);
    await expect(upgradeDialog(page)).toHaveCount(0);
  });
});
