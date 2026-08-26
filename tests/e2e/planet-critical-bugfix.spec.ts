import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:\\Users\\berke\\.gemini\\antigravity\\brain\\ee6e6f74-bae3-43fc-a1c4-dc4b91e1aa18';

const pressArrowDown = async (page: Page) => {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('planet-next'));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  });
};

const pressArrowUp = async (page: Page) => {
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('planet-prev'));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
  });
};

test.describe('Rent Yazılım — Pure WebGL Fullscreen Planet Service Experience Suite', () => {
  test.setTimeout(240000);

  test('Test 1: Zero Video Elements in DOM & Zero Black Rectangle Overlay', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const homeExp = page.locator('[data-testid="home-experience"]');
    await expect(homeExp).toBeVisible();

    // Verify 0 video elements in the entire DOM
    const videoCount = await page.locator('video').count();
    expect(videoCount).toBe(0);

    // Verify Canvas exists for 3D procedural WebGL
    const canvas = page.locator('[data-testid="active-planet"]');
    await expect(canvas).toBeAttached();

    // Verify no raw video paths in page HTML
    const html = await page.content();
    expect(html).not.toContain('.mp4');
    expect(html).not.toContain('flow-warm-transition');
    expect(html).not.toContain('flow-cool-transition');
  });

  test('Test 2: Next Button Advances Exactly One Screen (Earth -> Mercury)', async ({ page }) => {
    await page.goto('/');
    const homeExp = page.locator('[data-testid="home-experience"]');
    await expect(homeExp).toBeVisible();
    await expect(homeExp).toHaveAttribute('data-active-index', '0');
    await page.waitForTimeout(800);

    // Trigger next transition
    await pressArrowDown(page);

    // Should transition to Mercury and settle
    await expect(homeExp).toHaveAttribute('data-active-index', '1', { timeout: 15000 });
    await expect(homeExp).toHaveAttribute('data-active-scene', 'mercury');
    await expect(homeExp).toHaveAttribute('data-transitioning', 'false');

    // Verify it did not skip to Venus or Mars
    expect(await homeExp.getAttribute('data-active-index')).toBe('1');
  });

  test('Test 3: Rapid Click Bursts Do Not Skip Stages', async ({ page }) => {
    await page.goto('/');
    const homeExp = page.locator('[data-testid="home-experience"]');
    await expect(homeExp).toBeVisible();
    await expect(homeExp).toHaveAttribute('data-active-index', '0');
    await page.waitForTimeout(800);

    // Send rapid burst of keydowns
    await pressArrowDown(page);
    await pressArrowDown(page);
    await pressArrowDown(page);

    // Wait for single transition to complete
    await expect(homeExp).toHaveAttribute('data-active-index', '1', { timeout: 15000 });
    await expect(homeExp).toHaveAttribute('data-active-scene', 'mercury');
    await expect(homeExp).toHaveAttribute('data-transitioning', 'false');

    // Exactly 1 stage advanced
    expect(await homeExp.getAttribute('data-active-index')).toBe('1');
  });

  test('Test 4: Directional Prev / Next Navigation', async ({ page }) => {
    await page.goto('/');
    const homeExp = page.locator('[data-testid="home-experience"]');
    await expect(homeExp).toBeVisible();
    await expect(homeExp).toHaveAttribute('data-active-index', '0');
    await page.waitForTimeout(1000);

    // Next -> Mercury
    await pressArrowDown(page);
    await expect(homeExp).toHaveAttribute('data-active-index', '1', { timeout: 15000 });
    await expect(homeExp).toHaveAttribute('data-transitioning', 'false');

    // Prev -> Earth
    await page.waitForTimeout(1600);
    await pressArrowUp(page);
    await expect(homeExp).toHaveAttribute('data-active-index', '0', { timeout: 15000 });
    await expect(homeExp).toHaveAttribute('data-transitioning', 'false');

    // Next -> Mercury again
    await page.waitForTimeout(1600);
    await pressArrowDown(page);
    await expect(homeExp).toHaveAttribute('data-active-index', '1', { timeout: 15000 });
    await expect(homeExp).toHaveAttribute('data-transitioning', 'false');
  });

  test('Test 5: Full 9-Screen Sequential Experience (8 Planets -> FAQ) & Header Reviews Modal', async ({ page }, testInfo) => {
    await page.goto('/');
    const homeExp = page.locator('[data-testid="home-experience"]');
    await expect(homeExp).toBeVisible();
    await expect(homeExp).toHaveAttribute('data-active-index', '0');
    await page.waitForTimeout(600);

    const expectedStages = [
      { id: 'earth', name: 'Dünya', title: 'Web Tasarım ve Kurumsal Web Sitesi' },
      { id: 'mercury', name: 'Merkür', title: 'Landing Page Tasarımı' },
      { id: 'venus', name: 'Venüs', title: 'Web Sitesi Yenileme' },
      { id: 'mars', name: 'Mars', title: 'Google SEO ve Arama Görünürlüğü' },
      { id: 'jupiter', name: 'Jüpiter', title: 'Mobil Uygulama ve İşletme Yazılımı' },
      { id: 'saturn', name: 'Satürn', title: 'Google Maps ve Yerel SEO' },
      { id: 'uranus', name: 'Uranüs', title: 'Yemeksepeti ve Trendyol Yemek Kurulumu' },
      { id: 'neptune', name: 'Neptün', title: 'Instagram ve Meta Reklam Yönetimi' },
    ];

    if (testInfo.project.name === 'chromium') {
      await page.screenshot({ path: path.join(artifactsDir, 'v3_01_earth_scene.png') });
    }

    // Step through planets 1 to 7
    for (let i = 1; i <= 7; i++) {
      await page.waitForTimeout(400);
      await pressArrowDown(page);

      await expect(homeExp).toHaveAttribute('data-active-index', String(i), { timeout: 15000 });
      await expect(homeExp).toHaveAttribute('data-active-scene', expectedStages[i].id);
      await expect(homeExp).toHaveAttribute('data-transitioning', 'false');

      await expect(page.locator('[data-testid="active-service-card"] h2')).toContainText(expectedStages[i].title);

      if (expectedStages[i].id === 'mars' && testInfo.project.name === 'chromium') {
        await page.screenshot({ path: path.join(artifactsDir, 'v3_04_mars_scene.png') });
      }
      if (expectedStages[i].id === 'saturn' && testInfo.project.name === 'chromium') {
        await page.screenshot({ path: path.join(artifactsDir, 'v3_06_saturn_scene.png') });
      }
      if (expectedStages[i].id === 'neptune' && testInfo.project.name === 'chromium') {
        await page.screenshot({ path: path.join(artifactsDir, 'v3_08_neptune_scene.png') });
      }
    }

    // Step to Screen 09: FAQ
    await page.waitForTimeout(400);
    await pressArrowDown(page);
    await expect(homeExp).toHaveAttribute('data-active-index', '8', { timeout: 15000 });
    await expect(homeExp).toHaveAttribute('data-active-scene', 'faq');
    await expect(page.locator('[data-testid="faq-screen"]')).toBeVisible();
    if (testInfo.project.name === 'chromium') {
      await page.screenshot({ path: path.join(artifactsDir, 'v3_09_faq_scene.png') });
    }

    // Verify FAQ content
    await expect(page.locator('[data-testid="faq-screen"]')).toContainText('Web sitem ne kadar sürede tamamlanır');
    await expect(page.locator('[data-testid="faq-screen"]')).toContainText('3 ile 7 iş günü');
    await expect(homeExp).toHaveAttribute('data-transitioning', 'false', { timeout: 15000 });

    // Test "Hizmetleri Yeniden İncele" button returns to Screen 01 (Earth)
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="restart-experience"]') as HTMLButtonElement;
      btn?.click();
    });
    await expect(homeExp).toHaveAttribute('data-active-index', '0', { timeout: 15000 });
    await expect(homeExp).toHaveAttribute('data-active-scene', 'earth');

    // Test Header Reviews Modal opens and displays customer reviews (on desktop)
    if (testInfo.project.name === 'chromium') {
      const reviewsBtn = page.locator('button[aria-label="Müşteri Yorumlarını Aç"]');
      await reviewsBtn.click();
      await expect(page.locator('#reviews-title')).toBeVisible();
      await expect(page.locator('text=Quattro Garaj Otomotiv').first()).toBeVisible();
      const closeBtn = page.locator('button[aria-label="Kapat"]');
      await closeBtn.click();
    }
  });

  test('Test 6: Body Scroll Lock on Home & Clean Restoration on Navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="home-experience"]')).toBeVisible();

    // Body scroll should be locked on homepage
    await page.waitForFunction(() => document.body.style.overflow === 'hidden');
    const homeOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(homeOverflow).toBe('hidden');

    // Navigate to /hakkimizda/
    await page.goto('/hakkimizda/');
    await expect(page).toHaveURL(/\/hakkimizda\/?/);

    // Body scroll should be unlocked on subpage
    const subpageOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(subpageOverflow).not.toBe('hidden');

    // Navigate back to home
    await page.goto('/');
    await expect(page.locator('[data-testid="home-experience"]')).toBeVisible();
    await page.waitForFunction(() => document.body.style.overflow === 'hidden');
    const homeOverflowAgain = await page.evaluate(() => document.body.style.overflow);
    expect(homeOverflowAgain).toBe('hidden');
  });

  test('Test 7: Direct Header Navigation & Subpages Unaffected', async ({ page }) => {
    await page.goto('/hizmetler/web-sitesi-tasarimi/');
    await expect(page).toHaveURL(/\/hizmetler\/web-sitesi-tasarimi\/?/);
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('/projeler/');
    await expect(page).toHaveURL(/\/projeler\/?/);

    await page.goto('/iletisim/');
    await expect(page).toHaveURL(/\/iletisim\/?/);
  });

  test('Test 8: Mobile Touch Swipe Navigation', async ({ page }) => {
    await page.goto('/');
    const homeExp = page.locator('[data-testid="home-experience"]');
    await expect(homeExp).toBeVisible();
    await expect(homeExp).toHaveAttribute('data-active-index', '0');
    await expect(homeExp).toHaveAttribute('data-transitioning', 'false');
    await page.waitForTimeout(800);

    // Simulate pointer swipe up
    await page.evaluate(() => {
      window.dispatchEvent(new PointerEvent('pointerdown', { clientY: 500, bubbles: true, cancelable: true }));
      window.dispatchEvent(new PointerEvent('pointerup', { clientY: 200, bubbles: true, cancelable: true }));
    });

    await expect(homeExp).toHaveAttribute('data-active-index', '1', { timeout: 15000 });
    await expect(homeExp).toHaveAttribute('data-active-scene', 'mercury');
  });

  test('Test 9: VFX Lab Route Exists with noindex and Controls', async ({ page }) => {
    await page.goto('/vfx-lab/');
    await expect(page.locator('h1')).toContainText('VFX Transition Lab', { timeout: 12000 });
    
    // Verify noindex meta tag
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute('content', /noindex/);

    // Verify controls
    await expect(page.locator('button:has-text("İleri (4.6s)")')).toBeVisible();
    await expect(page.locator('canvas')).toBeAttached();
  });
});
