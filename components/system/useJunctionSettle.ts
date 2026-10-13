"use client";

import { useEffect, type RefObject } from "react";
import {
  COARSE_TABLET_QUERY,
  DESKTOP_MOTION_QUERY,
} from "@/utils/animationControl";

// Junction snap-settle for stacked-surface flows (Brian, 2026-07-10; PATTERNS
// Fix 26). The cover transitions look clean in motion, but a scroll that STOPS
// mid-junction rests with the previous surface half-covered. When scrolling
// goes genuinely idle inside a cover transition, glide the short remaining
// distance so the page always comes to rest fully composed.
//
// CANONICAL copy — every flow imports THIS file (components/home/
// useJunctionSettle re-exports it). Two implementations briefly diverged on
// 2026-07-10; the differences below are all hard-won, do not fork again:
//
// Band detection is LIVE-RECT, not doc-offset zones: "mid-junction" == some
// surface's viewport-top ∈ (MARGIN, vh−MARGIN). Sticky-proof, and — unlike a
// zone spanning rests[0]..rests[last] — it never fires while the reader is
// INSIDE a tall surface (internal pinned runways like the home approach walk
// or the services index sit between boundaries, where no surface edge crosses
// the viewport). Overlapping bands from shorter-than-viewport sections are
// handled by bounded re-measure correction rounds after each glide.
//
// Targeting is MAJORITY-AWARE: when the incoming surface owns most of the
// visible band, complete the cover; otherwise restore the previous surface.
// Exact half rests honor gesture direction.
//
// The glide goes THROUGH lenis.scrollTo (window.__lenis828, exposed by
// LenisProvider): raw window.scrollTo glides get reconciled away by Lenis'
// raf loop (torture run: 18/40 stops still rested half-covered). The rAF path
// is only a no-Lenis fallback.
//
// Guards (all required — this hook is shared, keep them intact):
// - Desktop-only (min-width: 1024px, checked live) + reduced-motion no-op.
// - Arms ONLY on genuine user input (wheel / touch / pointer / scroll keys):
//   anchor jumps, deep links, and other programmatic scrolls never settle.
// - Scroll-end detection is VELOCITY-based: Lenis' long easing tail keeps
//   emitting scroll events after the wheel stops, so idle = the page moved
//   <1px across an IDLE_MS window, re-checked while momentum continues.
// - One settle per user gesture (armed clears at glide start); bounded
//   follow-up correction rounds only re-measure overlap bands, never chase.
// - Any input during the glide cancels it instantly.
// - MIN_DIST skips micro-settles (also makes every landing terminal).

const MARGIN = 32; // px from a clean edge that still counts as "resting clean"
const IDLE_MS = 160; // stillness window that marks a genuine scroll-end
const MAX_ROUNDS = 3; // one gesture = one settle + bounded overlap corrections
const MIN_DIST = 4; // px — skip micro-glides
const SCROLL_KEYS = new Set([
  " ",
  "PageDown",
  "PageUp",
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
]);

type LenisHandle = {
  scrollTo: (
    y: number,
    opts: {
      duration: number;
      easing: (t: number) => number;
      onComplete?: () => void;
    }
  ) => void;
};

export function useJunctionSettle(
  wrapRef: RefObject<HTMLElement | null>,
  surfaceSelector = "[data-stack-surface]",
  enabled = true
) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const desktopQuery = window.matchMedia(DESKTOP_MOTION_QUERY);
    const coarseTabletQuery = window.matchMedia(COARSE_TABLET_QUERY);
    const shouldSettle = () => desktopQuery.matches && !coarseTabletQuery.matches;

    let armed = false; // true only after genuine user input
    let settling = false;
    let cancelled = false;
    let settleRounds = 0;
    let glideRaf = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let lastY = window.scrollY;
    let direction: 1 | -1 | 0 = 0;

    // A junction is DIRTY only while the incoming surface is actually cutting
    // into the surface above it. The upper clean rest for surface i is
    // min(vh, bottom of surface i−1): for viewport-scale sections that's vh
    // (fully off-screen below), but for SUB-VIEWPORT sections the natural
    // composed state is the incoming surface sitting FLUSH below the fully
    // visible short section — top == prevBottom < vh. Treating that as clean
    // is what keeps stacks of short sections (remediation: faq 728 / approach
    // 706 / method 619) terminal in ONE glide instead of cascading the whole
    // stack or landing dirty (2026-07-10, remediation torture).
    const activeJunction = (
      margin: number
    ): {
      top: number;
      restUp: number;
      nearest: boolean;
      backMinY: number;
    } | null => {
      const wrap = wrapRef.current;
      if (!wrap) return null;
      const vh = window.innerHeight;
      // Document-wide: the site footer is a stacked surface too (Brian
      // 2026-07-13 full-screen-footer cover) — it lives OUTSIDE the flow
      // wrap, so scoping to wrap would leave the footer junction unsnapped.
      // Every page has exactly one flow, so document order == stack order.
      const surfaces = Array.from(
        document.querySelectorAll<HTMLElement>(
          `${surfaceSelector}, [data-footer-surface]`
        )
      );
      // Deepest intruder (largest top): with overlapping bands more than one
      // surface can rest mid-band; resolving the deepest first converges.
      let worst: {
        top: number;
        restUp: number;
        nearest: boolean;
        backMinY: number;
      } | null = null;
      surfaces.forEach((el, i) => {
        const top = el.getBoundingClientRect().top;
        const prev = surfaces[i - 1];
        const prevBottom = prev
          ? prev.getBoundingClientRect().bottom
          : vh;
        const restUp = Math.min(vh, prevBottom);
        // data-snap-edge = INTERNAL boundary (e.g. home's statement →
        // approach runway inside one surface). Since the section above the
        // edge is a clean FULL-VIEWPORT screen (statement owns the whole
        // viewport at its snapped rest — Brian, 2026-07-13 round 4), the edge
        // behaves exactly like a surface junction: full band, direction-aware.
        // The only edge-specific rule left is the back-off clamp below.
        const isEdge = el.hasAttribute("data-snap-edge");
        if (top > margin && top < restUp - margin) {
          if (worst === null || top > worst.top) {
            // Backing off a snap-edge must not scroll above its CONTAINING
            // surface's own snap (backMinY) or the previous surface peeks
            // above the restored section.
            let backMinY = 0;
            if (isEdge) {
              const host = el.closest<HTMLElement>("[data-stack-surface]");
              if (host && host !== el) {
                backMinY = window.scrollY + host.getBoundingClientRect().top;
              }
            }
            worst = { top, restUp, nearest: isEdge, backMinY };
          }
        }
      });
      return worst;
    };

    const cancelGlide = () => {
      cancelled = true;
      if (glideRaf) cancelAnimationFrame(glideRaf);
      glideRaf = 0;
      settling = false;
    };

    const glideTo = (target: number) => {
      settling = true;
      cancelled = false;
      armed = false; // one settle per user gesture; re-arm on next input
      const dist = Math.abs(target - window.scrollY);
      const durationMs = Math.min(520, Math.max(240, dist * 0.72));
      const lenis = (window as unknown as { __lenis828?: LenisHandle })
        .__lenis828;
      if (lenis) {
        lenis.scrollTo(target, {
          duration: durationMs / 1000,
          easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
          onComplete: () => {
            settling = false;
            if (cancelled) return;
            // Lenis' internal epsilon can strand very short glides a few px
            // shy of the target (repeatably — corrections re-glide and strand
            // at the same offset). At rest a direct scrollTo sticks (Lenis
            // adopts external scrolls when idle), so square up the residual
            // before re-measuring.
            const residual = target - window.scrollY;
            if (Math.abs(residual) > MIN_DIST && Math.abs(residual) <= 48) {
              window.scrollTo(0, target);
            }
            settleStep(true); // correction pass (tight margin)
          },
        });
        return;
      }
      // Fallback (no Lenis): manual rAF glide.
      const from = window.scrollY;
      const delta = target - from;
      const start = performance.now();
      const step = (now: number) => {
        if (cancelled) {
          settling = false;
          return;
        }
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        window.scrollTo(0, Math.round(from + delta * eased));
        if (t < 1) {
          glideRaf = requestAnimationFrame(step);
        } else {
          settling = false;
          glideRaf = 0;
          if (!cancelled) settleStep(true);
        }
      };
      glideRaf = requestAnimationFrame(step);
    };

    // One gesture may need bounded FOLLOW-UP glides: with overlapping bands
    // (section shorter than the viewport), completing one cover can leave the
    // next surface resting mid-band. Sticky pinning makes the geometry
    // non-linear, so re-MEASURE after each glide and correct — at most
    // MAX_ROUNDS times, still cancelled instantly by any input.
    const settleStep = (isCorrection = false) => {
      // Guard on settling only — `cancelled` is a per-glide latch (checked in
      // the glide's own frames / onComplete chain). Gating entry on it here
      // would permanently disable settling after the first cancelled glide.
      if (settling) return;
      if (direction === 0 || settleRounds <= 0) return;
      // Correction passes re-measure with a TIGHT margin so glide undershoot
      // (Lenis can land a hair short) gets finished to pixel-flush instead of
      // resting a sliver inside MARGIN. Entry keeps the loose MARGIN so we
      // never engage on positions the reader would call composed.
      const junction = activeJunction(isCorrection ? MIN_DIST : MARGIN);
      if (junction === null) return;
      settleRounds--;
      // Majority settle: if the incoming surface owns most of the clean band,
      // complete the cover; otherwise restore the previous surface. This keeps
      // rests feeling intentional instead of direction-only.
      const goForward =
        junction.top < junction.restUp / 2 ||
        (junction.top === junction.restUp / 2 && direction === 1);
      let target = goForward
        ? window.scrollY + junction.top // complete to the boundary
        : window.scrollY - (junction.restUp - junction.top); // restore above
      if (!goForward && junction.nearest) {
        target = Math.max(target, junction.backMinY); // never above host snap
      }
      if (Math.abs(target - window.scrollY) < MIN_DIST) return;
      glideTo(Math.max(0, target));
    };

    const onIdle = () => {
      if (!armed || settling || !shouldSettle()) return;
      settleRounds = MAX_ROUNDS;
      settleStep();
    };

    // Velocity-based idle: Lenis' momentum tail keeps emitting scroll events;
    // idle == the page held still for IDLE_MS. Keep watching while it moves.
    let idleAnchorY = -1;
    const scheduleIdleCheck = () => {
      clearTimeout(idleTimer);
      idleAnchorY = window.scrollY;
      idleTimer = setTimeout(() => {
        if (settling) return;
        if (Math.abs(window.scrollY - idleAnchorY) < 1) onIdle();
        else scheduleIdleCheck(); // still moving under momentum
      }, IDLE_MS);
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 1 && !settling) {
        direction = y > lastY ? 1 : -1;
      }
      lastY = y;
      if (settling) return; // our own glide must not re-trigger idle checks
      if (!armed) return;
      scheduleIdleCheck();
    };

    const arm = () => {
      if (settling) cancelGlide(); // input during a glide aborts it instantly
      armed = true;
    };
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        armed = false;
        clearTimeout(idleTimer);
        cancelGlide();
        return;
      }
      if (SCROLL_KEYS.has(e.key)) arm();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", arm, { passive: true });
    window.addEventListener("touchstart", arm, { passive: true });
    window.addEventListener("touchmove", arm, { passive: true });
    window.addEventListener("pointerdown", arm, { passive: true });
    window.addEventListener("keydown", onKeydown, { passive: true });

    return () => {
      cancelGlide();
      clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", arm);
      window.removeEventListener("touchstart", arm);
      window.removeEventListener("touchmove", arm);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", onKeydown);
    };
  }, [enabled, wrapRef, surfaceSelector]);
}
