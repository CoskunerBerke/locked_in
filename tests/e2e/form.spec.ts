import { test, expect } from '@playwright/test';

test.describe('WhatsApp Form Validation', () => {
  test('should show validation errors when submitting empty form', async ({ page }) => {
    await page.goto('/#teklif-formu');
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await expect(page.locator('text=Lütfen geçerli bir ad ve soyad giriniz.')).toBeVisible();
  });
});
