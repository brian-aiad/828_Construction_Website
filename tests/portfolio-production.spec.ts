import { expect, test } from "@playwright/test";

const BASE = process.env.TEST_BASE_URL || "http://localhost:3011";

async function selectedPreviewState(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const section = document.querySelector<HTMLElement>("[data-section='portfolio-hero']");
    const rows = Array.from(
      section?.querySelectorAll<HTMLAnchorElement>("nav[aria-label='Project index'] a") ?? []
    );
    const activeRow = rows.find((row) => row.className.includes("bg-white/[0.035]"));
    const previewCandidates = Array.from(
      section?.querySelectorAll<HTMLAnchorElement>("a:has(img)") ?? []
    );
    const preview = previewCandidates.find((candidate) =>
      activeRow ? candidate.hash === activeRow.hash : Number(getComputedStyle(candidate).opacity) > 0.9
    );
    const img = preview?.querySelector("img");
    const rect = preview?.getBoundingClientRect();

    return {
      selected: activeRow?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      selectedHref: activeRow?.hash ?? "",
      imageSrc: img?.currentSrc || img?.getAttribute("src") || "",
      imageLoaded: Boolean(img?.complete && img.naturalWidth > 0),
      visible:
        Boolean(preview && rect) &&
        rect!.width > 0 &&
        rect!.height > 0 &&
        getComputedStyle(preview!).visibility === "visible" &&
        Number(getComputedStyle(preview!).opacity) > 0,
      rect: rect
        ? {
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          }
        : null,
      activeRows: rows
        .map((row, index) => (row.className.includes("bg-white/[0.035]") ? index + 1 : null))
        .filter(Boolean),
      badViewportImages: Array.from(document.images)
        .filter((image) => {
          const imageRect = image.getBoundingClientRect();
          if (imageRect.width === 0 || imageRect.height === 0) return false;
          if (imageRect.bottom < 0 || imageRect.top > window.innerHeight) return false;
          const style = getComputedStyle(image);
          return !image.complete || image.naturalWidth === 0 || Number(style.opacity) < 0.05;
        })
        .map((image) => image.alt || image.currentSrc || image.src),
    };
  });
}

test.describe("Portfolio production hardening", () => {
  test.describe.configure({ mode: "serial" });

  test("case index selected preview survives refresh and updates through every row", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(`${BASE}/portfolio`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});

    const projectIndex = page.locator("[data-section='portfolio-hero'] nav[aria-label='Project index']");
    await expect(projectIndex).toBeVisible();
    await projectIndex.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    for (const rowNumber of [1, 2, 3]) {
      const row = projectIndex.locator("a").nth(rowNumber - 1);
      await row.scrollIntoViewIfNeeded();
      await page.evaluate((rowNumber) => {
        const row = Array.from(
          document.querySelectorAll<HTMLElement>("[data-section='portfolio-hero'] nav[aria-label='Project index'] a")
        )[rowNumber - 1];
        if (!row) return;
        const top = row.getBoundingClientRect().top;
        if (top < 140 || top > window.innerHeight - 180) {
          window.scrollBy(0, top - 240);
        }
      }, rowNumber);
      const box = await row.boundingBox();
      expect(box, `row ${rowNumber} should have a rendered hit target`).not.toBeNull();
      await row.dispatchEvent("pointerenter", { pointerType: "mouse" });
      await row.focus();
      await page.waitForTimeout(250);

      const state = await selectedPreviewState(page);
      expect(state.visible, `selected preview should stay visible for row ${rowNumber}`).toBe(true);
      expect(state.imageLoaded, `selected preview image should load for row ${rowNumber}`).toBe(true);
      expect(state.activeRows, `row ${rowNumber} should be active`).toEqual([rowNumber]);
      expect(state.selected, `selected preview should identify row ${rowNumber}`).toContain(
        String(rowNumber).padStart(2, "0")
      );
      expect(state.selectedHref, `row ${rowNumber} preview should point at its case`).toBe(
        await row.getAttribute("href")
      );
    }
  });

  test("portfolio images remain loaded after repeated hard refreshes", async ({ page }) => {
    test.setTimeout(120_000);

    for (let pass = 1; pass <= 3; pass++) {
      await page.goto(`${BASE}/portfolio`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
      await page.evaluate(async () => {
        const max = document.documentElement.scrollHeight;
        for (let y = 0; y <= max; y += Math.floor(window.innerHeight * 0.85)) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);

      const badViewportImages: string[] = [];
      const max = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= max; y += 520) {
        await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
        await page.waitForTimeout(450);
        const state = await selectedPreviewState(page);
        badViewportImages.push(...state.badViewportImages);
      }

      expect([...new Set(badViewportImages)], `viewport images should stay loaded on pass ${pass}`).toHaveLength(0);
    }
  });
});
