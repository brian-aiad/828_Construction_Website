# Website QA — October 7, 2026

Status: local production build reviewed; these changes have not been deployed.

## Scope

All eight public pages: Home, About, Services, ADU Construction, Remediation, Consulting, Portfolio, Contact. Included the 404 page and legacy redirects. Browser coverage uses Chromium, Firefox, and WebKit; responsive sizes include 320, 375, 390, 393, 820, 1180, and 1440 pixels. Mobile/touch checks are emulated, not a physical-device lab.

Checked page loads, visible images, horizontal overflow, layout shifts, navigation and browser history, mobile menus, keyboard focus, galleries, FAQ controls, first-visit splash, reduced motion, cursor behavior, contact validation and retry flows, accessibility, metadata, sitemap, and dependency advisories. Manually reviewed screenshots of every page at desktop and phone sizes, plus footer/navigation behavior.

## Fixes and safeguards

- Contact requests now time out after 12 seconds for the security challenge and 45 seconds for submission. Previously, a stalled connection left the button disabled indefinitely. Recovery keeps entered details and allows a retry. A submission timeout says delivery could not be confirmed rather than falsely claiming the message was not sent. The server's existing idempotency mechanism remains in place.
- Added browser regressions for challenge and delivery stalls, field preservation, and successful retry. Contact submission tests mock email delivery and send no real leads.
- Added a geometry regression for the earlier cursor correction: dot and enlarged ring must share the actual pointer coordinates, including at navigation links.
- Patched Next.js/eslint-config-next to the locked 16.3.8 release, Sharp to 0.35.5, source-map-js to 1.2.2, and vulnerable brace-expansion dependency versions.
- Added a production browser suite to CI alongside lint, type checking/build, SEO checks, contact request tests, and production dependency auditing. Failures upload reports and screenshots/traces when available.
- Production browser tests start their own server with an ephemeral signing secret. Fixed test files targeting unrelated/stale ports. Firefox touch testing uses a narrow touch viewport because Playwright's isMobile emulation flag is unsupported in Firefox. The no-JavaScript splash test waits for the DOM rather than unrelated image-load completion.

## Verification

- Production build and type checks: passed. All 323 public raster images decoded successfully.
- Lint and whitespace validation: passed.
- SEO HTTP audit: all eight pages and twelve supporting resources passed; checked internal links, redirects, 404s, and sitemap/robots responses.
- Automated accessibility: 16 page/viewport combinations passed (eight desktop, eight phone). This is not a claim of complete accessibility certification.
- Responsive audit: 32 page/device combinations passed (eight pages at four phone/tablet sizes).
- Interaction audit: four device profiles and two reduced-motion profiles passed, covering route loads, scroll stress, mobile menu navigation, and form validation.
- Cross-browser release suite: all 168 tests passed across Chromium, Firefox, and WebKit, including the cursor geometry and both timeout/retry regressions.
- Contact request handling: all 15 tests passed, including malformed input, signed challenges, idempotent retries, and rate limiting.
- Production dependency audit: zero reported vulnerabilities.
- Live contact security-challenge endpoint: HTTP 200. Actual production email delivery was not exercised.

## Remaining limits

No finite test suite can guarantee that future browser updates, deployments, third-party services, or network failures will never cause an issue. CI checks reduce regression risk; they do not replace checking the deployed site.

The full dependency audit still reports five high findings in the development-only braces → micromatch → fast-glob → Next ESLint dependency chain. npm offers no compatible patched braces version; its suggested forced fix downgrades Next's lint configuration to version 14. That downgrade was not applied. These findings are absent from `npm audit --omit=dev` and should be revisited when an upstream patch is available.

Google Search Console recrawling and indexing remain external follow-up, documented in [SEO maintenance](SEO-MAINTENANCE.md). The two discovered but unindexed landing pages are Services and ADU Construction.

## Reproduce

```sh
npm run lint
npm run build
npm run test:contact
npm run audit:seo
npm run test:release
npm audit --omit=dev --audit-level=high
```

The `test:release` command starts/stops its own production server on port 3011. See the README for browser installation and external local-server usage.

## Advisory references

- [Next.js ImageResponse advisory](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j): the specific exploit requires attacker-controlled SVG input; this project does not use that path. Patched the dependency nonetheless.
- [Sharp/librsvg advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)
- [source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)
- [Development-only braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
