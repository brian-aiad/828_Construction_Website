import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Inject removeChild interceptor BEFORE page loads
await page.addInitScript(() => {
  const orig = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (!this.contains(child)) {
      const parentInfo = `${this.nodeName}#${this.id}.${[...this.classList].join('.')}`;
      const childInfo = child.nodeType === 3
        ? `TEXT:"${child.textContent?.substring(0,40)}"`
        : `${child.nodeName}#${child.id}.${[...(child.classList||[])].join('.')}`;
      console.error(`[RC_FAIL] parent=${parentInfo} child=${childInfo} childParent=${child.parentNode?.nodeName}`);
    }
    return orig.call(this, child);
  };
});

const errors = [];
page.on('console', msg => {
  if (msg.text().includes('[RC_FAIL]')) errors.push(msg.text());
});
page.on('pageerror', err => {
  if (err.message.includes('removeChild')) errors.push('CRASH: ' + err.message);
});

await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(3000); // let all GSAP setTimeout(80ms) fire + pin activate

const svcLink = await page.$('a[href="/services"]');
if (svcLink) await svcLink.click();
await page.waitForTimeout(2000);

if (errors.length === 0) {
  console.log('NO removeChild errors detected!');
} else {
  console.log(`Found ${errors.length} removeChild failure(s):`);
  errors.forEach(e => console.log(' ', e));
}

await browser.close();
