/** Audit rendered HTTP responses, not source templates. Run after npm run build. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const start = process.argv.includes('--start');
const origin = process.env.SEO_BASE_URL || 'http://127.0.0.1:3012';
const canonicalOrigin = 'https://828constructions.com';
const paths = ['/', '/about', '/services', '/services/adu', '/services/remediation', '/services/consulting', '/portfolio', '/contact'];
const server = start ? spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', new URL(origin).port, '--hostname', '127.0.0.1'], { stdio: 'ignore' }) : null;
let spawnError;
server?.on('error', error => { spawnError = error; });
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const normalize = s => decode(s).replace(/\s+/g, ' ').trim();
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map(match => Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, decode(v)])));
async function get(path) {
  const response = await fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  return { response, body: await response.text() };
}
try {
  if (server) {
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (spawnError) throw spawnError;
      assert.equal(server.exitCode, null, 'Audit server exited before becoming ready');
      try { ready = (await fetch(origin)).ok; } catch {}
      if (ready) break;
      await delay(500);
    }
    assert(ready, 'Production server did not become ready');
  }
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.response.status, 200);
  const urls = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]));
  assert.equal(urls.length, paths.length, 'Sitemap must contain eight canonical pages only');
  assert.deepEqual(urls.map(u => u.pathname).sort(), [...paths].sort());
  urls.forEach(u => { assert.equal(u.origin, canonicalOrigin); assert.equal(u.search, ''); });
  for (const [, date] of sitemap.body.matchAll(/<lastmod>(.*?)<\/lastmod>/g)) {
    assert(Number.isFinite(Date.parse(date)) && Date.parse(date) <= Date.now(), `Invalid lastmod: ${date}`);
  }
  const robots = await get('/robots.txt');
  assert.equal(robots.response.status, 200);
  assert(robots.body.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
  assert.deepEqual([...robots.body.matchAll(/^Disallow:\s*(.*)$/gm)].map(m => m[1].trim()), ['/api/']);

  const titles = new Set();
  const descriptions = new Set();
  const internalLinks = new Set();
  const resources = new Set(['/favicon.ico?favicon.old-deployment.ico', '/site.webmanifest?v=20260907']);
  for (const path of paths) {
    const { response, body } = await get(path);
    assert.equal(response.status, 200, path);
    assert(response.headers.get('content-type')?.includes('text/html'), path);
    assert(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), path);
    const meta = tags(body, 'meta');
    assert(meta.some(m => m.name === 'robots' && /\bindex\b/.test(m.content)), `Indexable robots: ${path}`);
    assert(!meta.some(m => ['robots', 'googlebot'].includes(m.name) && /noindex/i.test(m.content)), path);
    const canonical = tags(body, 'link').filter(l => l.rel === 'canonical');
    assert.equal(canonical.length, 1, `Canonical count: ${path}`);
    assert.equal(new URL(canonical[0].href).href, new URL(path, canonicalOrigin).href, path);
    const title = body.match(/<title>(.*?)<\/title>/s)?.[1];
    const description = meta.find(m => m.name === 'description')?.content;
    assert(title && !titles.has(title), `Missing/duplicate title: ${path}`);
    assert(description && !descriptions.has(description), `Missing/duplicate description: ${path}`);
    titles.add(title); descriptions.add(description);
    assert.equal([...body.matchAll(/<h1\b/g)].length, 1, `H1 count: ${path}`);
    assert(meta.some(m => m.property === 'og:image'), `Social image: ${path}`);
    const text = normalize(body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' '));
    const schemas = [...body.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
    assert(schemas.length > 0, `Missing structured data: ${path}`);
    for (const schema of schemas) {
      if (schema['@type'] === 'FAQPage') for (const faq of schema.mainEntity) {
        assert(text.includes(normalize(faq.name)), `FAQ question absent from HTML: ${path}`);
        assert(text.includes(normalize(faq.acceptedAnswer.text)), `FAQ answer absent from HTML: ${path}`);
      }
    }
    for (const link of tags(body, 'a')) if (link.href) {
      const url = new URL(link.href, canonicalOrigin);
      if (url.origin === canonicalOrigin) internalLinks.add(url.pathname);
    }
    const icons = tags(body, 'link').filter(l => ['icon', 'apple-touch-icon', 'manifest'].includes(l.rel));
    assert(icons.some(l => l.rel === 'icon' && l.href === '/favicon.ico'), `Stable favicon missing: ${path}`);
    for (const link of icons) { assert(!link.href.includes('?'), `Versioned icon/manifest: ${link.href}`); resources.add(link.href); }
    for (const link of tags(body, 'link').filter(l => l.as === 'font' || l.rel === 'stylesheet')) resources.add(link.href);
    console.log(`PASS ${path}: metadata, canonical, H1, structured data, stable icons`);
  }
  paths.forEach(path => assert(internalLinks.has(path), `Orphan page: ${path}`));
  for (const path of internalLinks) {
    const { response } = await get(path);
    assert(response.status < 400, `Broken internal link: ${path} (${response.status})`);
  }
  for (const path of resources) {
    const response = await fetch(new URL(path, origin));
    assert.equal(response.status, 200, `Broken resource: ${path}`);
    if (/\.woff2(?:\?|$)|site\.webmanifest/.test(path)) assert.equal(response.headers.get('x-robots-tag'), 'noindex', path);
    else assert(!/noindex/i.test(response.headers.get('x-robots-tag') || ''), `Image/CSS must remain usable: ${path}`);
    await response.arrayBuffer();
  }
  const manifest = JSON.parse((await get('/site.webmanifest')).body);
  for (const icon of manifest.icons) {
    assert(!icon.src.includes('?'));
    assert.equal((await fetch(new URL(icon.src, origin))).status, 200);
  }
  for (const path of ['/seo-audit-missing-page', '/_next/static/media/retired-font.woff2']) {
    assert.equal((await get(path)).response.status, 404, `Missing URL must stay 404: ${path}`);
  }
  for (const [path, destination] of [['/projects', '/portfolio'], ['/process', '/portfolio'], ['/services/adu/', '/services/adu']]) {
    const { response } = await get(path);
    assert([301, 308].includes(response.status), `Permanent redirect: ${path}`);
    assert.equal(new URL(response.headers.get('location'), origin).pathname, destination);
  }
  console.log(`SEO audit passed: ${paths.length} pages, ${resources.size} rendering/icon resources, sitemap, robots, internal links, 404s and redirects.`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  server?.kill('SIGTERM');
}
