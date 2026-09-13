"use client";

import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  COARSE_TABLET_QUERY,
  DESKTOP_MOTION_QUERY,
} from "@/utils/animationControl";

gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });

// ── Global animation failsafe ──────────────────────────────────────────────────
// Elements with data-gsap-reveal="true" start at opacity:0 or clipPath:hidden via
// GSAP. If their ScrollTrigger fires correctly, they reveal as intended. If the
// trigger misfires (stale positions, navigation race, etc.), this observer gives
// them a 2s grace window while in-viewport, then force-reveals them so users
// never see permanently invisible content on a live production site.
function attachRevealFailsafe() {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

  const GRACE_MS = 2500;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const recoveryTweens = new Set<gsap.core.Tween>();
  let disposed = false;

  const shouldForceReveal = (el: HTMLElement): boolean => {
    if (disposed || !el.isConnected) return false;
    const style = window.getComputedStyle(el);
    const opacity = parseFloat(style.opacity);
    const clip = style.clipPath;
    // Invisible: opacity near 0 OR fully clipped via inset
    if (opacity < 0.08) return true;
    if (clip && (
      clip.includes("inset(100%") ||
      clip.includes("inset(0% 100%") ||
      clip.includes("inset(0% 0% 100%")
    )) return true;
    return false;
  };

  const forceReveal = (el: HTMLElement) => {
    const tween = gsap.to(el, {
      // autoAlpha (not bare opacity): GSAP's autoAlpha-hidden elements carry
      // visibility:hidden alongside opacity:0 — restoring only opacity left
      // them invisible and "rescued" at the same time (found 2026-07-13).
      autoAlpha: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      y: 0,
      x: 0,
      yPercent: 0,
      xPercent: 0,
      scale: 1,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.55,
      ease: "power2.out",
      overwrite: true,
    });
    recoveryTweens.add(tween);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);

        const timer = setTimeout(() => {
          timers.delete(timer);
          if (shouldForceReveal(el)) forceReveal(el);
        }, GRACE_MS);
        timers.add(timer);
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
  );

  // Explicit data-gsap-reveal targets
  document.querySelectorAll<HTMLElement>("[data-gsap-reveal]").forEach((el) => observer.observe(el));

  // Broader catch: any element with GSAP-applied inline clipPath or opacity:0
  // This catches elements that weren't tagged but still need recovery.
  document.querySelectorAll<HTMLElement>("[style]").forEach((el) => {
    const s = el.style;
    if (!s) return;
    // Skip aria-hidden decorative elements (ghost numbers, watermarks)
    if (el.getAttribute("aria-hidden") === "true") return;
    // Skip self-managed hidden UI (toasts, overlays) — force-revealing these
    // paints stuck chrome over the page (see PhoneCopyToast, 2026-07-09).
    if (el.hasAttribute("data-failsafe-exempt")) return;
    const hasHiddenClip = s.clipPath && (
      s.clipPath.includes("inset(100%") ||
      s.clipPath.includes("inset(0% 100%") ||
      s.clipPath.includes("inset(0% 0% 100%")
    );
    const hasZeroOpacity = s.opacity === "0";
    if (hasHiddenClip || hasZeroOpacity) {
      observer.observe(el);
    }
  });

  return () => {
    disposed = true;
    observer.disconnect();
    timers.forEach(clearTimeout);
    recoveryTweens.forEach((tween) => tween.kill());
    timers.clear();
    recoveryTweens.clear();
  };
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const isFirstMount = useRef(true);
  const failsafeCleanupRef = useRef<(() => void) | null>(null);
  const [smoothScrollEnabled, setSmoothScrollEnabled] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_MOTION_QUERY);
    const coarseTablet = window.matchMedia(COARSE_TABLET_QUERY);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const sync = () => {
      setSmoothScrollEnabled(
        desktop.matches && !coarseTablet.matches && !reducedMotion.matches
      );
    };

    sync();
    desktop.addEventListener("change", sync);
    coarseTablet.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      coarseTablet.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  const refreshMotion = useCallback(() => {
    if (lenisRef.current) lenisRef.current.resize();
    ScrollTrigger.refresh(true);
    failsafeCleanupRef.current?.();
    failsafeCleanupRef.current = attachRevealFailsafe() ?? null;
  }, []);

  // ── Scroll restoration — fires synchronously before any useEffect ──────────
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;

      // Scroll reset
      if (window.innerWidth < 768) {
        window.scrollTo(0, 0);
      } else if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      // On hard refresh: trigger positions are calculated before images finish
      // loading. Refresh after window.load so layout is final.
      const doRefresh = () => {
        refreshMotion();
      };

      let refreshFrame = 0;
      let nestedRefreshFrame = 0;

      if (document.readyState === "complete") {
        // Already loaded — refresh on next frame (after this effect batch)
        refreshFrame = requestAnimationFrame(() => {
          nestedRefreshFrame = requestAnimationFrame(doRefresh);
        });
      } else {
        window.addEventListener("load", doRefresh, { once: true });
      }

      // Cleanup runs when navigating away from the initial page.
      // Must be in CLEANUP (not body) so it fires BEFORE the new page's
      // children useEffects create their ScrollTriggers.
      return () => {
        failsafeCleanupRef.current?.();
        failsafeCleanupRef.current = null;
        window.removeEventListener("load", doRefresh);
        if (refreshFrame) cancelAnimationFrame(refreshFrame);
        if (nestedRefreshFrame) cancelAnimationFrame(nestedRefreshFrame);
        window.scrollTo(0, 0);
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    }

    // ── Client-side navigation ────────────────────────────────────────────
    // Triggers from the departing page were already killed in the CLEANUP of the
    // previous effect run (see return below). This effect body only needs to scroll
    // to top and schedule the post-mount refresh — it must NOT kill triggers here
    // because the new page's children useEffects have already run and created their
    // ScrollTriggers by the time this parent effect body executes.
    const resetToTop = () => {
      // Portfolio owns valid fragment landings and reasserts them after late
      // layout. Every path-only navigation must defeat both Next's delayed
      // scroll handling and any target retained by the persistent Lenis
      // instance from the departing route.
      if (window.location.hash) return;
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };

    resetToTop();
    const resetFrames: number[] = [];
    resetFrames.push(
      requestAnimationFrame(() => {
        resetToTop();
        resetFrames.push(requestAnimationFrame(resetToTop));
      })
    );
    const resetTimers = [120, 320].map((delay) =>
      setTimeout(resetToTop, delay)
    );

    const refreshTimer = setTimeout(() => {
      refreshMotion();
      resetFrames.push(requestAnimationFrame(resetToTop));
    }, 340);

    return () => {
      failsafeCleanupRef.current?.();
      failsafeCleanupRef.current = null;
      clearTimeout(refreshTimer);
      resetFrames.forEach(cancelAnimationFrame);
      resetTimers.forEach(clearTimeout);
      // Kill departing page's triggers in CLEANUP so they're gone before the
      // next page's children effects run and create fresh triggers.
      resetToTop();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [pathname, refreshMotion]);

  useEffect(() => {
    if (!smoothScrollEnabled) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;
    // Global handle: Lenis owns desktop scroll, so anything that needs a
    // programmatic glide (junction settle, anchor jumps) must go THROUGH it —
    // raw window.scrollTo animations get reconciled away by Lenis' raf.
    (window as unknown as { __lenis828?: Lenis }).__lenis828 = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Initial refresh — fires after all children useEffects have created their
    // ScrollTriggers. Recalculates positions with correct scroll origin (Y=0).
    ScrollTrigger.refresh();

    let disposed = false;
    document.fonts?.ready
      .then(() => {
        if (disposed) return;
        lenis.resize();
        ScrollTrigger.refresh(true);
      })
      .catch(() => {});

    // ── Resize ───────────────────────────────────────────────────────────────
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        refreshMotion();
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ── Visibility change ─────────────────────────────────────────────────────
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        ScrollTrigger.refresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      failsafeCleanupRef.current?.();
      lenis.destroy();
      delete (window as unknown as { __lenis828?: Lenis }).__lenis828;
      lenisRef.current = null;
      gsap.ticker.remove(tick);
    };
  }, [refreshMotion, smoothScrollEnabled]);

  return <>{children}</>;
}
