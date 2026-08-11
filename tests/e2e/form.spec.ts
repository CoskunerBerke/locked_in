import { test, expect } from '@playwright/test';

test.describe('Contact Form Validation & Field Separation', () => {
  test('should show validation errors when submitting empty form', async ({ page }) => {
    await page.goto('/#teklif-formu');
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await expect(page.locator('text=Lütfen geçerli bir ad ve soyad giriniz.')).toBeVisible();
    await expect(page.locator('text=Lütfen projeniz hakkında en az 10 karakterlik bilgi veriniz.')).toBeVisible();
  });
});
