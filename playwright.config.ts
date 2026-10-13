import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";

const externalBaseURL = process.env.TEST_BASE_URL;
const baseURL = externalBaseURL || "http://localhost:3011";
const productionTest = process.env.TEST_PRODUCTION === "1";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      // Headless Linux Firefox can expose pointer:none. Reproduce that input
      // profile locally so CSS/JS pinning mismatches cannot hide in CI only.
      name: "firefox-no-pointer",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: {
            "ui.primaryPointerCapabilities": 0,
            "ui.allPointerCapabilities": 0,
          },
        },
      },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: externalBaseURL
    ? undefined
    : {
        command: productionTest ? "npx next start -p 3011" : "npx next dev -p 3011",
        url: "http://localhost:3011",
        reuseExistingServer: !process.env.CI && !productionTest,
        // Fresh test-only signing key; production must still supply its own.
        env: { CONTACT_FORM_SECRET: randomBytes(32).toString("hex") },
        timeout: 120_000,
      },
});
