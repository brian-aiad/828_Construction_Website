import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/services/adu",
  "/services/remediation",
  "/services/consulting",
  "/portfolio",
  "/contact",
];

test.describe("release hardening", () => {
  test("skip link moves focus to the main landmark", async ({ page, browserName }) => {
    await page.goto("/about");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    const main = page.locator("#main-content");

    // Playwright WebKit runs with Safari's Tab-to-links preference disabled,
    // so its synthetic Tab key cannot exercise a link skip path. Keep a
    // structural accessibility assertion there; Chromium covers the complete
    // keyboard interaction below.
    if (browserName === "webkit") {
      await expect(skipLink).toHaveAttribute("href", "#main-content");
      await expect(main).toHaveAttribute("tabindex", "-1");
      return;
    }

    // Exercise the real keyboard path so the test matches how keyboard users
    // move the off-canvas link into view and activate its target.
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(main).toBeFocused();
  });

  test("first-visit splash isolates the page and releases focus and scroll", async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: false,
      isMobile: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const splash = page.getByRole("dialog", { name: "828 Construction introduction" });
    await expect(splash).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip intro" })).toBeFocused();
    await expect(page.locator(".skip-link")).toHaveJSProperty("inert", true);
    await expect(page.locator("header")).toHaveJSProperty("inert", true);

    await page.keyboard.press("Escape");
    await expect(splash).toBeHidden();
    await expect(page.locator("header")).toHaveJSProperty("inert", false);
    await expect(page.locator("#main-content")).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
    await context.close();
  });

  test("active splash exits immediately when reduced motion is enabled", async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: false,
      isMobile: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const splash = page.getByRole("dialog", { name: "828 Construction introduction" });
    await expect(splash).toBeVisible();

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(splash).toBeHidden();
    await expect(page.locator("#main-content")).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
    await context.close();
  });

  test("pre-hydration splash cannot block a no-JavaScript visit", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto("/");

    const splash = page.locator(".splash-screen");
    await expect(splash).toHaveAttribute("aria-hidden", "true");
    await expect(splash).toHaveAttribute("inert", "");
    await expect(splash).toHaveCSS("pointer-events", "none");
    await expect(splash.getByRole("button", { includeHidden: true })).toHaveAttribute("tabindex", "-1");
    await expect(page.locator("main h1").first()).toBeVisible();
    await context.close();
  });

  test("mobile navigation is modal, keyboard-contained, and restores its trigger", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");

    const toggle = page.getByRole("button", { name: "Toggle menu" });
    await toggle.click();
    const menu = page.getByRole("dialog", { name: "Site navigation" });
    await expect(menu).toBeVisible();
    await expect(menu.locator('button[aria-label="Toggle menu"]')).toHaveCount(1);
    await expect(page.locator(".skip-link")).toHaveJSProperty("inert", true);
    await expect(page.locator("#main-content")).toHaveJSProperty("inert", true);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    const firstMenuLink = page.locator("#mobile-site-menu a[href]").first();
    await expect(firstMenuLink).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect
      .poll(() => page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))))
      .toBe(true);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(page.locator("#main-content")).toHaveJSProperty("inert", false);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");

    await toggle.click();
    await expect(menu).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(menu).toBeHidden();
    await expect(page.locator("#main-content")).toHaveJSProperty("inert", false);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  for (const route of ["/services/adu", "/services/remediation"]) {
    test(`${route} FAQ hides collapsed answers and exposes the expanded panel`, async ({ page }) => {
      await page.goto(route);
      const section = page.locator(
        route.endsWith("adu") ? '[data-section="adu-faq"]' : '[data-section="rem-faq"]'
      );
      const trigger = section.locator('button[aria-controls]').first();
      const panelId = await trigger.getAttribute("aria-controls");
      expect(panelId).toBeTruthy();
      const panel = page.locator(`[id="${panelId}"]`);

      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(panel).toHaveAttribute("aria-hidden", "true");
      await expect(panel).toHaveJSProperty("inert", true);
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(panel).toHaveAttribute("aria-hidden", "false");
      await expect(panel).toHaveJSProperty("inert", false);
    });
  }

  test("404 remains visible above the naturally flowing footer", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const response = await page.goto("/qa-release-not-found");
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const centerOwner = await heading.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return document
        .elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        ?.closest("footer")
        ? "footer"
        : "page";
    });
    expect(centerOwner).toBe("page");
  });

  test("portfolio viewer contains focus, navigates, and restores the opener", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/portfolio");
    const opener = page.getByRole("button", { name: /View photo \d+ of \d+/ }).first();
    const openerName = await opener.getAttribute("aria-label");
    const position = openerName?.match(/View photo (\d+) of (\d+)/);
    expect(position).toBeTruthy();
    const currentPosition = Number(position![1]);
    const photoCount = Number(position![2]);
    await opener.click({ timeout: 15_000 });

    const portal = page.locator(".yarl__portal");
    await expect(portal).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await expect(portal.locator('button[aria-current="true"]')).toHaveAccessibleName(
      new RegExp(`View photo ${currentPosition} of ${photoCount}`)
    );

    await page.keyboard.press("ArrowRight");
    const nextPosition = currentPosition === photoCount ? 1 : currentPosition + 1;
    await expect(portal.locator('button[aria-current="true"]')).toHaveAccessibleName(
      new RegExp(`View photo ${nextPosition} of ${photoCount}`)
    );
    await page.keyboard.press("Escape");
    await expect(portal).toBeHidden();
    await expect(opener).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");

    const logo = page.getByRole("link", { name: "828CONSTRUCTION", exact: true });
    await logo.focus();
    await page.waitForTimeout(180);
    await expect(logo).toBeFocused();
  });

  test("live viewport and motion changes tear down desktop hero transforms", async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: false,
      isMobile: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => sessionStorage.setItem("828:splash-seen", "1"));
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.7));
    await page.waitForTimeout(500);

    const heroImageLayer = page.locator(".hero-kenburns").locator("..");
    await expect.poll(() => heroImageLayer.evaluate((element) => element.style.transform)).not.toBe("");

    await page.setViewportSize({ width: 320, height: 568 });
    await expect.poll(() => heroImageLayer.evaluate((element) => element.style.transform)).toBe("");
    await expect(heroImageLayer).toHaveCSS("will-change", "auto");
    await expect
      .poll(() =>
        page.locator(".hero-line-inner").first().evaluate((element) => getComputedStyle(element).transform)
      )
      .toBe("none");
    await expect(page.locator("main h1").first()).toBeVisible();
    const compactHealth = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      bodyLocked: document.body.style.overflow === "hidden",
    }));
    expect(compactHealth).toEqual({ overflow: false, bodyLocked: false });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect.poll(() => heroImageLayer.evaluate((element) => element.style.transform)).toBe("");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect.poll(() => heroImageLayer.evaluate((element) => element.style.transform)).not.toBe("");
    await context.close();
  });

  test("reduced motion keeps every public route readable and overflow-free", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });

    for (const route of publicRoutes) {
      await page.goto(route);
      await expect(page.locator("main h1").first()).toBeVisible();
      const health = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        hiddenHeading: Array.from(document.querySelectorAll("main h1, main h2, main h3")).some(
          (heading) => Number.parseFloat(getComputedStyle(heading).opacity) < 0.05
        ),
      }));
      expect(health).toEqual({ overflow: false, hiddenHeading: false });
    }
  });

  test("legacy routes redirect directly and API responses are not indexable", async ({ page, request }) => {
    for (const legacyPath of ["/projects/legacy-project", "/process"]) {
      const redirect = await request.get(legacyPath, { maxRedirects: 0 });
      expect([301, 308]).toContain(redirect.status());
      expect(new URL(redirect.headers().location, "http://localhost").pathname).toBe("/portfolio");
    }

    await page.goto("/projects/legacy-project");
    await expect(page).toHaveURL(/\/portfolio$/);
    await page.goto("/process");
    await expect(page).toHaveURL(/\/portfolio$/);

    const challenge = await request.get("/api/contact/challenge");
    expect(challenge.headers()["x-robots-tag"]).toBe("noindex, nofollow, nosnippet");
    const contact = await request.get("/api/contact");
    expect(contact.status()).toBe(405);
    expect(contact.headers()["x-robots-tag"]).toBe("noindex, nofollow, nosnippet");
  });

  test("public metadata, JSON-LD, sitemap, robots, and internal links stay coherent", async ({ page, request }) => {
    const titles = new Set<string>();
    const internalPaths = new Set<string>();

    for (const route of publicRoutes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      const title = await page.title();
      expect(title, route).toBeTruthy();
      expect(titles.has(title), `duplicate title: ${title}`).toBe(false);
      titles.add(title);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical, `${route} canonical`).toBeTruthy();
      const canonicalUrl = new URL(canonical!);
      expect(canonicalUrl.origin, `${route} canonical origin`).toBe("https://828constructions.com");
      expect(canonicalUrl.pathname, `${route} canonical path`).toBe(route);
      const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(jsonLd.length, `${route} JSON-LD`).toBeGreaterThan(0);
      for (const source of jsonLd) expect(() => JSON.parse(source)).not.toThrow();

      const hrefs = await page.locator('a[href^="/"]').evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute("href") || "")
      );
      hrefs.forEach((href) => {
        if (href && !href.startsWith("/#") && !href.includes("#")) internalPaths.add(href);
      });
    }

    for (const path of internalPaths) {
      const response = await request.get(path);
      expect(response.status(), path).toBeLessThan(400);
    }

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Disallow: /api/");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const sitemapText = await sitemap.text();
    for (const route of publicRoutes) {
      expect(sitemapText).toContain(route === "/" ? "https://828constructions.com<" : `https://828constructions.com${route}<`);
    }
  });
});
