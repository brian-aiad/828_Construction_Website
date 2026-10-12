"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { COARSE_TABLET_QUERY, DESKTOP_MOTION_QUERY } from "@/utils/animationControl";
import { SITE } from "@/lib/constants";

gsap.registerPlugin(ScrollTrigger);

// NS-grammar hero: one full viewport, full-bleed photography, statement
// headline bottom-left, small mono metadata top/bottom corners. Motion is
// restrained — line mask reveal on load, image parallax scrub on scroll.

export default function HeroV2() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const licenseRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = gsap.matchMedia();
    media.add(
      {
        desktop: DESKTOP_MOTION_QUERY,
        coarseTablet: COARSE_TABLET_QUERY,
        reducedMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, coarseTablet, reducedMotion } = context.conditions as {
          desktop: boolean;
          coarseTablet: boolean;
          reducedMotion: boolean;
        };
        if (!desktop || coarseTablet || reducedMotion) return;

        const lines = gsap.utils.toArray<HTMLElement>(".hero-line-inner", section);
        const metaEls = [
          eyebrowRef.current,
          ctaRef.current,
          licenseRef.current,
          scrollHintRef.current,
        ].filter(Boolean) as HTMLElement[];

        const resetMotionStyles = () => {
          lines.forEach((line) => line.style.removeProperty("transform"));
          metaEls.forEach((element) => {
            element.style.removeProperty("transform");
            element.style.removeProperty("opacity");
          });
          imageRef.current?.style.removeProperty("transform");
          imageRef.current?.style.removeProperty("will-change");
          copyRef.current?.style.removeProperty("transform");
          copyRef.current?.style.removeProperty("opacity");
          copyRef.current?.style.removeProperty("will-change");
          if (veilRef.current) veilRef.current.style.opacity = "0";
        };

        const ctx = gsap.context(() => {
          if (imageRef.current) imageRef.current.style.willChange = "transform";
          if (copyRef.current) copyRef.current.style.willChange = "transform, opacity";
          gsap.set(lines, { yPercent: 110 });
          // Keep hero copy paint-eligible for LCP while retaining a restrained
          // fade/translate entrance. Fully transparent LCP text delays the metric.
          gsap.set(metaEls, { y: 14, opacity: 0.72 });

      // Entry — line-by-line mask reveal, then metadata
          gsap.to(lines, {
        yPercent: 0,
        duration: 0.95,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.15,
          });
          gsap.to(metaEls, {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.55,
          });

      // Scroll — the hero is pinned (CSS sticky) beneath the page surface.
      // All scrub motion is driven by the covering surface's position so the
      // hero recedes (scale, dim, drift) as the light surface rides over it.
          const surface = document.querySelector<HTMLElement>("[data-editorial-flow]");
          const coverTrigger = surface
            ? { trigger: surface, start: "top bottom", end: "top top" }
            : { trigger: section, start: "top top", end: "bottom top" };

          if (imageRef.current) {
            gsap.fromTo(
          imageRef.current,
          { scale: 1, yPercent: 0 },
          {
            scale: 1.1,
            yPercent: -4,
            ease: "none",
            scrollTrigger: { ...coverTrigger, scrub: 1 },
          }
            );
          }

          if (veilRef.current) {
            gsap.to(veilRef.current, {
          opacity: 0.55,
          ease: "none",
          scrollTrigger: { ...coverTrigger, scrub: 1 },
            });
          }

          if (copyRef.current) {
            gsap.to(copyRef.current, {
          yPercent: -16,
          opacity: 0.3,
          ease: "none",
          scrollTrigger: { ...coverTrigger, scrub: 0.9 },
            });
          }

          if (scrollHintRef.current && surface) {
            gsap.to(scrollHintRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: surface,
            start: "top 95%",
            end: "top 75%",
            scrub: 1,
          },
            });
          }
        }, sectionRef);

        return () => {
          try {
            ctx.revert();
          } catch {}
          resetMotionStyles();
        };
      },
      section
    );

    return () => {
      try {
        media.revert();
      } catch {}
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-header-dark=""
      data-header-transparent=""
      className="sticky top-0 z-0 h-[100svh] overflow-hidden bg-black text-white"
      aria-label="828 Construction homepage hero"
    >
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src="/images/generated/home-hero-bluehour-adu-v2.webp"
          alt="Modern South Bay ADU with warm interior lighting at blue hour"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          quality={86}
          className="hero-kenburns object-cover"
        />
      </div>

      {/* Single quiet veil — bottom-weighted so the photo stays readable */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.06) 38%, rgba(0,0,0,0.16) 62%, rgba(0,0,0,0.64) 100%)",
        }}
      />

      {/* Cover dim — darkens as the page surface rides over the pinned hero */}
      <div
        ref={veilRef}
        aria-hidden="true"
        className="absolute inset-0 bg-black"
        style={{ opacity: 0 }}
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[1680px] flex-col justify-end px-6 pb-12 pt-28 lg:px-12 lg:pb-16">
        <div
          ref={copyRef}
          className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_1px_minmax(24rem,0.62fr)] lg:items-end lg:gap-8"
        >
          <p
            ref={eyebrowRef}
            className="flex items-center gap-2 font-labels text-[0.78rem] uppercase tracking-[0.15em] text-white/78 min-[360px]:gap-3 min-[360px]:text-[clamp(0.9rem,1.45vw,1.25rem)] min-[360px]:tracking-[0.22em] sm:gap-4 sm:tracking-[0.34em]"
          >
            <span
              aria-hidden="true"
              className="inline-block h-px w-7 min-[360px]:w-10 lg:w-12"
              style={{ background: "var(--color-accent-light)" }}
            />
            Torrance / South Bay
          </p>

          <div className="hidden h-[9.5rem] w-px bg-white/18 lg:block" aria-hidden="true" />

          {/* Split-bottom statement: compact, deliberate, and anchored to the photo. */}
          <div className="max-w-[34rem] lg:justify-self-start">
            <h1
              ref={headlineRef}
              className="font-editorial text-[clamp(1.15rem,1.55vw,1.45rem)] font-medium leading-[1.22] tracking-[-0.005em] text-white"
            >
              <span className="block overflow-hidden">
                <span className="hero-line-inner block">
                  Transforming properties, delivering solutions.
                </span>
              </span>
            </h1>

            <p className="hero-support mt-2 max-w-[31rem] font-editorial text-[clamp(1.05rem,1.42vw,1.22rem)] font-normal leading-[1.42] tracking-[-0.005em] text-white/66">
              828 Construction is the partner of choice for your next project.
            </p>

            <div ref={ctaRef} className="mt-6">
              <Link
                href="/contact"
                className="btn-shine btn-lift inline-flex items-center justify-center bg-white px-8 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-[var(--color-accent)] hover:text-white"
              >
                Book Call
              </Link>
            </div>
          </div>
        </div>

        <div
          ref={licenseRef}
          className="absolute bottom-12 right-6 hidden font-labels text-[9px] uppercase tracking-[0.22em] text-white/42 lg:right-12 lg:bottom-16 lg:block"
        >
          CA License #{SITE.license}
        </div>

        <div
          ref={scrollHintRef}
          aria-hidden="true"
          className="hidden"
        >
          <span className="block h-10 w-px bg-white/35" />
        </div>
      </div>
    </section>
  );
}
