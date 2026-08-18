import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:\\Users\\berke\\.gemini\\antigravity\\brain\\ee6e6f74-bae3-43fc-a1c4-dc4b91e1aa18';

test.describe('Mandatory Planet Gate & Discrete Video VFX Transitions Suite', () => {
  test.setTimeout(180000);

  test('Test 1: Normal Scroll Locked on Earth & Discrete Advance to Mercury', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    await expect(gate).toHaveAttribute('data-gate-status', 'locked');
    await expect(gate).toHaveAttribute('data-active-index', '0');
    await expect(gate).toHaveAttribute('data-active-planet', 'earth');

    // Dispatch downward wheel event
    await page.evaluate(() => {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 300, bubbles: true, cancelable: true }));
    });

    // Should begin transition to Mercury, remaining locked at scrollY = 0
    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 8000 });
    await expect(gate).toHaveAttribute('data-active-index', '1');
    await expect(gate).toHaveAttribute('data-gate-status', 'locked');

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(50);
  });

  test('Test 2: Single Wheel Gesture Advances Exactly One Planet', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    await expect(gate).toHaveAttribute('data-active-index', '0');

    // Send single wheel tick
    await page.evaluate(() => {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
    });

    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 8000 });
    await expect(gate).toHaveAttribute('data-active-index', '1');
    await expect(gate).toHaveAttribute('data-transitioning', 'false');

    // Should NOT jump to Venus or Mars
    expect(await gate.getAttribute('data-active-index')).toBe('1');
  });

  test('Test 3: Mandatory Sequential Eight Planet Journey', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    await expect(gate).toHaveAttribute('data-active-index', '0');

    const stages = [
      { id: 'earth', name: 'Dünya', title: 'Web Tasarım ve Kurumsal Web Sitesi', index: '0' },
      { id: 'mercury', name: 'Merkür', title: 'Landing Page Tasarımı', index: '1' },
      { id: 'venus', name: 'Venüs', title: 'Web Sitesi Yenileme', index: '2' },
      { id: 'mars', name: 'Mars', title: 'Google SEO ve Arama Görünürlüğü', index: '3' },
      { id: 'jupiter', name: 'Jüpiter', title: 'Mobil Uygulama ve İşletme Yazılımı', index: '4' },
      { id: 'saturn', name: 'Satürn', title: 'Google Maps ve Yerel SEO', index: '5' },
      { id: 'uranus', name: 'Uranüs', title: 'Yemeksepeti ve Trendyol Yemek Kurulumu', index: '6' },
      { id: 'neptune', name: 'Neptün', title: 'Instagram ve Meta Reklam Yönetimi', index: '7' },
    ];

    if (testInfo.project.name === 'chromium') {
      await page.screenshot({ path: path.join(artifactsDir, '02_earth_start_scene.png') });
    }

    for (let i = 1; i < stages.length; i++) {
      const targetStage = stages[i];
      await page.waitForTimeout(100);

      // Trigger next via down arrow button
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="planet-next"]') as HTMLButtonElement;
        btn?.click();
      });

      await expect(gate).toHaveAttribute('data-active-planet', targetStage.id, { timeout: 8000 });
      await expect(gate).toHaveAttribute('data-active-index', targetStage.index);
      await expect(gate).toHaveAttribute('data-transitioning', 'false');

      await expect(page.locator('[data-testid="active-service-card"] h2')).toContainText(targetStage.title);

      if (targetStage.id === 'mercury' && testInfo.project.name === 'chromium') {
        await page.screenshot({ path: path.join(artifactsDir, '03_mercury_scene.png') });
      }
      if (targetStage.id === 'neptune' && testInfo.project.name === 'chromium') {
        await page.screenshot({ path: path.join(artifactsDir, '09_neptune_scene.png') });
      }
    }
  });

  test('Test 4: Neptune Release & Normal Page Scroll Unlocked', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');

    // Advance sequentially through stages to Neptune
    for (let i = 1; i <= 7; i++) {
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="planet-next"]') as HTMLButtonElement;
        btn?.click();
      });
      await expect(gate).toHaveAttribute('data-active-index', String(i), { timeout: 8000 });
      await expect(gate).toHaveAttribute('data-transitioning', 'false');
    }

    await expect(gate).toHaveAttribute('data-active-planet', 'neptune', { timeout: 8000 });

    // Click "Projelerimizi Keşfet" on Neptune
    const exploreBtn = page.locator('[data-testid="planet-next"]:has-text("Projelerimizi Keşfet")');
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();

    await expect(gate).toHaveAttribute('data-gate-status', 'released', { timeout: 5000 });

    await page.waitForTimeout(600);
    const portfolioSec = page.locator('#portfolyo-section');
    await expect(portfolioSec).toBeAttached();
  });

  test('Test 5: Rapid Wheel Events Do Not Skip Stages', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    await expect(gate).toHaveAttribute('data-active-index', '0');

    // Send 6 burst wheel events in rapid succession
    await page.evaluate(() => {
      for (let i = 0; i < 6; i++) {
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: 80, bubbles: true, cancelable: true }));
      }
    });

    // Wait for transition to complete
    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 8000 });
    await expect(gate).toHaveAttribute('data-active-index', '1');
    await expect(gate).toHaveAttribute('data-transitioning', 'false');

    // Exactly 1 stage advanced (Earth -> Mercury)
    expect(await gate.getAttribute('data-active-index')).toBe('1');
  });

  test('Test 6: Keyboard Navigation (ArrowDown, ArrowUp, Space)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    await expect(gate).toHaveAttribute('data-active-index', '0');

    // Press ArrowDown
    await page.keyboard.press('ArrowDown');
    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 8000 });
    await expect(gate).toHaveAttribute('data-active-index', '1');

    // Press ArrowUp to return to Earth
    await page.keyboard.press('ArrowUp');
    await expect(gate).toHaveAttribute('data-active-planet', 'earth', { timeout: 8000 });
    await expect(gate).toHaveAttribute('data-active-index', '0');

    // Press Space to advance to Mercury
    await page.keyboard.press('Space');
    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 8000 });
    await expect(gate).toHaveAttribute('data-active-index', '1');
  });

  test('Test 7: Services Menu Header Direct Bypass', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Navigate to a service detail page directly
    await page.goto('/hizmetler/web-sitesi-tasarimi/');
    await expect(page).toHaveURL(/\/hizmetler\/web-sitesi-tasarimi\/?/);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('Test 8: Real VFX Video Overlay Integration', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    const vfxVideo = gate.locator('video');

    await expect(vfxVideo).toBeAttached();
    const mixBlend = await vfxVideo.evaluate((el) => window.getComputedStyle(el).mixBlendMode);
    expect(mixBlend).toBe('screen');
  });

  test('Test 9: Mobile Touch Swipe Gesture', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    await expect(gate).toHaveAttribute('data-active-index', '0');

    // Simulate drag swipe up
    const gateBox = await gate.boundingBox();
    if (gateBox) {
      const centerX = gateBox.x + gateBox.width / 2;
      const startY = gateBox.y + gateBox.height * 0.75;
      const endY = gateBox.y + gateBox.height * 0.25;
      await page.mouse.move(centerX, startY);
      await page.mouse.down();
      await page.mouse.move(centerX, endY, { steps: 5 });
      await page.mouse.up();
    }

    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 8000 });
    await expect(gate).toHaveAttribute('data-active-index', '1');
  });

  test('Test 10: Strict Homepage Section Sequence & Preserved Components', async ({ page }) => {
    await page.goto('/');

    const sections = await page.evaluate(() => {
      const list: string[] = [];
      const mainNodes = document.querySelectorAll('#gezegen-seruveni, #portfolyo-section, #geri-donusler, #faq, #teklif-formu');
      mainNodes.forEach((node) => {
        if (node.id) list.push(node.id);
      });
      return list;
    });

    const planetIdx = sections.indexOf('gezegen-seruveni');
    const portfolyoIdx = sections.indexOf('portfolyo-section');
    const reviewsIdx = sections.indexOf('geri-donusler');
    const faqIdx = sections.indexOf('faq');
    const ctaIdx = sections.indexOf('teklif-formu');

    expect(planetIdx).toBeGreaterThan(-1);
    expect(portfolyoIdx).toBeGreaterThan(planetIdx);
    expect(reviewsIdx).toBeGreaterThan(portfolyoIdx);
    expect(faqIdx).toBeGreaterThan(reviewsIdx);
    expect(ctaIdx).toBeGreaterThan(faqIdx);

    // 1. Projects: 4 cards
    const projectCards = page.locator('#portfolyo-section .group');
    await expect(projectCards).toHaveCount(4);
    await expect(page.locator('#portfolyo-section').locator('text=RN Vize Danışmanlık')).toBeVisible();
    await expect(page.locator('#portfolyo-section').locator('text=Quattro Garaj Otomotiv')).toBeVisible();

    // 2. Reviews Marquee
    const reviewsSection = page.locator('#geri-donusler');
    await expect(reviewsSection).toBeVisible();
    await expect(reviewsSection.locator('h2')).toContainText('Instagram & WhatsApp');

    // 3. FAQ
    const faqDetails = page.locator('#faq details');
    await expect(faqDetails.first()).toBeVisible();

    // 4. Contact Form
    const nameInput = page.locator('#teklif-formu input[name="name"], form input#name').first();
    await expect(nameInput).toBeAttached();
  });
});
