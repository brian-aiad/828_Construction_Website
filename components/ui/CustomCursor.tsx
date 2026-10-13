"use client";

import { useEffect, useRef } from "react";
import { COARSE_TABLET_QUERY, DESKTOP_MOTION_QUERY } from "@/utils/animationControl";

// Position the dot and ring together. Hover scaling belongs to an inner element:
// an independent CSS scale on the positioned ring also scales its translation.
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringShapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const queries = [
      window.matchMedia("(pointer: fine)"),
      window.matchMedia(DESKTOP_MOTION_QUERY),
      window.matchMedia(COARSE_TABLET_QUERY),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];
    const isEnabled = () => queries[0].matches && queries[1].matches && !queries[2].matches && !queries[3].matches;
    document.body.classList.remove("has-custom-cursor");
    const dot = dotRef.current;
    const ring = ringRef.current;
    const shape = ringShapeRef.current;
    if (!dot || !ring || !shape) return;

    const hideCursor = () => {
      dot.style.display = "none";
      ring.style.display = "none";
      shape.style.transform = "scale(1)";
      document.body.classList.remove("has-custom-cursor");
    };
    const updateHover = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      const interactive = element?.closest("a, button, [role='button'], input, select, textarea, [data-cursor-grow]");
      const image = element?.closest("img, picture, [data-cursor-image]");
      shape.style.transform = `scale(${interactive ? 1.777778 : image ? 1.944444 : 1})`;
    };
    const handleMove = (event: PointerEvent) => {
      // Touch or pen input on a hybrid device should retain native behavior.
      if (!isEnabled() || event.pointerType !== "mouse") {
        hideCursor();
        return;
      }
      const position = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      dot.style.transform = position;
      ring.style.transform = position;
      updateHover(event.target);
      // Set both positions before hiding the native cursor, including re-entry.
      dot.style.display = "block";
      ring.style.display = "block";
      document.body.classList.add("has-custom-cursor");
    };
    const handleOver = (event: PointerEvent) => {
      if (isEnabled()) updateHover(event.target);
    };
    const handleOut = (event: PointerEvent) => {
      if (!event.relatedTarget) hideCursor();
      else updateHover(event.relatedTarget);
    };
    const onVisibility = () => {
      if (document.hidden) hideCursor();
    };
    // Keep input listeners attached across media changes. A pointer move must
    // not be lost between a media event and React committing another effect.
    const sync = () => { if (!isEnabled()) hideCursor(); };
    queries.forEach((query) => query.addEventListener("change", sync));
    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("pointerover", handleOver, { passive: true });
    document.addEventListener("pointerout", handleOut, { passive: true });
    document.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      hideCursor();
      queries.forEach((query) => query.removeEventListener("change", sync));
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerout", handleOut);
      document.removeEventListener("pointerleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
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
          willChange: "transform",
        }}
      />
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
          willChange: "transform",
        }}
      >
        <div
          ref={ringShapeRef}
          style={{
            width: "100%", height: "100%",
            borderRadius: "50%",
            border: "1.5px solid rgba(123,45,38,0.95)",
            transition: "transform 0.2s ease",
          }}
        />
      </div>
    </>
  );
}
