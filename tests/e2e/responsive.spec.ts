import { test, expect } from '@playwright/test';

// Multi-device viewports: Mobile (320-430), Tablets/iPads (768-1024), Laptops/Desktops (1280-1920), 2K/4K Smart TVs (2560-3840)
const viewports = [
  { width: 320, height: 568, device: 'Small Mobile' },
  { width: 375, height: 812, device: 'iPhone SE/X' },
  { width: 390, height: 844, device: 'iPhone 13/14' },
  { width: 430, height: 932, device: 'Mobile Max' },
  { width: 768, height: 1024, device: 'iPad / Tablet Portrait' },
  { width: 820, height: 1180, device: 'iPad Air Portrait' },
  { width: 1024, height: 1366, device: 'iPad Pro / Tablet Landscape' },
  { width: 1280, height: 800, device: 'Laptop' },
  { width: 1440, height: 900, device: 'Desktop' },
  { width: 1920, height: 1080, device: 'Full HD Monitor / TV' },
  { width: 2560, height: 1440, device: '2K Monitor / Smart TV' },
  { width: 3840, height: 2160, device: '4K Ultra HD Smart TV' },
];

test.describe('Multi-Device & Smart TV / iPad Responsive Integration', () => {
  for (const vp of viewports) {
    test(`should render without horizontal overflow on ${vp.device} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      const hasHorizontalScrollbar = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScrollbar).toBe(false);
    });
  }
});
