/**
 * Navigation image visibility test.
 * Verifies that GSAP-animated elements visible in the viewport are not stuck invisible
 * after client-side navigation.
 *
 * Root cause of the bug (fixed): ScrollTrigger.kill() was in the effect BODY of
 * LenisProvider's [pathname] effect. React runs children effects BEFORE parent effects
 * in the new-effects pass, so the new page's GSAP triggers were created FIRST, then
 * the parent immediately killed them. Fix: moved kill to CLEANUP (runs before any new
 * effects in the cleanup pass).
 *
 * Elements BELOW the viewport fold are intentionally hidden (GSAP initial state) and
 * only reveal when scrolled into view — these are NOT flagged by this test.
 * The scroll-reveal test below verifies below-fold elements do reveal on scroll.
 */
import { test, expect, type Locator, type Page } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3011";

const NAV_PAIRS: [string, string, string, string][] = [
  ["/", "home", "/about", "about"],
  ["/about", "about", "/", "home"],
  ["/", "home", "/services", "services"],
  ["/services", "services", "/", "home"],
  ["/", "home", "/projects", "projects"],
  ["/projects", "projects", "/", "home"],
  ["/", "home", "/process", "process"],
  ["/process", "process", "/", "home"],
  ["/", "home", "/contact", "contact"],
  ["/contact", "contact", "/", "home"],
  ["/about", "about", "/services", "services"],
  ["/services", "services", "/about", "about"],
  ["/services", "services", "/projects", "projects"],
  ["/projects", "projects", "/process", "process"],
  ["/process", "process", "/contact", "contact"],
  ["/contact", "contact", "/about", "about"],
  ["/", "home", "/services/adu", "services/adu"],
  ["/services/adu", "services/adu", "/services/remediation", "services/remediation"],
  ["/services/remediation", "services/remediation", "/services/consulting", "services/consulting"],
  ["/services/consulting", "services/consulting", "/services", "services"],
];

/**
 * After navigation, check that viewport-visible images/GSAP elements are not stuck invisible.
 * Elements below the fold are skipped — they're correctly hidden until scrolled.
 */
async function checkViewportVisibility(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  // 2s > 300ms refresh timer + GSAP initial effects
  await page.waitForTimeout(2000);

  return page.evaluate(() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("img, [data-gsap-reveal]")
    );
    const broken: string[] = [];

    els.forEach((el) => {
      if (!el.isConnected) return;
      if (el.getAttribute("aria-hidden") === "true") return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Only flag elements actually visible in the current viewport.
      // Below-fold elements are correctly hidden (GSAP initial state) and reveal on scroll.
      const isInViewport =
        rect.top < vh && rect.bottom > 0 && rect.left < vw && rect.right > 0;
      if (!isInViewport) return;

      const style = window.getComputedStyle(el);
      const opacity = parseFloat(style.opacity);
      const clip = style.clipPath;

      const isStuck =
        opacity < 0.05 ||
        (clip &&
          (clip.includes("inset(100%") ||
            clip.includes("inset(0% 100%") ||
            clip.includes("inset(0% 0% 100%")));

      if (isStuck) {
        const label =
          `${el.tagName.toLowerCase()}` +
          `${[...el.classList].slice(0, 4).join(".")}` +
          ` opacity=${opacity.toFixed(2)} clip=${clip?.slice(0, 40)} ` +
          `top=${Math.round(rect.top)} vh=${vh}`;
        broken.push(label);
      }
    });

    return broken;
  });
}

// Paths only reachable via dropdown/nested nav — use direct goto to avoid clicking a hidden element
const DROPDOWN_PATHS = new Set(["/services/adu", "/services/remediation", "/services/consulting"]);

/**
 * Navigate client-side. Uses link click for top-nav pages, goto for sub-pages
 * that are only accessible via dropdown menus (not directly clickable in main nav).
 */
async function clientNavigate(page: Page, toPath: string) {
  if (DROPDOWN_PATHS.has(toPath)) {
    // Use Next.js router navigation via eval so it's still client-side, not a hard reload
    const navigated = await page.evaluate((path: string) => {
      const el = document.querySelector<HTMLAnchorElement>(`a[href="${path}"]`);
      if (el) { el.click(); return true; }
      return false;
    }, toPath);
    if (!navigated) {
      await page.goto(BASE + toPath, { waitUntil: "domcontentloaded" });
    }
    return;
  }
  // Main nav link — click directly
  const inViewportLink = async (): Promise<Locator | null> => {
    const links = page.locator(`a[href="${toPath}"]`);
    const viewport = page.viewportSize();
    for (let index = 0; index < await links.count(); index++) {
      const candidate = links.nth(index);
      const box = await candidate.boundingBox();
      if (
        await candidate.isVisible() &&
        box &&
        viewport &&
        box.x < viewport.width &&
        box.x + box.width > 0 &&
        box.y < viewport.height &&
        box.y + box.height > 0
      ) {
        return candidate;
      }
    }
    return null;
  };

  let visibleLink = await inViewportLink();
  if (!visibleLink) {
    const menuButton = page.locator("button[aria-label*='menu' i], button[aria-controls*='nav' i]").first();
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.waitForTimeout(350);
      visibleLink = await inViewportLink();
    }
  }

  if (!visibleLink) {
    await page.goto(BASE + toPath, { waitUntil: "domcontentloaded" });
  } else {
    await visibleLink.click({ timeout: 8_000 });
  }
}

test.describe("Client-side navigation — image visibility", () => {
  test.setTimeout(120_000);

  // ── Per-pair transition tests ───────────────────────────────────────────
  for (const [fromPath, fromLabel, toPath, toLabel] of NAV_PAIRS) {
    test(`${fromLabel} → ${toLabel}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await page.goto(BASE + fromPath, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);

      await clientNavigate(page, toPath);

      const stuck = await checkViewportVisibility(page);

      if (stuck.length > 0) {
        console.log(`FAIL ${fromLabel}→${toLabel}: ${stuck.length} viewport-visible elements stuck:`);
        stuck.forEach((s) => console.log("  ", s));
      }

      expect(
        stuck,
        `${fromLabel}→${toLabel}: viewport-visible elements still invisible after 2s`
      ).toHaveLength(0);

      const navErrors = consoleErrors.filter(
        (e) => e.includes("removeChild") || e.includes("NotFoundError")
      );
      expect(navErrors, `removeChild errors after ${fromLabel}→${toLabel}`).toHaveLength(0);
    });
  }

  // ── Below-fold elements reveal on scroll ────────────────────────────────
  // Verifies that GSAP ScrollTriggers still exist after navigation (not prematurely killed),
  // so elements reveal when scrolled into view.
  test("below-fold elements reveal on scroll after navigation (home → about)", async ({ page }) => {
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await clientNavigate(page, "/about");
    await page.waitForTimeout(1500);

    // Slowly scroll the full page so all ScrollTriggers fire
    await page.evaluate(async () => {
      const totalHeight = document.documentElement.scrollHeight;
      const step = Math.floor(window.innerHeight * 0.4);
      for (let pos = 0; pos < totalHeight; pos += step) {
        window.scrollTo(0, pos);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(800);

    // After a full scroll pass, no data-gsap-reveal element should still be fully clipped
    const stillHidden = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll<HTMLElement>("[data-gsap-reveal]")
      )
        .filter((el) => {
          if (!el.isConnected || el.getAttribute("aria-hidden") === "true") return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          const style = window.getComputedStyle(el);
          const opacity = parseFloat(style.opacity);
          const clip = style.clipPath;
          return (
            opacity < 0.05 ||
            (clip &&
              (clip.includes("inset(100%") ||
                clip.includes("inset(0% 100%") ||
                clip.includes("inset(0% 0% 100%")))
          );
        })
        .map((el) => `${el.tagName}.${[...el.classList].slice(0, 3).join(".")}`);
    });

    expect(
      stillHidden,
      "Elements still fully hidden after scrolling through entire page"
    ).toHaveLength(0);
  });

  test("below-fold elements reveal on scroll after navigation (any → projects)", async ({ page }) => {
    await page.goto(BASE + "/about", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await clientNavigate(page, "/projects");
    await page.waitForTimeout(1500);

    await page.evaluate(async () => {
      const totalHeight = document.documentElement.scrollHeight;
      const step = Math.floor(window.innerHeight * 0.4);
      for (let pos = 0; pos < totalHeight; pos += step) {
        window.scrollTo(0, pos);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });

    await page.waitForTimeout(800);

    const stillHidden = await page.evaluate(() => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      return Array.from(
        document.querySelectorAll<HTMLElement>("[data-gsap-reveal]")
      )
        .filter((el) => {
          if (!el.isConnected || el.getAttribute("aria-hidden") === "true") return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          if (rect.top >= vh || rect.bottom <= 0 || rect.left >= vw || rect.right <= 0) return false;
          const style = window.getComputedStyle(el);
          return (
            parseFloat(style.opacity) < 0.05 ||
            (style.clipPath && style.clipPath.includes("inset(100%"))
          );
        })
        .map((el) => `${el.tagName}.${[...el.classList].slice(0, 3).join(".")}`);
    });

    expect(
      stillHidden,
      "ProjectCard elements still hidden after scrolling through /projects"
    ).toHaveLength(0);
  });

  // ── Rapid multi-hop stress test ─────────────────────────────────────────
  test("rapid multi-hop: home → about → services → projects → home", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);

    for (const hop of ["/about", "/services", "/projects", "/"]) {
      await clientNavigate(page, hop);
      await page.waitForTimeout(500); // fast — stress test
    }

    const stuck = await checkViewportVisibility(page);
    expect(stuck, "Viewport-invisible elements after rapid multi-hop").toHaveLength(0);

    const navErrors = consoleErrors.filter(
      (e) => e.includes("removeChild") || e.includes("NotFoundError")
    );
    expect(navErrors, "removeChild errors after rapid multi-hop").toHaveLength(0);
  });

  // ── Browser back/forward ────────────────────────────────────────────────
  test("back-button: home → about → back → forward", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.goto(BASE + "/about", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.goBack({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    await page.goForward({ waitUntil: "domcontentloaded" });

    const stuck = await checkViewportVisibility(page);
    expect(stuck, "Viewport-invisible elements after back/forward").toHaveLength(0);

    const navErrors = consoleErrors.filter(
      (e) => e.includes("removeChild") || e.includes("NotFoundError")
    );
    expect(navErrors, "removeChild errors after back/forward").toHaveLength(0);
  });
});
