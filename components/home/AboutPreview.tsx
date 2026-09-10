"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { EXPERIENCE_SINCE } from "@/lib/constants";
import { AnimationController } from "@/utils/animationControl";
import { revealOnVisible } from "@/utils/revealOnVisible";

// NS-grammar about preview: dark editorial close to the page — big quiet
// statement headline, supporting copy, then a horizontal row of real project
// photographs. The frames stay still while this final surface is pinned so the
// footer cover reads cleanly and the work remains easy to inspect.

const DETAIL_IMAGES = [
  {
    src: "/images/projects/cerritos-residence/home-preview-v2.jpg",
    alt: "Cerritos bath remodel with a frameless glass shower, dark feature tile, and marble vanity",
    project: "Cerritos Bath Remodel",
    meta: "Bath Remodel / Cerritos, CA",
    href: "/portfolio#cerritos-residence",
  },
  {
    src: "/images/projects/el-sereno-residence/home-preview-v2.jpg",
    alt: "El Sereno hillside deck with custom railing, wood decking, and outdoor dining area",
    project: "El Sereno Bath & Deck",
    meta: "Bath + Outdoor Living / El Sereno, CA",
    href: "/portfolio#el-sereno-residence",
  },
  {
    src: "/images/projects/tustin-residence/home-preview-v2.jpg",
    alt: "Tustin bath refresh with a blue soaking tub, glass surround, and herringbone tile niche",
    project: "Tustin Bath Refresh",
    meta: "Bath Refresh / Tustin, CA",
    href: "/portfolio#tustin-residence",
  },
];

export default function AboutPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // One-shot reveals use IntersectionObserver — ScrollTrigger positional
    // once-triggers go stale after route transitions (PATTERNS.md Fix 22).
    const revealCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const headlineLines = gsap.utils.toArray<HTMLElement>(".about-headline-line");
      const copyEls = gsap.utils.toArray<HTMLElement>(".about-copy-el");

      gsap.set(headlineLines, { yPercent: 110 });
      gsap.set(copyEls, { y: 20, opacity: 0 });
      if (!AnimationController.shouldAnimate()) {
        // The shared section controller owns mobile/tablet entrances. Keep
        // child text and photography visible under rapid skipped sections.
        gsap.set(headlineLines, { yPercent: 0 });
        gsap.set(copyEls, { x: 0, y: 0, opacity: 1 });
        return;
      }

      revealCleanups.push(
        revealOnVisible([headlineRef.current ?? section], () => {
          gsap.to(headlineLines, {
            yPercent: 0,
            duration: 0.95,
            stagger: 0.1,
            ease: "power3.out",
          });
        })
      );

      revealCleanups.push(
        revealOnVisible(copyEls, (el, i) => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.07,
            ease: "power3.out",
          });
        })
      );

    }, sectionRef);

    return () => {
      revealCleanups.forEach((dispose) => dispose());
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-svh overflow-hidden bg-[#050505] text-white"
      data-section="about-preview"
      data-header-dark=""
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,26,22,0.18),transparent_38%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--color-accent)] opacity-70"
      />
      <div className="mx-auto flex min-h-svh max-w-[1680px] flex-col px-6 pb-10 pt-18 sm:pb-12 lg:px-10 lg:pb-12 lg:pt-[6.75rem] 2xl:px-12">
        <div
          className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-14"
          data-motion-reveal="up"
          data-motion-stagger="0.08"
        >
          <div className="lg:col-span-7 xl:col-span-6">
            <p className="about-copy-el mb-5 flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.26em] text-[var(--color-accent)] lg:mb-7">
              <span
                aria-hidden="true"
                className="inline-block h-px w-10 bg-[var(--color-accent)]"
              />
              Since {EXPERIENCE_SINCE}
            </p>
            <h2
              ref={headlineRef}
              className="max-w-[15ch] font-editorial text-[clamp(2.65rem,4.8vw,5.65rem)] font-normal leading-[1.08]"
            >
              <span className="-my-[0.24em] block overflow-hidden py-[0.24em]">
                <span className="about-headline-line block">
                  Quality over quantity.
                </span>
              </span>
            </h2>
          </div>

          <div className="flex flex-col justify-end lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
            <p className="about-copy-el max-w-[34rem] text-[15px] leading-7 text-white/62 lg:text-[16px] lg:leading-8">
              With more than 20 years of experience across multiple
              construction trades, 828 Construction brings a comprehensive
              understanding of the building process. Our mission is to make
              every project as seamless, effective, and stress-free as
              possible.
            </p>
            <div className="about-copy-el mt-6">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 border-b border-white/22 pb-1 font-labels text-[10px] uppercase tracking-[0.18em] text-white/58 transition-colors hover:border-white hover:text-white max-lg:min-h-[44px] max-lg:pt-3 max-lg:pb-1.5"
              >
                Learn more
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Detail photography row */}
        <div
          className="mt-12 grid flex-1 grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-5 lg:mt-14 lg:items-end lg:gap-7"
          data-motion-reveal="up"
          data-motion-stagger="0.08"
        >
          {DETAIL_IMAGES.map((img) => (
            <Link
              key={img.src}
              href={img.href}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#050505]"
              aria-label={`View ${img.project} in the portfolio`}
            >
              <div
                className="about-frame relative aspect-[4/5] min-h-[18rem] overflow-hidden bg-[#111] sm:aspect-[3/4] sm:min-h-0 lg:aspect-auto lg:h-[min(42svh,30rem)] xl:h-[min(45svh,34rem)] [@media(min-height:1100px)]:xl:h-[min(52svh,48rem)]"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 48px), 33vw"
                  quality={82}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                  style={{ filter: "contrast(1.04) saturate(0.98) brightness(0.94)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/24 via-transparent to-black/5" />
              </div>
              <div
                aria-hidden="true"
                className="mt-2.5 h-px w-10 bg-[var(--color-accent)] opacity-70"
              />
              <div className="mt-3.5 flex min-h-[4.75rem] items-start justify-between gap-4 lg:gap-5">
                <div className="min-w-0">
                  <p className="font-editorial text-[clamp(1.55rem,2vw,2.25rem)] leading-[1.02] text-white">
                    {img.project}
                  </p>
                  <p className="mt-2 font-labels text-[8px] uppercase leading-4 tracking-[0.18em] text-white/38">
                    {img.meta}
                  </p>
                </div>
                <span className="mt-1 hidden whitespace-nowrap font-labels text-[8px] uppercase tracking-[0.18em] text-white/42 transition-colors group-hover:text-white xl:block">
                  View in portfolio -&gt;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
