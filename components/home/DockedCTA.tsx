"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/constants";

// Persistent conversion dock: a small dark card pinned bottom-left that
// appears once the reader leaves the hero and follows them down the page,
// stepping aside when the footer arrives. Desktop only.

export default function DockedCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const pastHero = window.scrollY > window.innerHeight * 0.85;
      const services = document.querySelector('[data-section="services-v2"]');
      const servicesRect = services?.getBoundingClientRect();
      const servicesInView = servicesRect
        ? servicesRect.top < window.innerHeight * 0.9 &&
          servicesRect.bottom > window.innerHeight * 0.12
        : false;
      const vision = document.querySelector('[data-section="vision"]');
      const visionEntering = vision
        ? vision.getBoundingClientRect().top < window.innerHeight * 0.86
        : false;
      const footer = document.querySelector("footer");
      const footerNear = footer
        ? footer.getBoundingClientRect().top < window.innerHeight * 0.92
        : false;
      setVisible(pastHero && !servicesInView && !visionEntering && !footerNear);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      data-docked-cta=""
      inert={!visible}
      aria-hidden={!visible}
      className={`fixed bottom-6 left-6 z-40 hidden transition-all duration-500 lg:block ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <Link
        href="/contact"
        className="group block w-[13.5rem] bg-[#111] p-5 text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] transition-colors duration-300 hover:bg-[var(--color-accent)]"
      >
        <span className="block h-px w-8 bg-[var(--color-accent)] transition-colors duration-300 group-hover:bg-white/70" />
        <span className="mt-4 block font-editorial text-[1.15rem] font-normal leading-snug">
          Book Call
          <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
        <span className="mt-3 block font-numbers text-[10px] tracking-[0.08em] text-white/55">
          {SITE.phone}
        </span>
      </Link>
    </div>
  );
}
