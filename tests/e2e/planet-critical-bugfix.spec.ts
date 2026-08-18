import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:\\Users\\berke\\.gemini\\antigravity\\brain\\ee6e6f74-bae3-43fc-a1c4-dc4b91e1aa18';

test.describe('Mandatory Planet Gate & Discrete Video VFX Transitions Suite', () => {
  test.setTimeout(240000);

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
    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 12000 });
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

    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 12000 });
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

      await expect(gate).toHaveAttribute('data-active-planet', targetStage.id, { timeout: 12000 });
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
      await page.waitForTimeout(400);
      await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="planet-next"]') as HTMLButtonElement;
        btn?.click();
      });
      await expect(gate).toHaveAttribute('data-active-index', String(i), { timeout: 15000 });
      await expect(gate).toHaveAttribute('data-transitioning', 'false', { timeout: 15000 });
    }

    await expect(gate).toHaveAttribute('data-active-planet', 'neptune', { timeout: 12000 });

    // Click "Projelerimizi Keşfet" on Neptune
    const exploreBtn = page.locator('[data-testid="planet-next"]:has-text("Projelerimizi Keşfet")');
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();

    await expect(gate).toHaveAttribute('data-gate-status', 'released', { timeout: 6000 });

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
        document.getElementById('gezegen-seruveni')?.dispatchEvent(new WheelEvent('wheel', { deltaY: 80, bubbles: true, cancelable: true }));
      }
    });

    // Wait for transition to complete
    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 15000 });
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
    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 12000 });
    await expect(gate).toHaveAttribute('data-active-index', '1');

    // Press ArrowUp to return to Earth
    await page.keyboard.press('ArrowUp');
    await expect(gate).toHaveAttribute('data-active-planet', 'earth', { timeout: 12000 });
    await expect(gate).toHaveAttribute('data-active-index', '0');

    // Press Space to advance to Mercury
    await page.keyboard.press('Space');
    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 12000 });
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

  test('Test 8: Real Clean VFX Video Overlay Integration & No Raw Names', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    const vfxVideo = gate.locator('video');

    await expect(vfxVideo).toBeAttached();
    const mixBlend = await vfxVideo.evaluate((el) => window.getComputedStyle(el).mixBlendMode);
    expect(mixBlend).toBe('screen');

    // Verify video src uses clean derivative asset
    const src = await vfxVideo.getAttribute('src');
    expect(src).toContain('-clean-');
    expect(src).not.toContain('references/');
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

    await expect(gate).toHaveAttribute('data-active-planet', 'mercury', { timeout: 12000 });
    await expect(gate).toHaveAttribute('data-active-index', '1');
  });

  test('Test 10: Real-time 4.8s Transition Keyframes & Clean Regression Validation', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const gate = page.locator('[data-testid="planet-gate"]');
    await expect(gate).toHaveAttribute('data-active-index', '0');

    if (testInfo.project.name === 'chromium') {
      // 0ms: Initial state
      await page.screenshot({ path: path.join(artifactsDir, 'vfx_00_start_0ms.png') });

      // Trigger transition
      await page.keyboard.press('ArrowDown');

      // 1200ms: Corona build-up
      await page.waitForTimeout(1200);
      await expect(gate).toHaveAttribute('data-transitioning', 'true');
      await page.screenshot({ path: path.join(artifactsDir, 'vfx_01_corona_1200ms.png') });

      // 2400ms: Peak transformation
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(artifactsDir, 'vfx_02_peak_2400ms.png') });

      // 3600ms: Calming down
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(artifactsDir, 'vfx_03_calming_3600ms.png') });

      // 4800ms+: Settle to Mercury
      await page.waitForTimeout(1400);
      await expect(gate).toHaveAttribute('data-active-planet', 'mercury');
      await expect(gate).toHaveAttribute('data-transitioning', 'false');
      await page.screenshot({ path: path.join(artifactsDir, 'vfx_04_settled_4800ms.png') });
    }

    // Verify raw Flow filenames are NOT anywhere in the rendered HTML or scripts
    const pageContent = await page.content();
    expect(pageContent).not.toContain('flow-warm-transition');
    expect(pageContent).not.toContain('flow-cool-transition');
  });
});
