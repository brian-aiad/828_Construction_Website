import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Swallow removeChild error so we can inspect the failures without crash
await page.addInitScript(() => {
  const orig = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (!this.contains(child)) {
      window.__rcFails = window.__rcFails || [];
      const p = this;
      const c = child;
      window.__rcFails.push({
        parentTag: p.nodeName,
        parentClass: p.className?.substring?.(0,80) || '',
        parentId: p.id || '',
        childTag: c.nodeType === 3 ? 'TEXT' : c.nodeName,
        childClass: c.className?.substring?.(0,80) || '',
        childId: c.id || '',
        childText: c.textContent?.substring?.(0,60) || '',
        childParentTag: c.parentNode?.nodeName || 'none',
        childParentClass: c.parentNode?.className?.substring?.(0,80) || '',
      });
      // Don't rethrow - just return child (fake removal for inspection)
      return c;
    }
    return orig.call(this, child);
  };
});

await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(3000);

const svcLink = await page.$('a[href="/services"]');
if (svcLink) await svcLink.click();
await page.waitForTimeout(2000);

const fails = await page.evaluate(() => window.__rcFails || []);
if (fails.length === 0) {
  console.log('No removeChild failures captured!');
} else {
  console.log(`${fails.length} removeChild failure(s):`);
  fails.forEach((f, i) => {
    console.log(`[${i+1}] parent: <${f.parentTag}#${f.parentId}.${f.parentClass}>`);
    console.log(`     child:  <${f.childTag}#${f.childId}.${f.childClass}> text="${f.childText}"`);
    console.log(`     child's actual parent: <${f.childParentTag}.${f.childParentClass}>`);
  });
}

await browser.close();
