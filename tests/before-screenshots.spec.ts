import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const screenshotsDir = path.join(__dirname, "../screenshots");

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test("capture full homepage before", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3011");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  // Full page
  await page.screenshot({
    path: path.join(screenshotsDir, "before-full-page.png"),
    fullPage: true,
    animations: "disabled",
  });

  // Header
  const header = page.locator("header");
  await header.screenshot({ path: path.join(screenshotsDir, "before-header.png"), animations: "disabled" });

  // Hero (viewport)
  await page.screenshot({ path: path.join(screenshotsDir, "before-hero.png"), animations: "disabled" });

  // Scroll to services
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "before-services.png"), animations: "disabled" });

  // Scroll to about
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3.2));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "before-about.png"), animations: "disabled" });

  // Scroll to projects
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4.5));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "before-projects.png"), animations: "disabled" });

  // Scroll to building science
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 6));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "before-building-science.png"), animations: "disabled" });

  // Scroll to CTA
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 7.5));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "before-cta.png"), animations: "disabled" });

  // Footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "before-footer.png"), animations: "disabled" });

  console.log("✅ All before screenshots captured.");
});
