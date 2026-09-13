"use client";

import { useEffect, useRef, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export default function MagneticButton({ children, className = "", strength = 0.28 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const origin = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const enabled = useRef(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reset = () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      origin.current = null;
      if (ref.current) ref.current.style.transform = "translate(0px, 0px)";
    };
    const sync = () => {
      enabled.current = finePointer.matches && !reducedMotion.matches;
      reset();
    };
    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    window.addEventListener("resize", reset, { passive: true });
    window.addEventListener("scroll", reset, { passive: true });
    return () => {
      reset();
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
      window.removeEventListener("resize", reset);
      window.removeEventListener("scroll", reset);
    };
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled.current) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (!origin.current) origin.current = el.getBoundingClientRect();
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const rect = origin.current;
      if (!rect) return;
      // Measure the resting box once, rather than chasing our own transform.
      const x = (pointer.current.x - rect.left - rect.width / 2) * strength;
      const y = (pointer.current.y - rect.top - rect.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
  };

  const handleLeave = () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    origin.current = null;
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
    el.style.transition = "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)";
  };

  const handleEnter = () => {
    const el = ref.current;
    if (!el || !enabled.current) return;
    origin.current = el.getBoundingClientRect();
    el.style.transition = "transform 0.15s ease-out";
  };

  return (
    <div
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={handleEnter}
    >
      {children}
    </div>
  );
}
