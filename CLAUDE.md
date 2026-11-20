# 828 Construction — Project Rules

Start with [AGENTS.md](AGENTS.md) for the OneDrive AI_Brain workflow and this project's current shared context. Keep the project rules below; record current status in the shared brain.

This file is read by Claude Code automatically at the start of every session in
this project. It contains non-negotiable rules. If anything here conflicts with
skill instructions, this file wins.

---

## V2 DESIGN LANGUAGE — CURRENT (May 2026)

The V2 brief lives at `docs/828_CLIENT_BRIEF_V2.md`. Read it before any page-level work.

### Locked decisions
- **Accent color:** Maroon `#7B2D26` is primary. Use `var(--color-accent)`. Copper `#B87333` retained as fallback only (`var(--color-accent-fallback)` / `var(--accent-copper)`).
- **Founding year:** 2004 (typed-notes typo of 2025 ignored — verbal call confirms 2004).
- **Bold display font:** Reserved for "828" wordmark and main hero anchor headlines ONLY. Everything else uses lighter weights.
- **Header:** One-line "828 Construction" wordmark LEFT, location+timestamp RIGHT, "BOOK CALL" CTA with asterisk-dropdown phone reveal.
- **Splash:** Black vertical gradient (`var(--gradient-splash-vertical)`), one-line wordmark, letter-by-letter reveal, slightly larger than V1.
- **Process page:** DELETED. Content merges into renamed `/portfolio` (was `/projects`).
- **Contact form:** ACTIVE. Owner-only Resend delivery to `828constructionca@gmail.com`; signed challenge, same-origin checks, honeypot, validation, rate limiting, and idempotency are mandatory. Third-party bot scoring must never hard-block a legitimate customer.
- **Portfolio photos:** Real only. AI-generated work photos forbidden. "Coming Soon" placeholders OK per Joe.

### Motion vocabulary
1. Scroll-scrub reveals (GSAP ScrollTrigger — already in stack).
2. Asterisk/plus dropdown reveals (Book Call header CTA, FAQ expanders on service pages).
3. Rolling marquees (footer top, About area names — `@keyframes marqueeScroll` already in globals.css).
4. Subtle glass/depth overlays — site must NOT feel flat.
5. Asymmetric splits (home hero, contact sections).
6. Image-sequence on scroll (reserved for once real photos arrive).

### Route-specific motion rule
- Each route must have its own motion grammar. Do not copy the homepage scroll pattern onto pages other than About.
- **EXCEPTION (Brian, 2026-07-08):** About carries the homepage stacked-surface grammar via `components/about/AboutFlow.tsx` (dark-surface port of EditorialFlow) — explicit owner override. Within-section reveal logic stays About-specific (CRAFT watermark drift + letter rail, documentary pacing).
- About should feel like a documentary/editorial profile: different section pacing, different reveal logic, and more proof-led composition.
- If an image reads as generic or AI-like, replace it with a better-fitting asset or crop rather than repeating the same visual trick.

### Git & deploy policy (LOCKED — August 2026, Brian's explicit instruction)
- This is a production-only repository. The only deployment branch is `main`.
- Pushing `main` auto-deploys the official site, https://828constructions.com, through the Vercel project `828-construction-website`.
- Never push or deploy without Brian explicitly asking to push, publish, deploy, or make the work live.
- Retired staging branches and projects must not be recreated.

### Standing rules
- **Production-only push policy:** "Commit and push", "push", "make it live", or "push to 828construction(s).com" means commit current work and push to `main` only.
- **Keep the dev server running (Brian, 2026-07-08):** At session start, verify that `http://localhost:3001` is the actual 828 site, not merely that the port responds. Start `npm run dev` in the background if it is free. If another project owns port 3001, leave it untouched, run 828 on `http://localhost:3011`, and report the fallback URL. Leave the 828 server running when the session ends.
- **Dual-machine workflow:** Brian works on this repo from BOTH a Windows desktop PC (`C:\Users\kingt\Desktop\Projects\828_website`) and a Mac laptop (`/Users/brianaiad/Code/Projects/828_website`), syncing through GitHub (`brian-aiad/828_Construction_Website`). At the START of every session: `git fetch` and fast-forward if behind before doing any work. At the END of any session that changed files: commit and push so the other machine picks it up. Never leave finished work sitting uncommitted — it strands the other machine on stale files.
- **Deploy environment:** The single official environment is `828constructions.com` — Vercel project `828-construction-website`, deployed from `main`. Validate changes locally and pass `npm run preflight:full` before every production push.
- **Local dev URL:** Prefer `http://localhost:3001` for this repo. `npm run dev` is pinned to `next dev -p 3001`; when that port belongs to another local app, use `npx next dev -p 3011` and verify the 828 page identity before judging changes. Port `3000` also belongs to another local app.
- All factual data traces to `lib/constants.ts`.
- Production build only for verification (port 4000).
- Chrome DevTools MCP for animation/scroll verification — Playwright is functional only.
- 18-route preflight gates `git push`.
- Atomic conventional commits per change area.
- `impeccable` pre-commit hook runs on every commit.

### Page rebuild order (separate terminals)
1. Splash — NS Builders vertical gradient treatment
2. Home — simplified to Hero + Services Preview + About Preview + Footer
3. About — story + 3 principles + CRAFT acronym + South Bay marquee
4. Services landing — creative discretion within design language
5. ADU page — visual hero + need + FAQ + 5-step process + ADU acronym + start-here
6. Remediation page — visual hero + need + 3 FAQs + 4-step process + why 828 + start-here
7. Consulting page — visual hero + need + 5 benefits + 3 Q&A + CTA
8. Portfolio (rename from Projects) — real photos + merged process content
9. Footer rebuild — rolling marquee + broken-color sections + schedule CTA
10. Contact page — ON HOLD until form infrastructure unblocks

---

## Read these before any code change

0. `design/828_DESIGN_DIRECTION_V4.md` — Brian's standing directive (2026-07-08): verbiage frozen, NS-simple + page-animated, NO billboard-scale text, asymmetric alternating motion, morphing header on every page, mobile designed not just tested. Applies to ALL future page passes and video batches.
1. `design/828_DESIGN_SYSTEM.md` — palette, type, animation catalog, component primitives
2. `design/PATTERNS.md` — Known Fixes section (21 solved bugs + 4 V2 patterns; use these, do not re-solve)
3. `~/.claude/skills/828-construction-methodology/SKILL.md` — the v3 autonomous build protocol
4. `~/.claude/skills/ux-architecture-methodology/SKILL.md` — UX architecture protocol (runs before motion skill on new pages; audit layer on existing pages)
5. `~/.claude/skills/828-preflight/SKILL.md` — pre-push test gate (run before declaring any page done)
6. `PROJECT-MAP.md` — exact file locations for every route, component, and image asset

## Quality bar

Any page being redesigned must reach parity with the About page
(`components/about/AboutContent.tsx`). That is the reference. Do not ship less.

## Forbidden patterns

- Navy, blue, or slate-reading-as-blue tones. V2 palette: black / white / gray ramp / maroon `#7B2D26` (primary accent) / copper `#B87333` (fallback only).
- `filter: grayscale(...)` on any image, ever.
- `filter: brightness(...)` below 0.9 on hero images — makes photos unreadable.
- `pinSpacing: true` (the GSAP default) without an explicit `minHeight` on the pin wrapper — causes visible white gaps after pinned sections.
- `overflow-hidden` on a section that contains pinned content — use `overflowX: 'clip'` instead.
- `opacity: 0` as initial state on above-the-fold text — kills LCP.
- Counter elements with no hardcoded fallback text content — always ship real values in JSX.
- SplitType without the 4-guard cleanup from `PATTERNS.md` Fix 1 (isConnected check, mounted flag, cancelAnimationFrame, try/catch).
- Pin sections where two panels can be visible at the same time — use `gsap.set()` opacity snap in onUpdate, not `gsap.to()` with duration.

## Definition of done

A page is not done until ALL of these are true:

1. `node .claude-work/research/{page}-fixes/functional-qa.mjs {URL} desktop` returns `PASS: true`
2. Same at `mobile` (390×844 viewport) returns `PASS: true`
3. **`npm run preflight:full` exits 0** — this runs `next build` + tests ALL 9 routes. Not just the changed page.
4. Production build (via `npx next start -p 4000`) Lighthouse: Performance ≥85, Accessibility ≥95
5. The page has been scrolled end-to-end at both viewports with no dead zones, overflow, or stacked content
6. The shared `Projects/828-construction/CONTEXT.md` has been updated with the verified result, commit, checks, and remaining work
7. Phase 4.5 visual audit: every major section has a PASS file with all 5 questions answered affirmatively, AND the functional-qa duplicateHeadings array is empty.
8. **/design-critique and /accessibility-review run as subagents** — block deploy if A11y score drops below 95

## Autonomous mode

For any task matching these keywords on any page — `redesign`, `revamp`, `polish`, `fix`, `v3 quality pass`, `bug fix pass`, `clean up`, `make it better` — invoke the `828-construction-methodology` skill and run its full six-phase protocol autonomously.

For any task mentioning UX, structure, flow, information hierarchy, user journey, above-the-fold, or when a page has motion quality but feels weird to use, invoke the `ux-architecture-methodology` skill FIRST (page architecture), then `828-construction-methodology` (motion quality). A beautifully animated wrong structure is still a wrong structure. UX always precedes motion.

- Do not ask for approval between phases.
- Do not send status updates.
- Do not interrupt.
- Deliver one final report when the Definition of Done above is satisfied.

Minimum elapsed for a full page redesign: 45 minutes. Minimum for a bug-fix pass: 15 minutes. If you finish sooner, the protocol was shortcut — back up and verify every deliverable exists.

## Anti-patterns observed in past sessions

- Reporting "done" in 10–15 minutes on a redesign task. Means Phases 1, 2, and 4 were skipped.
- Treating `functional-qa.mjs` as optional. It is not.
- Re-solving a bug already in `PATTERNS.md` Known Fixes with new custom code. Use the existing fix.
- Running Lighthouse against the dev server instead of production. Invalid result.
- Building a page without reading `design/828_DESIGN_SYSTEM.md` first — leads to palette drift and pattern inconsistency.

## Historical page snapshots

These dated entries preserve earlier implementation history. Read and update the shared project context for current status.

| Page | Status | Date |
|------|--------|------|
| Splash | V2.5 Cinematic — rotateX 88→0 3-channel reveal, maroon radial ignition pulse on entry, curtain-wipe exit (clipPath inset). V2 base: vertical gradient, ONE LINE wordmark, maroon underline, sessionStorage gate. | 2026-05-06 |
| Home (`/`) | V3.5 NS-grammar stacked-surface build — hero CSS-sticky pinned with Ken Burns drift; EVERY section holds still once read while the next surface rides over it (EditorialFlow measured sticky tops + cover scale/dim). Morphing header: white-on-photo over hero → #f7f7f3 glass with dark ink over the light surface (home only). Persistent DockedCTA "Book Call" card bottom-left (appears after hero, hides at footer). Fireplace photo scrubs inset-frame → full-bleed 92vh. Editorial-scale marquee. Maroon plumb line + ignition nodes. Word-fill scrub statement. Process rows ignite in the focus band. All copy verbatim. KNOWN CONTENT BUG flagged for client: "Refining industry standards." duplicated in HomeVisionSequence AND AboutPreview. Verify on `http://localhost:3001`; port 3000 is another app. | 2026-06-10 |
| About (`/about`) | V6 — Brian's screenshot-feedback pass on V5 (docs/828_ABOUT_BRIAN_FEEDBACK_V5.md), words frozen: compact dossier hero (no dead middle, hairline-draw proof rows, 92svh); condensed builder profile ("Observed/Not assumed." + "Field standard" chrome deleted) with JOE PORTRAIT SLOT — drop public/images/about/joe-portrait.jpg → renders next build/refresh (server-side fs.existsSync in app/about/page.tsx; pending JP plate until then); CRAFT letter-completion rows (each word slides out of its maroon-igniting capital — page signature, PATTERNS.md); tight South Bay marquee band + glass card; CTA split panel with drawing maroon seam. AboutFlow stacked surfaces, cover-scale top-anchored (junction artifact fixed). Verbiage source: docs/828_ABOUT_JOE_FEEDBACK_2026-06.md. Research: .claude-work/research/about-v3/. | 2026-07-08 |
| Services (`/services`) | V3.3 — Joe's video verbiage (FROZEN, docs/828_SERVICES_JOE_FEEDBACK_2026-07-08.md) on the site-wide cover-scroll grammar: ServicesFlow stacked surfaces (AboutFlow port) carry [pinned traveling-picture index (210vh runway, ~70vh per service)] → [vision split w/ homeowner photo] → [Ever present values split — four close-ups rotating per igniting principle] → [Guided-by sentence + sliding 6-stage strip + CTA band] → footer. Two clean frame sweeps both viewports; Lighthouse prod Perf 99 / A11y 96. | 2026-07-09 |
| Services/ADU (`/services/adu`) | V3.2 — Joe's 4-video verbiage batch verbatim (docs/828_ADU_JOE_FEEDBACK_2026-07-08.md, words frozen, twice frame-verified incl. whisper-medium): letter-cascade "Built with intent" vertical hero + maroon plumb line; NS checkerboard FAQ (4 cards + 2 ADU photo cells, +/× expanders); "What ADU means to 828." A/D/U rows + drifting watermark (signature); "An invitation to work together" + 01–04 questions. V3.2: wrapped in About stacked-surface grammar via AduFlow.tsx (sticky covers, veil, plumb nodes; ResizeObserver for FAQ-expander height changes). V3.3 (Brian round 3): FAQ = tall photo + 2×2 card checkerboard with home word-fill statement; acronym = letter rows with word-fill definitions + sticky crossfade photo panel keyed to the igniting letter; photo slots swap-ready for new client images. 2× frame sweeps clean both viewports; Lighthouse Perf 99 / A11y 96. functional-qa: .claude-work/research/adu-fixes/. | 2026-07-10 |
| Services/Remediation (`/services/remediation`) | V3.5 — full-coverage re-review (all 67 frames + whisper-medium re-transcription, zero wording deltas; hero paragraph boundary restored to Joe's punctuation) + motion/flow elevation on the V3 verbiage build: hero media wipe-in + transform-only line rises (LCP-safe); NS-Perspectives rolling question strip above the FAQ cards (scrub-staggered); approach rows gain a scrub-filled maroon plumb rail + step-keyed sticky photo CROSSFADE (inspection → rebuilt); method photos on two parallax depths; CTA equipment plates (Flair E8 / 277 MR — real photos PENDING from Joe) settle in on scrub with drawing maroon seam. Verbiage frozen per docs/828_REMEDIATION_JOE_FEEDBACK_2026-07-08.md. QA: functional-qa PASS both viewports, preflight 16/16, Lighthouse prod Perf 99 / A11y 96 (zero non-footer contrast fails). **V3.6 (2026-07-09): About scroll system applied** — sections carried by RemediationFlow (faithful AboutFlow copy: measured sticky tops, opacity-veil covers, plumb line + igniting nodes) with a ResizeObserver guard for FAQ-expander height changes; in-surface animations converted to sticky-proof drivers (IO once-reveals for cards/plates/seam, live-rect state rail, photo fade-settles replace clip wipes — clip mid-states read as slivers in the stacked flow). Frame-by-frame sweeps 2× consecutive clean at 1440×900 + 390×844, incl. all-answers-expanded junction test. Content/verbiage untouched. | 2026-07-09 |
| Services/Consulting (`/services/consulting`) | V3 — Joe's 4-video verbiage batch applied verbatim (docs/828_CONSULTING_JOE_FEEDBACK_2026-07-09.md, words frozen): hero "Building solutions beyond the blueprint." cream asymmetric split; "Delivering considerate solutions." ink section with 01–05 Benefits ledger (focus-band ignition + maroon progress rail); "Questions and answers" card grid (ADU/Remediation grammar) with always-visible self-selection prompts (page signature — asymmetric col spans, no accordions); clean "Engineered solutions tailored to your project" statement CTA (doodles + side pill deleted per Joe) flowing into the black footer. Zone-aware header (light hero/FAQ, dark solutions/CTA). V3.1: wrapped in the About stacked-surface scroll system via ConsultingFlow.tsx (sticky covers, opacity veil, plumb line + diamond nodes) — 2x seam sweeps clean both viewports. QA: functional-qa PASS both viewports, verbiage probe 16/16. Research: .claude-work/research/consulting-v3/. | 2026-07-09 |
| Process (`/process`) | DELETED — 308 redirect to /portfolio | 2026-05-06 |
| Contact (`/contact`) | V4.2 — Joe's frozen contact-page design plus active owner-only Resend delivery. Security is first-party and deterministic: signed short-lived challenge, same-origin enforcement, honeypot, bounded/validated input, per-IP throttling, provider retries, and idempotent duplicate suppression. Vercel BotID hard rejection was removed after a real-browser false positive (Fix 28); vendor bot classification may never block a legitimate lead. UI keeps the compressed hero, form-first flow, critical-elements ledger, service-path runway, South Bay row, and stacked-surface treatment. QA: contact security, browser regression, functional QA, and full preflight. Research: .claude-work/research/contact-fixes/. | 2026-08-25 |
| Portfolio (`/portfolio`) | V4 REAL-WORK REVAMP (Brian voice directive 2026-07-13): the page IS the three photographed residences — compact V4-scale hero (statement + residence index + real triptych, no fabricated content anywhere) → three case-dossier surfaces (Cerritos cream lead-left/sticky-ledger, El Sereno black full-bleed banner + two-chapter bath/deck grid, Tustin cream dossier-bar + offset grid), each with curated selects (contact-sheet evidenced, .claude-work/research/portfolio-revamp/sheet-*.png), scope/location/spec/documentation ledger, and "Open the full set" per-case lightbox (37/42/44 photos) → "Next up" Redondo Beach example plate (tempPhoto, labeled IN PROGRESS — PHOTOGRAPHY PENDING per Brian: fabricated projects DELETED from lib/constants.ts, one example allowed) → CTA. Signature: traveling contact strip (PATTERNS.md). Surface-aware veil ported (0.08 cream). Header zones added (V4 morphing). Deep links #cerritos/#el-sereno/#tustin preserved + verified direct AND via home cards. QA: functional-qa PASS both viewports (0 errors/dupes/stuck), seam sweeps 2× clean both viewports, settle tortures 21/21+17/17 clean 2× (harness clean-check upgraded to Fix 26 lesson-4 flush-rest definition), text-fit 0×2, lightbox full-cycle both viewports. Page height 20.3k→8.9k px. | 2026-07-13 |
| Footer (site-wide) | V3.1 TWO-TONE BOXES (Brian 2026-07-13): photo panel + charcoal #161616 nav/copyright box + warm bone #e8e4dc Serving box (ink text, maroon-bordered license chip) — black→charcoal→bone tonal steps; marquee repetition gap tightened (pr-4) so 828 CONSTRUCTION loops as one continuous train. V4 NS-REFERENCE REBUILD (Brian 2026-07-13, image-matched): black bar at snap (data-header-dark), 2fr/1fr/1fr panels at 55svh — photo | NS light-gray #ECEBE7 nav (ink links, indented, centered) | white serving; giant bottom-cropped rotating wordmark overlay (BrandMarqueeBottom giant preset). V3.2 FULL-SCREEN COVER (Brian 2026-07-13): footer is the site-wide last stacked surface — every flow pins+veils its final section beneath it (100svh runway + :has() overlap), min-h-svh footer owns the viewport at rest, junction settle snaps it (PATTERNS: Full-screen footer cover). Top band + Book-a-Call photo panel unchanged; V3 all-black base per Joe IMG_1127 retained elsewhere. | 2026-07-13 |

## Project context

- **Stack:** Next.js 16 (Turbopack), Tailwind CSS v4, GSAP + ScrollTrigger, SplitType, Lenis, Resend, Vercel Analytics
- **Fonts:** Space Grotesk (display), Space Mono (numbers), IBM Plex Mono (labels)
- **Reference aesthetic:** NS Builders (Boston) — editorial, photography-first, scrub-dominant motion
- **Client:** Joe P, 828 Construction, Torrance CA (CA License #1141119, est. 2004)
- **Logo:** `828logo.png` + `828logo_trans.png` exist in project root — wire non-transparent version in Header

## Current shared context

Follow [AGENTS.md](AGENTS.md) and the shared `WORKFLOW.md`. Read and update `AI_Brain/Projects/828-construction/CONTEXT.md` for current status, checks, decisions, and next steps.

The tracked files in `.claude/project-context/` are historical source notes. Preserve them and consult them only for a specific earlier decision; do not maintain a second current-status stream there.

## Historical client checklist

This older checklist is retained as history. Confirm present-day client/setup needs in the shared project context and live configuration before acting on an item.

- Real project photography (currently using placeholder/AI-generated)
- Resend API key for contact form
- Google Business Profile link
- Domain confirmation (828constructions.com)
- Favicon set verification in `app/layout.tsx`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
