import { expect, test, type Page } from "@playwright/test";

async function mockChallenge(page: Page) {
  let challengeRequests = 0;
  await page.route("**/api/contact/challenge", async (route) => {
    challengeRequests++;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: `browser-challenge-${challengeRequests}`, minWaitMs: 0 }),
    });
  });
  return () => challengeRequests;
}

async function waitForFormHydration(challengeRequests: () => number) {
  await expect.poll(challengeRequests, { timeout: 10_000 }).toBeGreaterThan(0);
}

async function fillMainForm(page: Page) {
  await page.locator("#cf-name").fill("Browser Regression Customer");
  await page.locator("#cf-phone").fill("(310) 555-0182");
  await page.locator("#cf-email").fill("browser.regression@example.com");
  await page.getByRole("radio", { name: /ADU Build or convert space/i }).check();
  await page
    .locator("#cf-message")
    .fill("Browser regression inquiry with enough detail to verify the complete form flow.");
}

test.describe("contact form browser hardening", () => {
  test("service choices fit their form column at phone, tablet, and desktop widths", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => sessionStorage.setItem("828:splash-seen", "1"));
    await mockChallenge(page);
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    for (const width of [320, 390, 768, 1100, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const choices = page.locator('label[for^="cf-service-"]');
      await expect(choices).toHaveCount(4);
      await expect.poll(() => choices.evaluateAll((labels) => {
        const heights = labels.map((label) => label.getBoundingClientRect().height);
        return Math.max(...heights) - Math.min(...heights) < 1 && labels.every((label) => {
          const box = label.getBoundingClientRect();
          return [...label.querySelectorAll("span")].every((text) => {
            const range = document.createRange();
            range.selectNodeContents(text);
            return [...range.getClientRects()].every((rect) => rect.left >= box.left && rect.right <= box.right);
          });
        });
      }), { message: `Service labels must fit equal-height cards at ${width}px` }).toBe(true);
      await page.getByRole("radio", { name: /Remediation Diagnose and repair/i }).check();
      await expect(page.getByRole("radio", { name: /Remediation Diagnose and repair/i })).toBeChecked();
    }
  });

  test("desktop form remains clickable, validates, debounces, and confirms a reference", async ({
    page,
  }) => {
    const challengeRequests = await mockChallenge(page);
    let postCount = 0;
    await page.route("**/api/contact", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      postCount++;
      const submitted = route.request().postDataJSON() as Record<string, unknown>;
      expect(String(submitted.challengeToken)).toMatch(/^browser-challenge-/);
      await new Promise((resolve) => setTimeout(resolve, 150));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, reference: "828-BROWSER" }),
      });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await waitForFormHydration(challengeRequests);

    const submit = page.getByRole("button", { name: /send project details/i });
    await submit.click();
    await expect(
      page.getByText("A few details still need your attention.")
    ).toBeVisible();
    await expect(page.getByRole("radio", { name: /ADU Build or convert space/i })).toBeFocused();
    expect(postCount).toBe(0);

    await fillMainForm(page);
    await expect(page.getByRole("progressbar", { name: "Project brief completeness" })).toHaveAttribute(
      "aria-valuenow",
      "4"
    );
    await submit.evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });

    await expect(
      page.getByRole("heading", { name: "Your project details are in Joe’s inbox." })
    ).toBeVisible();
    await expect(page.getByRole("status")).toBeFocused();
    await expect(page.getByText("Ref. 828-BROWSER")).toBeVisible();
    expect(postCount).toBe(1);
  });

  test("server field errors focus the rejected field and allow correction", async ({ page }) => {
    const challengeRequests = await mockChallenge(page);
    let postCount = 0;
    await page.route("**/api/contact", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      postCount++;
      await route.fulfill(
        postCount === 1
          ? {
              status: 422,
              contentType: "application/json",
              body: JSON.stringify({ errors: { email: "Check the email address." } }),
            }
          : {
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({ ok: true, reference: "828-CORRECTED" }),
            }
      );
    });

    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await waitForFormHydration(challengeRequests);
    await fillMainForm(page);
    await page.getByRole("button", { name: /send project details/i }).click();

    await expect(page.locator("#cf-email")).toBeFocused();
    await expect(page.locator("#cf-email-err")).toHaveText("Check the email address.");
    await page.locator("#cf-email").fill("corrected@example.com");
    await page.getByRole("button", { name: /send project details/i }).click();
    await expect(page.getByText("Ref. 828-CORRECTED")).toBeVisible();
    expect(postCount).toBe(2);
  });

  test("expired browser challenge is refreshed and retried once", async ({ page }) => {
    const challengeRequests = await mockChallenge(page);
    let postCount = 0;
    await page.route("**/api/contact", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      postCount++;
      if (postCount === 1) {
        await route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Security check expired.",
            code: "challenge_expired",
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, reference: "828-RETRIED" }),
      });
    });

    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await waitForFormHydration(challengeRequests);
    await fillMainForm(page);
    await page.getByRole("button", { name: /send project details/i }).click();

    await expect(page.getByText("Ref. 828-RETRIED")).toBeVisible();
    expect(postCount).toBe(2);
    expect(challengeRequests()).toBeGreaterThanOrEqual(2);
  });

  test("rate limits and provider outages show actionable recovery without losing the page", async ({
    page,
  }) => {
    const challengeRequests = await mockChallenge(page);
    let status = 429;
    await page.route("**/api/contact", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({
          error:
            status === 429
              ? "Too many requests. Please try again in a few minutes."
              : "Failed to send email. Please call us directly.",
        }),
      });
    });

    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await waitForFormHydration(challengeRequests);
    await fillMainForm(page);
    await page.getByRole("button", { name: /send project details/i }).click();
    await expect(page.getByText(/too many requests/i)).toBeVisible();
    await expect(page.getByRole("link", { name: "213-828-2388" }).last()).toBeVisible();

    status = 503;
    await page.getByRole("button", { name: /send project details/i }).click();
    await expect(page.getByText(/failed to send email/i)).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });

  test("mobile form validates and completes without overflow", async ({ page }) => {
    const challengeRequests = await mockChallenge(page);
    await page.route("**/api/contact", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, reference: "828-MOBILE" }),
      });
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await waitForFormHydration(challengeRequests);
    await fillMainForm(page);
    await page.getByRole("button", { name: /send project details/i }).click();

    await expect(page.getByText("Ref. 828-MOBILE")).toBeVisible();
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  });

});

test("a stalled secure connection releases the form and preserves details for retry", async ({ page }) => {
  await page.clock.install();
  let stalled = true;
  await page.route("**/api/contact/challenge", async (route) => {
    if (stalled) return;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "browser-challenge-recovered", minWaitMs: 0 }),
    });
  });
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, reference: "828-RECOVERED" }),
    });
  });
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await fillMainForm(page);
  await page.getByRole("button", { name: /send project details/i }).click();
  await page.clock.fastForward(12_100);
  await expect(page.getByText(/The secure form could not connect/)).toBeVisible();
  await expect(page.locator("#cf-name")).toHaveValue("Browser Regression Customer");
  await expect(page.locator("#cf-message")).not.toHaveValue("");
  const retry = page.locator("button[type=submit]");
  await expect(retry).toBeEnabled();
  stalled = false;
  await retry.click();
  await expect(page.getByText("Ref. 828-RECOVERED")).toBeVisible();
});

test("a stalled delivery reports uncertainty and allows a safe retry", async ({ page }) => {
  await page.clock.install();
  const challengeRequests = await mockChallenge(page);
  let stalled = true;
  await page.route("**/api/contact", async (route) => {
    if (stalled) return;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, reference: "828-DELIVERY-RETRY" }),
    });
  });
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await waitForFormHydration(challengeRequests);
  await fillMainForm(page);
  const request = page.waitForRequest((r) => new URL(r.url()).pathname === "/api/contact");
  await page.getByRole("button", { name: /send project details/i }).click();
  await request;
  await page.clock.fastForward(45_100);
  await expect(page.getByText(/We couldn’t confirm delivery/)).toBeVisible();
  await expect(page.locator("#cf-email")).toHaveValue("browser.regression@example.com");
  const retry = page.locator("button[type=submit]");
  await expect(retry).toBeEnabled();
  stalled = false;
  await retry.click();
  await expect(page.getByText("Ref. 828-DELIVERY-RETRY")).toBeVisible();
});
