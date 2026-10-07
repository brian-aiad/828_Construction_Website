import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on('pageerror', err => errors.push(err.message));

const routes = ['/', '/about', '/services', '/process', '/contact'];

// Test every route → next route
for (let i = 0; i < routes.length; i++) {
  const from = routes[i];
  const to = routes[(i + 1) % routes.length];

  errors.length = 0;
  await page.goto('http://localhost:3000' + from, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2500); // let GSAP pin + setTimeout(80ms) initialize

  // Click a nav link to trigger React router navigation (not full page reload)
  const navLink = await page.$('a[href="' + to + '"]');
  if (navLink) {
    await navLink.click();
    await page.waitForTimeout(1500);
  } else {
    await page.goto('http://localhost:3000' + to, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
  }

  const rcErrors = errors.filter(e => e.includes('removeChild') || e.includes('NotFoundError'));
  console.log(rcErrors.length ? `FAIL ${from} -> ${to}: ${rcErrors[0].substring(0,120)}` : `PASS ${from} -> ${to}`);
}

// Also test back-navigation
errors.length = 0;
await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(3000);
const svcLink = await page.$('a[href="/services"]');
if (svcLink) { await svcLink.click(); await page.waitForTimeout(1500); }
const rcE = errors.filter(e => e.includes('removeChild') || e.includes('NotFoundError'));
console.log(rcE.length ? `FAIL about->services: ${rcE[0].substring(0,120)}` : `PASS about->services (deep test)`);

await browser.close();
