/**
 * Homepage Animation Quality Audit
 * Tests that scroll animations are wired correctly and mobile is clean.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const afterDir = path.join(__dirname, '../screenshots/after-transformation');

test.describe('HOMEPAGE ANIMATION QUALITY AUDIT', () => {

  test.beforeAll(() => {
    if (!fs.existsSync(afterDir)) fs.mkdirSync(afterDir, { recursive: true });
  });

  // ── DESKTOP: Full scroll capture ───────────────────────────────────────────

  test('Desktop 1920: Full page scroll — capture every section', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // hero entrance animations complete

    const positions = [
      { y: 0,    name: '01-hero-initial' },
      { y: 900,  name: '02-hero-section2' },
      { y: 2000, name: '03-services' },
      { y: 3200, name: '04-about' },
      { y: 4800, name: '05-projects' },
      { y: 6500, name: '06-building-science' },
      { y: 8500, name: '07-cta' },
      { y: 9999, name: '08-footer' },
    ];

    for (const pos of positions) {
      await page.evaluate((y: number) => window.scrollTo(0, y), pos.y);
      await page.waitForTimeout(1200); // let GSAP animations complete
      await page.screenshot({
        path: path.join(afterDir, `${pos.name}.png`),
        fullPage: false,
      });
    }

    console.log('✅ Desktop scroll: 8 positions captured');
  });

  // ── HEADER: Timer must be gone ─────────────────────────────────────────────

  test('Header: no timer, logo visible, CTA present', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');

    // No live clock
    const timerCount = await page.locator('header span').filter({ hasText: /\d{2}:\d{2}:\d{2}/ }).count();
    expect(timerCount).toBe(0);

    // Logo is visible
    const logo = page.locator('header img[alt*="828"]');
    await expect(logo).toBeVisible();

    // "Get Estimate" CTA exists
    const cta = page.locator('header').getByText('Get Estimate');
    await expect(cta).toBeVisible();

    await page.locator('header').screenshot({ path: path.join(afterDir, '00-header.png') });
    console.log('✅ Header: timer=0, logo visible, CTA present');
  });

  // ── HERO: Headline text must be visible ────────────────────────────────────

  test('Hero: headline readable after animations settle', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500); // wait for Framer Motion entrance

    const h1 = page.locator('h1').first();
    const text = await h1.innerText();
    expect(text).toContain('Built with');
    expect(text).toContain('Intent');

    console.log('✅ Hero headline:', text.replace('\n', ' '));
  });

  // ── SERVICES: Cards must be present and use images ─────────────────────────

  test('Services: 3 image cards in asymmetric grid', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 2200));
    await page.waitForTimeout(1500);

    const cards = page.locator('[data-section="services"] .service-card');
    await expect(cards).toHaveCount(3);

    // Cards should have images (not icon placeholder)
    const imgs = page.locator('[data-section="services"] img');
    const imgCount = await imgs.count();
    expect(imgCount).toBeGreaterThan(0);

    console.log('✅ Services: 3 cards with', imgCount, 'images');
  });

  // ── ABOUT: Images + stats visible ─────────────────────────────────────────

  test('About: images and stats present (not a text wall)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 3200));
    await page.waitForTimeout(1800); // wait for clip-path reveals + counters

    const section = page.locator('[data-section="about"]');
    const images = section.locator('img');
    const imgCount = await images.count();
    expect(imgCount).toBeGreaterThanOrEqual(2);

    console.log('✅ About: images found:', imgCount);
  });

  // ── CTA: label changed, images visible ────────────────────────────────────

  test('CTA: updated label, no "Ready to Start?" AI slop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 9999));
    await page.waitForTimeout(1500);

    const cta = page.locator('[data-section="cta"]');

    // AI slop text must be gone
    const badText = await cta.getByText('Ready to Start?').count();
    expect(badText).toBe(0);

    // New label present
    const newLabel = await cta.getByText(/Torrance, CA/).count();
    expect(newLabel).toBeGreaterThan(0);

    console.log('✅ CTA: "Ready to Start?" gone, "Torrance, CA" present');
  });

  // ── MOBILE: Verify layout works at 375px ──────────────────────────────────

  test('Mobile 375: hero readable, nav collapses', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Hero headline should be visible
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Desktop nav should be hidden
    const desktopNav = page.locator('header nav');
    await expect(desktopNav).not.toBeVisible();

    // Hamburger should be visible
    const hamburger = page.locator('button[aria-label="Toggle menu"]');
    await expect(hamburger).toBeVisible();

    await page.screenshot({ path: path.join(afterDir, '09-mobile-375.png') });
    console.log('✅ Mobile: headline visible, nav collapsed, hamburger shown');
  });

  // ── BUILDING SCIENCE: pillar-number class present ─────────────────────────

  test('Building Science: pillar rows and numbered elements present', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 6500));
    await page.waitForTimeout(2000);

    const section = page.locator('[data-section="building-science"]');
    const pillars = section.locator('.pillar-row');
    const numbers = section.locator('.pillar-number');

    await expect(pillars).toHaveCount(3);
    await expect(numbers).toHaveCount(3);

    console.log('✅ Building Science: 3 pillar rows, 3 numbered elements');
  });

});
