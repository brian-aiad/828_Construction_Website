"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { SITE } from "@/lib/constants";
import MagneticButton from "@/components/ui/MagneticButton";
import { AnimationController } from "@/utils/animationControl";

gsap.registerPlugin(ScrollTrigger);

// CSS for the "Intent." char-by-char reveal is in globals.css (.hero-char-animate)

export default function HeroSections() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // ── Layer refs for triple parallax ──────────────────────────────────────
  const bgRef = useRef<HTMLDivElement>(null);       // Layer 1: fastest
  const midRef = useRef<HTMLDivElement>(null);      // Layer 2: medium
  const headlineRef = useRef<HTMLHeadingElement>(null); // Layer 3: counter-motion
  // ── Scroll indicator ────────────────────────────────────────────────────
  const scrollLineRef = useRef<HTMLDivElement>(null);
  // ── Section 2 ───────────────────────────────────────────────────────────
  const content2Ref = useRef<HTMLDivElement>(null);
  // ── SplitType cleanup ───────────────────────────────────────────────────
  const allSplitsRef = useRef<SplitType[]>([]);
  const ctxRef = useRef<gsap.Context | null>(null);
  useLayoutEffect(() => () => {
    allSplitsRef.current.forEach(s => { try { s.revert(); } catch {} });
    try { ctxRef.current?.revert(); } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    let splitFrame = -1;
    let localSplits: SplitType[] = [];
    let splitEls: HTMLElement[] = [];

    const ctx = gsap.context(() => {

      // Mobile: hero is exactly 100vh (no sticky scroll space).
      // CSS keyframe animations handle the entry. Skip all GSAP scroll-driven work.
      if (!AnimationController.shouldAnimate()) {
        return;
      }

      // ── LAYER 1: Background — fastest parallax + scale (same bg) ─────────
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.fromTo(bgRef.current,
          { scale: 1 },
          {
            scale: 1.1,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "top top",
              end: "50% top",
              scrub: 1.5,
            },
          }
        );
      }

      // ── LAYER 2: Mid-ground (eyebrow + location strip) — medium parallax ──
      if (midRef.current) {
        gsap.to(midRef.current, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "50% top",
            scrub: 1.2,
          },
        });
      }

      // ── LAYER 3: Headline — counter-motion (heavier, stays in frame longer) ─
      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "50% top",
            scrub: 1,
          },
        });
      }

      // ── Scroll indicator: fades out early ─────────────────────────────────
      if (scrollLineRef.current) {
        gsap.to(scrollLineRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "12% top",
            scrub: 1,
          },
        });
      }

      // ── Section 1 exit: headline chars scatter ───────────────────────────────
      // (desktop only — mobile returns early above)
      if (headlineRef.current) {
        const _headline = headlineRef.current;
        const _wrapper = wrapperRef.current;
        splitFrame = requestAnimationFrame(() => {
          if (!mounted || !_headline.isConnected) return;

          // Split only the .line elements (NOT "Built with" — that's LCP)
          const lineEls = Array.from(
            _headline.querySelectorAll<HTMLElement>(".home-hero-line")
          );
          if (lineEls.length > 0) {
            splitEls = lineEls;
            const splits = lineEls.map(el => new SplitType(el, { types: "words,chars" }));
            localSplits = splits;
            allSplitsRef.current = splits;
            const allChars = splits.flatMap(s => s.chars ?? []);
            if (allChars.length) {
              gsap.to(allChars, {
                yPercent: -80,
                opacity: 0,
                stagger: { each: 0.01, from: "random" },
                ease: "none",
                scrollTrigger: {
                  trigger: _wrapper,
                  start: "12% top",
                  end: "38% top",
                  scrub: 1.2,
                },
              });
            }
          }

          // Fade the LCP span ("Built with") — opacity only, no DOM mutation
          const lcpSpan = _headline.querySelector<HTMLSpanElement>("span.block:first-child");
          if (lcpSpan) {
            gsap.to(lcpSpan, {
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: _wrapper,
                start: "12% top",
                end: "30% top",
                scrub: 1,
              },
            });
          }
        });
      }

      // ── CTAs + mid fade out on section 1 exit ────────────────────────────
      const ctaEls = wrapperRef.current?.querySelectorAll<HTMLElement>(".hero-cta-row");
      if (ctaEls?.length) {
        gsap.to(Array.from(ctaEls), {
          opacity: 0,
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "8% top",
            end: "30% top",
            scrub: 1,
          },
        });
      }

      // ── Section 2 content: fade in + drift up from below ─────────────────
      // Set initial state via gsap.set (Fix 14): never hardcode GSAP initial
      // states in JSX — if GSAP doesn't run (mobile/error), element stays visible.
      if (content2Ref.current) {
        gsap.set(content2Ref.current, { opacity: 0, y: 50 });
        gsap.fromTo(
          content2Ref.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: wrapperRef.current,
              start: "35% top",
              end: "65% top",
              scrub: 1,
            },
          }
        );
      }

    }, wrapperRef);

    ctxRef.current = ctx;

    return () => {
      mounted = false;
      cancelAnimationFrame(splitFrame);
      localSplits.forEach((s, i) => {
        if (splitEls[i]?.isConnected) { try { s.revert(); } catch {} }
      });
      localSplits = [];
      allSplitsRef.current = [];
      ctxRef.current = null;
      try { ctx.revert(); } catch {}
    };
  }, []);

  return (
    /* Wrapper spans 200vh desktop / 140vh mobile — scroll distance for sticky panel */
    <div ref={wrapperRef} style={{ height: "var(--home-hero-height, 200vh)", position: "relative", zIndex: 1 }}>
      {/* Sticky panel — stays pinned while user scrolls through wrapper */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ── Layer 1: Background image — scaled tall for parallax travel ─────── */}
        <div
          ref={bgRef}
          className="absolute left-0 right-0"
          style={{ top: "-15%", height: "130%", transformOrigin: "center center", willChange: "transform" }}
          aria-hidden="true"
        >
          <Image
            src="/images/hero/hero-night.jpg"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
            style={{ filter: "contrast(1.04) saturate(1.1) brightness(0.92)" }}
          />
        </div>

        {/* ── Gradient layers ──────────────────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" style={{ height: "35%" }} aria-hidden="true" />

        {/* ── Copper accent line ───────────────────────────────────────────── */}
        <div
          className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
          aria-hidden="true"
          style={{
            height: "2px",
            background: "linear-gradient(to right, transparent 5%, #B87333 35%, #B87333 65%, transparent 95%)",
            opacity: 0.7,
          }}
        />

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — LAYER 2 (mid-ground eyebrow) + LAYER 3 (headline)
        ══════════════════════════════════════════════════════════════════ */}

        {/* Layer 2: Eyebrow — medium parallax */}
        <div
          ref={midRef}
          className="absolute top-28 left-0 right-0 z-10 max-w-7xl mx-auto px-6 lg:px-12"
          style={{ willChange: "transform" }}
        >
          {/* Eyebrow label — CSS animation so it paints before JS hydrates */}
          <div className="hero-meta-animate flex items-center gap-4" style={{ animationDelay: "0.1s" }}>
            <span className="font-labels text-[10px] text-white/50 tracking-[0.25em] uppercase">
              Torrance, CA
            </span>
            <span className="w-px h-3 bg-white/20" aria-hidden="true" />
            <span className="font-labels text-[10px] text-white/50 tracking-[0.25em] uppercase">
              South Bay
            </span>
            <span className="w-px h-3 bg-white/20" aria-hidden="true" />
            <span className="font-labels text-[10px] text-white/50 tracking-[0.25em] uppercase">
              20+ Yrs Experience
            </span>
          </div>
        </div>

        {/* Layer 3: Headline — counter-motion + section 1 content */}
        <div
          className="absolute inset-0 z-10 flex flex-col justify-end max-w-7xl mx-auto w-full px-6 lg:px-12 pb-14 lg:pb-20"
          style={{ pointerEvents: "none" }}
        >
          {/* Headline */}
          <h1
            ref={headlineRef}
            className="font-display font-bold text-white tracking-tight leading-[0.88] mb-8"
            style={{ fontSize: "clamp(5rem, 13vw, 13rem)", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
          >
            {/* Line 1: LCP element — no animation, no SplitType, paints on first frame */}
            <span className="block">Built with</span>

            {/* Line 2: CSS char-by-char reveal — replaces Framer Motion */}
            <span className="block overflow-hidden" aria-hidden="true">
              <span className="home-hero-line flex">
                {["I","n","t","e","n","t","."].map((char, i) => (
                  <span
                    key={i}
                    className="inline-block hero-char-animate"
                    style={{ animationDelay: `${0.25 + i * 0.06}s` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </span>
          </h1>

          {/* CTAs + services label — CSS animation entry */}
          <div className="hero-cta-row flex flex-col sm:flex-row sm:items-end justify-between gap-6" style={{ pointerEvents: "auto" }}>
            <span className="hero-meta-animate font-labels text-[10px] text-white/40 tracking-[0.18em] uppercase" style={{ animationDelay: "0.55s" }}>
              ADU · Remediation · Consulting
            </span>
            <div className="hero-meta-animate flex flex-col sm:flex-row gap-3 flex-shrink-0" style={{ animationDelay: "0.6s" }}>
              <MagneticButton strength={0.28}>
                <Link
                  href="/contact"
                  className="btn-shine btn-lift inline-flex items-center justify-center gap-2 bg-white text-black
                    px-8 py-3.5 font-labels text-[10px] tracking-[0.18em] uppercase
                    hover:bg-gray-100 transition-colors duration-200"
                >
                  Request Estimate →
                </Link>
              </MagneticButton>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center justify-center border border-white/30 text-white
                  px-8 py-3.5 font-labels text-[10px] tracking-[0.18em] uppercase
                  hover:border-white transition-colors duration-200 font-numbers"
              >
                {SITE.phone}
              </a>
            </div>
          </div>
        </div>

        {/* ── Scroll indicator ────────────────────────────────────────────── */}
        <div
          ref={scrollLineRef}
          className="hero-meta-animate absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 pointer-events-none"
          style={{ animationDelay: "1.4s" }}
        >
          <span className="font-labels text-[8px] text-white/30 tracking-[0.3em] uppercase">Scroll</span>
          <div className="relative w-[1.375rem] h-[2.25rem] rounded-[0.75rem] border border-white/25">
            <div
              className="absolute left-1/2 -translate-x-1/2 top-[0.4rem] w-[3px] h-[6px] bg-white/50 rounded-full"
              style={{ animation: "scrollWheel 1.8s ease-in-out infinite" }}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — fades in on scroll
        ══════════════════════════════════════════════════════════════════ */}
        {/* Section 2 hidden on mobile (hero is 100vh — no scroll space to reveal it) */}
        <div
          ref={content2Ref}
          className="absolute inset-0 z-10 hidden md:block"
          style={{ pointerEvents: "none" }}
        >
          <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
          <div
            className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto w-full px-6 lg:px-12 pb-14 lg:pb-20"
            style={{ pointerEvents: "auto" }}
          >
            <div className="relative z-10">
              <span className="font-labels text-[9px] text-white/35 tracking-[0.28em] uppercase mb-5 block">
                Torrance · Redondo Beach · Manhattan Beach
              </span>
              <h2
                className="font-display font-bold text-white tracking-tight leading-[0.88] mb-8"
                style={{ fontSize: "clamp(3.2rem, 8vw, 8rem)", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
              >
                South Bay&apos;s contractor
                <br />
                for work that lasts.
              </h2>

              {/* Credibility proof — 3 signals that Section 1 didn't give */}
              <div className="flex flex-wrap gap-x-10 gap-y-4 mb-10">
                <div>
                  <div className="font-numbers font-bold text-white leading-none" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>25+</div>
                  <div className="font-labels text-white/40 tracking-[0.2em] uppercase mt-1" style={{ fontSize: 9 }}>Years South Bay</div>
                </div>
                <div>
                  <div className="font-numbers font-bold text-white leading-none" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>150+</div>
                  <div className="font-labels text-white/40 tracking-[0.2em] uppercase mt-1" style={{ fontSize: 9 }}>Projects</div>
                </div>
                <div>
                  <div className="font-numbers font-bold leading-none" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "#B87333" }}>#1141119</div>
                  <div className="font-labels text-white/40 tracking-[0.2em] uppercase mt-1" style={{ fontSize: 9 }}>CA License</div>
                </div>
              </div>

              <MagneticButton strength={0.28}>
                <Link
                  href="/contact"
                  className="btn-shine btn-lift inline-flex items-center gap-2 bg-white text-black px-8 py-4
                    font-labels text-[10px] tracking-[0.18em] uppercase
                    hover:bg-gray-100 transition-colors duration-200"
                >
                  Request Estimate →
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
