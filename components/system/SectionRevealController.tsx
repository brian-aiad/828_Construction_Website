"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import {
  COARSE_TABLET_QUERY,
  DESKTOP_MOTION_QUERY,
} from "@/utils/animationControl";

type RevealDirection = "left" | "right" | "up";

type RevealUnit = {
  trigger: HTMLElement;
  targets: HTMLElement[];
  direction: RevealDirection;
  delay: number;
  stagger: number;
  revealed: boolean;
};

const SELECTOR = "[data-motion-reveal]";

function numberFromDataset(value: string | undefined, fallback = 0) {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function directionFromDataset(value: string | undefined): RevealDirection {
  if (value === "left" || value === "right") return value;
  return "up";
}

export default function SectionRevealController() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const roots = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopMotion = window.matchMedia(DESKTOP_MOTION_QUERY);
    const coarseTouch = window.matchMedia(COARSE_TABLET_QUERY);
    // Touch devices retain native scrolling; only their entrance distance and
    // duration are reduced. A motion preference always takes precedence.
    const staticEntrancesEnabled = () => reducedMotion.matches;
    const compactMotion = () => !desktopMotion.matches || coarseTouch.matches;
    const entranceDistance = () => compactMotion() ? 12 : window.innerWidth < 1280 ? 26 : 34;
    const units: RevealUnit[] = roots.map((trigger) => {
      const stagger = numberFromDataset(trigger.dataset.motionStagger);
      const children = stagger > 0
        ? Array.from(trigger.children).filter(
            (child): child is HTMLElement =>
              child instanceof HTMLElement && !child.hasAttribute("data-motion-static")
          )
        : [];

      return {
        trigger,
        targets: children.length ? children : [trigger],
        direction: directionFromDataset(trigger.dataset.motionReveal),
        delay: numberFromDataset(trigger.dataset.motionDelay),
        stagger,
        revealed: false,
      };
    });

    const allTargets = units.flatMap((unit) => unit.targets);
    const ambientTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".hero-kenburns, .animate-brand-marquee, [data-ambient-motion]"
      )
    );
    const ambientObserver = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              entry.target.toggleAttribute("data-ambient-paused", !entry.isIntersecting);
            });
          },
          { rootMargin: "120px 0px" }
        );
    if (ambientObserver) {
      ambientTargets.forEach((target) => {
        target.setAttribute("data-ambient-paused", "");
        ambientObserver.observe(target);
      });
    }

    let remaining = units.length;
    const activeTweens = new Set<gsap.core.Tween>();
    const ctx = gsap.context(() => {
      if (staticEntrancesEnabled()) {
        gsap.set(allTargets, { opacity: 1, x: 0, y: 0, clearProps: "willChange" });
        units.forEach((unit) => {
          unit.revealed = true;
          unit.trigger.setAttribute("data-motion-revealed", "true");
        });
        remaining = 0;
        return;
      }

      units.forEach((unit) => {
        const distance = entranceDistance();
        const from =
          unit.direction === "left"
            ? { x: -distance, y: 0 }
            : unit.direction === "right"
              ? { x: distance, y: 0 }
              : { x: 0, y: distance };
        gsap.set(unit.targets, {
          opacity: 0,
          ...from,
        });
      });
    }, document.body);

    const reveal = (unit: RevealUnit, immediate = false) => {
      if (unit.revealed) return;
      unit.revealed = true;
      remaining = Math.max(0, remaining - 1);
      unit.trigger.setAttribute("data-motion-revealed", "true");

      if (immediate || staticEntrancesEnabled()) {
        gsap.set(unit.targets, {
          opacity: 1,
          x: 0,
          y: 0,
          clearProps: "transform,opacity,willChange",
        });
        return;
      }

      gsap.set(unit.targets, { willChange: "transform, opacity" });
      const tween = gsap.to(unit.targets, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: compactMotion() ? 0.48 : 0.7,
        delay: compactMotion() ? Math.min(unit.delay, 0.1) : unit.delay,
        stagger: compactMotion()
          ? Math.min(unit.stagger, 0.3 / Math.max(1, unit.targets.length - 1))
          : unit.stagger,
        ease: "power2.out",
        force3D: true,
        overwrite: "auto",
        onComplete: () => {
          activeTweens.delete(tween);
          gsap.set(unit.targets, { clearProps: "transform,opacity,willChange" });
        },
      });
      activeTweens.add(tween);
    };

    const viewportBand = (unit: RevealUnit) => {
      const rect = unit.trigger.getBoundingClientRect();
      const topEdge = window.innerHeight * 0.9;
      const bottomEdge = window.innerHeight * 0.08;
      return {
        inBand: rect.top <= topEdge && rect.bottom >= bottomEdge,
        passed: rect.bottom < bottomEdge,
      };
    };

    units.map((unit) => ({ unit, state: viewportBand(unit) })).forEach(({ unit, state }) => {
      if (state.passed) reveal(unit, true);
      else if (state.inBand) reveal(unit);
    });

    let lastScrollY = window.scrollY;
    let lastEventY = window.scrollY;
    let velocityWindowStartedAt = performance.now();
    let velocityWindowStartedY = window.scrollY;
    let jumpUntil = 0;
    const noteScrollVelocity = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const directJump = Math.abs(currentY - lastEventY) > window.innerHeight * 0.55;
      lastEventY = currentY;
      if (now - velocityWindowStartedAt > 240) {
        velocityWindowStartedAt = now;
        velocityWindowStartedY = currentY;
      }
      if (
        directJump ||
        Math.abs(currentY - velocityWindowStartedY) > window.innerHeight * 0.65
      ) {
        jumpUntil = now + 360;
        activeTweens.forEach((tween) => tween.totalProgress(1));
      }
    };
    const recentlyJumped = () => performance.now() < jumpUntil;
    const observer = typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            const jumped =
              recentlyJumped() ||
              Math.abs(window.scrollY - lastScrollY) > window.innerHeight * 1.25;
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const unit = unitByTrigger.get(entry.target);
              if (!unit) return;
              reveal(unit, jumped);
              observer?.unobserve(unit.trigger);
            });
            lastScrollY = window.scrollY;
          },
          { threshold: 0.04, rootMargin: "0px 0px -9% 0px" }
        );

    const unitByTrigger = new Map<Element, RevealUnit>(
      units.map((unit) => [unit.trigger, unit])
    );

    units.forEach((unit) => {
      if (!unit.revealed) observer?.observe(unit.trigger);
    });

    let frame = 0;
    const inspect = () => {
      frame = 0;
      const movingDown = window.scrollY >= lastScrollY;
      const jumped =
        recentlyJumped() ||
        Math.abs(window.scrollY - lastScrollY) > window.innerHeight * 1.25;
      lastScrollY = window.scrollY;
      units.filter((unit) => !unit.revealed)
        .map((unit) => ({ unit, state: viewportBand(unit) }))
        .forEach(({ unit, state }) => {
        if (state.inBand) reveal(unit, jumped);
        else if (movingDown && state.passed) reveal(unit, true);
      });
    };
    const scheduleInspect = () => {
      if (remaining > 0 && !frame) frame = requestAnimationFrame(inspect);
    };
    const onScroll = () => {
      noteScrollVelocity();
      scheduleInspect();
    };
    // WebKit can commit an immediate Lenis/deep-link jump without dispatching
    // a native scroll event. A few bounded probes cover that path and late
    // image geometry without leaving a polling loop alive during reading.
    const probeTimers = [240, 700, 1400, 2800].map((delay) =>
      window.setTimeout(scheduleInspect, delay)
    );
    const onFocusIn = (event: FocusEvent) => {
      // Finish an already-running entrance too, so a keyboard user never
      // focuses a partially transparent control.
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>(SELECTOR)
        : null;
      const unit = target
        ? units.find((candidate) => candidate.trigger === target)
        : undefined;
      if (unit) {
        activeTweens.forEach((tween) => {
          if (tween.targets().some((target) => unit.targets.includes(target as HTMLElement))) {
            tween.totalProgress(1);
          }
        });
        reveal(unit, true);
      }
    };
    const finishForStaticMotion = () => {
      if (!staticEntrancesEnabled()) return;
      activeTweens.forEach((tween) => tween.totalProgress(1));
      units.forEach((unit) => reveal(unit, true));
    };

    if (remaining > 0) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", scheduleInspect, { passive: true });
    }
    document.addEventListener("focusin", onFocusIn);
    desktopMotion.addEventListener("change", finishForStaticMotion);
    reducedMotion.addEventListener("change", finishForStaticMotion);
    coarseTouch.addEventListener("change", finishForStaticMotion);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      probeTimers.forEach(clearTimeout);
      observer?.disconnect();
      ambientObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleInspect);
      document.removeEventListener("focusin", onFocusIn);
      desktopMotion.removeEventListener("change", finishForStaticMotion);
      reducedMotion.removeEventListener("change", finishForStaticMotion);
      coarseTouch.removeEventListener("change", finishForStaticMotion);
      units.forEach((unit) => unit.trigger.removeAttribute("data-motion-revealed"));
      ambientTargets.forEach((target) => target.removeAttribute("data-ambient-paused"));
      activeTweens.forEach((tween) => tween.kill());
      gsap.set(allTargets, { clearProps: "transform,opacity,willChange" });
      try {
        ctx.revert();
      } catch {}
    };
  }, [pathname]);

  return null;
}
