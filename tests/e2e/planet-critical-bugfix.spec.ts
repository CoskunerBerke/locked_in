import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:\\Users\\berke\\.gemini\\antigravity\\brain\\ee6e6f74-bae3-43fc-a1c4-dc4b91e1aa18';

test.describe('Planet Experience Critical Bugfix V2 Suite', () => {
  test.setTimeout(120000);

  test('1. Hero Button "Serüvene Başla" smoothly scrolls to #gezegen-seruveni and activates Earth', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const heroCta = page.locator('a:has-text("Serüvene Başla")').first();
    await expect(heroCta).toBeVisible();
    await heroCta.click();

    await page.waitForTimeout(600);

    const section = page.locator('#gezegen-seruveni');
    await expect(section).toBeVisible();

    const exp = page.locator('[data-testid="planet-experience"]');
    await expect(exp).toHaveAttribute('data-active-index', '0');
    await expect(exp).toHaveAttribute('data-planet-id', 'earth');

    const card = page.locator('[data-testid="active-service-card"]');
    await expect(card).toBeVisible();
    await expect(card.locator('h2')).toContainText('Web Tasarım ve Kurumsal Web Sitesi');

    await page.screenshot({ path: path.join(artifactsDir, '01_hero_adventure_invitation.png') });
    await page.screenshot({ path: path.join(artifactsDir, '02_earth_start_scene.png') });
  });

  test('2. Real 3D Y-Axis Sphere Rotation verification on Earth and Saturn', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Scroll to planet experience section first
    const heroCta = page.locator('a:has-text("Serüvene Başla")').first();
    await heroCta.click();
    await page.waitForTimeout(600);

    const planetEl = page.locator('[data-testid="active-planet"]').first();
    await expect(planetEl).toBeVisible();

    await page.waitForTimeout(300);
    const angle1 = await planetEl.getAttribute('data-rotation-angle');
    await page.waitForTimeout(1400);
    const angle2 = await planetEl.getAttribute('data-rotation-angle');

    expect(angle1).not.toBeNull();
    expect(angle2).not.toBeNull();
    expect(angle1).not.toEqual(angle2);

    // Click Saturn button and verify Saturn rotation & screenshot
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="planet-nav-saturn"]') as HTMLButtonElement;
      btn?.click();
    });
    await page.waitForTimeout(600);

    const exp = page.locator('[data-testid="planet-experience"]');
    await expect(exp).toHaveAttribute('data-planet-id', 'saturn');

    await page.waitForTimeout(300);
    const saturnAngle1 = await planetEl.getAttribute('data-rotation-angle');
    await page.waitForTimeout(1400);
    const saturnAngle2 = await planetEl.getAttribute('data-rotation-angle');

    expect(saturnAngle1).not.toBeNull();
    expect(saturnAngle2).not.toBeNull();
    expect(saturnAngle1).not.toEqual(saturnAngle2);

    await page.screenshot({ path: path.join(artifactsDir, '07_saturn_scene.png') });
  });

  test('3. Planet Navigation Buttons navigate to all 8 stages accurately', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const heroCta = page.locator('a:has-text("Serüvene Başla")').first();
    await heroCta.click();
    await page.waitForTimeout(600);

    const stages = [
      { id: 'earth', name: 'Dünya', title: 'Web Tasarım ve Kurumsal Web Sitesi', index: '0', file: '02_earth_start_scene.png' },
      { id: 'mercury', name: 'Merkür', title: 'Landing Page Tasarımı', index: '1', file: '03_mercury_scene.png' },
      { id: 'venus', name: 'Venüs', title: 'Web Sitesi Yenileme', index: '2', file: '04_venus_scene.png' },
      { id: 'mars', name: 'Mars', title: 'Google SEO ve Arama Görünürlüğü', index: '3', file: '05_mars_scene.png' },
      { id: 'jupiter', name: 'Jüpiter', title: 'Mobil Uygulama ve İşletme Yazılımı', index: '4', file: '06_jupiter_scene.png' },
      { id: 'saturn', name: 'Satürn', title: 'Google Maps ve Yerel SEO', index: '5', file: '07_saturn_scene.png' },
      { id: 'uranus', name: 'Uranüs', title: 'Yemeksepeti ve Trendyol Yemek Kurulumu', index: '6', file: '08_uranus_scene.png' },
      { id: 'neptune', name: 'Neptün', title: 'Instagram ve Meta Reklam Yönetimi', index: '7', file: '09_neptune_scene.png' },
    ];

    const exp = page.locator('[data-testid="planet-experience"]');

    for (const stage of stages) {
      await page.evaluate((targetId) => {
        const b = document.querySelector(`[data-testid="planet-nav-${targetId}"]`) as HTMLButtonElement;
        b?.click();
      }, stage.id);
      await page.waitForTimeout(300);

      await expect(exp).toHaveAttribute('data-active-index', stage.index);
      await expect(exp).toHaveAttribute('data-planet-id', stage.id);

      const btn = page.locator(`[data-testid="planet-nav-${stage.id}"]`);
      await expect(btn).toHaveAttribute('aria-current', 'step');

      const card = page.locator('[data-testid="active-service-card"]');
      await expect(card.locator('h2')).toContainText(stage.title);

      await page.screenshot({ path: path.join(artifactsDir, stage.file) });
    }
  });

  test('4. Downward and Upward Scroll Trajectory verification', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const scrollToProgress = async (ratio: number) => {
      await page.evaluate((r) => {
        const section = document.getElementById('gezegen-seruveni');
        if (section) {
          const rect = section.getBoundingClientRect();
          const totalDistance = section.offsetHeight - window.innerHeight;
          const targetY = window.scrollY + rect.top + r * totalDistance;
          window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
        }
      }, ratio);
      await page.waitForTimeout(250);
    };

    const exp = page.locator('[data-testid="planet-experience"]');
    const stickyViewport = page.locator('[data-testid="planet-sticky-viewport"]');

    // Downward scroll steps (0 to 7)
    const downSteps = [
      { ratio: 0.06, id: 'earth' },
      { ratio: 0.18, id: 'mercury' },
      { ratio: 0.31, id: 'venus' },
      { ratio: 0.43, id: 'mars' },
      { ratio: 0.56, id: 'jupiter' },
      { ratio: 0.68, id: 'saturn' },
      { ratio: 0.81, id: 'uranus' },
      { ratio: 0.94, id: 'neptune' },
    ];

    for (const step of downSteps) {
      await scrollToProgress(step.ratio);
      await expect(stickyViewport).toBeVisible();
      await expect(exp).toHaveAttribute('data-planet-id', step.id);
    }

    // Upward scroll back to Earth
    await scrollToProgress(0.02);
    await expect(exp).toHaveAttribute('data-planet-id', 'earth');
    await page.screenshot({ path: path.join(artifactsDir, '10_scroll_back_to_earth.png') });
  });

  test('5. Multi-Device Responsive & Mobile Rendering', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/');

      const section = page.locator('#gezegen-seruveni');
      await expect(section).toBeAttached();

      // Check no horizontal scrollbar on body
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 1);

      // Verify Earth on mobile
      if (vp.width === 390) {
        await page.screenshot({ path: path.join(artifactsDir, '11_mobile_earth.png') });

        // Click Neptune on mobile
        await page.evaluate(() => {
          const btn = document.querySelector('[data-testid="planet-nav-neptune"]') as HTMLButtonElement;
          btn?.click();
        });
        await page.waitForTimeout(400);

        const exp = page.locator('[data-testid="planet-experience"]');
        await expect(exp).toHaveAttribute('data-planet-id', 'neptune');
        await page.screenshot({ path: path.join(artifactsDir, '12_mobile_neptune.png') });
      }
    }
  });

});
