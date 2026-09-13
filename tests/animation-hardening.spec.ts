import { expect, Page, test } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
const ROUTES = [
  "/",
  "/about",
  "/services",
  "/services/adu",
  "/services/remediation",
  "/services/consulting",
  "/portfolio",
  "/projects",
  "/process",
  "/contact",
];

async function settle(page: Page, ms = 650) {
  await page.waitForTimeout(ms);
  await page.evaluate(() => {
    window.dispatchEvent(new Event("resize"));
  });
  await page.waitForTimeout(250);
}

async function skipSplash(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem("828:splash-seen", "1");
  });
}

async function collectAnimationFailures(page: Page) {
  return page.evaluate(() => {
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const failures: string[] = [];

    const isVisible = (el: Element, rect: DOMRect) => {
      const style = window.getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") return false;
      if (Number(style.opacity) < 0.08) return false;
      if (rect.width < 2 || rect.height < 2) return false;
      if (rect.bottom <= 0 || rect.top >= viewportH) return false;
      return true;
    };

    const isTopPainted = (el: Element, rect: DOMRect) => {
      const left = Math.max(1, rect.left + Math.min(8, rect.width / 2));
      const right = Math.min(viewportW - 1, rect.right - Math.min(8, rect.width / 2));
      const top = Math.max(1, rect.top + Math.min(8, rect.height / 2));
      const bottom = Math.min(viewportH - 1, rect.bottom - Math.min(8, rect.height / 2));
      const points = [
        [(left + right) / 2, (top + bottom) / 2],
        [left, top],
        [right, top],
        [left, bottom],
        [right, bottom],
      ] as const;

      return points.some(([x, y]) => {
        const stack = document.elementsFromPoint(x, y);
        return stack.some((candidate) => candidate === el || el.contains(candidate));
      });
    };

    const clipAncestors = (el: Element) => {
      const ancestors: Array<{
        tag: string;
        rect: DOMRect;
        clip: string;
        overflowX: string;
        overflowY: string;
      }> = [];
      let node = el.parentElement;
      while (node && node !== document.body && node !== document.documentElement) {
        const style = window.getComputedStyle(node);
        const clip = style.clipPath;
        const clipsX = style.overflowX === "hidden" || style.overflowX === "clip";
        const clipsY = style.overflowY === "hidden" || style.overflowY === "clip";
        if (
          clipsX ||
          clipsY ||
          (clip && clip !== "none")
        ) {
          ancestors.push({
            tag: node.tagName.toLowerCase(),
            rect: node.getBoundingClientRect(),
            clip,
            overflowX: style.overflowX,
            overflowY: style.overflowY,
          });
        }
        node = node.parentElement;
      }
      return ancestors;
    };

    const selectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      "p",
      "a",
      "button",
      "label",
      "legend",
      "[class*='headline']",
      "[class*='title']",
    ].join(",");
    const meaningfulInCore: string[] = [];

    document.querySelectorAll<HTMLElement>(selectors).forEach((el) => {
      const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      if (el.closest("[aria-hidden='true']")) return;
      if (el.closest("header")) return;
      if (el.hasAttribute("data-failsafe-exempt")) return;

      const rect = el.getBoundingClientRect();
      if (!isVisible(el, rect)) return;
      if (!isTopPainted(el, rect)) return;

      if (rect.bottom > viewportH * 0.22 && rect.top < viewportH * 0.88) {
        meaningfulInCore.push(text.slice(0, 48));
      }

      const fullyInsideViewportY = rect.top >= -2 && rect.bottom <= viewportH + 2;
      if (fullyInsideViewportY && (rect.left < -2 || rect.right > viewportW + 2)) {
        failures.push(`viewport overflow: "${text.slice(0, 48)}" rect=${JSON.stringify(rect.toJSON())}`);
      }

      for (const ancestor of clipAncestors(el)) {
        const ar = ancestor.rect;
        const verticalOverlap = rect.bottom > ar.top + 2 && rect.top < ar.bottom - 2;
        const horizontalOverlap = rect.right > ar.left + 2 && rect.left < ar.right - 2;
        if (!verticalOverlap || !horizontalOverlap) continue;
        const clipsByPath = ancestor.clip && ancestor.clip !== "none";
        const clippedX =
          (ancestor.overflowX === "hidden" || ancestor.overflowX === "clip" || clipsByPath) &&
          (rect.left < ar.left - 2 || rect.right > ar.right + 2);
        // Vertical masks and viewport-height sticky surfaces intentionally clip
        // incoming/outgoing content as part of the section choreography. Text
        // fit is still guarded here horizontally and by the dedicated text-fit
        // audit, while document overflow is checked below.
        if (clippedX && fullyInsideViewportY) {
          failures.push(
            `clipped by ${ancestor.tag}: "${text.slice(0, 48)}" rect=${JSON.stringify(rect.toJSON())} ancestor=${JSON.stringify(ar.toJSON())} clip=${ancestor.clip} overflowX=${ancestor.overflowX} overflowY=${ancestor.overflowY}`
          );
          break;
        }
      }
    });

    document.querySelectorAll<HTMLElement>("img, picture, video, canvas").forEach((el) => {
      if (el.closest("header") || el.closest("[aria-hidden='true']")) return;
      const rect = el.getBoundingClientRect();
      if (!isVisible(el, rect)) return;
      if (!isTopPainted(el, rect)) return;
      if (rect.bottom > viewportH * 0.22 && rect.top < viewportH * 0.88) {
        meaningfulInCore.push(el.tagName.toLowerCase());
      }
    });

    if (meaningfulInCore.length === 0) {
      failures.push("blank viewport core: no visible text or media in the central reading area");
    }

    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth + 1) {
      failures.push(`document horizontal overflow: ${doc.scrollWidth} > ${doc.clientWidth}`);
    }

    return failures;
  });
}

async function sampleRoute(page: Page, route: string) {
  await skipSplash(page);
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  await settle(page, 650);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportH = await page.evaluate(() => window.innerHeight);
  const maxY = Math.max(0, scrollHeight - viewportH);
  const positions = Array.from(
    new Set([
      0,
      Math.round(maxY * 0.18),
      Math.round(maxY * 0.36),
      Math.round(maxY * 0.54),
      Math.round(maxY * 0.72),
      maxY,
    ])
  );

  const failures: string[] = [];
  for (const y of positions) {
    await page.evaluate((target) => window.scrollTo({ top: target, behavior: "instant" }), y);
    await settle(page, 900);
    const current = await collectAnimationFailures(page);
    failures.push(...current.map((failure) => `${route} @${y}: ${failure}`));
  }

  return failures;
}

async function collectSmallScreenContainerFailures(page: Page) {
  return page.evaluate(() => {
    const failures: string[] = [];
    const doc = document.documentElement;

    if (doc.scrollWidth > doc.clientWidth + 1) {
      failures.push(`document horizontal overflow: ${doc.scrollWidth} > ${doc.clientWidth}`);
    }

    // Legacy motion runways must not remain pinned on narrow screens. The
    // separate coarse-pointer audit below verifies stack surfaces themselves.
    document.querySelectorAll<HTMLElement>(".motion-runway, .process-travel").forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.position === "sticky" || style.position === "fixed") {
        const label = (el.getAttribute("data-section") || el.textContent || el.className || el.tagName)
          .toString()
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 56);
        failures.push(`small-screen pinned container: ${label} position=${style.position}`);
      }
    });

    document.querySelectorAll<HTMLElement>("[data-gsap-reveal]").forEach((el) => {
      if (!el.isConnected || el.closest("[aria-hidden='true']")) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      if (rect.bottom <= window.innerHeight * 0.2 || rect.top >= window.innerHeight * 0.8) return;
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      if (visibleHeight < Math.min(80, rect.height * 0.35)) return;
      const style = window.getComputedStyle(el);
      const opacity = Number.parseFloat(style.opacity || "1");
      const clip = style.clipPath || "";
      if (
        opacity < 0.08 ||
        clip.includes("inset(100%") ||
        clip.includes("inset(0% 100%") ||
        clip.includes("inset(0% 0% 100%")
      ) {
        const label = (el.textContent || el.tagName).replace(/\s+/g, " ").trim().slice(0, 56);
        failures.push(`visible reveal stuck: "${label}" opacity=${opacity.toFixed(2)} clip=${clip.slice(0, 44)}`);
      }
    });

    return failures;
  });
}

async function sectionScrollTargets(page: Page) {
  return page.evaluate(() => {
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const sectionTops = Array.from(document.querySelectorAll<HTMLElement>("[data-section], footer"))
      .map((el) => Math.round(window.scrollY + el.getBoundingClientRect().top - 72))
      .filter((y) => Number.isFinite(y));

    return Array.from(
      new Set([
        0,
        ...sectionTops,
        Math.round(maxY * 0.18),
        Math.round(maxY * 0.36),
        Math.round(maxY * 0.54),
        Math.round(maxY * 0.72),
        Math.round(maxY * 0.9),
        maxY,
      ])
    )
      .map((y) => Math.max(0, Math.min(maxY, y)))
      .sort((a, b) => a - b);
  });
}

test.describe("animation hardening", () => {
  for (const viewport of [
    { name: "mobile-320", width: 320, height: 568 },
    { name: "mobile-360", width: 360, height: 800 },
    { name: "iphone-375", width: 375, height: 812 },
    { name: "iphone-390", width: 390, height: 844 },
    { name: "mobile-414", width: 414, height: 896 },
    { name: "mobile-430", width: 430, height: 932 },
    { name: "intermediate-600", width: 600, height: 960 },
    { name: "ipad-portrait", width: 768, height: 1024 },
    { name: "ipad-air-portrait", width: 820, height: 1180 },
    { name: "ipad-landscape", width: 1024, height: 768 },
    { name: "laptop-1280", width: 1280, height: 800 },
    { name: "desktop-1440", width: 1440, height: 900 },
    { name: "desktop-1728", width: 1728, height: 1117 },
    { name: "large-desktop", width: 2048, height: 1113 },
  ]) {
    for (const route of ROUTES) {
      const sizeTag = viewport.width >= 1280 ? "@desktop" : "@small-screen";
      test(`${sizeTag} ${route} avoids clipped text and overflow at ${viewport.name}`, async ({ page }) => {
        test.setTimeout(60_000);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        const failures = await sampleRoute(page, route);

        expect(failures, failures.join("\n")).toHaveLength(0);
      });
    }
  }

  test("about hero keeps its static title, readable content, and responsive bounds", async ({ page }) => {
    test.setTimeout(60_000);
    await skipSplash(page);

    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 844, height: 390 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
      { width: 2048, height: 900 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE}/about`, { waitUntil: "domcontentloaded" });
      await settle(page, 650);

      const initial = await page.evaluate(() => {
        const title = document.querySelector<HTMLElement>("[data-about-static-title]");
        const dossier = document.querySelector<HTMLElement>("[data-about-dossier]");
        if (!title || !dossier) return null;
        const titleStyle = getComputedStyle(title);
        const titleRect = title.getBoundingClientRect();
        const dossierRect = dossier.getBoundingClientRect();
        return {
          text: title.textContent?.trim(),
          titleLeft: titleRect.left,
          titleBottom: titleRect.bottom,
          titleRight: titleRect.right,
          dossierTop: dossierRect.top,
          animationName: titleStyle.animationName,
          transform: titleStyle.transform,
          dossierWidth: dossierRect.width,
          dossierHeight: dossierRect.height,
          dossierLeft: dossierRect.left,
          dossierRight: dossierRect.right,
          overflow: document.documentElement.scrollWidth - innerWidth,
        };
      });

      expect(initial, `${viewport.width}px: expected About hero elements`).not.toBeNull();
      expect(initial?.text).toBe("828 Construction");
      expect(initial?.animationName).toBe("none");
      expect(initial?.transform).toBe("none");
      expect(initial?.overflow).toBeLessThanOrEqual(1);
      expect(initial?.titleLeft).toBeGreaterThanOrEqual(0);
      expect(initial?.titleRight).toBeLessThanOrEqual(viewport.width);
      expect(initial?.dossierLeft).toBeGreaterThanOrEqual(0);
      expect(initial?.dossierRight).toBeLessThanOrEqual(viewport.width);
      expect(initial?.dossierTop).toBeGreaterThan(initial?.titleBottom ?? 0);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("[data-about-dossier]")).toContainText("#1141119");

      await page.evaluate(() => window.scrollTo({ top: 160, behavior: "instant" }));
      await settle(page, 250);
      const afterScroll = await page.evaluate(() => {
        const title = document.querySelector<HTMLElement>("[data-about-static-title]");
        if (!title) return null;
        const style = getComputedStyle(title);
        return {
          left: title.getBoundingClientRect().left,
          animationName: style.animationName,
          transform: style.transform,
        };
      });
      expect(afterScroll?.left).toBe(initial?.titleLeft);
      expect(afterScroll?.animationName).toBe("none");
      expect(afterScroll?.transform).toBe("none");
    }
  });

  test("home survives rapid scroll, resize, and history stress", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await skipSplash(page);
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await settle(page, 1000);

    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await page.waitForTimeout(100);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(100);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await settle(page, 700);
    await page.setViewportSize({ width: 2048, height: 1113 });
    await settle(page, 700);

    await page.goto(`${BASE}/services`, { waitUntil: "domcontentloaded" });
    await settle(page, 350);
    await page.goBack({ waitUntil: "domcontentloaded" });
    await settle(page, 1000);

    const failures = await collectAnimationFailures(page);
    expect(failures, failures.join("\n")).toHaveLength(0);
  });

  test("about bottom handoff does not expose previous stacked surfaces", async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await skipSplash(page);
    await page.goto(`${BASE}/about`, { waitUntil: "domcontentloaded" });
    await settle(page, 1000);

    const maxY = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const positions = Array.from(
      new Set([
        Math.round(maxY * 0.52),
        Math.round(maxY * 0.6),
        Math.round(maxY * 0.68),
        Math.round(maxY * 0.76),
        Math.round(maxY * 0.84),
        Math.round(maxY * 0.92),
        maxY,
      ])
    );

    const failures: string[] = [];
    for (const y of positions) {
      await page.evaluate((target) => window.scrollTo({ top: target, behavior: "instant" }), y);
      await settle(page, 550);
      const current = await page.evaluate(() => {
        const failureMessages: string[] = [];
        const surfaces = Array.from(document.querySelectorAll<HTMLElement>("[data-stack-surface]"));
        const footer = document.querySelector<HTMLElement>("[data-footer-surface]");
        const craft = surfaces.find((surface) =>
          (surface.textContent || "").includes("Exceptional thinking, exceptional building.")
        );
        const cta = surfaces.find((surface) =>
          (surface.textContent || "").includes("For those who value experience and quality.")
        );

        if (!craft || !cta || !footer) {
          return ["about bottom handoff: missing expected stack surfaces or footer"];
        }

        const footerMarginTop = Number.parseFloat(window.getComputedStyle(footer).marginTop || "0");
        const footerHeight = footer.getBoundingClientRect().height;
        if (Math.abs(footerMarginTop + footerHeight) > 2) {
          failureMessages.push(
            `footer overlap ${footerMarginTop}px does not match its ${footerHeight}px height`
          );
        }

        const ctaRect = cta.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        const handoffStarted = ctaRect.top <= window.innerHeight || footerRect.top <= window.innerHeight;
        if (!handoffStarted) return failureMessages;

        const points = [
          [window.innerWidth * 0.2, window.innerHeight * 0.25],
          [window.innerWidth * 0.5, window.innerHeight * 0.25],
          [window.innerWidth * 0.8, window.innerHeight * 0.25],
          [window.innerWidth * 0.2, window.innerHeight * 0.5],
          [window.innerWidth * 0.5, window.innerHeight * 0.5],
          [window.innerWidth * 0.8, window.innerHeight * 0.5],
          [window.innerWidth * 0.2, window.innerHeight * 0.82],
          [window.innerWidth * 0.5, window.innerHeight * 0.82],
          [window.innerWidth * 0.8, window.innerHeight * 0.82],
        ] as const;

        points.forEach(([x, yy]) => {
          const top = document.elementFromPoint(x, yy);
          const surface = top?.closest<HTMLElement>("[data-stack-surface], [data-footer-surface]");
          const incomingCoversPoint =
            (yy >= ctaRect.top && yy <= ctaRect.bottom) ||
            (yy >= footerRect.top && yy <= footerRect.bottom);
          if (incomingCoversPoint && surface === craft) {
            failureMessages.push(
              `CRAFT surface is topmost during CTA/footer handoff at x=${Math.round(x)}, y=${Math.round(yy)}`
            );
          }
        });

        return failureMessages;
      });

      failures.push(...current.map((failure) => `/about @${y}: ${failure}`));
    }

    expect(failures, failures.join("\n")).toHaveLength(0);
  });

  test("@cursor always keeps a visible pointer fallback", async ({ page }) => {
    test.setTimeout(45_000);
    await page.setViewportSize({ width: 900, height: 800 });
    await skipSplash(page);
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await settle(page, 700);

    const finePointer = await page.evaluate(() =>
      window.matchMedia("(pointer: fine)").matches
    );
    test.skip(!finePointer, "Custom cursor is intentionally disabled on touch pointers");

    const fallback = await page.evaluate(() => ({
      bodyCursor: window.getComputedStyle(document.body).cursor,
      customActive: document.body.classList.contains("has-custom-cursor"),
      customDisplays: Array.from(
        document.querySelectorAll<HTMLElement>("[data-custom-cursor]")
      ).map((element) => window.getComputedStyle(element).display),
    }));

    expect(fallback.bodyCursor).not.toBe("none");
    expect(fallback.customActive).toBe(false);
    expect(fallback.customDisplays.every((display) => display === "none")).toBe(true);

    await page.setViewportSize({ width: 1100, height: 800 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await settle(page, 700);
    await page.mouse.move(720, 450);
    await page.waitForTimeout(120);

    const active = await page.evaluate(() => ({
      bodyCursor: window.getComputedStyle(document.body).cursor,
      customActive: document.body.classList.contains("has-custom-cursor"),
      opacities: Array.from(
        document.querySelectorAll<HTMLElement>("[data-custom-cursor]")
      ).map((element) => Number(window.getComputedStyle(element).opacity)),
    }));

    expect(active.bodyCursor).toBe("none");
    expect(active.customActive).toBe(true);
    expect(active.opacities.some((opacity) => opacity >= 0.5)).toBe(true);

    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(250);
    const afterScroll = await page.evaluate(() => ({
      customActive: document.body.classList.contains("has-custom-cursor"),
      visible: Array.from(
        document.querySelectorAll<HTMLElement>("[data-custom-cursor]")
      ).some((element) => Number(window.getComputedStyle(element).opacity) >= 0.5),
    }));
    expect(afterScroll.customActive).toBe(true);
    expect(afterScroll.visible).toBe(true);
  });

  test("@snap fine-pointer desktops settle half-covered sections", async ({ page }) => {
    test.setTimeout(60_000);
    await skipSplash(page);

    for (const viewport of [
      { width: 1100, height: 800 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 900);

      const finePointer = await page.evaluate(() =>
        window.matchMedia("(pointer: fine)").matches
      );
      test.skip(!finePointer, "Section settling is intentionally disabled on touch pointers");

      const prepared = await page.evaluate(() => {
        const flow = document.querySelector<HTMLElement>("[data-stack-mode]");
        const surfaces = Array.from(
          flow?.querySelectorAll<HTMLElement>("[data-stack-surface]") ?? []
        );
        const incoming = surfaces[1];
        if (!flow || !incoming) return { mode: null, top: -1 };
        document.documentElement.style.setProperty(
          "scroll-behavior",
          "auto",
          "important"
        );
        const target =
          window.scrollY +
          incoming.getBoundingClientRect().top -
          window.innerHeight * 0.35;
        const lenis = (window as unknown as {
          __lenis828?: { scrollTo: (y: number, options: { immediate: boolean }) => void };
        }).__lenis828;
        if (lenis) lenis.scrollTo(target, { immediate: true });
        else window.scrollTo(0, target);
        return {
          mode: flow.dataset.stackMode ?? null,
          top: incoming.getBoundingClientRect().top,
        };
      });
      await page.waitForTimeout(250);
      const before = await page.evaluate(() =>
        document
          .querySelectorAll<HTMLElement>("[data-stack-surface]")[1]
          ?.getBoundingClientRect().top ?? -1
      );

      expect(prepared.mode).toBe("desktop");
      expect(before).toBeGreaterThan(viewport.height * 0.2);
      expect(before).toBeLessThan(viewport.height * 0.5);

      await page.mouse.wheel(0, 12);
      await page.waitForTimeout(1600);
      const after = await page.evaluate(() =>
        document
          .querySelectorAll<HTMLElement>("[data-stack-surface]")[1]
          ?.getBoundingClientRect().top ?? -1
      );
      expect(Math.abs(after)).toBeLessThanOrEqual(2);
    }
  });

  test("updated 828 favicon assets are linked and available", async ({ page, request }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    const href = await page
      .locator('link[rel="icon"][sizes="32x32"][type="image/png"]')
      .getAttribute("href");

    expect(href).toContain("/favicon-828-v2-32x32.png?v=20260907");
    const response = await request.get(new URL(href!, BASE).toString());
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("@portfolio photo tiles keep compact-desktop button geometry clipped", async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });
    await skipSplash(page);
    await page.goto(`${BASE}/portfolio`, { waitUntil: "domcontentloaded" });
    await settle(page, 900);

    const overflowingTiles = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>(".pf-tile"))
        .filter((tile) => tile.scrollWidth > tile.clientWidth + 3)
        .map((tile) => tile.getAttribute("aria-label") || "unlabelled tile")
    );
    expect(overflowingTiles, overflowingTiles.join("\n")).toHaveLength(0);
  });

  test("footer stays compact on phone and tablet", async ({ page }) => {
    test.setTimeout(60_000);
    await skipSplash(page);

    for (const viewport of [
      { name: "iphone-se", width: 375, height: 667, maxHeightRatio: 2.1 },
      { name: "ipad-landscape", width: 1024, height: 768, maxHeightRatio: 2.1 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      await settle(page, 1000);
      const result = await page.evaluate(() => {
        const footer = document.querySelector<HTMLElement>("footer");
        if (!footer) return { ok: false, reason: "missing footer", footerHeight: 0, marqueeVisible: false };
        const marquee = footer.querySelector<HTMLElement>(".brand-marquee-bottom");
        const footerRect = footer.getBoundingClientRect();
        const marqueeRect = marquee?.getBoundingClientRect();
        const marqueeVisible = !!marquee &&
          !!marqueeRect &&
          marqueeRect.width > 1 &&
          marqueeRect.height > 1 &&
          getComputedStyle(marquee).visibility !== "hidden";
        return {
          ok: true,
          reason: "",
          footerHeight: footerRect.height,
          marqueeVisible,
        };
      });

      expect(result.ok, `${viewport.name}: ${result.reason}`).toBe(true);
      expect(
        result.footerHeight,
        `${viewport.name}: footer height ${result.footerHeight}px is too long for ${viewport.height}px viewport`
      ).toBeLessThanOrEqual(viewport.height * viewport.maxHeightRatio);
      expect(result.marqueeVisible, `${viewport.name}: footer marquee should be visible`).toBe(true);
    }
  });

  test("coarse-pointer tablet keeps stacked photos in stable natural flow", async ({ browser }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: false,
      viewport: { width: 1024, height: 768 },
    });
    const page = await context.newPage();
    await skipSplash(page);
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await settle(page, 1000);

    const initial = await page.evaluate(() => ({
      coarse: window.matchMedia("(pointer: coarse) and (max-width: 1366px)").matches,
      modes: Array.from(document.querySelectorAll<HTMLElement>("[data-stack-mode]"))
        .map((flow) => flow.dataset.stackMode),
      stickySurfaces: Array.from(document.querySelectorAll<HTMLElement>("[data-stack-surface]"))
        .filter((surface) => getComputedStyle(surface).position === "sticky").length,
    }));

    expect(initial.coarse).toBe(true);
    expect(initial.modes).toContain("touch");
    expect(initial.stickySurfaces, "touch surfaces must not overlap as sticky layers").toBe(0);

    const failures: string[] = [];
    const maxY = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (const y of [0, 0.18, 0.36, 0.54, 0.72, 0.9, 1, 0.62, 0.28, 0]) {
      await page.evaluate((target) => window.scrollTo({ top: target, behavior: "instant" }), Math.round(maxY * y));
      await page.waitForTimeout(180);
      const current = await page.evaluate(() => {
        const issues: string[] = [];
        document.querySelectorAll<HTMLElement>("[data-cover-veil]").forEach((veil) => {
          if (Number(getComputedStyle(veil).opacity) > 0.001) issues.push("touch cover veil painted over content");
        });
        document.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
          const rect = image.getBoundingClientRect();
          const visible = rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
          if (!visible) return;
          const style = getComputedStyle(image);
          const hasBlurPlaceholder = image.style.backgroundImage.includes("data:image");
          if ((!image.complete || image.naturalWidth < 1) && !hasBlurPlaceholder) {
            issues.push(`unloaded visible image without placeholder: ${image.currentSrc || image.src}`);
          }
          // Some process thumbnails are intentionally subdued until their row
          // is active; only a fully hidden image indicates a render failure.
          if (Number(style.opacity) < 0.05) issues.push(`hidden visible image: ${image.currentSrc || image.src}`);
        });
        return issues;
      });
      failures.push(...current.map((issue) => `scroll ${y}: ${issue}`));
    }

    expect(failures, failures.join("\n")).toHaveLength(0);
    await context.close();
  });

  for (const viewport of [
    { name: "iphone-se", width: 375, height: 667 },
    { name: "ipad-portrait", width: 768, height: 1024 },
    { name: "ipad-landscape", width: 1024, height: 768 },
  ]) {
    for (const route of ROUTES) {
      test(`@section-stress ${route} stays stable through every section at ${viewport.name}`, async ({ page }) => {
        test.setTimeout(90_000);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await skipSplash(page);
        await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
        await settle(page, 900);

        const failures: string[] = [];
        const targets = await sectionScrollTargets(page);

        for (const y of targets) {
          await page.evaluate((target) => window.scrollTo({ top: target, behavior: "instant" }), y);
          await page.waitForTimeout(190);
          await page.evaluate(() => window.dispatchEvent(new Event("resize")));
          await page.waitForTimeout(600);

          const animationFailures = await collectAnimationFailures(page);
          const containerFailures = await collectSmallScreenContainerFailures(page);
          failures.push(
            ...animationFailures.map((failure) => `${route} ${viewport.name} @${y}: ${failure}`),
            ...containerFailures.map((failure) => `${route} ${viewport.name} @${y}: ${failure}`)
          );
        }

        expect(failures, failures.join("\n")).toHaveLength(0);
      });
    }
  }
});
