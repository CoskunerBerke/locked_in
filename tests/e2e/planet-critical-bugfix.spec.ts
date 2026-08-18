import { test, expect } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:\\Users\\berke\\.gemini\\antigravity\\brain\\ee6e6f74-bae3-43fc-a1c4-dc4b91e1aa18';

test.describe('Arrow-Controlled Planet Services Experience Suite', () => {
  test.setTimeout(120000);

  test('Test 1: Forward Transition via Down Arrow (Earth to Neptune)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const heroCta = page.locator('a:has-text("Serüvene Başla")').first();
    await heroCta.click();
    await page.waitForTimeout(600);

    const exp = page.locator('[data-testid="planet-experience"]');
    await expect(exp).toHaveAttribute('data-active-index', '0');
    await expect(exp).toHaveAttribute('data-planet-id', 'earth');

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

    const nextBtn = page.locator('[data-testid="planet-next"]');

    for (let i = 1; i < stages.length; i++) {
      const targetStage = stages[i];
      await page.waitForTimeout(300);
      await nextBtn.click();

      // Wait for target planet to become active
      await expect(exp).toHaveAttribute('data-planet-id', targetStage.id, { timeout: 6000 });
      await expect(exp).toHaveAttribute('data-active-index', targetStage.index);
      await expect(exp).toHaveAttribute('data-transitioning', 'false');

      await expect(page.locator('[data-testid="active-service-card"] h2')).toContainText(targetStage.title);

      if (targetStage.id === 'mercury' && testInfo.project.name === 'chromium') {
        await page.screenshot({ path: path.join(artifactsDir, '03_mercury_scene.png') });
      }
      if (targetStage.id === 'neptune' && testInfo.project.name === 'chromium') {
        await page.screenshot({ path: path.join(artifactsDir, '09_neptune_scene.png') });
      }
    }
  });

  test('Test 2: Backward Transition via Up Arrow (Neptune back to Earth)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const heroCta = page.locator('a:has-text("Serüvene Başla")').first();
    await heroCta.click();
    await page.waitForTimeout(600);

    const exp = page.locator('[data-testid="planet-experience"]');

    // First jump to Neptune
    const neptunePill = page.locator('[data-testid="planet-nav-neptune"]');
    await neptunePill.click();
    await expect(exp).toHaveAttribute('data-planet-id', 'neptune', { timeout: 6000 });
    await expect(exp).toHaveAttribute('data-transitioning', 'false');

    const prevBtn = page.locator('[data-testid="planet-prev"]');

    const reverseStages = [
      { id: 'uranus', name: 'Uranüs', title: 'Yemeksepeti ve Trendyol Yemek Kurulumu', index: '6' },
      { id: 'saturn', name: 'Satürn', title: 'Google Maps ve Yerel SEO', index: '5' },
      { id: 'jupiter', name: 'Jüpiter', title: 'Mobil Uygulama ve İşletme Yazılımı', index: '4' },
      { id: 'mars', name: 'Mars', title: 'Google SEO ve Arama Görünürlüğü', index: '3' },
      { id: 'venus', name: 'Venüs', title: 'Web Sitesi Yenileme', index: '2' },
      { id: 'mercury', name: 'Merkür', title: 'Landing Page Tasarımı', index: '1' },
      { id: 'earth', name: 'Dünya', title: 'Web Tasarım ve Kurumsal Web Sitesi', index: '0' },
    ];

    for (const targetStage of reverseStages) {
      await page.waitForTimeout(300);
      await prevBtn.click();

      await expect(exp).toHaveAttribute('data-planet-id', targetStage.id, { timeout: 6000 });
      await expect(exp).toHaveAttribute('data-active-index', targetStage.index);
      await expect(exp).toHaveAttribute('data-transitioning', 'false');

      await expect(page.locator('[data-testid="active-service-card"] h2')).toContainText(targetStage.title);
    }

    // On Earth, prev button should be disabled
    await expect(prevBtn).toBeDisabled();

    if (testInfo.project.name === 'chromium') {
      await page.screenshot({ path: path.join(artifactsDir, '10_scroll_back_to_earth.png') });
    }
  });

  test('Test 3: Rapid Click Locking (prevents skipping or freezing)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const heroCta = page.locator('a:has-text("Serüvene Başla")').first();
    await heroCta.click();
    await page.waitForTimeout(600);

    const exp = page.locator('[data-testid="planet-experience"]');
    await expect(exp).toHaveAttribute('data-active-index', '0');

    const nextBtn = page.locator('[data-testid="planet-next"]');

    // First click initiates transition to Mercury
    await nextBtn.click();

    // Fire rapid burst clicks while transition is active
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="planet-next"]') as HTMLButtonElement;
      for (let i = 0; i < 6; i++) {
        btn?.click();
      }
    });

    // Wait for transition to complete
    await expect(exp).toHaveAttribute('data-planet-id', 'mercury', { timeout: 6000 });
    await expect(exp).toHaveAttribute('data-active-index', '1');
    await expect(exp).toHaveAttribute('data-transitioning', 'false');
  });

  test('Test 4: Planet Name Pills Direct Navigation (Earth to Saturn)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const heroCta = page.locator('a:has-text("Serüvene Başla")').first();
    await heroCta.click();
    await page.waitForTimeout(600);

    const exp = page.locator('[data-testid="planet-experience"]');
    await expect(exp).toHaveAttribute('data-active-index', '0');

    const saturnPill = page.locator('[data-testid="planet-nav-saturn"]');
    await saturnPill.click();

    await expect(exp).toHaveAttribute('data-planet-id', 'saturn', { timeout: 6000 });
    await expect(exp).toHaveAttribute('data-active-index', '5');
    await expect(exp).toHaveAttribute('data-transitioning', 'false');

    await expect(page.locator('[data-testid="active-service-card"] h2')).toContainText('Google Maps ve Yerel SEO');

    if (testInfo.project.name === 'chromium') {
      await page.screenshot({ path: path.join(artifactsDir, '07_saturn_scene.png') });
    }
  });

  test('Test 5: Neptune Final CTA Navigation to Projects', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const heroCta = page.locator('a:has-text("Serüvene Başla")').first();
    await heroCta.click();
    await page.waitForTimeout(600);

    const exp = page.locator('[data-testid="planet-experience"]');

    // Jump to Neptune
    const neptunePill = page.locator('[data-testid="planet-nav-neptune"]');
    await neptunePill.click();
    await expect(exp).toHaveAttribute('data-planet-id', 'neptune', { timeout: 6000 });
    await expect(exp).toHaveAttribute('data-transitioning', 'false');

    const exploreBtn = page.locator('[data-testid="planet-next"]:has-text("Projelerimizi Keşfet")');
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();

    await page.waitForTimeout(800);
    const portfolioSec = page.locator('#portfolyo-section');
    await expect(portfolioSec).toBeAttached();
  });

  test('Test 6: Strict Homepage Section Sequence & No Redundancy', async ({ page }) => {
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

    // Verify removed redundant sections
    const redundantCatalogue = page.locator('text=İşletmenizi büyütecek 6 ana uzmanlık alanımız');
    await expect(redundantCatalogue).toHaveCount(0);
  });

  test('Test 7: Preserved Sections (Projects, Reviews Marquee, FAQ, Form)', async ({ page }) => {
    await page.goto('/');

    // 1. Projects
    const projectCards = page.locator('#portfolyo-section .group');
    await expect(projectCards).toHaveCount(4);
    await expect(page.locator('#portfolyo-section').locator('text=RN Vize Danışmanlık')).toBeVisible();
    await expect(page.locator('#portfolyo-section').locator('text=Quattro Garaj Otomotiv')).toBeVisible();

    // 2. Reviews Marquee
    const reviewsSection = page.locator('#geri-donusler');
    await expect(reviewsSection).toBeVisible();
    await expect(reviewsSection.locator('h2')).toContainText('Instagram & WhatsApp');
    const marqueeTrack = reviewsSection.locator('.animate-marquee-ltr');
    await expect(marqueeTrack).toBeVisible();

    // 3. FAQ Accordion
    const faqDetails = page.locator('#faq details');
    await expect(faqDetails.first()).toBeVisible();
    await faqDetails.first().click();
    await expect(faqDetails.first()).toHaveAttribute('open', '');

    // 4. Contact / Preliminary Form
    const nameInput = page.locator('#teklif-formu input[name="name"], form input#name').first();
    await expect(nameInput).toBeAttached();
  });

  test('Test 8: Compact Section Height & No 800vh Dark Void', async ({ page }) => {
    await page.goto('/');

    const height = await page.evaluate(() => {
      const sec = document.getElementById('gezegen-seruveni');
      return sec ? sec.offsetHeight : 0;
    });

    // Height should be ~1000px (1 viewport), NOT 8000px (800vh)!
    expect(height).toBeLessThan(1400);
    expect(height).toBeGreaterThan(400);
  });

  test('Test 9: Multi-Device Responsive & Mobile Rendering', async ({ page }, testInfo) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1366, height: 768 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/');

      const section = page.locator('#gezegen-seruveni');
      await expect(section).toBeAttached();

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(vp.width + 1);

      if (vp.width === 390 && testInfo.project.name === 'chromium') {
        await page.screenshot({ path: path.join(artifactsDir, '11_mobile_earth.png') });
      }
    }
  });

});
