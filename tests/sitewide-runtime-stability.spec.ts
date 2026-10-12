import { expect, test } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3011";
const ROUTES = [
  "/",
  "/about",
  "/services",
  "/services/adu",
  "/services/remediation",
  "/services/consulting",
  "/portfolio",
  "/contact",
];

const VIEWPORTS = [
  { label: "small-mobile", width: 320, height: 568 },
  { label: "iphone", width: 390, height: 844 },
  { label: "tablet", width: 820, height: 1180 },
  { label: "compact-desktop", width: 1100, height: 800 },
  { label: "short-desktop", width: 1440, height: 650 },
  { label: "landscape-phone", width: 844, height: 390 },
  { label: "desktop", width: 1440, height: 900 },
];

declare global {
  interface Window {
    __qaCumulativeLayoutShift?: number;
  }
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.label} runtime stability`, () => {
    test.use({ viewport });

    for (const route of ROUTES) {
      test(`${route} has no runtime, resource, image, overflow, or CLS failure`, async ({ page }) => {
        const consoleErrors: string[] = [];
        const pageErrors: string[] = [];
        const failedResources: string[] = [];

        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("pageerror", (error) => pageErrors.push(error.message));
        page.on("requestfailed", (request) => {
          const url = new URL(request.url());
          const reason = request.failure()?.errorText ?? "failed";
          // WebKit aborts lazy image/font requests that leave the viewport
          // during the deliberate instant-scroll stress. An abort is not a
          // resource failure; a bad response or a completed zero-size image
          // is still caught below.
          const expectedAbort = /cancelled|canceled|aborted/i.test(reason);
          if (url.origin === new URL(BASE).origin && !expectedAbort) {
            failedResources.push(`${reason} ${url.pathname}`);
          }
        });
        page.on("response", (response) => {
          const url = new URL(response.url());
          if (url.origin === new URL(BASE).origin && response.status() >= 400) {
            failedResources.push(`${response.status()} ${url.pathname}`);
          }
        });

        await page.addInitScript(() => {
          sessionStorage.setItem("828:splash-seen", "1");
          window.__qaCumulativeLayoutShift = 0;
          if (!("PerformanceObserver" in window)) return;
          try {
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const shift = entry as PerformanceEntry & {
                  hadRecentInput?: boolean;
                  value?: number;
                };
                if (!shift.hadRecentInput) {
                  window.__qaCumulativeLayoutShift =
                    (window.__qaCumulativeLayoutShift ?? 0) + (shift.value ?? 0);
                }
              }
            });
            observer.observe({ type: "layout-shift", buffered: true });
          } catch {
            // Older engines may not expose LayoutShift entries. The remaining
            // runtime, image, and geometry assertions still apply there.
          }
        });

        await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(900);

        const maxY = await page.evaluate(
          () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
        );
        for (const y of [0, Math.round(maxY * 0.5), maxY]) {
          await page.evaluate((target) => window.scrollTo({ top: target, behavior: "instant" }), y);
          await page.waitForTimeout(700);

          const health = await page.evaluate(() => {
            const brokenVisibleImages = Array.from(document.images)
              .filter((image) => {
                const rect = image.getBoundingClientRect();
                return rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
              })
              .filter((image) => image.complete && image.naturalWidth === 0)
              .map((image) => image.currentSrc || image.src || image.alt || "unknown image");

            return {
              overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
              brokenVisibleImages,
            };
          });

          expect(health.overflow, `${route} overflow at scroll ${y}`).toBeLessThanOrEqual(1);
          expect(health.brokenVisibleImages, `${route} broken images at scroll ${y}`).toEqual([]);
        }

        await page.waitForTimeout(300);
        const cls = await page.evaluate(() => window.__qaCumulativeLayoutShift ?? 0);
        expect(cls, `${route} cumulative layout shift`).toBeLessThan(0.1);
        expect(pageErrors, `${route} page errors`).toEqual([]);
        expect(consoleErrors, `${route} console errors`).toEqual([]);
        expect(failedResources, `${route} failed same-origin resources`).toEqual([]);

        // Breakpoint regressions can keep a panel pinned while expanding all
        // photos inside its clipped viewport. Exercise every service, not just
        // the page midpoint, and prove the active image is actually painted.
        if (route === "/services") {
          // Return to the document start before using element geometry: a
          // covered sticky ancestor has viewport-relative bounds at the footer.
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
          await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
          const index = page.locator('[data-section="services-index"]');
          const pinned = await index.evaluate((el) =>
            getComputedStyle(el.firstElementChild!).position === "sticky"
          );
          for (let service = 0; service < 3; service++) {
            const stage = page.locator(".svc-row-stage").nth(service);
            if (pinned) {
              await index.evaluate((el, step) => {
                window.scrollTo({
                  top: (el.clientHeight - innerHeight) * (step + 0.4) / 3,
                  behavior: "instant",
                });
              }, service);
              await expect(stage).toHaveAttribute("data-active", "true");
            } else {
              await stage.scrollIntoViewIfNeeded();
            }
            await expect.poll(() => stage.evaluate((el) => {
              const rect = el.getBoundingClientRect();
              const x = rect.left + rect.width / 2;
              const y = Math.max(80, Math.min(innerHeight - 1, rect.top + rect.height / 2));
              return rect.height > 100 && el.contains(document.elementFromPoint(x, y));
            }), { message: `Service ${service + 1} must be visible and reachable` }).toBe(true);
          }
        }

      });
    }
  });
}
