"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FlowNode from "@/components/system/FlowNode";
import { useJunctionSettle } from "@/components/system/useJunctionSettle";
import { useStackSurfaceVisibility } from "@/components/system/useStackSurfaceVisibility";
import {
  COARSE_TABLET_QUERY,
  DESKTOP_MOTION_QUERY,
} from "@/utils/animationControl";

gsap.registerPlugin(ScrollTrigger);

type StackMotionMode = "desktop" | "touch" | "none";

type StackedSurfaceFlowProps = {
  children: React.ReactNode;
  flowAttribute: string;
  className?: string;
  surfaceClassName?: string;
  settleSelector?: string;
  darkVeilOpacity?: number;
  lightVeilOpacity?: number;
  resizeDebounceMs?: number;
};

export default function StackedSurfaceFlow({
  children,
  flowAttribute,
  className = "relative z-10 bg-[#050505]",
  surfaceClassName = "relative bg-[#050505]",
  settleSelector = "[data-stack-surface]",
  darkVeilOpacity = 0.28,
  lightVeilOpacity = 0.08,
  resizeDebounceMs = 180,
}: StackedSurfaceFlowProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<number[]>([]);
  const [motionMode, setMotionMode] = useState<StackMotionMode>("none");

  useLayoutEffect(() => {
    const desktop = window.matchMedia(DESKTOP_MOTION_QUERY);
    const coarseTablet = window.matchMedia(COARSE_TABLET_QUERY);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const sync = () => {
      if (reducedMotion.matches) {
        setMotionMode("none");
      } else {
        setMotionMode(
          desktop.matches && !coarseTablet.matches ? "desktop" : "touch"
        );
      }
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

  const desktopMotion = motionMode === "desktop";
  useJunctionSettle(wrapRef, settleSelector, desktopMotion);
  useStackSurfaceVisibility(wrapRef, "[data-stack-surface]", desktopMotion);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const line = lineRef.current;
    if (!wrap || !line) return;

    const stacks = Array.from(
      wrap.querySelectorAll<HTMLElement>("[data-stack-surface]")
    );

    const applySurfaceBackdrops = () => {
      stacks.forEach((el) => {
        el.toggleAttribute(
          "data-stack-static",
          el.querySelector("[data-stack-static]") !== null
        );
        const childSurface =
          el.querySelector<HTMLElement>("[data-header-light], [data-header-dark]") ??
          el.firstElementChild as HTMLElement | null;
        if (!childSurface) return;

        const childStyle = window.getComputedStyle(childSurface);
        const childBg = childStyle.backgroundColor;
        if (childBg && childBg !== "rgba(0, 0, 0, 0)" && childBg !== "transparent") {
          el.style.backgroundColor = childBg;
        }

        if (childSurface.closest("[data-header-light]")) {
          el.setAttribute("data-header-light", "");
          el.removeAttribute("data-header-dark");
        } else {
          el.setAttribute("data-header-dark", "");
          el.removeAttribute("data-header-light");
        }

        el.toggleAttribute(
          "data-stack-compact",
          el.querySelector("[data-stack-compact]") !== null
        );
        el.toggleAttribute(
          "data-flow-rail-pause",
          el.querySelector("[data-flow-rail-pause]") !== null
        );
      });
    };

    const applyStackTops = () => {
      stacks.forEach((el) => {
        // Dense interactive surfaces must stay in normal document flow. A
        // later sticky sibling can otherwise cover a visible form control and
        // intercept its pointer events before the user can focus it.
        const staticSurface =
          el.hasAttribute("data-stack-static") ||
          el.querySelector("[data-stack-static]") !== null;
        // Touch/tablet pages must stay in natural document flow. Inline sticky
        // positioning here used to override the tablet CSS contract, leaving
        // multiple image-heavy surfaces composited on top of one another and
        // causing visible flashes during quick scrolls.
        if (motionMode !== "desktop" || staticSurface) {
          el.style.position = "relative";
          el.style.top = "auto";
          return;
        }

        el.style.position = "sticky";
        el.style.top = `${Math.min(0, window.innerHeight - el.offsetHeight)}px`;
      });
    };

    const measure = () => {
      // A sticky element's viewport and offset coordinates can both change
      // while it is pinned. The surfaces remain normal-flow siblings, though,
      // so their cumulative heights are the stable source of truth for every
      // cover junction and rail diamond.
      let top = 0;
      const junctions = stacks.map((surface) => {
          const junction = top;
          top += surface.offsetHeight;
          return junction;
        });
      setNodes(junctions);

      const rail = railRef.current;
      if (rail) {
        const pauseRanges = stacks.flatMap((surface, index) =>
          surface.hasAttribute("data-flow-rail-pause")
            ? [{
                start: junctions[index],
                end: index === stacks.length - 1
                  ? wrap.offsetHeight
                  : junctions[index] + surface.offsetHeight,
              }]
            : []
        );

        if (!pauseRanges.length) {
          rail.style.maskImage = "none";
          rail.style.webkitMaskImage = "none";
        } else {
          const stops = ["#000 0px"];
          pauseRanges.forEach(({ start, end }) => {
            stops.push(
              `#000 ${start}px`,
              `transparent ${start}px`,
              `transparent ${end}px`,
              `#000 ${end}px`
            );
          });
          stops.push(`#000 ${wrap.offsetHeight}px`);
          const mask = `linear-gradient(to bottom, ${stops.join(", ")})`;
          rail.style.maskImage = mask;
          rail.style.webkitMaskImage = mask;
        }
      }
    };

    let railFrame = 0;
    let lastScrollAt = 0;
    const updateTouchCovers = () => {
      const veilUpdates = stacks.map((surface) => {
        const veil = surface.querySelector<HTMLElement>("[data-cover-veil]");
        if (!veil) return null;

        // Cover veils belong to the desktop stacking illusion. Painting them
        // over natural-flow touch surfaces makes photos pulse darker as the
        // next section approaches, which reads as image flicker on tablets.
        if (motionMode !== "desktop") {
          return { veil, opacity: "0" };
        }
        return null;
      });

      veilUpdates.forEach((update) => {
        if (update && update.veil.style.opacity !== update.opacity) {
          update.veil.style.opacity = update.opacity;
        }
      });
    };

    const updateRail = () => {
      railFrame = 0;
      updateTouchCovers();
      if (motionMode !== "desktop") {
        line.style.transform = "scaleY(0)";
        wrap.querySelectorAll<HTMLElement>("[data-flow-node]").forEach((node) =>
          node.classList.remove("flow-node-lit")
        );
        return;
      }

      const wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
      const start = wrapTop - window.innerHeight * 0.72;
      const travel = Math.max(1, wrap.offsetHeight - window.innerHeight * 0.28);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - start) / travel)
      );
      const drawnY = progress * wrap.offsetHeight;

      line.style.transform = `scaleY(${progress.toFixed(5)})`;
      wrap.querySelectorAll<HTMLElement>("[data-flow-node]").forEach((node) => {
        const top = Number.parseFloat(node.style.top) || 0;
        node.classList.toggle(
          "flow-node-lit",
          progress > 0 && top <= drawnY + 0.5
        );
      });
    };
    const scheduleRail = () => {
      if (!railFrame) railFrame = requestAnimationFrame(updateRail);
    };
    const onScroll = () => {
      lastScrollAt = performance.now();
      scheduleRail();
    };

    applyStackTops();
    applySurfaceBackdrops();
    measure();
    scheduleRail();

    const refresh = () => {
      applyStackTops();
      applySurfaceBackdrops();
      measure();
      observedHeights = stacks.map((el) => el.offsetHeight);
      scheduleRail();
    };

    const onResize = () => refresh();
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    let roTimer: ReturnType<typeof setTimeout> | undefined;
    let observedHeights = stacks.map((el) => el.offsetHeight);
    const refreshAfterScrollSettles = () => {
      const idleFor = performance.now() - lastScrollAt;
      if (idleFor < 220) {
        roTimer = setTimeout(refreshAfterScrollSettles, 220 - idleFor);
        return;
      }
      refresh();
      try {
        ScrollTrigger.refresh();
      } catch {}
    };
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            const nextHeights = stacks.map((el) => el.offsetHeight);
            const geometryChanged = nextHeights.some(
              (height, index) => Math.abs(height - observedHeights[index]) > 1
            );
            observedHeights = nextHeights;
            if (!geometryChanged) return;
            clearTimeout(roTimer);
            roTimer = setTimeout(refreshAfterScrollSettles, resizeDebounceMs);
          })
        : undefined;
    stacks.forEach((el) => ro?.observe(el));

    if (motionMode !== "desktop") {
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        if (railFrame) cancelAnimationFrame(railFrame);
        clearTimeout(roTimer);
        ro?.disconnect();
      };
    }

    const ctx = gsap.context(() => {
      stacks.forEach((el, i) => {
        const next =
          stacks[i + 1] ??
          document.querySelector<HTMLElement>("[data-footer-surface]");
        const veil = el.querySelector<HTMLElement>("[data-cover-veil]");
        if (!next || !veil) return;

        const light = el.querySelector("[data-header-light]") !== null;
        gsap.fromTo(
          veil,
          { opacity: 0 },
          {
            opacity: light ? lightVeilOpacity : darkVeilOpacity,
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: "top top",
              scrub: 0.65,
            },
          }
        );
      });

      gsap.set(line, { scaleY: 0, transformOrigin: "top" });
    }, wrapRef);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (railFrame) cancelAnimationFrame(railFrame);
      clearTimeout(roTimer);
      ro?.disconnect();
      try {
        ctx.revert();
      } catch {}
    };
  }, [darkVeilOpacity, lightVeilOpacity, motionMode, resizeDebounceMs, settleSelector]);

  const items = React.Children.toArray(children);

  return (
    <div
      ref={wrapRef}
      data-stack-mode={motionMode}
      {...{ [flowAttribute]: "" }}
      className={className}
    >
      <div
        ref={railRef}
        data-flow-rail=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 top-0 left-[1.4rem] z-30 hidden w-px xl:left-6 xl:block"
      >
        <div data-flow-track="" className="absolute inset-0 bg-[var(--color-accent)]/24" />
        <div
          ref={lineRef}
          data-flow-fill=""
          className="absolute inset-0 origin-top bg-[var(--color-accent)]/80 will-change-transform"
        />
        {nodes.map((top, i) => (
          <FlowNode key={i} top={top} />
        ))}
      </div>

      {items.map((child, i) => (
        <div
          key={i}
          data-stack-surface=""
          className={surfaceClassName}
          style={{ zIndex: i + 1 }}
        >
          {child}
          <div
            data-cover-veil=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[60] bg-black opacity-0"
          />
        </div>
      ))}
      <div aria-hidden="true" data-footer-runway="" className="pointer-events-none h-svh" />
    </div>
  );
}
