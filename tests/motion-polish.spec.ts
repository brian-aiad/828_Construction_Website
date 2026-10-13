import { expect, test } from "@playwright/test";

test("phone entrances animate, settle, and respect a live reduced-motion change", async ({ browser, browserName }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    // Firefox supports touch + narrow viewports, but not mobile emulation.
    isMobile: browserName !== "firefox",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  try {
    await page.goto(`${process.env.TEST_BASE_URL || "http://localhost:3011"}/about`);
    await page.waitForTimeout(700);
    const index = await page.locator("[data-motion-reveal]").evaluateAll((elements) =>
      elements.findIndex((el) => el.getBoundingClientRect().top > innerHeight)
    );
    expect(index).toBeGreaterThanOrEqual(0);
    const entrance = page.locator("[data-motion-reveal]").nth(index);
    await entrance.evaluate((el) => window.scrollTo({
      top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.97,
      behavior: "instant",
    }));
    await page.waitForTimeout(500);
    await expect(entrance).not.toHaveAttribute("data-motion-revealed", "true");
    await expect(entrance).toHaveCSS("opacity", "0");
    const samples = await entrance.evaluate(async (el) => {
      window.scrollBy({ top: 120, behavior: "instant" });
      const values: number[] = [];
      const started = performance.now();
      while (performance.now() - started < 750) {
        await new Promise(requestAnimationFrame);
        values.push(Number(getComputedStyle(el).opacity));
      }
      return values;
    });
    // A busy browser may skip intermediate paint frames. Assert the complete
    // hidden-to-visible lifecycle, rather than requiring a particular FPS.
    expect(samples.at(-1)).toBe(1);
    await expect(entrance).toHaveCSS("opacity", "1");
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const target of await page.locator("[data-motion-reveal]").all()) {
      await expect(target).toHaveCSS("opacity", "1");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  } finally {
    await context.close();
  }
});

test("cursor returns to the native pointer on live motion and viewport changes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/about");
  // Hover waits for the header entrance to settle before reading coordinates.
  // Fixed delays could move the mouse above the viewport on a slower browser.
  const link = page.locator("header a[href='/contact']").first();
  await link.hover();
  const supportsCursor = await page.evaluate(() => matchMedia("(pointer: fine)").matches);
  if (!supportsCursor) {
    await page.mouse.move(700, 300);
    await expect(page.locator("body")).not.toHaveClass(/has-custom-cursor/);
    await expect(page.locator("[data-custom-cursor=ring]")).toBeHidden();
    await expect(link).not.toHaveCSS("cursor", "none");
    return;
  }
  await page.mouse.move(700, 300);
  await expect(page.locator("body")).toHaveClass(/has-custom-cursor/);
  // Hover growth must not scale the ring's screen translation away from the dot.
  const box = await link.boundingBox();
  expect(box).not.toBeNull();
  const position = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
  await page.mouse.move(position.x, position.y);
  await page.waitForTimeout(250);
  const cursorBounds = await page.evaluate(() => {
    const ring = document.querySelector("[data-custom-cursor=ring]")!;
    return [document.querySelector("[data-custom-cursor=dot]")!, ring.firstElementChild!]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: rect.width };
      });
  });
  for (const bounds of cursorBounds) {
    expect(Math.abs(bounds.x - position.x)).toBeLessThan(1);
    expect(Math.abs(bounds.y - position.y)).toBeLessThan(1);
  }
  expect(cursorBounds[1].width).toBeGreaterThan(50);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("body")).not.toHaveClass(/has-custom-cursor/);
  await expect(page.locator("[data-custom-cursor=ring]")).toBeHidden();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(150);
  await page.mouse.move(710, 310);
  await expect(page.locator("body")).toHaveClass(/has-custom-cursor/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("body")).not.toHaveClass(/has-custom-cursor/);
  await expect(page.locator("[data-custom-cursor=ring]")).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(150);
  await page.mouse.move(720, 320);
  await expect(page.locator("body")).toHaveClass(/has-custom-cursor/);
});
