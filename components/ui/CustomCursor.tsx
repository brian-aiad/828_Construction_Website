"use client";

import { useEffect, useRef, useState } from "react";
import { COARSE_TABLET_QUERY, DESKTOP_MOTION_QUERY } from "@/utils/animationControl";

// Custom cursor: main dot (mixBlendMode:difference) + lagging ring + copper trail.
// The native cursor remains active until the custom cursor has received a real
// mouse position and is visibly ready. This prevents a cursor-less page when
// motion is disabled, the viewport is narrow, or hydration is still settling.

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const copperRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const queries = [
      window.matchMedia("(pointer: fine)"),
      window.matchMedia(DESKTOP_MOTION_QUERY),
      window.matchMedia(COARSE_TABLET_QUERY),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];
    const sync = () => setEnabled(queries[0].matches && queries[1].matches && !queries[2].matches && !queries[3].matches);
    sync();
    queries.forEach((query) => query.addEventListener("change", sync));
    return () => queries.forEach((query) => query.removeEventListener("change", sync));
  }, []);

  useEffect(() => {
    document.body.classList.remove("has-custom-cursor");
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const copper = copperRef.current;
    if (!dot || !ring || !copper) {
      document.body.classList.remove("has-custom-cursor");
      return;
    }

    dot.style.display = "block";
    ring.style.display = "block";
    copper.style.display = "block";
    dot.style.opacity = "0";
    ring.style.opacity = "0";
    copper.style.opacity = "0";

    let rafId = 0;
    let ringX = 0, ringY = 0;
    let copperX = 0, copperY = 0;
    let curX = 0, curY = 0;
    let hasPointer = false;
    let lastFrame = 0;

    const hideCursor = () => {
      hasPointer = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      lastFrame = 0;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      copper.style.opacity = "0";
      document.body.classList.remove("has-custom-cursor");
    };

    const handleMove = (e: MouseEvent) => {
      curX = e.clientX;
      curY = e.clientY;
      if (!hasPointer) {
        hasPointer = true;
        ringX = curX;
        ringY = curY;
        copperX = curX;
        copperY = curY;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
        copper.style.opacity = "0.5";
        document.body.classList.add("has-custom-cursor");
      }
      dot.style.transform = `translate(${curX}px, ${curY}px)`;
      if (!rafId) {
        lastFrame = performance.now();
        rafId = requestAnimationFrame(animate);
      }
    };

    const animate = (now: number) => {
      // Preserve the same response on 60Hz, 90Hz, and 120Hz displays.
      const elapsed = Math.min(64, Math.max(0, now - lastFrame)) / (1000 / 60);
      lastFrame = now;
      const ringFollow = 1 - Math.pow(0.86, elapsed);
      const copperFollow = 1 - Math.pow(0.91, elapsed);
      ringX += (curX - ringX) * ringFollow;
      ringY += (curY - ringY) * ringFollow;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

      copperX += (curX - copperX) * copperFollow;
      copperY += (curY - copperY) * copperFollow;
      copper.style.transform = `translate(${copperX}px, ${copperY}px)`;

      const ringSettled = Math.abs(curX - ringX) < 0.1 && Math.abs(curY - ringY) < 0.1;
      const copperSettled =
        Math.abs(curX - copperX) < 0.1 && Math.abs(curY - copperY) < 0.1;
      if (ringSettled && copperSettled) {
        ringX = copperX = curX;
        ringY = copperY = curY;
        ring.style.transform = `translate(${curX}px, ${curY}px)`;
        copper.style.transform = `translate(${curX}px, ${curY}px)`;
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(animate);
    };

    // The maroon ring remains legible on both the white and black surfaces.
    const resetRing = () => {
      ring.style.scale = "1.000000";
      ring.style.borderColor = "rgba(123,45,38,0.95)";
      ring.style.opacity = hasPointer ? "1" : "0";
    };

    // Hover over links/buttons: ring grows.
    const onInteractive = () => {
      ring.style.scale = "1.777778";
      ring.style.borderColor = "rgba(123,45,38,1)";
      ring.style.opacity = hasPointer ? "1" : "0";
    };

    // Hover over images: ring becomes maroon and expands (upgraded 52→70px)
    const onImage = () => {
      ring.style.scale = "1.944444";
      ring.style.borderColor = "var(--color-accent)";
      ring.style.opacity = hasPointer ? "0.85" : "0";
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", hideCursor);
    window.addEventListener("blur", hideCursor);
    const onVisibility = () => {
      if (document.hidden) hideCursor();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const isInteractiveTarget = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest("a, button, [role='button'], input, select, textarea, [data-cursor-grow]"));

    const isImageTarget = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest("img, picture, [data-cursor-image]"));

    const handlePointerOver = (e: PointerEvent) => {
      if (isImageTarget(e.target)) {
        onImage();
        return;
      }
      if (isInteractiveTarget(e.target)) onInteractive();
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (!(e.relatedTarget instanceof Element)) {
        resetRing();
        return;
      }

      const leavingImage = isImageTarget(e.target);
      const enteringImage = isImageTarget(e.relatedTarget);
      const leavingInteractive = isInteractiveTarget(e.target);
      const enteringInteractive = isInteractiveTarget(e.relatedTarget);

      if ((leavingImage && !enteringImage) || (leavingInteractive && !enteringInteractive)) {
        resetRing();
      }
    };

    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerout", handlePointerOut, { passive: true });

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
      document.removeEventListener("visibilitychange", onVisibility);
      [dot, ring, copper].forEach((el) => { el.style.display = "none"; });
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
    };
  }, [enabled]);

  return (
    <>
      {/* Main dot — mixBlendMode:difference (white on dark, black on light) */}
      <div
        ref={dotRef}
        data-custom-cursor="dot"
        aria-hidden="true"
        style={{
          display: "none",
          position: "fixed",
          top: 0, left: 0,
          zIndex: 9999,
          pointerEvents: "none",
          mixBlendMode: "difference",
          width: 8, height: 8,
          marginLeft: -4, marginTop: -4,
          borderRadius: "50%",
          background: "#fff",
          willChange: "transform, opacity",
        }}
      />

      {/* Copper trail dot — subtle warmth, trails behind cursor */}
      <div
        ref={copperRef}
        data-custom-cursor="trail"
        aria-hidden="true"
        style={{
          display: "none",
          position: "fixed",
          top: 0, left: 0,
          zIndex: 9997,
          pointerEvents: "none",
          width: 5, height: 5,
          marginLeft: -2.5, marginTop: -2.5,
          borderRadius: "50%",
          background: "var(--color-accent)",
          opacity: 0.5,
          willChange: "transform, opacity",
        }}
      />

      {/* Lagging ring — transitions to copper on image hover (upgraded 32→36px base) */}
      <div
        ref={ringRef}
        data-custom-cursor="ring"
        aria-hidden="true"
        style={{
          display: "none",
          position: "fixed",
          top: 0, left: 0,
          zIndex: 9998,
          pointerEvents: "none",
          width: 36, height: 36,
          marginLeft: -18, marginTop: -18,
          borderRadius: "50%",
          border: "1.5px solid rgba(123,45,38,0.95)",
          transition: "scale 0.25s ease, border-color 0.25s ease, opacity 0.25s ease",
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}
