import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const screenshotsDir = path.join(__dirname, "../screenshots");

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test("capture full homepage after all fixes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3011");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Full page
  await page.screenshot({
    path: path.join(screenshotsDir, "after-full-page.png"),
    fullPage: true,
    animations: "disabled",
  });

  // Header
  const header = page.locator("header");
  await header.screenshot({ path: path.join(screenshotsDir, "after-header.png"), animations: "disabled" });

  // Hero (viewport)
  await page.screenshot({ path: path.join(screenshotsDir, "after-hero.png"), animations: "disabled" });

  // Scroll to services
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "after-services.png"), animations: "disabled" });

  // Scroll to about
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 3.2));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "after-about.png"), animations: "disabled" });

  // Scroll to projects
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4.5));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "after-projects.png"), animations: "disabled" });

  // Scroll to building science
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 6));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "after-building-science.png"), animations: "disabled" });

  // Scroll to CTA
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 7.5));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(screenshotsDir, "after-cta.png"), animations: "disabled" });

  // Footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, "after-footer.png"), animations: "disabled" });

  console.log("✅ All after screenshots captured.");
});
