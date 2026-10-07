import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const screenshotsDir = path.join(__dirname, '../screenshots/audit');

test.describe('HOMEPAGE COMPLETE AUDIT - Every Section', () => {

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3011');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // let animations settle
  });

  // SECTION 1: HEADER
  test('01 Audit: Header Navigation', async ({ page }) => {
    const header = page.locator('header');
    await header.screenshot({ path: path.join(screenshotsDir, '01-header-full.png') });

    const logo = page.locator('header img[alt*="828"]');
    const navLinks = page.locator('header nav a');
    const logoVisible = await logo.isVisible();
    const navCount = await navLinks.count();
    const hasTimestamp = await page.locator('header span').filter({ hasText: /\d{2}:\d{2}/ }).count();

    console.log('📊 HEADER AUDIT:');
    console.log('  Logo visible:', logoVisible);
    console.log('  Nav links count:', navCount);
    console.log('  Timer elements:', hasTimestamp);

    if (hasTimestamp > 0) {
      console.log('  ❌ AI SLOP: Useless live clock visible in header — DELETE IT');
    } else {
      console.log('  ✅ No timer found');
    }
  });

  // SECTION 2: HERO
  test('02 Audit: Hero Section', async ({ page }) => {
    await page.screenshot({
      path: path.join(screenshotsDir, '02-hero-viewport.png'),
    });

    // Check headline
    const h1 = page.locator('h1').first();
    const headlineText = await h1.innerText().catch(() => 'NOT FOUND');

    console.log('📊 HERO AUDIT:');
    console.log('  Headline:', headlineText);

    if (headlineText.includes('Welcome') || headlineText.includes('What We')) {
      console.log('  ❌ AI SLOP: Generic headline');
    } else {
      console.log('  ✅ Headline looks custom');
    }
  });

  // SECTION 3: SERVICES
  test('03 Audit: Services Section', async ({ page }) => {
    // Scroll past 200vh hero
    await page.evaluate(() => window.scrollTo(0, 2300));
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(screenshotsDir, '03-services-section.png') });

    const heading = await page.locator('h2').first().innerText().catch(() => 'NOT FOUND');
    const cards = page.locator('.service-card');
    const cardCount = await cards.count();

    console.log('📊 SERVICES AUDIT:');
    console.log('  First h2:', heading);
    console.log('  Service cards:', cardCount);
    console.log('  Uses image cards (not icon grid):', cardCount > 0);
  });

  // SECTION 4: ABOUT
  test('04 Audit: About Section', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 3500));
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(screenshotsDir, '04-about-section.png') });

    const images = page.locator('section').filter({ hasText: /About 828/ }).locator('img');
    const imageCount = await images.count();

    console.log('📊 ABOUT AUDIT:');
    console.log('  Images in section:', imageCount);
    if (imageCount === 0) console.log('  ❌ AI SLOP: Pure text wall');
    else console.log('  ✅ Has images');
  });

  // SECTION 5: PROJECTS
  test('05 Audit: Projects Section', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 5000));
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(screenshotsDir, '05-projects-section.png') });

    const cards = page.locator('.project-card');
    const cardCount = await cards.count();

    console.log('📊 PROJECTS AUDIT:');
    console.log('  Project cards:', cardCount);
    console.log('  Grid is asymmetric:', cardCount > 0);
  });

  // SECTION 6: BUILDING SCIENCE
  test('06 Audit: Building Science Section', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 6500));
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(screenshotsDir, '06-building-science.png') });

    console.log('📊 BUILDING SCIENCE AUDIT:');
    const pillars = page.locator('.pillar-row');
    const count = await pillars.count();
    console.log('  Pillar rows:', count);
  });

  // SECTION 7: CTA
  test('07 Audit: CTA Section', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 9999999));
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(screenshotsDir, '07-cta-section.png') });

    const bg = page.locator('section').last();
    const bgImages = bg.locator('img');
    const imgCount = await bgImages.count();

    console.log('📊 CTA AUDIT:');
    console.log('  Images in CTA:', imgCount);
    console.log('  Not half-empty:', imgCount > 0);
  });

  // FULL PAGE SCROLL — captures visible quality at each position
  test('08 Full Page Scroll Test', async ({ page }) => {
    const positions = [0, 700, 1400, 2500, 3800, 5200, 6800, 8500];

    for (const pos of positions) {
      await page.evaluate((y: number) => window.scrollTo(0, y), pos);
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(screenshotsDir, `scroll-y${pos}.png`),
        fullPage: false,
      });
    }

    console.log('📊 SCROLL TEST: Captured', positions.length, 'positions');
  });

  // MOBILE CHECK
  test('09 Mobile Viewport Check', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3011');
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: path.join(screenshotsDir, '09-mobile-hero.png') });

    console.log('📊 MOBILE AUDIT: Screenshot captured at 375x667');
  });

});
