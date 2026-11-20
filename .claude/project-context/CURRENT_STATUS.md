<!-- AI_BRAIN_HISTORY:BEGIN -->
This is preserved historical context. Current status, checks, decisions, and next steps are maintained in OneDrive `AI_Brain/Projects/828-construction/CONTEXT.md`. Start with the repository `AGENTS.md` and shared `WORKFLOW.md`; do not append new session status to this historical file.
<!-- AI_BRAIN_HISTORY:END -->

# 828 Construction — Current Status

_Update this file after every session. It's loaded by memory at session start._

## Contact delivery false-positive incident — fixed (2026-08-25)

Production Vercel BotID misclassified a legitimate customer browser and
returned 403 before normal form validation. BotID was removed from the client,
Next configuration, server route, and dependencies. The form remains protected
by signed short-lived challenges, same-origin enforcement, honeypot handling,
bounded and sanitized validation, five-per-ten-minute IP throttling, owner-only
delivery, provider retry handling, and deterministic Resend idempotency. A
permanent seven-profile regression matrix now proves Chrome, Safari, Firefox,
Edge, iPhone, privacy, and embedded-browser submissions do not require
proprietary classification headers.

## Services Index V3.2 — Traveling picture + bulletproof pinned walk (2026-07-09)

Brian's IMG_1075 clarifications executed: NO side plate — ADU / Remediation /
Consulting run full-width "long ways"; ONE photograph at a time expands
under/overlapping the active word (CSS grid-rows 0fr→1fr stages, identical
easing = net-zero reflow) and swaps as you scroll; whole row links to its
page. Scroll made BULLETPROOF per Brian: desktop pins the panel (CSS sticky,
fits 100svh at 800–1080 heights) over a 210vh runway — active service is a
pure function of scroll progress (~70vh of dedicated scroll each; cannot
rush, skip, or flicker; releases after consulting). Mobile: no pin, natural
in-flow walk (last-title-past-focus rule, top guard pins ADU at load — the
"starts at consulting" bug is dead). Signature updated in PATTERNS.md.
QA: pin-probe walk 0→1→2 + clean release at two viewport heights;
functional-qa PASS both viewports; verbatim probe 21/21; preflight 16/16
(push gate); shipped 3d15bdb → https://828-ns-preview.vercel.app/services.
NOTE: parallel-agent gates again active tonight — pushed only after :4001
freed (monitor pattern).

## Contact V3 + all-black footer — Joe's video batch (2026-07-09, terminal B)

`/contact` rebuilt from IMG_1123/1125/1127 (ledger docs/828_CONTACT_JOE_
FEEDBACK_2026-07-09.md, K1–K11 applied, verbiage FROZEN): NS "Get in touch"
photo hero ("Building lasting partnerships." + listening line off to the
side) → all-black fat Get-in-touch band (contact ledger + form card; form
backend STILL ON HOLD) → cream Critical-elements prep strip (items 01–04
frozen) → full-bleed service-path rows with row-embedded photo ignition
(page signature) + shrunk South Bay row ("Whether improving your residence…").
Site-wide: footer panels now ALL BLACK per Joe; stuck-toast failsafe bug fixed
(PATTERNS.md Fix 24 — it was visible floating in Joe's own video).
QA: tsc clean, verbiage 15/15, functional-qa PASS both viewports, reveal-probe
PASS, site-smoke 7/7. Preflight + prod Lighthouse: see below/report.

## Consulting V3 — Joe's video verbiage batch (2026-07-09)

`/services/consulting` rebuilt from Joe's 4 feedback videos (IMG_1117/1120/
1121/1122, OneDrive Gaming_Files); ledger docs/828_CONSULTING_JOE_FEEDBACK_
2026-07-09.md, verbiage FROZEN. Structure: "Building solutions beyond the
blueprint." cream asymmetric hero (LCP-safe) → "Delivering considerate
solutions." ink section + Benefits 01–05 ledger (focus-band ignition, maroon
progress rail) → "Questions and answers" checkerboard card grid with Joe's 3
questions as always-visible self-selection prompts (page signature; no answers
dictated → no accordions) → "Engineered solutions tailored to your project"
clean statement CTA (doodles + side pill deleted per Joe) flowing into the
black footer. Old decision-matrix/advisory/short-call sections deleted.
QA: tsc clean, verbiage probe 16/16 + old copy gone, functional-qa PASS both
viewports, site-smoke 7/7, visual audit 4×5 PASS.
NOTE: contact page + site-wide all-black footer (IMG_1123/1125/1127) owned by
the parallel terminal-B session (ownership note in the contact ledger).

## Remediation V3.5 — Full frame re-review + elevation (2026-07-09 early)

Second pass on Brian's order: all 67 frames of the 4 remediation videos
re-reviewed one by one + whisper-MEDIUM re-transcription — zero wording
deltas; hero paragraph boundary restored to Joe's own punctuation (em dash
after "damage", period after "reconstruction" — change doc §1 updated).
Elevation on the frozen verbiage: hero media wipe-in + transform-only line
rises; NS-Perspectives rolling question strip above the FAQ cards
(scrub-staggered); approach rows with scrub-filled maroon plumb rail +
step-keyed sticky photo crossfade (inspection → rebuilt); dual-depth method
parallax; CTA equipment plates settle on scrub with drawing maroon seam
(Flair E8 / 277 MR photos still PENDING from Joe).
QA: functional-qa PASS both viewports (0 errors), preflight:full 16/16,
Lighthouse prod desktop Perf 99 / A11y 96 / BP 100 / SEO 100 — zero
non-footer contrast fails (transform-only scrubs; parent-opacity dims fail
axe at load state). Shipped to ns-preview.

## Services Landing V3.1 — Full frame re-review + elevation (2026-07-09 early)

Second pass on Brian's order: all 114 frames of the 4 services videos reviewed
one by one → `.claude-work/research/services-v3/REQUIREMENTS_LEDGER.md` (every
ask timestamped with frame evidence; 16/17 met, homeowner-admiring photo still
pending from client — TODO in component). Confirmed on-camera detail: Joe taps
"Riverside Passive House" on NS and the row inks + photo swaps — exactly the
built focus/hover mechanic. Elevation: index photo flush under the header (NS
geometry), position-only list drift entrance, scale-settle (1.07→1.0 scrub) on
vision/band photographs, maroon reading-progress seam on the values panel.
QA: preflight 16/16 ×2 (commit + push gate), functional-qa PASS both
viewports, verbatim probe 21/21, smoke all routes, Lighthouse prod desktop
Perf 99 / A11y 96 / LCP 0.9s. Shipped: commit 59e6f5b → ns-preview →
https://828-ns-preview.vercel.app/services (deploy Ready, phrases verified
live). Deploy note: exclude `.next-dev` in the robocopy mirror (245MB
turbopack cache breaks Vercel's 100MB file limit).

## ADU Page V3.1 — Full re-review + design upgrade (2026-07-08 late night)

Second pass on Brian's order: all 4 videos re-reviewed at 1 frame/sec (153
frames) + whisper-medium re-transcription — zero verbiage deltas, change doc
verified. Design upgraded: letter-cascade vertical hero + scroll cue, NS
checkerboard FAQ with interleaved ADU photo cells (right-anchored row 2),
acronym letter rail + hairline draws, invitation flow tightened with staggered
question cascade. Lighthouse prod: Perf 100 / A11y 96. functional-qa PASS both
viewports.

## Services Landing V3 — Joe's Video Verbiage Batch (2026-07-08 night)

`/services` rebuilt from Joe's 4 feedback videos (IMG_1075/1077/1080/1082,
OneDrive); change doc `docs/828_SERVICES_JOE_FEEDBACK_2026-07-08.md`, verbiage
now FROZEN. Structure: whited-out NS Selected-Works index (rows illuminate in
the focus band, sticky photo crossfades + caption — page signature) →
"Where your vision meets uncompromising quality." full-bleed photo split
(PLACEHOLDER pending Joe's homeowner-admiring photo, TODO in component) →
"Ever present" photo/ink split with 01–04 principles (numbers/titles vs
phrases, focus ignition) → "Guided by our foundational principles…" + 6-stage
strip that slides across the screen on scrub + full-bleed CTA band ("Committed
to bringing your vision to life." / PHASE ONE). Instrument doodles deleted per
Joe; footer untouched per Joe.
QA: tsc clean; functional-qa PASS desktop+mobile; verbatim-verbiage probe
21/21; site-smoke all routes OK; preflight:full 16/16; Lighthouse prod desktop
`/services`: Perf 99 / A11y 96 / LCP 0.8s (a11y pass required un-hiding the
H2s — axe skips visibility-hidden headings, breaking heading order — and
lifting all dim-state colors to WCAG floors). New PATTERNS.md Fix 23:
IntersectionObserver never fires on fully-clipped elements.

## Remediation Page V3 — Joe's Video Verbiage Batch (2026-07-08 night)

`/services/remediation` rebuilt from Joe's 4 feedback videos (IMG_1103/1111/
1112/1113, OneDrive\Pictures); change doc
`docs/828_REMEDIATION_JOE_FEEDBACK_2026-07-08.md`, verbiage now FROZEN.
Structure: "828 — creating healthier environments…" asymmetric hero →
"When mold remediation is necessary" FAQ cards (light zone, header morphs) →
"The approach / Build philosophy" 01–04 focus rows + sticky photo →
re-verbiaged method section ("828's integrated remediation and restoration
approach…") → "Where recovery begins" CTA + Flair E8 / 277 MR equipment
plates (page signature; REAL EQUIPMENT PHOTOS PENDING from Joe — his note
attaches a picture but it's unreadable in video). FAQPage JSON-LD added.
QA: tsc clean, remediation-fixes functional-qa PASS desktop+mobile (0 console
errors — the old mount warning is gone with the rewrite), npm run
preflight:full exit 0. Leftover note copy not assigned on camera ("This
expertise had led to an advanced remediation process…") documented in the
change doc — confirm placement with Joe.

## ADU Page V3 — Joe's Video Verbiage Batch (2026-07-08 night)

`/services/adu` rebuilt from Joe's 4 feedback videos (IMG_1086/1092/1094/1095);
change doc `docs/828_ADU_JOE_FEEDBACK_2026-07-08.md`, verbiage now FROZEN.
Structure: vertical "Built with intent" hero → FAQ card grid (light zone,
header morphs) → "What ADU means to 828." A/D/U rows + drifting watermark →
"An invitation to work together" + 01–04 qualifying questions. QA: tsc clean,
adu-fixes functional-qa PASS desktop+mobile, site-smoke /services/adu OK.
Shipped to ns-preview (branch + https://828-ns-preview.vercel.app).
Pre-existing, untouched, still open: /services/remediation React
state-update-warning on mount; header BOOK CALL button absent (smoke script
expects it). Services landing V3 (prior batch) was still uncommitted in the
working tree when this session started.
## Portfolio Remodel Gallery Revamp (2026-06-02)

Portfolio was reorganized around the new Cerritos and Tustin bath remodel documentation. The page now opens with a photography-first project board, keeps the existing case-index hover/click section and bottom work wall, and replaces the old lightbox with a project dossier modal. The fake-looking foundation photo is no longer presented as work photography; that project now renders an explicit documentation-pending plate.

- Latest preflight report: `.claude-work/preflight/2026-06-02-04-38/report.json`
- Verification: `npx tsc --noEmit`, `npm run lint`, `npm run build`, Playwright desktop/mobile portfolio modal checks, `npm run preflight:full`
- Full preflight result: 16/16 route/viewport checks passing, nav/SplitType cleanup passing, hard-refresh stability passing

## Push + Local Cleanup Handoff (2026-05-26)

Requested action was `PUSH AND CLEAN`. No source changes were pending at the start. `git push` ran the repo pre-push gate, which performed a full production build and route audit; all 16 desktop/mobile route checks plus nav/SplitType cleanup and hard-refresh stability passed.

- Latest pushed commit before notes: `44ae824 chore: update preflight marker`
- Latest preflight report: `.claude-work/preflight/2026-05-26-21-09/report.json`
- Verification from push hook: `npm run preflight:full` equivalent, 16/16 route checks passing
- Safe local cleanup performed: removed `.next`, server logs, Playwright report/output, and TypeScript build info; did not remove `.env.local`, `node_modules`, source files, docs, or client assets
- Local servers on `3001`, `4000`, `4001`, and `4028` were stopped after cleanup
- Working tree was clean and `main` matched `origin/main` after pushing the updated preflight marker

## Sitewide Cleanup + Production QA (2026-05-21)

All public routes were visually reviewed at desktop and mobile, portfolio imagery was pulled back from generated-looking live project slots, page metadata titles were normalized, and about-page mid-scroll image loading was hardened.

- Latest report: `.claude-work/preflight/2026-05-21-22-57/report.json`
- Verification: `npm run lint`, `npx tsc --noEmit --pretty false`, `npm run build`, production desktop+mobile visual audit, `npx playwright test tests/portfolio-production.spec.ts --project=chromium`, `npx playwright test tests/stress.spec.ts --project=chromium --workers=1`, `npm run preflight:full`

## Local Dev Port Pin (2026-05-21)

This repo is permanently pinned to `http://localhost:3001` for local development. `npm run dev` runs `next dev -p 3001`. Port `3000` is another local app and must not be used to review 828 Construction.

## Portfolio Production Hardening + Client-Ready QA (2026-05-21)

Portfolio case-index preview, client-facing project imagery, contact above-fold image visibility, and stress tests were hardened for production refresh/navigation use.

- Latest report: `.claude-work/preflight/2026-05-21-20-51/report.json`
- Verification: `npm run lint`, `npx tsc --noEmit --pretty false`, `npm run build`, production route/image audit at desktop+mobile, `npx playwright test tests/portfolio-production.spec.ts --project=chromium`, `npx playwright test tests/stress.spec.ts --project=chromium --workers=1`, `npm run preflight:full`

## Mobile Polish + Image Loading Hardening (2026-05-20)

Shared header/footer tap targets, services mobile spacing, and portfolio/lightbox image loading were tightened. Full production preflight passed with all 16 route/viewport checks plus nav cleanup and hard-refresh stability.

- Latest report: `.claude-work/preflight/2026-05-20-19-55/report.json`
- Verification: `npm run lint`, `npx tsc --noEmit --pretty false`, `npm run build`, `npm run preflight:full`

## V2.5 FIX — Homepage Cinematic Overhaul (2026-05-06)

**Session:** Prompt 1 of the cinematic fix series. 10 feature commits + 12 preflight stability commits. All 16/16 routes passing. Branch: `main`.

### What shipped this session

**Phase 0 — Context rewire (same session, earlier):**
- `docs/828_CLIENT_BRIEF_V2.md` — full V2 brief from Joseph iteration call
- `lib/constants.ts` — `ACCENTS` + `ACCENT_PRIMARY` tokens added
- `app/globals.css` — `--color-accent: #7B2D26` (maroon primary), `--color-accent-fallback: #B87333` (copper retained), gradient tokens, global accent refs normalized
- `design/828_DESIGN_SYSTEM.md` — V2 palette dual-token, typography hierarchy rule, V2 header rules, motion vocabulary section
- `design/PATTERNS.md` — 4 new patterns: asterisk dropdown, rolling marquee, glass/depth overlay, asymmetric hero split
- `CLAUDE.md` — V2 section at top with locked decisions + rebuild order

**V2 page rebuilds (separate terminals, same session):**
All 9 pages rebuilt per V2 brief. See page status table below.

**V2.5 elevation pass (same session):**
- `components/system/GrainOverlay.tsx` — SVG fractalNoise component (replaces CSS div)
- `components/system/RightScrollProgress.tsx` — right-edge vertical maroon progress bar
- `components/system/GlassCard.tsx` — `backdrop-blur-xl` + maroon hairline top
- `components/system/silhouettes/` — 6 architectural SVGs: Hardhat, Level, BlueprintCorner, ArchOutline, ConstructionLine, Compass
- `lib/hooks/useMagnetic.ts` — GSAP `quickTo` magnetic hook, touch-guarded
- `lib/hooks/useSectionScrub.ts` — pin+scrub abstraction hook
- `lib/hooks/useTilt.ts` — GSAP rotateX/Y 3D tilt hook
- `docs/828_V2_5_ELEVATION.md` — elevation plan reference
- `app/template.tsx` — cinematic curtain page transition (black drop + maroon hairline swipe)
- `components/portfolio/PortfolioCinemaRow.tsx` — horizontal pin-scroll cinema strip
- `components/system/RevealImage.tsx` — image reveal on viewport entry
- All 9 pages: silhouette parallax overlays, glass cards on definitions/FAQs, 2-layer marquees, magnetic CTAs, maroon cursor
- Custom scrollbar maroon, `::selection` maroon, GrainOverlay 0.055, Lenis 1.4s duration

**Homepage Cinematic Overhaul (this prompt):**

| File | Change |
|------|--------|
| `SplashScreen.tsx` | `rotateX: 88→0` 3-channel reveal, maroon radial ignition pulse, curtain-wipe exit (not fade) |
| `Header.tsx` | Sub-nav marquee strip (35s, always-on), BOOK CALL `pulse-glow` CSS animation, magnetic 0.55 |
| `HeroV2.tsx` | Mesh gradient blobs (idle drift, `sine.inOut` yoyo), `ArchOutlineSilhouette` 65vw/0.55 opacity + idle float + -85% parallax, photo scale 1.10, copy block -20%, headline rotateX on load (delay 0.6s), headline scroll fade-out |
| `ServicesPreviewV2.tsx` | `useTilt(10)` 3D tilt on cursor, z:40 lift + maroon ghost shadow on hover, rotateY entry animation |
| `AboutPreview.tsx` | SplitType clipPath curtain-wipe on headline, `ConstructionLineSilhouette` 0.08 opacity -40% parallax, magnetic CTA |
| `Footer.tsx` | Background marquee layer: 2.2rem font / 0.18 opacity / 70s reversed; foreground 9px / full opacity — visually distinct |
| `CustomCursor.tsx` | `.has-custom-cursor` body class on `pointer:fine` — hides native cursor; ring 36px/64px hover |
| `globals.css` | `@keyframes pulseGlow` (book-call-cta), `.has-custom-cursor * { cursor: none }`, `.book-call-cta` class |

**Preflight stability hardening (Windows OOM prevention):**
- Pre-build `.next` wipe, NODE_OPTIONS 4096MB, periodic server restart between routes, 1 screenshot/route, chromium `--disable-dev-shm-usage` flag, 1.2s test gaps

### Above-the-fold idle motion (5-second test after Prompt 1)
All 6/6 visible without scrolling:
- Mesh gradient blobs drift
- Silhouette Y-bob (sine.inOut yoyo)
- Timestamp ticks every second
- Sub-header marquee runs continuously
- Headline chars reveal on load (delay 0.6s)
- BOOK CALL pulse-glow ring

## V2.5 FIX — Prompt 3 Complete (2026-05-06)

Portfolio + Services Landing + Global polish shipped and pushed to `origin/main`.

### New components/files added
- `app/template.tsx` — Cinematic curtain page transition (black drop + maroon hairline swipe)
- `components/portfolio/PortfolioCinemaRow.tsx` — Horizontal pin-scroll cinema strip with containerAnimation
- `components/system/RevealImage.tsx` — Image reveal on viewport entry (mask/blur/scale)
- `lib/hooks/useTilt.ts` — GSAP rotateX/Y 3D tilt hook

### Global systemic upgrades
- `::selection` → maroon (`var(--color-accent)`) with white text
- Custom scrollbar → maroon thumb (Webkit + Firefox)
- `GrainOverlay` opacity bumped 0.035 → 0.055
- Lenis duration 1.4 (was 1.1), easing exponent -8 (was -10)
- Page transitions replaced: 250ms fade → cinematic curtain (0.7s)
- `ContactForm.tsx` focus border: copper → maroon + 240ms transition

### Portfolio upgrades
- Cinema strip (3 photos horizontal pin-scroll with parallax-blur peaking at center)
- Featured full-screen takeover section (P[2] outdoor-living, settling scale + char reveal)
- GalleryTile: scrub-tied curtain reveal, hover lift (-6px) + maroon ghost shadow + caption slide

### Services landing upgrades
- 3D tilt (rotateX/Y 10deg) on cursor hover for all 3 tiles
- Maroon ghost shadow `0 40px 80px rgba(123,45,38,0.6)` on tile hover
- `perspective: 1200px` + `overflowX: clip` on tile wrapper
- `ConstructionLineSilhouette` opacity 0.04 → 0.10 + slow rotate (240s)
- `pulse-glow` class on BOOK CALL CTA

## Site Status (as of 2026-04-29)

All 9 routes complete. Four-workstream quality pass complete. All pages Perf ≥85, A11y ≥96.

| Page | Perf | A11y | Status |
|------|------|------|--------|
| Home `/` | 99 | 96 | ✅ Done — 25+ years, splash screen, copper cursor, live time |
| About `/about` | 99 | 96 | ✅ Done — founder profile, editorial timeline, 25+ years |
| Services `/services` | 99 | 96 | ✅ Done — service row GSAP hover, 25+ years |
| Services/ADU | 98 | 96 | ✅ Done — PinnedWhy, embedded form, 25+ years |
| Services/Remediation | 94 | 96 | ✅ Done — same template, 25+ years |
| Services/Consulting | 98 | 96 | ✅ Done — same template, 25+ years |
| Process `/process` | 96 | 96 | ✅ Done — pinned timeline, 25+ years counter |
| Contact `/contact` | 96 | 96 | ✅ Done — NEW dark form card, field validation, honeypot, animated checkmark |
| Projects `/projects` | 99 | 96 | ✅ Done — filter tabs, gallery, 25+ years |

## Form Status (NEW — 2026-04-29)

- **ContactForm.tsx** — fully redesigned: dark card (`bg-[#0a0a0a]`), white labels, copper focus rings, field-level validation, honeypot, loading spinner, animated SVG checkmark success state
- **ServicePageContactForm.tsx** — improved: honeypot, double-submit guard, animated SVG checkmark, loading spinner
- **API route** — rate limiting (5 req/10min/IP), honeypot check, server-side validation, graceful console fallback when no Resend key
- **Resend API key** still pending from client (Joe P) — form works in dev with console logging

## Stress Test Suite (NEW — 2026-04-29)

`tests/stress.spec.ts` — 21 tests, all passing against production build:
- Rapid navigation between all 9 routes
- Projects filter tab spam
- Form stress (empty submit, XSS input, double-submit)
- Scroll velocity (rapid scroll up/down, counter no-reverse check)
- Viewport resize stress (1440→320→768→1440)
- Keyboard navigation
- Browser back/forward navigation
- Mobile overflow audit (all 9 routes at 390px)

Run with: `TEST_BASE_URL=http://localhost:4000 npx playwright test tests/stress.spec.ts`

## Pending Client Items (blocking launch)

- [ ] Real project photography (currently placeholder/AI-generated)
- [ ] Resend API key for contact form (`RESEND_API_KEY` in `.env.local`)
- [ ] Google Business Profile link
- [ ] Domain confirmation (828constructions.com)
- [ ] Favicon set verification

## Work Plans (reference)

`.claude/work/01-visual-revamp.md` — Visual QA protocol
`.claude/work/02-mobile-audit.md` — Mobile + footer audit
`.claude/work/03-stress-test.md` — Stress test protocol
`.claude/work/04-form-implementation.md` — Form implementation spec
