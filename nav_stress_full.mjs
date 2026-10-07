import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on('pageerror', err => errors.push(err.message));

const routes = ['/', '/about', '/services', '/process', '/contact'];

let totalFail = 0;
let totalPass = 0;

// Test every possible from→to pair (including non-adjacent)
for (const from of routes) {
  for (const to of routes) {
    if (from === to) continue;

    errors.length = 0;
    await page.goto('http://localhost:3000' + from, { waitUntil: 'networkidle', timeout: 25000 });
    // 3 seconds: more than enough for setTimeout(80ms) pin init
    await page.waitForTimeout(3000);

    const navLink = await page.$('a[href="' + to + '"]');
    if (navLink) {
      await navLink.click();
    } else {
      await page.goto('http://localhost:3000' + to, { waitUntil: 'networkidle', timeout: 25000 });
    }
    await page.waitForTimeout(2000);

    const rcErrors = errors.filter(e => e.includes('removeChild') || e.includes('NotFoundError') || e.includes('insertBefore'));
    if (rcErrors.length) {
      console.log(`FAIL ${from} -> ${to}: ${rcErrors[0].substring(0, 120)}`);
      totalFail++;
    } else {
      console.log(`PASS ${from} -> ${to}`);
      totalPass++;
    }
  }
}

// Rapid back-forward stress: about ↔ services x3
console.log('\n--- Rapid repeat stress: about <-> services x3 ---');
for (let rep = 0; rep < 3; rep++) {
  errors.length = 0;
  await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(3000);
  const svcLink = await page.$('a[href="/services"]');
  if (svcLink) await svcLink.click();
  await page.waitForTimeout(2000);
  const rcE = errors.filter(e => e.includes('removeChild') || e.includes('NotFoundError'));
  console.log(rcE.length ? `FAIL about->services rep${rep+1}` : `PASS about->services rep${rep+1}`);
  if (rcE.length) totalFail++; else totalPass++;
}

// Quick repeat: services → about
console.log('\n--- Rapid repeat stress: services <-> about x3 ---');
for (let rep = 0; rep < 3; rep++) {
  errors.length = 0;
  await page.goto('http://localhost:3000/services', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(3000);
  const aboutLink = await page.$('a[href="/about"]');
  if (aboutLink) await aboutLink.click();
  await page.waitForTimeout(2000);
  const rcE = errors.filter(e => e.includes('removeChild') || e.includes('NotFoundError'));
  console.log(rcE.length ? `FAIL services->about rep${rep+1}` : `PASS services->about rep${rep+1}`);
  if (rcE.length) totalFail++; else totalPass++;
}

console.log(`\n=== TOTAL: ${totalPass} PASS, ${totalFail} FAIL ===`);
await browser.close();
process.exit(totalFail > 0 ? 1 : 0);
