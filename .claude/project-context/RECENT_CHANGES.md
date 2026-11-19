# 828 Construction — Recent Changes

## 2026-10-19 — Cross-device startup verification

- MacBook and Windows desktop source files match; root, services, and contact start successfully. Browser checks passed on eight routes at desktop/mobile widths; 15 contact security tests passed.
- Development commands and watchdog now use Webpack on port 3001, matching the verified server. PDF files are marked binary to preserve exact bytes on Windows. Changes remain unpublished.

_Append entries here newest-first. Date all entries._

## 2026-08-25 — Contact form false-positive hard block removed

- Removed Vercel BotID after a real browser was incorrectly classified as an
  automated submission and blocked before validation.
- Preserved signed challenges, same-origin checks, honeypot, strict validation,
  per-IP throttling, owner-only delivery, retry handling, and Resend idempotency.
- Added a permanent seven-profile customer matrix covering Chrome, Safari,
  Firefox, Edge, iPhone, privacy, and embedded-browser requests without
  vendor-specific bot-classification headers.

## 2026-07-14 — SITE EXCELLENCE PASS: mobile + reveals + stress hardening (7 agents)

- Brian's "biggest edit": every page amazing on every screen, every animation
  unbreakable by a user, word animations where sections sat static — format
  and verbiage frozen, desktop pixel-equivalent (proven per page with
  before/after captures; the chrome pass used a masked control diff).
- SYSTEMIC ROOT CAUSE FOUND: AnimationController.shouldAnimate() is false
  below 1024px, so every page rendered STATIC on mobile ("nothing pops up
  when you scroll" verbatim). Each page now runs the house IO-decisive
  reveal grammar on mobile — failsafe-tagged y+opacity states, reduced-motion
  never hides, above-fold stays visible (LCP) — while scroll-hijack motion
  (settle, walks, parallax) stays desktop-only by design.
- REAL BUGS FIXED: consulting benefits rows 02-04 could NEVER ignite on any
  viewport (Fix 27 short-pinned trap; useFocusIndex rewritten to cover-rise
  progress anchored min(secH,vh), verified 0>1>2>3>4 fwd+rev at 4 widths);
  LenisProvider force-reveal restored opacity but not visibility (autoAlpha-
  hidden elements were "rescued" invisible — now autoAlpha:1); About's
  useReveal/standards/portrait were riding the 2.5s failsafe instead of
  firing (converted to IO-decisive, visuals identical).
- MOBILE FIXES: home hero eyebrow + all 5 process titles hold one line to
  360px; ADU FAQ density (page ~185px shorter) + tap targets; consulting
  tablet Q&A gap filled + 3 links to 44px; contact call CTA 44px; header
  wordmark/menu 44px hit areas (zero rendered pixels — control-diff proven);
  footer nav links to 27px (WCAG AA 24px floor; 44px needs visible respacing
  — declined per format freeze).
- NEW ENTRANCES: contact form slides in from the side + two-beat band
  (Brian's example); ADU hero fade-up + per-word headline stagger; mobile
  reveals across home/remediation/consulting/contact/adu.
- STRESS: per-page torture suites (fling x10, wheel-spam during settle,
  FAQ churn while scrolling, focus-then-scroll, keyboard traversal,
  resize mid-scroll, tab blur/focus, 5-offset hard refresh, nav-away-back)
  — all green, 0 console errors anywhere.
- Integration re-verified on the combined tree WITH the concurrent
  footer-cover + NS footer + Portfolio V4 work: tsc clean, all 7 flows
  settle clean (footer riding as a surface), home walk 5/5, consulting
  benefits 5/5 at 3 widths, functional-qa PASS both viewports.
- Commits: adu 5413bf2, about beda0b3, home 8e99727, contact 357fd17,
  failsafe 8d14383, header 211311a, remediation 806d14d, consulting
  69e042d (pushed to main → production). Services' agent edits landed via
  the concurrent c31a177; its verification completed by the coordinator.

## 2026-07-13 — Footer NS round 2: Brian's side-by-side fixes (terminal B)

- Wordmark confined to the white serving box only (lg:w-1/4, bottom padding,
  fully visible — no crop), sized to the panel (giant preset 2.9-5.2rem).
- Phone/email flush with the gray panel's left edge: top band 50/50 grid,
  both sized to fit one line in the column (2.8rem/2.45rem max).
- Book a Call smaller (clamp 1.25-1.55rem); socials -ml-2 so the first icon
  glyph is flush with the headline's left edge.
- QA: footer-cover probe 8/8, functional-qa PASS d+m, tsc clean.

## 2026-07-13 — Portfolio V4 real-work revamp (Brian voice directive)

- Brian: page read as "a bunch of things thrown into one place" — showcase the
  three REAL residences first, DELETE fabricated projects (Garage Conversion
  Glass Entry, Detached ADU New Construction, South Bay Outdoor Living + all
  stock one-offs), generate ONE example project in another South Bay city with
  temp photos, make it flow like the rest of the site.
- lib/constants.ts PROJECTS reduced to Cerritos / El Sereno (new entry) /
  Tustin (real, portfolioRank 1–3) + "Redondo Beach Residence" example
  (tempPhoto, honest "In progress — photography pending" presentation).
  Consumers audited: ProjectsPreview/ProjectsGallery unrouted; [slug] service
  route shadowed by static pages and empty-category safe.
- PortfolioContent rebuilt: compact V4-scale hero (statement + residence index
  + real triptych) → three case-dossier surfaces with curated selects (picked
  from indexed contact sheets, .claude-work/research/portfolio-revamp/) +
  scope/location/spec/documentation ledgers + per-case full-set lightbox →
  Next-up example plate → CTA. ResidenceGalleries.tsx absorbed and deleted;
  new components/portfolio/portfolioCases.data.ts composes PROJECTS +
  RESIDENCE_GALLERIES.
- New page signature: traveling contact strip (decorative scrub drift;
  PATTERNS.md per-page table updated — old cinema-strip entry was stale).
- PortfolioFlow: surface-aware veil ported from ContactFlow V4.1 (0.08 on
  cream — no gray-out). Header morph zones added (data-header-dark/light).
- Brian mid-build: "TAKE OFF THIS RULER COMPONENT" → DraftingMotionLayer
  removed from the portfolio hero.
- Settle-torture harness clean-check upgraded to the Fix 26 lesson-4
  flush-rest definition (min(vh, prevBottom)); lightbox harness now scrolls
  through Lenis before clicking (raw CDP scroll gets reconciled away).
- QA: functional-qa PASS d+m; deep links PASS direct + via home cards d+m;
  lightbox full-cycle PASS d+m; seam sweeps 2× clean d+m; settle 21/21 down +
  17/17 up 2×; text-fit 0 issues 2×; tsc clean. Page height 20.3k→8.9k px.

## 2026-07-13 — Footer rebuilt to the NS Builders reference (terminal B)

- Brian: copy the NS footer nearly exactly — elongated full-screen snap,
  same colors/positioning/panel sizes, black top bar at the snapped rest.
  All wording unchanged.
- Header goes BLACK over the footer (data-header-dark on the footer root —
  the zone-aware bar picks it up at snap, NS-style).
- Panels: NS proportions (photo 2fr | nav 1fr | serving 1fr, 55svh row; black
  top band fills the rest of the viewport). Nav panel = NS light gray #ECEBE7
  with ink links (indented, vertically centered, (c) block under the links);
  serving panel = white, vertically centered.
- Giant NS wordmark: new `giant` BrandMarqueeBottom preset (clamp 4.6-10rem)
  as a bottom-cropped overlay riding the light panels' bottom edge, rotating
  with the continuous train. Removed the small in-panel marquee.
- QA: footer-cover probe 8/8 still PASS post-rebuild; functional-qa PASS d+m;
  tsc clean; desktop + mobile rest screenshots match the NS reference.

## 2026-07-13 — Full-screen footer cover + snap, site-wide (terminal B)

- Brian: on every page the footer should end the scroll like the other
  sections — previous section blacked out/shaded beneath it, full screen,
  snapping like every junction. No wording/size/structure changes.
- Mechanism (PATTERNS "Full-screen footer cover"): all 8 flows pin their last
  surface + veil it under the footer; 100svh [data-footer-runway] spacer gives
  the pin room; FooterRevealWrapper = [data-footer-surface] z-20 pulled up
  100svh via :has() CSS so it truly covers; canonical useJunctionSettle now
  sees the footer surface document-wide; Footer is min-h-svh (top band
  breathes to fill).
- Debug trail: abutting footers never overlap (prevBottom == footerTop) so
  the settle could not engage — the runway + negative margin create a real
  cover junction with linear glide math.
- QA: footer-cover probe 8/8 routes PASS (final footer top 0, veil active,
  composed band stops); contact seam sweep + settle torture (down 22/22,
  up 18/18) clean; about sweep clean; functional-qa PASS d+m; tsc clean.

## 2026-07-13 — Footer two-tone boxes + continuous marquee train (terminal B)

- Brian: the all-black footer's info boxes should carry two different colors
  that match the site; wording/layout untouched. First try (deep maroon) read
  too red per Brian's live feedback — final: charcoal #161616 nav/copyright
  box + warm bone #e8e4dc Serving box with ink text (black -> charcoal ->
  bone tonal steps, site ink/cream family). License chip keeps the maroon
  border on bone.
- Rotating 828 CONSTRUCTION marquee: panel repetition gap pr-16 -> pr-4 so
  "CONSTRUCTION" runs into the next "828" — one continuous train per Brian.
- QA: tsc clean; contact functional-qa PASS; footer verified desktop+mobile
  screenshots. NOTE: site-smoke currently flags /portfolio (hidden headings
  after reload + a React mount warning) — traced to another terminal's
  uncommitted portfolio WIP in the tree, not the footer change.

## 2026-07-13 — Approach walk faster + full-screen statement + marquee moved into the approach

- Brian round 5: walk "takes too long" → runway trimmed 190vh → 120vh
  (~37% fewer scroll-notches per step; 5 steps still each get a lit moment —
  walk-verify 5/5 x3).
- Statement ("Our first step is listening / Refining industry standards.") is
  now a clean FULL-SCREEN section (lg:h-svh) — the white rolling marquee
  moved OUT from under it and now rides at the TOP of the approach panel,
  pinned with it for the whole walk. Panel gets lg:pt-[3.5rem] so the strip
  sits VISIBLY below the fixed header instead of pinned behind the bar
  (caught by rest-state probe; note: lg:pt-14 didn't generate in this
  Tailwind build — arbitrary value used).
- With the statement a true full-viewport screen, the statement→approach
  snap-edge dropped its 45%-commitment special case and behaves exactly like
  every surface junction (full band, direction-aware): down-stop anywhere in
  the transition completes into the approach, up-stop restores the statement
  fully composed. Scenario matrix verified all four gestures land flush.
- Regression: settle tortures 26/26 down + 20/20 up clean, functional-qa PASS
  both viewports, tsc clean.

## 2026-07-13 — Remediation: arrive-first step walk + site-wide occlusion audit

- Brian (video + screenshots): (1) FAQ rolling-questions strip parked half-cut
  under the header when the surface snapped; (2) the approach steps ignited
  while the section was still arriving — "go to the section first, then let me
  scroll through" like the other pages.
- FIX 1: FAQ section pt-24 (padding, NOT margin — a first-child margin
  collapses through the section boundary and the strip stayed at y=0). Strip
  now rests 96px from top vs header bottom 57 — CLEAR. Note: fd27e94's
  clearance tool skips aria-hidden nodes, which is exactly how the decorative
  strip escaped the site-wide pass.
- FIX 2: approach section rebuilt on the services-page "bulletproof walk"
  grammar — 260svh runway, panel lg:sticky/h-svh/centered, active step =
  pure function of scroll progress (~40svh per step), progress 0 until the
  section top reaches the viewport top so it ARRIVES FIRST with step 01 held;
  replaced the focus-ratio-tuned useFocusIndex (0.66 magic number gone).
  Mobile: no pin, monotone last-row-past-focus walk with arrival guard.
  Probe: pre-arrival→1, 10%→1, 30%→2, 60%→3, 90%→4, deterministic.
- SITE-WIDE strict occlusion audit (occlusion-audit.mjs — includes aria-hidden
  and images, closing the fd27e94 blind spot): every stacked surface on all 8
  routes rested at snap position, both viewports. Result: zero text
  occlusions; only by-design full-bleed hero photos bleed under the glass
  header. Two sub-standard rests fixed: remediation method mobile pt-28
  (photos tucked 17px under header) and portfolio CTA mobile pt-28 ("Ready to
  compare notes" at 0px air).
- Sweeps s6+s7 clean ×2 viewports (s7 console noise = concurrent-terminal HMR;
  isolated pass 0 errors); functional-qa PASS both; tsc clean.

## 2026-07-13 — Contact V4.1: whisper veil on cream + services runway walk (terminal B)

- Brian's V4 screenshots: prep section read "grayed out" (the black cover veil
  on a cream surface) and the paths rows should scroll like the services page
  without copying its look.
- ContactFlow veil now surface-aware: 0.08 max over [data-header-light]
  surfaces, 0.28 over dark ones.
- Paths: pinned 150vh runway walk on lg+ (useTravelIndex port — deterministic
  progress math), differentiated from services: 50vh/service pacing, smaller
  titles, stage indented 14% with a drawing vertical maroon bar. Mobile stays
  natural flow. South Bay box moved out of the runway section (was overlapping
  the pinned panel) — same stack surface, lands after the walk.
- QA: tsc clean; functional-qa PASS d+m; verbiage 15/15; seam sweeps 2x both
  viewports; settle torture down 28/28 + up 22/22 x2 (stable server).

## 2026-07-13 — Home statement→approach snap-edge + flush marquee (3 Brian rounds)

- Round 1: the statement→approach transition never snapped ("nothing happens
  when I peek") — it's an INTERNAL boundary inside the vision surface, not a
  flow junction, so the settle never saw it. Added data-snap-edge support to
  useJunctionSettle (EditorialFlow passes "[data-stack-surface],
  [data-snap-edge]"; the approach runway wrapper carries the attr).
- Round 2 ("fireplace gets skipped"): a full-width edge band spanned the
  statement's entire reading zone — any down-stop completed forward. Round 3
  ("now it yanks BACK on half scrolls"): nearest-edge targeting rejected too.
  FINAL SHAPE: snap-edges engage only once the reader commits past ~45% of
  the transition; stops shallower rest naturally; targeting stays
  direction-aware site-wide. Back-offs clamp to the containing surface's own
  snap (backMinY) so the previous surface can't peek above the restored
  statement. Bonus hook hardening: correction passes re-measure with a tight
  4px margin, and Lenis short-glide epsilon undershoot gets squared up with
  a direct scrollTo at rest.
- FLUSH MARQUEE (Brian): statement block + marquee now fill exactly one
  viewport on desktop (lg:h-svh flex column, photo flex-1, marquee at the
  bottom) — at the snapped rest the white marquee sits flush at the viewport
  bottom, no black runway bar peeking. Verified marqueeBottom == vh, headline
  80px clear above it, reveal completes to identity transform.
- Scenarios verified: small flick → natural rest (no yank either way);
  committed scroll → snaps into the approach; up out of the approach →
  statement restored composed. Walk 5/5 lit-in-view; settle tortures 34/34
  down + 26/26 up; functional-qa PASS both viewports; tsc clean.

## 2026-07-13 — Contact V4: design-fidelity pass on Joe's re-sent videos (terminal B)

- Brian re-sent the same 3 contact videos (20260621_23xxxx_iOS.MOV = IMG_1123/
  1125/1127, byte-identical) asking the page to match what Joe SHOWED: hero
  not full-page (form visible below the fold like the NS reference) and the
  last two sections brought up to home/about professionalism. Words frozen.
- Hero 88svh -> 54svh (NS proportion); Get-in-touch band + form now visible
  on load at both breakpoints.
- Critical elements: flat 4-col strip -> asymmetric split, 01-04 as an
  igniting ledger (focus-band ink + maroon rule).
- Focused service paths: side plates -> services-index stage grammar (dim
  full-width rows; active row opens a full-width picture stage, 950ms bezier,
  caption + maroon progress line; scroll-driven only). Same approved pictures/
  captions as the services rows. No pinned runway. South Bay stays as the
  shrunk fourth box.
- QA: tsc clean; contact functional-qa PASS d+m (0 errors, dup [], toast 0);
  verbiage 15/15; seam sweeps 2x clean; settle torture down+up 2x clean;
  reveal-probe PASS both viewports.

## 2026-07-13 — Header-clearance standard at snapped rests, site-wide

- Brian: snapping is loved, but sections rested with their first content
  nearly flush under the fixed header ("SINCE 2004", "One company," crammed
  below the bar). SITE-WIDE STANDARD: at every stacked surface's snapped rest
  (top=0, desktop 1440x900), clearance from the header's live bottom to the
  first readable content sits in the ~56–80px band. Top-padding-only edits —
  no verbiage/layout/design changes.
- Agents applied per-section padding across all 7 pages before hitting
  session limits; coordinator measured every surface post-edit with
  clearance.mjs (.claude-work/research/clearance-final/): home 63/414(hero
  para)/63, about 141(hero)/63/63/80/79, services 51(hero)/162/73/63, adu
  54/63/63/64, remediation 63/144/63/63/56, consulting 78/55/55/55, contact
  79/63/63/63, portfolio 47(card-edge, visually composed)/63/79/80/117 — all
  readable-content rests in band, symmetrical.
- BONUS FIX while verifying: /portfolio hero H1 clamp (7.5vw/8.2rem cap) was
  wider than its col-span-5 card, and the global overflow-wrap:break-word
  split "Remodels," from its comma — a line started with ", " (Fix 21
  class). Clamp retuned to 6.6vw/6.4rem cap: verified no punctuation-led
  lines and no overflow at 390/1024/1440/1920.
- Geometry re-verified post-padding (offsets all shifted): tsc clean; home
  walk 5/5 lit-in-view + settle 37/37 down 32/32 up; settle spots clean on
  about 11/11, services 41/41, portfolio 60/60, adu 11/11, remediation
  11/11, consulting 12/12, contact 15/15; functional-qa home PASS both
  viewports. ServicesPreviewV2's in-tree rework (Fix 22 IO reveals + real
  v3 photos) rides along, exercised by the same QA.

## 2026-07-12 — ADU V3.4: junction settle + compact acronym (Brian)

- SETTLE: AduFlow wired to the canonical junction-settle hook
  (components/system/useJunctionSettle via the home re-export). Verified the
  canonical short-surface band bound (prevBottom) covers the newly compact
  acronym — a stop in the ~100px pre-cover window below a sub-viewport
  section must NOT carry the reader a section forward.
- COMPACT ACRONYM (Brian screenshot: "too long, takes up the whole page",
  verbiage untouched): section 1088px → 768px desktop (fits one viewport;
  mobile 973 → 701). Row padding halved, letters clamp(2.4,3.8vw,3.4rem),
  words clamp(1.2,1.7vw,1.6rem), definitions inline-tight, photo panel now
  absolute-fills the rows column (no more viewport-tall sticky), watermark
  clamp(9,17vw,14rem).
- TORTURE (wheel-driven — the settle correctly ignores programmatic jumps,
  which is the anchor/deep-link guarantee; immediate-jump harnesses can't
  trigger it): 2× consecutive desktop runs clean under the real contract
  (junction complete ≤32px OR not-begun ≥ prevVisibleBottom−32); fling,
  mid-junction reversal, and scrollIntoView anchor all clean. Mobile: hook
  intentionally inactive (canonical desktop-only guard) — N/A by design.
- ANIMATION PRESERVATION: before/after frames at fixed offsets — hero + FAQ
  pixel-identical (0.0% delta); only the ordered compaction differs below.
- QA: tsc clean; functional-qa PASS desktop+mobile; no overflow.

## 2026-07-11 — FINAL POLISH PASS: every page to the home standard (Brian's "one last hurrah")

- Seven parallel agents, one per page + cross-cutting sweeps. Checklist per
  page: settle torture (down+up, prev-bottom-aware clean-check, 2 clean
  passes), frame-by-frame seam sweeps (2x clean, both viewports), blur audit
  (8 rests/viewport — no fractional transforms / filters / stale will-change
  on text), smoothness (CLS + frame timing), walks (last item must ignite in
  view), tsc + functional-qa both viewports.
- Commits: about 0fb0ee8, services 58f8eb7, contact cce5625, consulting
  852257e, adu 49a1393, remediation 23dc975, portfolio 615eb83 (+ this one:
  shared hook + docs). Home verified clean, no fix needed.
- REAL DEFECTS FOUND+FIXED (one per page): About — permanent will-change kept
  CRAFT text on a raster layer (now scoped to the reveal tween). Services —
  principle close-up keyed-Image remount flashed the blur placeholder (now
  persistent crossfade layers). Contact — reveal failsafe force-opened
  INACTIVE photo plates after 2.5s dwell, two photos lit (data-failsafe-
  exempt, Fix 24 class). Consulting — benefits row 05 could NEVER ignite.
  ADU — 'Understanding' row never ignited. Remediation — approach step 04
  never ignited + settle wired (last flow without it). Portfolio — NEW
  PortfolioFlow (was the only flow-less page): rail + veils + settle, stray
  x0.5 hairline deleted, black-on-black wrap regression fixed, Fix 25 reveal
  hardening; VBM yields on /portfolio.
- SHARED HOOK (useJunctionSettle): junction clean-rest is now prev-bottom-
  aware — flush-below a fully-visible short section is composed (fixes
  remediation's 3-short-section stack: one glide, no cascades). PATTERNS
  Fix 26 updated (4th lesson) + NEW Fix 27: "last walk item never ignites"
  — 4 independent instances found tonight; audit every focus-band walk.
- CROSS-CUTTING (all green, report-only): nav matrix 11 legs x 2 viewports
  (client-side clicks, back-buttons, mid-scroll nav — 0 stuck reveals, 0
  errors); splash gate (plays once, no replay, no scroll-lock leftover);
  footer junctions full-bleed on all 8 routes x 2 viewports; 3 residence
  deep links land at 96px via cards AND direct URLs; header ink correct at
  every settled position. Site-wide settle verified: home 34/34+31/31,
  about 11/11, services 27/27, remediation 11/11+8/8+11/11 FAQ-open, adu
  11/11+8/8+13/13, contact 15/15+11/11, portfolio 63/63+57/57.

## 2026-07-10 — Approach walk runway + settle canonicalized site-wide

- Brian: the approach walk got cut off — "gets to Permit & Approval and the
  next section already pops up… can't see the Post-Construction highlight."
  Root cause: the walk was paced by the section's physical height; the
  compaction shrank its scroll budget so the cover arrived at step 03.
- HomeVisionSequence: process panel now CSS-sticky over a .process-travel
  runway (100svh+190vh, desktop only); active row is a PURE function of
  runway progress (runway/5 each — services pattern, 3d15bdb) and the
  EditorialFlow surface can only pin at progress 1, so 01→05 ALL get their
  lit moment before any cover. Progress rail driven from the same progress.
  Mobile keeps compact natural flow + focus-line selection. Verified: 2×
  walk-verify passes — all 5 rows lit while fully visible, 0 errors.
- useJunctionSettle CANONICALIZED at components/system/useJunctionSettle.ts
  (home path is a re-export shim): merged the two diverged forks — live-rect
  band detection + direction-aware targeting + Lenis-driven glide (mine) with
  arm-on-user-input-only (anchor/deep-links never hijacked), velocity-based
  idle for Lenis' momentum tail, adaptive glide duration (fan-out fork).
  Fixed a latent latch bug: gating settle entry on the per-glide `cancelled`
  flag permanently disabled settling after the first input-cancelled glide.
  PATTERNS Fix 26 updated with all three lessons.
- Settle now wired in EVERY flow: Editorial, About, Services, Adu,
  Consulting, Contact (Remediation pending its terminal's in-flight rework).
- Verified: home torture down/up 34/34 + 31/31 clean; about 10/10; services
  25/25 ×2 (one earlier "fail" was a measurement race — glide completes
  ~0.5s after the harness window at the post-pin junction); walk-verify 2×;
  tsc clean; functional-qa PASS desktop+mobile.

## 2026-07-10 — Home junction settle: never rest half-covered (PATTERNS Fix 26)

- Brian: sections "not really snapping… the previous section kinda peeking…
  looks sloppy." Covers were clean in motion but the page could REST
  half-covered when the reader stopped mid-junction.
- NEW components/home/useJunctionSettle.ts wired into EditorialFlow: after a
  genuine ~180ms scroll-end, if any stack surface rests mid-cover, glide
  ~520ms easeOutCubic to the nearest clean boundary. Direction-aware (down →
  complete the cover, up → back off) — a 50% rule traps gentle scrollers.
  Glide goes through lenis.scrollTo via new window.__lenis828 handle
  (LenisProvider); raw window.scrollTo glides get reconciled away by Lenis
  (torture run proved it: 18/40 stops stayed half-covered).
- Guards: cancel on any input, one settle per stop, lands outside the band
  (no self-retrigger), desktop-only, reduced-motion no-op, junction bands
  only — reading positions never snapped. Loved animations untouched (word
  pops, services-preview parallax + coloring, fireplace inset→full-bleed).
- Verified: torture-settle.mjs + settle-up.mjs — varied stops, both
  directions, two consecutive clean passes each (0 half-covered rests,
  0 errors, full traversal). tsc clean; functional-qa PASS desktop+mobile.
- Recorded as PATTERNS.md Fix 26 — portable to every *Flow page (the fan-out
  prompt tells terminals to reuse the hook).

## 2026-07-10 — El Sereno card + real-photo residence galleries + deep links

- Brian added the "El Sereno Residence" photo folder (dictation garbled it as
  El Cerrito/Cerrano): home middle card "Cerritos Detail" replaced with
  "El Sereno Residence" — photo 01-2194.jpg (round wood mirror / vessel sink /
  geometric black-star tile, the project signature), meta "Bath Remodel /
  El Sereno, CA".
- El Sereno pipeline: 50 raw → 42 optimized (8 near-dupes culled), sharp
  EXIF-rotate/strip → max 1920px → mozjpeg q78 + adaptive tighten; 11MB total,
  zero files over 400KB, at public/images/projects/el-sereno-residence/
  (matches the cerritos/tustin convention — NOT a new portfolio/ tree). Raw
  root folders stay untracked + excluded from deploys.
- NEW components/portfolio/ResidenceGalleries.tsx (+ residenceGalleries.data
  .ts): three anchored gallery sections (#cerritos-residence /
  #el-sereno-residence / #tustin-residence), 123 lazy 4/5 cells (zero CLS),
  editorial cream design, accessible lightbox (arrows/Esc/backdrop, scroll
  lock). Wired into PortfolioContent with a 2-line touch.
- Home cards deep-link /portfolio#<id>; mount handler instant-jumps to a 96px
  offset and re-asserts briefly to survive Lenis' mount reset, aborting on a
  real scroll gesture. Verified landing top=96px for all three ids, both
  viewports, plus click-through from each card.
- JOE TO CONFIRM: El Sereno scope label — card says "Bath Remodel", gallery
  says "Bath Remodel & Outdoor Living" (the set is a star-tile bath + a
  chevron-deck outdoor living build with slat fence + planter benches).
- QA: tsc clean; functional-qa PASS both viewports on / ; equivalent
  portfolio QA PASS both viewports (123 images, 0 broken, no overflow).

## 2026-07-10 — ADU V3.3: FAQ + acronym revamp (Brian round 3, home-grammar words)

- Brian: both middle sections could look/be organized a lot better; take
  inspiration from home/About motion ("the words popping up as you scroll");
  add photos where necessary (new client images incoming — slots swap-ready).
  Videos IMG_1092/1094 re-checked against the change doc — verbiage untouched.
- FAQ reorganized: tall clip-reveal photograph (adu-interior-living, parallax)
  beside a tidy 2×2 question-card checkerboard (dark/light/light/dark) — no
  more ragged second row; the dictated statement now uses the HOME WORD-FILL
  grammar (SplitType words ink 0.45→1 on scrub; initial at the axe large-text
  floor, unlike home's 0.28).
- ACRONYM reorganized: rows left (letter rail + word + maroon tick), each
  definition WORD-FILLS on scroll (0.55→1, small-text axe floor); sticky
  right photo panel crossfades per igniting letter (A exterior / D detail /
  U framing — live-rect keyed, sticky-proof) with letter/word caption;
  watermark drift moved behind the rows (left).
- QA: tsc clean; 2 consecutive frame sweeps clean at both viewports (r3+r4);
  FAQ-expanded junction probe clean; functional-qa PASS desktop+mobile;
  Lighthouse prod desktop Perf 99 / A11y 96 with ZERO non-global contrast
  nodes. Note: mid-run 500s on :4000 were a parallel build wiping .next —
  wait for manifest stability before auditing in shared-tree sessions.

## 2026-07-10 — Remediation: method-section owner revision + approach fit

- Brian (voice + screenshot, re-reading IMG_1112): method section lead
  statement ("828's integrated remediation and restoration approach…")
  REMOVED from the section — it stays on the page once, in the CTA small
  print (Joe's IMG_1113 "as well"). "With decades of expertise…" promoted to
  the section statement; "This informs…" under the hairline. Photo column
  rebuilt as a swappable METHOD_PHOTOS grid (equal-height 2-up) ready for the
  AI photo set Brian is generating.
- Approach section "way too long" fixed: sticky photo capped at
  min(100vh-14rem, 34rem), section paddings py-16/20, tighter rows — desktop
  932→706px, method 806→619px (mobile method 1460→873px).
- QA: tsc clean; functional-qa PASS both viewports (header-morph probe updated
  for the living header — compares bg AND ink, it no longer snaps
  backgroundColor); junction sweep s5 clean; change doc updated with the
  owner-revision section.

## 2026-07-09 (night) — "Communication." mid-word break fixed + site-wide text-fit audit

- Brian's screenshot at ~1657px window: About standards title "Communication."
  broke as "Communicatio / n." — fixed 12.5rem title column vs ~210px word at
  the 1.7rem clamp cap (Fix 21 class). Fixed: column 12.5rem→14.5rem +
  whitespace-nowrap on the single-word titles. Verified one-line at 1657.
- NEW site-wide harness `.claude-work/research/site-textfit/audit.mjs`: 8
  routes × 7 widths (390/768/1024/1280/1440/1657/1920), canvas-measures every
  heading's longest word vs container, flags nowrap/box/viewport overflow
  (marquees + aria-hidden exempt). Detector validated against a planted defect
  (150px box → flagged). Result: TOTAL ISSUES 0, twice consecutively — no
  other instance of the bug class exists anywhere on the site at any audited
  width.
- Lesson recorded: the 1440–1920 band (e.g. 1657) was untested before and is
  now mandatory in every audit — PATTERNS.md Fix 21 addendum +
  828_DESIGN_DIRECTION_V4.md audit-width rule.
- QA: craft-torture 5/5 PASS, functional-qa PASS desktop+mobile, tsc clean.

## 2026-07-09 (night) — Right edge cleaned: duplicate progress bar deleted, scrollbar restyled

- Brian: right side of every page showed the scrollbar PLUS a second thinner
  red line filling as you scroll — delete it and make the scrollbar look
  professional. That bar was components/system/RightScrollProgress.tsx
  (fixed right-0 z-[9999]) — redundant since the page-progress hairline moved
  onto the header's bottom edge. Component deleted, unrendered from
  app/layout.tsx. Confirmed 0 occurrences in rendered HTML.
- Scrollbar restyle (globals.css): was a chunky square maroon thumb on a gray
  track (read as a second red bar). Now a slim 4px rounded neutral pill
  (rgba(122,116,110,.55)) floating in a 10px gutter, invisible track, maroon
  only on hover/drag; Firefox scrollbar-color matched. Quiet on both cream
  and black surfaces; the edge chrome no longer competes with the plumb rail
  or header hairline.

## 2026-07-09 (night) — Rail rollout complete: igniting diamond rail on every page

- Brian: "now do this for every page on the website without changing content."
- /services was the last flow page without its own igniting rail: ServicesFlow
  now draws the full rail (RemediationFlow port — measured [data-section] node
  offsets, scaleY line draw, shared FlowNode diamonds, debounced RO so the
  index's internal 210vh pin spacer can't stale the offsets). No wrapper or
  content changes needed — anchors already existed.
- VerticalBrandMark yield list extended to /services, /services/consulting,
  /contact — killed the fresh double rails on consulting + contact (their new
  flows and VBM's static line were both rendering).
- Site state: flow pages (/, /about, /services, /services/adu,
  /services/remediation, /services/consulting, /contact) draw the animated
  multi-node igniting rail; VBM supplies the single static diamond on
  flow-less pages (/portfolio until its in-flight flow lands) and yields
  wherever a flow owns the rail.
- NOTE for portfolio terminal: when PortfolioFlow lands, import shared
  FlowNode, add /portfolio to the VBM yield list, and align/remove the
  in-flight left-edge hairline at x0.5 (site rail is x24.5).
- Sweeps: /services, /services/consulting, /contact all [24.5] node+rail
  x-centers, single rail each, all nodes ignite, two consecutive clean
  desktop passes, mobile rail correctly hidden, 0 console errors. QA: tsc
  clean; functional-qa PASS desktop+mobile on all three routes.

## 2026-07-09 (evening) — Contact + Consulting wrapped in the About scroll system (terminal B)

- Brian's fan-out ask: same stacked-surface scrolling as About, zero changes to
  wording/pictures/section designs. Portfolio left alone (actively claimed by
  another terminal, uncommitted edits in tree).
- CONTACT: ContactFlow.tsx (faithful AduFlow copy — measured sticky tops,
  gap-free opacity veil, plumb line + diamond nodes; ResizeObserver because the
  mobile row-photo strips resize their surface). Staleness audit: ct-line
  hairlines converted scrub → IO decisive one-shots; hero Ken Burns scrub
  removed (pins under cover); plate parallax kept (last/relative surface only).
- CONSULTING: ConsultingFlow.tsx (canonical AboutFlow copy + light-surface
  track shadow; no RO — no post-mount height changers). Page reveals were
  already IO-decisive; nothing to convert.
- Probe bug fixed while here: functional-qa's nav round-trip did
  URL.replace('/services','/about') → /about/consulting 404 on nested service
  URLs; now resolves new URL('/about', URL).
- QA per page: seam sweeps 2x consecutive clean at 1440x900 + 390x844;
  functional-qa PASS both viewports; verbiage probes PASS (no words changed);
  tsc clean.

## 2026-07-09 — Unified plumb-line rail: one diamond vocabulary site-wide

- Brian loves the left rail + section diamonds; asked for alignment/consistency
  polish. Audit found 3 divergent node implementations (home light-fill/black
  border — near-invisible on light surfaces; about/adu dark-fill/white border;
  VerticalBrandMark static dark), top-anchored nodes hanging half below their
  seam, a 1.6px x-offset at the lg breakpoint, and DOUBLE RAILS on
  /services/adu and /services/remediation (each page's animated flow rail +
  VBM's static line both rendering).
- NEW components/system/FlowNode.tsx — single source of truth (FLOW_NODE_CLASS
  + FlowNode): 8px rotated-square diamond, collinear with the w-px track at
  left-[1.4rem] xl:left-6, -translate-y-1/2 centered ON the junction seam
  (worst delta 0.5px), pre-ignition maroon ring + faint center (legible on
  light AND dark), ignited solid maroon (.flow-node-lit), identical
  ScrollTrigger ignition (top+offset 72%, lit trail, unlit on leave-back).
  EditorialFlow / AboutFlow / AduFlow / RemediationFlow import it (local
  copies deleted); VerticalBrandMark wears the same diamond and now yields on
  /services/adu AND /services/remediation.
- Sweeps with left-edge crops + programmatic geometry: distinct rail/node
  x-centers = [24.5] on every page, all flow nodes ignite (home 3/3, about
  5/5, adu 4/4, remediation 5/5), double rails eliminated, two consecutive
  clean passes per page. Mobile: rail correctly hidden below lg. QA: tsc
  clean, functional-qa PASS desktop+mobile on home/about/adu + consulting
  desktop (VBM path). Frames: .claude-work/research/home-fixes/rail/.

## 2026-07-09 — Remediation V3.6: About scroll system applied (fan-out directive)

- Brian's template: carry the page's existing sections with the About
  stacked-surface grammar — NO changes to wording/pictures/layouts.
- New `components/services/remediation/RemediationFlow.tsx` — faithful copy of
  AboutFlow (post-723c508 gap-free mechanics: measured sticky tops, opacity
  veils, plumb line + nodes) + a debounced ResizeObserver so the FAQ answer
  expanders (surface height changes) can't stale the measured tops.
- Sticky-staleness audit (the #1 regression class): FAQ cards, equipment
  plates and maroon seam converted from scroll-math scrubs to decisive
  IO once-reveals (data-gsap-reveal added); approach rail now fills from
  live-rect focus state (scaleY (active+1)/4, CSS transition); photo clip
  wipes replaced with fade+scale settles — ANY clip direction reads as a
  stray sliver when a sweep frame catches the first tween moments. Parallax
  drift kept (continuous depth, matches home grammar).
- Frame-by-frame sweeps (sweep.mjs, 380/420px steps, every frame read): s1
  found sliver-class artifacts → fixed → s3 AND s4 fully clean at 1440×900 +
  390×844 (25 frames/sweep). All-answers-expanded junction probe also clean;
  no overflow; 0 console errors.
- QA: tsc clean; functional-qa PASS desktop+mobile (verbatim probe 20/20 —
  every piece of original content present; FAQ expanders OK; header morphs).

## 2026-07-09 — Services: stacked-surface scroll + values close-up rotation + mobile footer

- SERVICES FLOW: /services now rides the About/home cover-scroll grammar via
  `components/services/ServicesFlow.tsx` (faithful AboutFlow port: measured
  sticky tops, opacity veils — never scale — opaque z-stacked wrappers; no
  second plumb line, the site-wide rail already draws it). The index's
  internal 210vh pin composes: taller-than-viewport surfaces pin at their
  bottom edge, so the traveling-picture walk completes before Vision covers
  it. TWO consecutive frame-by-frame sweeps clean at 1440×900 + 390×844
  (`.claude-work/research/services-v3/sweep/`).
- VALUES PLATE (IMG_1080 re-verified frame-by-frame): Joe says "close-upS" —
  four photographs now rotate with the igniting principle (black fixtures /
  floor plans / foundation rebar / finished interior), 450ms crossfade,
  0X/04 counter. Verbiage untouched — verbatim probe 21/21. Index rows also
  carry the image agent's regenerated photos (services-row-*-v2.jpg).
- FOOTER MOBILE (Brian's screenshots): phone-first sub-lg composition — same
  information, ~45% shorter (1076px @390); two-column nav, slim Book-a-Call
  band, tappable phone/email, slim marquee. Desktop pixel-identical.
- QA: tsc clean; functional-qa PASS desktop+mobile; settled-opacity probe;
  push gate 16/16; deployed → https://828-ns-preview.vercel.app/services.

## 2026-07-09 (early) — ADU V3.2: About stacked-surface scroll system applied

- Brian's fan-out directive: give /services/adu the About-page scroll feel —
  content untouched (words/pictures/layouts frozen), sections wrapped in the
  canonical stacked-surface grammar.
- `components/services/adu/AduFlow.tsx` — faithful copy of AboutFlow (measured
  sticky tops, gap-free opacity veil, maroon plumb line + igniting nodes) with
  one ADU-required addition: a debounced ResizeObserver re-applies stack tops
  and refreshes trigger positions when FAQ expanders resize their surface
  (AboutFlow only re-measures on window resize).
- Reveal audit: page already used IO-based revealOnVisible (Fix 22-safe inside
  sticky surfaces) + live-rect focus ignition — no scroll-math once-reveals to
  convert.
- QA: 2 consecutive frame-by-frame sweeps CLEAN at 1440×900 (10 steps) and
  390×844 (14 steps) — no gaps, no slivers, no past-section bleed at any
  junction; FAQ-expanded junction probe clean (surface grows 230px, covers
  still seamless); left-edge probe confirms plumb line terminates at flow
  bottom (no footer overlap); functional-qa PASS both viewports (all verbatim
  copy present, no invisible images); tsc clean.

## 2026-07-09 — Home stacked-surface seams: scale settle → opacity veil

- HOME EditorialFlow had the same root bug AboutFlow already fixed: covered
  surfaces settled with scale 0.975 (origin center 80%), shrinking them inward
  from the viewport edges — cream gaps beside the marquee band, white band
  above incoming dark surfaces, dark slivers at junctions, broken plumb line /
  floating nodes (Brian's 4-screenshot report). Ported AboutFlow's veil
  pattern into components/home/EditorialFlow.tsx: per-surface [data-cover-veil]
  black overlay tweens opacity 0→0.22 on cover; geometry stays full-bleed at
  every frame. Mobile (shouldAnimate=false) unaffected.
- The thin maroon line under the header in the same screenshots is NOT a seam:
  it is the new intentional page-progress hairline on the header's bottom edge
  (living-header build). Verified header borders stay neutral in all zones.
- Sweeps: desktop 1440x900 at 150px steps (33 frames) + mobile 390x844 at
  350px steps (20 frames), two consecutive clean passes each; frames in
  .claude-work/research/home-fixes/seams/. QA: tsc clean, functional-qa PASS
  desktop + mobile, no overflow, all home content verified present.

## 2026-07-09 — Seam cleanup, line-only sidebar, visible wordmark, living header

- STACKED-SURFACE GAPS FIXED AT ROOT (Brian: sections peeking through gaps
  that grow as you scroll): the AboutFlow cover-scale settle (scale 0.975)
  inset covered surfaces ~18px per side, exposing the surface beneath —
  invisible on home (all-cream surfaces) but glaring on About's dark/white
  alternation. Replaced with a geometry-free depth cue: a per-surface black
  veil that dims 0→0.28 as the next surface covers it. Surfaces now span full
  viewport width at every frame; flow wrap painted #050505 so no contrasting
  sliver can ever show. RULE: never transform stacked-surface geometry on
  pages with mixed light/dark surfaces.
- Frame-by-frame seam audit harness added
  (.claude-work/research/about-v3/seam-audit/sweep.mjs): scrolls in 200px
  steps at 1440x900 + 390x844, screenshots every step, and programmatically
  asserts every visible surface spans full width and no flow band is
  uncovered. Two consecutive sweeps clean at both viewports (57 frames each).
- SIDEBAR: VerticalBrandMark wording deleted site-wide (Brian: "I like the
  red line — delete the wording"). Null on / and /about (About's plumb line
  IS the red line); other routes get a quiet centered maroon hairline + node.
- HERO WORDMARK: no longer top-cropped — fully visible mid-top band, centered,
  clamp(2.2rem,8vw,8rem) so it fits untouched at both viewports; drift range
  tightened so it can never leave the viewport.
- LIVING HEADER (Brian: "a lot more responsive… change colors, be more
  transparent while scrolling"): graded glass — background alpha 0.05→0.90 and
  blur 4→18px interpolate continuously over the first 360px of scroll
  (quantized 1/20 steps; prefers-reduced-motion falls back to the old binary
  snap); desktop bar condenses h-16→h-14 past half-scroll; maroon page-progress
  hairline moved from the detached #scroll-progress top bar onto the header's
  bottom edge (ScrollProgress unrendered from layout); zone-aware dark/cream
  morph unchanged. Verified at 6 scroll depths on about/home/services/
  portfolio (ink always matches background) + mobile menu clean at 390.
- QA: tsc clean; functional-qa PASS both viewports; craft-torture 5/5 PASS;
  seam sweep clean twice.

## 2026-07-09 — About hero V6.2 (photography-first) + CRAFT never-missing-text fix

- Brian: hero "can look better somehow." Built and compared 3 real variants
  (captures: .claude-work/research/about-v3/visual-audit/hero-variant-*.png);
  winner C = photography-first: full-bleed planning-table photo, floating glass
  dossier panel (black/55 blur, lift shadow), oversized top-cropped
  "828 Construction" ghost at top-left. Words unchanged.
- URGENT: CRAFT letter-completion was leaving R/A/F/T bare on Brian's live
  scroll — scrub ScrollTriggers go stale inside AboutFlow's sticky stacked
  surfaces (documented as PATTERNS.md Fix 25). Rewritten to rect-based
  IntersectionObserver decisive reveals + 900ms sweep failsafe +
  data-gsap-reveal coverage (LenisProvider failsafe). 5-scenario torture test
  (slow scroll / fling+return / mid-page hard refresh / client-side nav /
  mobile 390) ALL PASS — script: .claude-work/research/about-v3/craft-torture.mjs.
- functional-qa PASS desktop+mobile post-change; tsc clean.

## 2026-07-09 — Contact V3 + site-wide all-black footer + stuck-toast fix (terminal B)

- Videos IMG_1123/1125/1127 (Camera Roll) transcribed (whisper medium, 1 fps),
  every frame reviewed via contact sheets, phone notes read at full resolution.
  Ledger: docs/828_CONTACT_JOE_FEEDBACK_2026-07-09.md — K1–K11 all applied.
- HERO: NS "Get in touch" photo band — "Building lasting partnerships." +
  maroon hairline + "Forging exceptional partnership…" support line; the
  listening line rides the upper right ("off to the side" per Joe). Static-
  painted H1 (LCP-safe), Ken Burns settle on scrub.
- GET IN TOUCH: all-black fat band — call/email/base ledger rows (hairline +
  maroon ticks) + license/Est. 2004 chips + restyled form card. FORM BACKEND
  STILL ON HOLD — visual form only, no new infrastructure.
- PREP: cream strip — eyebrow "Critical elements to include in your
  communication", heading "Your insights help us provide solutions that are
  thoughtfully tailored to your needs", items 01–04 unchanged (frozen).
- SERVICE PATHS: 3 full-bleed rows + shrunk South Bay 4th row with the new
  "Whether improving your residence…" sentence. Row-embedded photo ignition =
  page signature (desktop clip-wipe plate in the row; mobile photo strip
  expands under the active title). useFocusIndex live-rect selection.
- FOOTER (site-wide): cream nav/address panels flipped to BLACK per Joe
  ("no separation… it's all black… complete"); white/10 hairlines; marquee white.
- BUG FIX (site-wide, visible in Joe's own video): Fix 18 reveal failsafe was
  force-showing PhoneCopyToast ~2.5s after load (stuck pill over content).
  New data-failsafe-exempt opt-out — PATTERNS.md Fix 24.
- QA: tsc clean; verbiage probe 15/15; functional-qa PASS desktop+mobile;
  site-smoke 7/7; reveal-probe (4 scenarios × 2 viewports) PASS; 3 screenshot
  critique rounds (.claude-work/research/contact-fixes/).

## 2026-07-09 — Consulting V3: Joe's 4-video verbiage batch + V4 grammar rebuild

- Videos IMG_1117/1120/1121/1122 (Gaming_Files) transcribed (whisper medium,
  1 fps frames), every frame reviewed, phone notes read at full resolution.
  Ledger: docs/828_CONSULTING_JOE_FEEDBACK_2026-07-09.md (verbatim quotes +
  cleanup notes). Verbiage now FROZEN.
- HERO: "Building solutions beyond the blueprint." cream asymmetric split
  (copy left / consulting-table photo right, parallax), dictated paragraph,
  LCP-safe plain-paint H1.
- SOLUTIONS: "Delivering considerate solutions." ink section — dictated body
  + Benefits ledger 01–05 (focus-band ignition, maroon progress rail).
- QUESTIONS: "Questions and answers" card grid in the ADU/Remediation
  checkerboard grammar; Joe's intro paragraph as the section headline; his 3
  questions as ALWAYS-VISIBLE self-selection prompts (no answers dictated —
  no accordions; asymmetric col spans = page signature, PATTERNS.md updated).
- CTA: "Engineered solutions tailored to your project" clean statement band —
  DraftingMotionLayer doodles + side pill DELETED per Joe ("get rid of this
  guy and this stuff on the side"); flows into the black footer.
- Old V2 sections deleted: decision matrix, field-based advisory chips,
  "A short call…" CTA.
- Motion: con-* system (revealOnVisible entrances per Fix 22/23, gsap.set
  initial states per Fix 14, parallax scrubs per Fix 15, full mobile branch).
- QA: tsc clean; verbiage probe 16/16 + 5 old phrases gone; functional-qa
  PASS desktop+mobile; site-smoke 7/7; visual audit 4 sections × 5 PASS
  (.claude-work/research/consulting-v3/).
- COORDINATION: contact page + site-wide all-black footer (videos
  IMG_1123/1125/1127) are owned by the parallel terminal-B session per the
  ownership note in docs/828_CONTACT_JOE_FEEDBACK_2026-07-09.md.

## 2026-07-08 (late night) — Remediation V3.5: full-coverage re-review + design upgrade

- Brian's directive (same as ADU V3.1): re-review every second/frame of
  IMG_1103/1111/1112/1113, then make the page look/flow/animate better with
  Joe's verbiage intact.
- Verification: all 67 frames reviewed (including every previously skipped
  frame) + whisper-MEDIUM re-transcription of all four audios
  (`img_*/transcript_medium.txt`) — zero wording deltas. One boundary
  refinement: hero paragraph now keeps Joe's own punctuation ("…that follows
  damage — from restoring environmental integrity to complete reconstruction.
  828 Construction delivers…"); change doc §1 + Second-pass verification
  section updated.
- HERO: media panel wipes in from the copy side on load (clipPath), headline/
  paragraph/CTAs rise transform-only (LCP-safe, no opacity on above-fold text).
- FAQ: NS-Perspectives echo added — rolling marquee strip of the three
  questions (black/50, maroon separator dots, aria-hidden) above the heading;
  cards get transform-only scrub-staggered rises.
- APPROACH: maroon plumb rail FILLS via scrub beside the 01–04 rows; sticky
  photo now CROSSFADES by step (01–02 inspection/mold → 03–04 rebuilt room)
  with caption swap — React-state, sticky-proof.
- METHOD: photos on two parallax depths (-8 / -4) for dimension.
- CTA: equipment plates settle from opposite sides via scrub (transform-only;
  opacity dims removed — they failed WCAG at load state), maroon seam draws
  via scrub.
- QA: tsc clean; functional-qa PASS desktop+mobile (0 errors, verbatim probe
  20/20, no overflow, no dup headings); preflight:full 16/16; Lighthouse prod
  desktop Perf 99 / A11y 96 / BP 100 / SEO 100 with ZERO non-footer contrast
  fails; mid-scrub state verified numerically (plate x=-17px at 72% viewport).

## 2026-07-08 (late night) — ADU V3.1: full-coverage re-review + design upgrade

- Brian's directive: re-review EVERY second/frame, then make the page look/flow/
  animate better with all of Joe's verbiage intact (frozen).
- Verification: all 4 videos re-extracted at 1fps (153 frames, all reviewed) +
  re-transcribed with whisper MEDIUM (`transcript_medium.txt`) — ZERO wording
  deltas vs the applied copy; change doc gained a "Second-pass verification"
  section. Sharpened cue: the NS Perspectives reference Joe points at
  interleaves PHOTO CELLS between question cards.
- HERO: "Built with intent" now enters letter-by-letter down the maroon plumb
  line (CSS keyframes, LCP-safe, reduced-motion guarded); SCROLL cue with
  looping drop-line added bottom-right.
- FAQ: rebuilt as a true NS checkerboard — 4 question cards interleaved with 2
  ADU photo cells (adu-interior-living, garage-conversion), clip-reveals with
  per-cell stagger; row 2 right-anchored (lg:col-start-3) for asymmetric
  balance; expander + now boxed.
- ACRONYM: fixed-width letter rail (A/D/U words align), per-row animated
  hairline draws, row entrance rises; watermark drift unchanged.
- INVITATION: left column re-organized to natural flow (dead middle removed),
  maroon hairline draws above "Prepared to proceed with your vision?",
  qualifying-question rows + hairlines cascade with stagger.
- data-stagger cascade added to the motion hook (reveal delay per element).
- A11y: labels bumped to contrast-safe (white/58+); Lighthouse prod desktop
  Perf 100 / A11y 96; functional-qa PASS desktop+mobile; no overflow.

## 2026-07-08 (night) — Remediation V3: Joe's video-feedback rebuild (4-video batch)

- Intake: 4 videos (IMG_1103/1111/1112/1113, from OneDrive\Pictures) transcribed +
  frame-resolved at `.claude-work/research/remediation-joe-feedback/`; change doc
  written FIRST at `docs/828_REMEDIATION_JOE_FEEDBACK_2026-07-08.md` (verbatim
  quotes, phone-note transcriptions, typo cleanups documented).
  `components/services/remediation/RemediationServiceContent.tsx` fully rebuilt;
  `app/services/remediation/page.tsx` gains FAQPage JSON-LD mirroring Joe's 3 Q&As.
- HERO (IMG_1103): H1 → "828 — creating healthier environments, one home at a
  time." (maroon 828); paragraph → "Above all else, your peace of mind is
  paramount…" (note Section 5); asymmetric copy-left/photo-right split (mirrors
  ADU), parallax drift.
- FAQ (IMG_1111): "A cleaner repair starts with restraint." + Trace/Contain/
  Rebuild DELETED → NS-Perspectives FAQ on light surface: label "Identifying the
  reason for service", H2 "When mold remediation is necessary", intro paragraph
  verbatim, 3 alternating Q&A cards with +/× expanders (answers mirror JSON-LD).
- APPROACH (note Section 3, note-only): "Build philosophy / The approach" — 01
  Initial call · 02 Visual inspection / Testing · 03 Remediation / Scope of work ·
  04 Build back / Reconstruction; rows ignite in the live-rect focus band against
  a sticky reconstruction photo (desktop).
- METHOD (IMG_1112): "Proof that the repair is controlled." verbiage replaced by
  Joe's three paragraphs ("828's integrated remediation and restoration
  approach…" → "…exceeds industry standards."); layout kept ("this section here
  is fine"), photos unchanged (damage + work).
- CTA (IMG_1113): "Start restoration" (small letters) / H2 "Where recovery
  begins" / "Begin the path to renewal" (bold) + the integrated-approach
  paragraph reused in small print (Joe: "as well"). Page signature = equipment
  model showcase: Flair E8 + 277 MR dark plates converging from opposite sides
  with a drawing maroon seam; photo slots PENDING real equipment photos from Joe.
- Unassigned note copy ("This expertise had led to an advanced remediation
  process…" + partial paragraphs above it) documented in the change doc — ask Joe.
- QA: tsc clean; `.claude-work/research/remediation-fixes/functional-qa.mjs` PASS
  desktop+mobile (verbatim probe 20/20 case-insensitive, header morph, FAQ
  expanders, approach rows readable, plates visible, 0 console errors, no
  overflow, no duplicate headings); 3 visual critique rounds at 1440×900 +
  390×844 (de-duplicated mold imagery: FAQ went type-only asymmetric).

## 2026-07-08 (night) — ADU V3: Joe's video-feedback rebuild (4-video batch)

- Intake: 4 videos (IMG_1086/1092/1094/1095, from OneDrive\Downloads) transcribed +
  frame-resolved at `.claude-work/research/adu-joe-feedback/` (hi-res phone-note
  crops in `img_1094/hi_*.jpg`, `img_1095/hi_*.jpg`); change doc written FIRST at
  `docs/828_ADU_JOE_FEEDBACK_2026-07-08.md` (verbatim quotes, note transcriptions,
  typo cleanups documented). `components/services/adu/AduServiceContent.tsx`
  fully rebuilt; `app/services/adu/page.tsx` (SEO/JSON-LD) untouched.
- HERO (IMG_1086): H1 "Built with intent" running DOWNWARDS (vertical-rl) with a
  maroon plumb line drawing beside it; hero paragraph replaced with Joe's
  dictated copy ("Whether looking to refine a private retreat… same seriousness
  as a primary home."). Photo split retained, parallax drift.
- FAQ (IMG_1092): "The value is in the planning." section DELETED → FAQ section
  in NS-Perspectives card grammar: dictated line "Whether your vision is fully
  defined or still evolving, 828 Construction is here to help." above 4
  alternating dark/light question cards with +/× expanders (answers mirror the
  page's FAQ JSON-LD).
- ACRONYM (IMG_1094): "One accountable build path." section DELETED → "What ADU
  means to 828." A/D/U value rows verbatim from Joe's phone notes (Aligned /
  Dedicated / Understanding), letters ignite maroon in the live-rect focus band;
  page signature = giant ADU watermark (0.04) drifting yPercent -8 (per
  PATTERNS.md signature table).
- INVITATION (IMG_1095): CTA heading → "An invitation to work together" + the
  four qualifying questions in fine print (01–04 rail), note-only swaps applied:
  resonance line + "Prepared to proceed with your vision?" above the CTAs.
  "…completing the form…" note line NOT applied (contact form ON HOLD).
- QA: tsc clean; new `.claude-work/research/adu-fixes/functional-qa.mjs` PASS
  desktop+mobile (verbatim-copy probe 17/17, header morph dark→cream verified,
  FAQ expanders, no overflow, no duplicate headings, 0 console errors); 3 visual
  critique rounds at 1440×900 + 390×844; site-smoke: /services/adu OK all
  scenarios (pre-existing: remediation React warning + missing header BOOK CALL
  button flagged, untouched).

## 2026-07-08 (late night) — Services V3: Joe's video-feedback rebuild (4-video batch)

- Intake: 4 videos (IMG_1075/1077/1080/1082) transcribed + frame-resolved at
  `.claude-work/research/services-joe-feedback/`; change doc written FIRST at
  `docs/828_SERVICES_JOE_FEEDBACK_2026-07-08.md` (verbatim quotes, phone-note
  transcriptions, typo cleanups documented).
- SECTION 1 (IMG_1075): hero whited out to the NS Selected-Works list — ADU /
  Remediation / Consulting full-width rows, dim until the live-rect focus band
  illuminates them (maroon rule draws, sticky right photo panel crossfades to
  that service + caption). Page signature; PATTERNS.md table updated.
- SECTION 2 (IMG_1077): H2 → "Where your vision meets uncompromising quality."
  (from Joe's ChatGPT list, exact); instrument doodles ("little guys") DELETED;
  full-bleed photo split. Placeholder image pending the real homeowner-admiring
  photo Joe described (flagged TODO in component).
- SECTION 3 (IMG_1080): "Scope first. Then build." replaced by the values
  split — label "Through all projects", H2 "Ever present", 01–04 principles
  verbatim from Joe's phone notes (numbers/titles one side, phrases opposite,
  sticky herringbone close-up, rows ignite in focus band).
- SECTION 4 (IMG_1082): CTA heading → "Guided by our foundational principles,
  we consistently uphold the highest standards in every project, ensuring
  flawless execution and meticulous attention to detail at every stage." above
  the 6-stage strip across the screen (Initial Contact / Discovery →
  Post Construction, maroon progress draw) + media/CTA split ("Committed to
  bringing your vision to life." + PHASE ONE button per note swaps). Footer
  untouched per Joe.
- NEW PATTERNS.md Fix 23: IntersectionObserver never fires on fully-clipped
  elements (clip-path inset 100% → empty intersection rect) — observe the
  unclipped parent, reveal the child. Also blinds the Fix 18 failsafe.
- QA: tsc clean; functional-qa PASS desktop+mobile (0 errors, no overflow, no
  duplicate headings); site-smoke PASS all 7 routes; 4 visual critique rounds
  at 1440×900 + 390×844; verbatim-verbiage probe PASS (21/21 strings).

## 2026-07-08 (late night) — About V6: Brian's screenshot feedback executed

- Spec: `docs/828_ABOUT_BRIAN_FEEDBACK_V5.md`. All verbiage untouched.
- HERO: dead middle killed — dossier panel is one continuous centered
  composition (eyebrow → headline → paragraph → proof rows with animated
  hairline draws → inline tick trio); section 92svh.
- BUILDER PROFILE: condensed; "Observed/Not assumed." and "Field standard"
  chrome DELETED; photos replaced by the JOE PORTRAIT SLOT — server-side
  existence check (app/about/page.tsx fs.existsSync) so dropping
  public/images/about/joe-portrait.jpg in renders it next build/refresh with
  zero failed requests; pending plate = JP monogram + "Portrait — coming
  soon" + Joe P / Founder bar.
- CRAFT: full revamp to Joe's literal sketch — words complete OUT of their
  letters ("C"+"uriosity." slides from behind the maroon-igniting capital,
  scrubbed, descender-safe); C/R/A/F/T reads down the left; index labels
  deleted; compact rows; watermark 0.03 bottom-right. Signature updated in
  PATTERNS.md.
- SOUTH BAY: dead height cut (min-h removed, py-20/24), compass centered left.
- CTA: maroon seam draws on scrub.
- AboutFlow cover-scale transformOrigin → "center top" (kills the V5
  top-sliver junction artifact).
- QA: tsc clean; 0 console errors; functional-qa PASS desktop+mobile; 3 visual
  critique rounds at 1440×900 + 390×844.

## 2026-07-08 (late night) — Home approach panel: void fix, walk timing, sticky-proof reveals (Fix 22)

- Approach panel (`HomeVisionSequence`): removed forced `min-h-[165svh]` +
  `pb-[52vh]` (the giant black void before "Since 2004"); panel now sizes to
  content (~1008px at 1440×900). Rows condensed `py-10 → py-7` (lg), top
  padding and footnote spacing tightened.
- Step-walk timing: focus line `0.55 → 0.66 * vh`, stuck-walk window
  `0.8 → 0.35 * vh` — all five rows now light while still visible before the
  About surface covers the panel (probe scenario F asserts this).
- **Fix 22 (PATTERNS.md):** "Refining industry standards." headlines (vision
  intro + AboutPreview) permanently hidden after client-side nav round-trips —
  positional `once: true` ScrollTriggers go stale after route transitions /
  inside the sticky stack. All one-shot entrance reveals in
  ServicesPreviewV2 / HomeVisionSequence / AboutPreview now ride
  `utils/revealOnVisible.ts` (IntersectionObserver). Rule: hidden-initial-state
  + positional once-trigger is forbidden; scrubs keep ScrollTrigger.
- Break-test harness added: `break-probe.mjs` (slow scroll, instant jump,
  reload mid-page, nav round-trip, back-button, walk completeness) and
  `site-smoke.mjs` (all 7 routes × scroll + mid-page reload + hidden-heading
  audit) under `.claude-work/research/home-approach-fix/`. All PASS desktop +
  mobile; functional-qa PASS both viewports.
- Ops note: dev server on :3001 was corrupted twice by concurrent builds from
  a parallel agent session (preview deploy flow wiping `.next`); if home 500s
  with `routes-manifest.json ENOENT`, delete `.next` and restart dev.

## 2026-07-08 (night) — About V5: full composition redesign (words frozen)

- Brian: V4 "looks nearly identical — work on it like an actual project." V5
  rebuilt every section's composition (3 visual critique rounds, all captures
  in .claude-work/research/about-v3/visual-audit/):
  - HERO: text-over-photo replaced by NS-style asymmetric split — near-black
    dossier panel left (eyebrow, headline, paragraph, hairline spec-sheet
    stats, maroon-dot trio) / full-height photo right with scale scrub; the
    828 CONSTRUCTION wordmark rides the seam at the bottom.
  - BUILDER PROFILE: magazine editorial — founder lede as maroon-ruled
    pull-quote, framing photo with overlapping materials inset crop
    (parallax at different rates), caption relocated below the plate, and the
    three cards flattened into numbered index rows with scrub reveals.
  - CRAFT: rows tightened to index/title/body columns with a maroon tick that
    draws in per active row (alongside the igniting rail letters); watermark
    tucked bottom-right at 0.035.
  - SOUTH BAY: taller horizon band — rolling cities as the mid layer, copy in
    a floating glass card (backdrop-blur) anchored right, compass moved left.
  - CTA: full-bleed dimmed photo replaced by a split panel — workbench photo
    plate left (scale scrub), black panel right with maroon seam and buttons.
- Every visible word unchanged from Joe's dictated verbiage.
- QA: functional-qa PASS desktop+mobile (0 errors, no overflow, no duplicate
  headings), tsc clean; morphing header verified over light/dark zones.

## 2026-07-08 (evening) — About V4 simplicity pass + standing design direction

- NEW STANDING DIRECTIVE from Brian recorded in `design/828_DESIGN_DIRECTION_V4.md`
  (linked from CLAUDE.md "read these" #0): verbiage frozen, NS-simple +
  page-animated, NO billboard-scale text, asymmetric alternating motion
  (sticky side vs scrolling side), morphing header on every page, one signature
  moment per page, mobile designed at 390px. Applies to every future page pass
  and client-video batch.
- About V4 applied: hero h1 4.6rem cap (was 9.6rem), South Bay/CTA h2s ~3.4rem
  cap, watermark quieter; origin image column now sticky (left) while copy
  scrolls; CRAFT flipped — statements left, sticky letter rail right
  (alternating sides); South Bay copy block moved right over the full-bleed
  city marquee; CTA bg varied to home-about-workbench.jpg.
- Header zone-morph generalized: was pathname==="/" only, now activates on any
  page containing [data-header-light] (About's white CRAFT section is marked).
  Dark stays default; loop order means only mark LIGHT zones inside AboutFlow.
- No image generation tool available this session — imagery varied from the
  existing generated library instead (noted in V4 doc).
- QA: functional-qa PASS both viewports, captures re-verified, tsc clean.

## 2026-07-08 - Home scroll cleanup and reveal stabilization

- Home process panel now has more scroll runway before the next stacked surface
  covers it, so the approach steps can finish reading before the Since 2004
  section arrives.
- Added quiet process thumbnails to the five approach rows while keeping all
  wording unchanged.
- Services headline reveal now starts visible by default and only animates from
  hidden when its trigger runs, preventing "One company, multiple solutions."
  from getting stuck invisible.
- Signed: CODEX

## 2026-07-08 — About V3: Joe's video feedback applied + stacked-surface port

- Analyzed Joe's 5 stylus walkthrough videos (OneDrive IMG_1014/1019/1020/1024/1031)
  with a local pipeline (imageio-ffmpeg frame extraction + faster-whisper
  transcription); every "this here" pointer resolved against extracted frames.
  Change doc: `docs/828_ABOUT_JOE_FEEDBACK_2026-06.md`. Raw transcripts/frames:
  `.claude-work/research/about-joe-feedback/`.
- Applied all dictated changes: hero H1 "Where quality meets quiet luxury." +
  full-screen faded 828 CONSTRUCTION backdrop; builder-profile big headline
  deleted, founder lede promoted; cards renamed Communication / Intentions /
  Execution with rewritten bodies; Field-Method section replaced by Joe's CRAFT
  acronym system (bold CRAFT watermark + 5 statements); South Bay headline
  "Looking for a local contractor?" + full-screen rolling city marquee replaces
  the tile grid; CTA "For those who value experience and quality." + INITIAL
  CONTACT button.
- Ported the homepage stacked-surface scroll grammar to About via new
  `components/about/AboutFlow.tsx` (dark-surface EditorialFlow port with maroon
  plumb line + per-section nodes) — Brian's explicit override of the
  route-specific motion rule, recorded in CLAUDE.md.
- QA: functional-qa PASS desktop+mobile (0 errors, no overflow, no duplicate
  headings), section-by-section visual audit 5/5 PASS each, visual flow 6/6
  PASS. Research tree: `.claude-work/research/about-v3/`.
- The video-intake pipeline is reusable for the NEXT batch of client videos —
  steps documented at the bottom of `docs/828_ABOUT_JOE_FEEDBACK_2026-06.md`.

## 2026-06-10 (refresh fix) — Hard refresh always lands at top, no white strip

- ScrollRestorationReset was useEffect-only — it ran after hydration, so a mid-page hard refresh painted one frame at the restored position (cream strip) before jumping to top.
- Now also renders an inline synchronous <script> (Fix 13 pattern) that sets history.scrollRestoration='manual' + scrollTo(0,0) during HTML parse, before first paint. useEffect kept as second layer.
- Verified: scrollY === 0 at commit, domcontentloaded, and settled after a 3000px-deep hard refresh; hero full-frame.

## 2026-06-10 (first-land fix) — Hero always lands full-frame

- Bug: on first land the hero sometimes showed a sliver of the light surface at the bottom — the surface started exactly at the fold, and wheel input during the splash (or any stray scroll offset) revealed it.
- Fix, three layers: (1) body scroll locked while the splash plays; (2) scrollTo(0,0) on splash dismiss; (3) the editorial surface now starts 4svh below the fold (mt-[4svh] on EditorialFlow — the pinned hero shows through the gap, so the curtain is unchanged).
- Verified with a wheel-during-splash probe: scrollY stays 0, surface rests 36px below the fold in both splash and no-splash paths.

## 2026-06-10 (responsive) — Mobile / iPad / small-window pass

- Audited 390, 768, 834, 1024, 1280 widths with an automated overflow + headline-fit + console-error sweep (all clean) plus visual review of key frames.
- FIXED: process rows were permanently dim below 1024px — AnimationController gates at <1024 (not <768 as the step-driver assumed), so tablets/mobile never ran the highlighter. CSS override at max-width:1023px now keeps rows fully readable (white titles, maroon numbers) on non-desktop.
- FIXED: step-by-step highlighter used document-offset ScrollTrigger bands which go stale once the stacked surface pins (rects freeze while scroll continues) — broken on iPad-height viewports. Rewrote as rect-based selection against a 55%-viewport focus line, with a stuck-phase fallback that keeps the walk advancing over the cover distance. Verified progressive walk -1→0→…→4 at 1280.
- Single-line "Refining industry standards." clamp tightened (3.2vw, cap 3.4rem) so it can't overflow its column at 1024–1280.
- NOTE: dev-server CSS went stale during this pass (served chunk missing new globals.css rules) — fixed by clean .next restart; worth checking when a CSS edit "doesn't apply."
- Verified: tsc clean, five-viewport audit all green, preflight:full PASS.

## 2026-06-10 (reorganization) — Hero one-sentence, compact statement, step-by-step process, zone-aware navbar

- Hero: replaced the four stacked giant words with one readable block — "Transforming properties, delivering solutions." as the lead line, partner line dimmed beneath, Book Call under. clamp(1.8–2.95rem), max-w-46rem, bottom-left.
- "Embodying meticulous planning…" demoted from billboard display text to a compact maroon-edged reading block in the vision intro right column (word-fill scrub kept, subtle 0.28→1).
- Marquee reverted from oversized editorial text (read tacky) to the refined 11px mono strip, hairline-bounded, maroon diamonds + one maroon item per cycle.
- Process panel is now true step-by-step: rows rest dimmed (white/25–35); a single ScrollTrigger driver lights exactly ONE row at a time (white title + maroon number + 0.5rem shift) as the reader scrolls — Fix 2 single-driver pattern.
- Navbar is now zone-aware via document.elementsFromPoint sampling at (center, 40px): dark glass over hero/photo/black-panel/footer, cream glass over light surfaces. Marked zones with data-header-dark / data-header-light. A 300ms poll keeps it honest because scrub animations (expanding photo) settle after the last scroll event — verified ink matches underlying zone at 10 scroll depths.
- Verified: tsc clean, zero console errors/overflow at both viewports, preflight:full PASS.

## 2026-06-10 (cleanup) — Sentence splits fixed, decisive reveals

- Fixed the awkward hard line break "Refining industry / standards." in BOTH vision and about headlines — now one clean single line on desktop (sized to fit, natural wrap below lg). Vision headline column widened to col-span-7 to guarantee fit.
- Text reveals (section headlines, process rows, row hairlines) converted from scrub-parked to decisive once-based animations — they always complete, never sit half-revealed. The living scrub layer stays: stacked surfaces, photo expansion, word-fill statement, progress rail, plumb line, row ignition.
- Word-fill statement range tightened (completes by 42% viewport). About photos gain the same hover zoom as services.
- Verified: tsc clean, desktop+mobile captures (zero errors/overflow), preflight:full PASS.

## 2026-06-10 (latest) — Color & hierarchy pass (wording untouched)

- Hero re-hierarchy: "Transforming properties, delivering solutions." is now the large two-line h1; "828 Construction is the partner of choice for your next project." moved to a small supporting paragraph (maroon-edged) beside it with the Book Call button. Same words, new placement.
- Navbar: Book Call button added on the desktop right side (inverts with the morphing header: white-on-dark over hero, black-on-cream over the surface, maroon hover).
- Color system: maroon eyebrow labels with tick lines (hero, vision, about), maroon "multiple solutions." headline line, maroon service index numbers, maroon ticks under about photos, one soft-maroon marquee item per cycle, plumb line strengthened to 65% opacity.
- Process block re-staged as a full-bleed BLACK panel: white type, maroon-light numbers/eyebrow, scroll-filled maroon progress rail beside the rows, row ignition (maroon number + title shift) tuned for dark. Page color rhythm is now: dark hero → cream → giant photo → cream marquee → black process → cream about → black footer.
- Branch: work now lives on `ns-preview` (git/deploy policy in CLAUDE.md — never push main without explicit instruction).
- Verified: tsc clean, desktop+mobile full-page captures (zero errors/overflow), stacked-surface mechanics re-probed, preflight:full PASS.

## 2026-06-10 (later) — Extravagant pass: morphing header, stacked surfaces, showpieces

- Researched nsbuilders.com live in Playwright (10 scroll-frame captures + computed-style probe): their hero is a FIXED layer the page rides over; light header with dark ink over light sections; persistent bottom-left CTA card through the whole scroll.
- **Morphing header** (user's explicit ask): on home, header is white-on-transparent over the dark hero, then re-forms to `#f7f7f3/90` glass with dark ink the moment the light editorial surface reaches it. Reverts on scroll-up. Other routes unchanged.
- **Stacked surfaces**: every home section now holds still once fully read (JS-measured sticky tops in `EditorialFlow`) while the next surface rides over it; covered surfaces settle to scale 0.975 / opacity 0.72 for depth. Last section stays in flow for a clean footer junction.
- **Docked CTA** (`DockedCTA.tsx`): persistent "Book Call" card bottom-left, appears after the hero, hides at the footer. Desktop only.
- **Expanding photograph**: the fireplace landscape now scrubs from an inset frame (`inset(10% 9%)`) to full-bleed 92vh as the reader passes it.
- **Editorial marquee**: vision marquee upscaled from 10px mono to clamp(1.6–3.3rem) display text at black/16 with maroon diamonds, 52s.
- **Living hero**: slow Ken Burns drift (26s alternate) on the hero photo beneath the scroll scrub.
- **Process ignition**: each process row's number turns maroon and title shifts 0.5rem while the row holds the reader's focus band.
- Verified: tsc clean, behavioral Playwright probe (header morph colors, sticky stack tops, clipPath expansion, dock show/hide), full-page scroll captures both viewports, zero console errors/overflow, preflight:full 16/16 PASS.

## 2026-06-10 — Home page NS-grammar rebuild (one-surface scroll)

- Rebuilt all four home sections to the NS Builders editorial grammar with ALL copy verbatim (client requirement — no rewording).
- Hero: simplified to one full viewport, statement headline bottom-left (now the page h1), single veil. Hero is CSS-sticky pinned beneath the page; the light editorial surface slides over it as a curtain (one-surface scroll feel).
- Services / Vision / About sections moved from dark gradient-wash panels to a warm off-white editorial surface (#f7f7f3, matches footer panels). Captions sit below image frames, never overlaid. Removed 3D tilt, maroon glow shadows, DraftingMotionLayer usage, drifting decorative shapes, and the pinned horizontal process track.
- New `EditorialFlow` wrapper: continuous scroll-drawn maroon plumb line down the left margin of the entire light region with nodes that ignite per section — the page's connective scroll signature.
- "Embodying meticulous planning…" brand statement elevated to a full-width word-fill scrub moment (SplitType words, Fix 1 four-guard cleanup).
- Headline mask reveals converted to scrub-tied (Fix 15). Process steps are hairline rows revealing per-row on scroll.
- About preview now uses three REAL project detail photos (Cerritos, outdoor pergola, Tustin) instead of a generated image.
- Lenis glide deepened (duration 1.08 → 1.35, wheelMultiplier 0.88) for the continuous one-surface feel.
- KNOWN CONTENT BUG (flagged for client, not fixed per copy-verbatim rule): "Refining industry standards." appears as the headline of BOTH the vision section (HomeVisionSequence) and the about preview (AboutPreview).
- Verified: tsc clean, preflight:full 16/16 PASS, zero console errors, zero horizontal overflow at 1440 and 390 widths, full-page scroll captures at both viewports.

## 2026-05-26 — Push and local cleanup handoff

- Confirmed `main` was aligned with `origin/main` before cleanup; no source edits were pending.
- Ran `git push`, which triggered the full pre-push production preflight. Build succeeded and all 16 route/viewport checks passed, including nav/SplitType cleanup and hard-refresh stability.
- Pushed the hook-updated `.preflight-passed` marker as `44ae824 chore: update preflight marker`.
- Removed safe generated local clutter: `.next`, server logs, Playwright report/output, and `tsconfig.tsbuildinfo`.
- Avoided blanket `git clean -X` because the dry run included important ignored files such as `.env.local` and `node_modules`.
- Stopped local servers on ports `3001`, `4000`, `4001`, and `4028`.
- End state before this note commit: clean working tree, `main...origin/main`, latest preflight report `.claude-work/preflight/2026-05-26-21-09/report.json`.

## 2026-05-21 — Sitewide cleanup, image credibility pass, and full QA

- Visually reviewed every public route at desktop and mobile, including legacy `/process` and `/projects` redirects into `/portfolio`.
- Replaced live portfolio references to generated-angle and v2 generated project images with existing local project/worksite assets; removed the unused untracked v2 generated portfolio files.
- Normalized page metadata titles so pages no longer duplicate `828 Construction` in the browser title.
- Raised too-dark image brightness filters to meet the project image readability rules.
- Hardened the About method section images with eager loading so fast scroll/review does not show black image plates.
- Tightened portfolio production and stress tests after rerunning them against `next start`.
- `npm run lint`, `npx tsc --noEmit --pretty false`, `npm run build`, `npx playwright test tests/portfolio-production.spec.ts --project=chromium`, `npx playwright test tests/stress.spec.ts --project=chromium --workers=1`, and `npm run preflight:full` pass. Latest full report: `.claude-work/preflight/2026-05-21-22-57/report.json`.

## 2026-05-21 — Local dev pinned to localhost:3001

- `npm run dev` now runs `next dev -p 3001`.
- README, CLAUDE project rules, project map, and homepage handoff notes now mark `http://localhost:3001` as the canonical local review URL.
- Port `3000` is documented as another local app and should not be used to review this repo.

## 2026-05-21 — Portfolio production hardening + client-ready QA

- Portfolio case-index preview now remains visible through hard refreshes and all selected rows; desktop uses a stable sticky selected-preview panel and mobile/tablet gets an immediate selected preview.
- Portfolio main project imagery was tightened using stronger existing local assets for weak bath/outdoor slots and five generated replacement images were wired where they improved the client-facing archive.
- Contact above-fold plans image no longer starts hidden behind GSAP reveal state.
- Added `tests/portfolio-production.spec.ts` for portfolio hard-refresh preview/image regressions.
- Stress tests were updated for the current `/portfolio` implementation and custom cursor behavior.
- `npm run lint`, `npx tsc --noEmit --pretty false`, `npm run build`, production route/image audit, portfolio production Playwright test, Chromium stress suite, and `npm run preflight:full` pass. Latest full report: `.claude-work/preflight/2026-05-21-20-51/report.json`.

## 2026-05-20 — Mobile polish + image loading hardening verified

- Header/footer mobile tap targets tightened for the phone link, menu button, footer links, and footer contact CTA.
- Services and service-detail mobile spacing reduced to avoid oversized stacked cards and dead space.
- Home services preview card heights/type scales tuned for 390px mobile widths while retaining the desktop V2.5 layout.
- Portfolio, lightbox, services, home services preview, and contact images now use blur placeholders, eager/priority loading for above-fold imagery, and graceful image-error opacity handling.
- `npm run lint`, `npx tsc --noEmit --pretty false`, `npm run build`, and `npm run preflight:full` pass. Latest full report: `.claude-work/preflight/2026-05-20-19-55/report.json`.

## 2026-05-06 — V2 full rebuild + V2.5 elevation + Homepage Cinematic Overhaul

### Phase 0 — Context rewire
- `docs/828_CLIENT_BRIEF_V2.md` created — full V2 brief from Joseph call
- Maroon `#7B2D26` set as primary accent in tokens, CSS vars, and design docs
- Copper `#B87333` retained as `--color-accent-fallback` per Joe's approval
- `CLAUDE.md` rewritten with V2 section at top (locked decisions, page rebuild order)
- `design/828_DESIGN_SYSTEM.md` updated: V2 palette, typography hierarchy, header rules, motion vocabulary from 4 reference videos
- `design/PATTERNS.md` appended: asterisk dropdown, rolling marquee, glass/depth, asymmetric split

### V2 page rebuilds (separate terminals)
All 9 pages rebuilt per `docs/828_CLIENT_BRIEF_V2.md`. Key changes:
- Splash: NS Builders vertical gradient, one-line wordmark, slide-up reveal
- Home: stripped to Hero + Services Preview + About Preview + Footer; BOOK CALL asterisk dropdown replaces old CTAs; asymmetric split hero; timestamp+location moved to right
- About: 6 sections — story (short version), 3 principles, CRAFT acronym watermark, South Bay marquee, CTA
- ADU/Remediation/Consulting: visual hero + need + FAQ + process + acronym + start-here template
- Services landing: asymmetric 3-tile gateway
- Portfolio: `/portfolio` route (was `/projects`); Process page deleted, content merged in
- Footer: rolling marquee + broken-color blocks + schedule CTA

### V2.5 elevation pass
New infrastructure:
- `components/system/` — GrainOverlay, RightScrollProgress, GlassCard, 6 SVG silhouettes
- `lib/hooks/` — useMagnetic, useSectionScrub, useTilt
- `app/template.tsx` — cinematic curtain page transition
- Custom scrollbar (maroon), `::selection` (maroon), GrainOverlay 0.055

Per-page upgrades:
- All 9 pages: silhouette parallax overlays, glass cards, 2-layer marquees, magnetic CTAs
- CRAFT/ADU/Remediation acronym sections: GlassCard definitions
- Service heroes: per-page silhouette (Arch/ConstructionLine/Blueprint)
- Footer: magnetic 828 anchor, license badge glow

### Homepage Cinematic Overhaul (Prompt 1)
- `SplashScreen.tsx`: `rotateX: 88→0` 3-channel reveal + maroon radial ignition + curtain-wipe exit
- `Header.tsx`: sub-nav marquee strip (35s always-on) + BOOK CALL `pulseGlow` animation + magnetic 0.55
- `HeroV2.tsx`: mesh gradient idle drift + silhouette 65vw/0.55/float/-85% parallax + photo 1.10 + copy -20% + headline rotateX load entry + scroll fade-out
- `ServicesPreviewV2.tsx`: useTilt(10) 3D cards + z:40 lift + maroon shadow + rotateY entry
- `AboutPreview.tsx`: SplitType clipPath curtain-wipe + ConstructionLine silhouette 0.08 + magnetic CTA
- `Footer.tsx`: 2-layer marquee size contrast (2.2rem bg vs 9px fg, 0.18 vs 1.0 opacity)
- `CustomCursor.tsx`: `.has-custom-cursor` body class hides native cursor on `pointer:fine`
- `globals.css`: `@keyframes pulseGlow`, `.book-call-cta`, `.has-custom-cursor * { cursor: none }`
- Preflight hardened for Windows OOM: .next wipe pre-build, NODE_OPTIONS 4096MB, chromium flags

## 2026-04-29 — Four-workstream quality pass

### WS1: Visual QA + 25+ years fix (site-wide)
- **25+ years** — all remaining "20+ years" instances fixed in 12 files: `HeroSections.tsx`, `BuildingScience.tsx`, `HomeCTA.tsx`, `HomeInterstitial.tsx`, `ProjectsGallery.tsx`, `ProcessContent.tsx`, `ServiceDetailContent.tsx`, `ServicesContent.tsx`, `AboutContent.tsx`, `ContactContent.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/services/[slug]/page.tsx`, `lib/constants.ts`. All counters updated (val:25), all JSX fallback text updated ("25+").

### WS2: Mobile + Footer
- **Footer mobile redesign** — `components/layout/Footer.tsx`: mobile nav changed from `flex flex-wrap gap-y-0` (zero gap) to `grid grid-cols-2` with `min-h-[44px]` tap targets. Navigate and Services now share a clean 2-col grid. Desktop service area shows all 8 cities (was showing only 5 via `slice(0,5)`).

### WS3: Stress Test Suite
- **`tests/stress.spec.ts`** — 21 tests, all passing: rapid navigation (9 routes), filter spam (Projects), form stress (empty/XSS/double-submit), scroll velocity, viewport resize (1440→320→1440), keyboard nav, back/forward nav, mobile overflow (all 9 routes at 390px). Base URL configurable via `TEST_BASE_URL`.

### WS4: Form Implementation
- **`components/contact/ContactForm.tsx`** — complete redesign: dark card in white section (editorial contrast), white labels (`font-labels` uppercase), copper focus rings, field-level validation with inline errors, honeypot anti-spam field, double-submit guard (`submittingRef`), loading spinner SVG, animated copper checkmark success state (SVG stroke-dashoffset draw, 2 CSS keyframes added to `globals.css`)
- **`components/contact/ServicePageContactForm.tsx`** — honeypot added, double-submit guard, animated checkmark success state, loading spinner
- **`app/api/contact/route.ts`** — rate limiting (5 req per 10 min per IP, in-memory Map), honeypot check (silent success for bots), server-side validation with field-level error response, stricter phone/email regex
- **`ContactContent.tsx`** — right column now wrapped in `bg-[#0a0a0a] p-8 lg:p-10` dark card for editorial white/dark column contrast
- **`globals.css`** — added `@keyframes drawCircle` and `@keyframes drawCheck` for SVG checkmark animation

### Lighthouse (final, production build)
All 9 routes: Perf ≥94, A11y ≥96 (Home=99, Contact=96, About=99, Services=99, ADU=98, Remediation=94, Consulting=98, Process=96, Projects=99)

## 2026-04-24 (session 2 — mobile polish + year correction)

- **Mobile footer redesign** — `components/layout/Footer.tsx`: NAVIGATE + SERVICES merged into grid-cols-2 with vertical stacked link lists (no more horizontal flex-wrap overflow); section labels now copper-tinted; dividers border-white/10; phone 1.9rem; consistent py-8 rhythm. CTA tracking tightened.
- **Hero mobile scroll indicator** — added `hidden sm:flex` to scroll indicator: hidden on <640px where hero is 100vh and scroll extension doesn't exist; no more overlap with stacked CTA buttons.
- **EST. 2004 → EST. 2025** — site-wide correction across all 30+ instances: Hero, HeroSections, HomeCTA, HomeInterstitial, HomeMarquee, About (8 instances including watermark and sticky credential), Contact (counter target 2004→2025), Services components, metadata files, lib/constants.ts, design/PATTERNS.md.
- **20+ years → 25+ years** — all team experience claims updated to match 25+ years per client instruction. Company EST. date = 2025; team experience = 25+ years (kept separate).
- Pushed 6 clean conventional commits to origin/main (rebased onto other session's nav/ScrollTrigger fixes).
- Vercel auto-deploy triggered from main push.

## 2026-04-23

- **Full site v3 polish** — all 9 routes revamped for more organization, professional polish, and interactivity
- BuildingScience: vertical copper rule through pillars (scaleY scrub), stat counter 0→20+, group hover on pillar rows (copper number + bg shift)
- ServicesPreview: Pattern C overflow-hidden headline reveal, GSAP image brightness + scale hover on service rows
- About (city cards): copper group hover — city name turns copper, hairline brightens, body text lifts opacity
- Contact: vertical copper gradient connector line between "What Happens After" steps
- Process (EditorialStandards): group hover — number lifts to 100% opacity, body text brightens, subtle bg shift
- Services detail (all 3): per-element scrub reveal (Fix 15), copper bullet points, keyword hover states
- ProjectsGallery: filter tab copper hover hint on inactive tabs
- HomeInterstitial: fixed stat divider absolute positioning (added `relative` to stat-item)
- Footer: all nav links now hover to copper (#B87333) consistently
- All 18/18 preflight routes: PASS
- All pages Lighthouse: Perf ≥99, A11y ≥96

## 2026-04-22

- About page: revamped v2 — Perf=100, A11y=96, founder rewrite, credential card, SelectiveWork section, "2004" drift signature
- Process page: revamped v3 — Perf=85, A11y=96, EditorialStandards section, hero LCP fix, preflight hardened

## 2026-04-21

- Preflight system installed: `npm run preflight:full` runs next build + all 9 routes. PreToolUse hook blocks git push until preflight passes.
- Home: revamped v2 — Perf=99, A11y=100
- Services: revamped v4 — Perf=98, A11y=96, 13 images
- Services/ADU, Remediation, Consulting: master audit — Perf=87, A11y=96
- Contact: master audit — Perf=86, A11y=96
- Projects: revamped v2 — Perf=99, A11y=96

## 2026-04-20

- About page: initial bug-fix pass — SplitType 4-guard cleanup applied
