# Technical SEO and Search Console

Audit date: October 7, 2026. Changes in this checkout require deployment before they affect production.

## What the supplied Search Console report means

The ten “Crawled – currently not indexed” examples are fonts, favicons, and a web manifest, not landing pages. The reported 404 is an obsolete hashed font URL. These URLs do not belong in the page sitemap, and they do not need to become indexed pages. Do not redirect retired fonts to the homepage or block /_next/ in robots.txt; current fonts, JavaScript, CSS, and images must remain fetchable.

The sitemap contains eight public pages. Six appear in the supplied indexed examples; /services and /services/adu are absent from those examples. A subsequent supplied Search Console report confirms both URLs are “Discovered – currently not indexed”, with last crawled N/A. The 13 excluded URLs are now fully accounted for: ten supporting assets, one retired font 404, and these two landing pages. Live HTTP checks on October 7 returned 200 for all eight pages with self-referencing canonical URLs. HTTP redirects to HTTPS; www redirects to the preferred apex domain (currently a hosting-level 307).

## Changes

- Move the same favicon bytes from the Next metadata convention to public/favicon.ico and explicitly reference the stable URL. Retain old public icons for existing references. Remove dated query strings from current icon, logo, and manifest links.
- Add X-Robots-Tag: noindex only to WOFF2 files and the web manifest. These remain crawlable; images and favicons remain eligible for search use. Exclusion labels may change after recrawling, not disappear.
- Keep the eight canonical page URLs in the sitemap; omit changefreq and priority, which Google ignores. Update the fixed lastmod for this shared metadata change. Do not replace it with the build time.
- Share existing ADU and remediation FAQ copy between visible cards and JSON-LD. This prevents drift; it is not a promise of FAQ rich results.
- Align the shared experience description with the existing 20+ years wording and the recorded experience since 2004.
- Add an HTTP-level SEO audit to production CI.

## Verification

Run `npm run build`, `npm run lint`, and `npm run audit:seo`. The SEO command starts a production server on 127.0.0.1:3012 and stops it afterward. It checks sitemap membership, robots rules, successful HTML responses, unique titles/descriptions, canonical URLs, one H1 per page, social image metadata, parseable JSON-LD, FAQ/HTML agreement, internal links, current fonts/CSS/icons, asset indexing headers, legacy icon query compatibility, genuine 404s, and permanent route redirects.

After deployment, run:

```sh
SEO_BASE_URL=https://828constructions.com node scripts/audit-seo.mjs
```

Production CDN headers must be verified separately from the local build. The deployed audit deliberately fails if old metadata or missing resource headers are still being served.

## Search Console follow-up after deployment

1. Keep the successful /sitemap.xml submission. Repeated deletion/resubmission is unnecessary.
2. Set the Page indexing report filter to the submitted sitemap (or “All submitted pages”) to focus on actual landing pages instead of asset URLs.
3. Inspect https://828constructions.com/services and https://828constructions.com/services/adu individually. Use Test live URL, inspect the rendered page, confirm the Google-selected canonical in indexed data, and request indexing once if needed.
4. Inspect the homepage and request a recrawl for the stable favicon references.
5. Allow Google to recrawl. Do not repeatedly validate excluded fonts as if they should be indexed. Keep obsolete hashed assets as 404 if nothing current links to them.
6. Optionally change the existing www-to-apex redirect from 307 to a permanent 308 in the hosting configuration, preserving path and query. Verify the hosting configuration before changing it; application redirects cannot override an earlier edge redirect.

Google controls indexing and report timing. There is no Google “SEO certified” status for this work, and successful technical checks do not guarantee indexing or rankings. Search Console account actions were not performed by this repository change.

## References

- [Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [Robots.txt limitations](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Sitemap lastmod, changefreq, and priority](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)
- [URL Inspection and live-test limitations](https://support.google.com/webmasters/answer/9012289)
