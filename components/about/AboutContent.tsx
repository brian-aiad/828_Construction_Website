"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICE_AREAS, SITE } from "@/lib/constants";
import { AnimationController } from "@/utils/animationControl";
import { revealOnVisible } from "@/utils/revealOnVisible";
import SectionMotionBackdrop from "@/components/system/SectionMotionBackdrop";
import AboutFlow from "@/components/about/AboutFlow";

gsap.registerPlugin(ScrollTrigger);

const proofStats = [
  { label: "In the Field", value: `Since '04` },
  { label: "License", value: `#${SITE.license}` },
  { label: "Base", value: "Torrance" },
];

// Joe's dictated card set (video IMG_1019): Communication / Intentions /
// Execution, body copy rewritten to fit per his explicit license.
const standards = [
  {
    number: "01",
    title: "Communication.",
    body: "Every project starts and ends with clear, honest dialogue. Homeowners always know what is happening, what comes next, and why it matters.",
  },
  {
    number: "02",
    title: "Intentions.",
    body: "Nothing here is built by accident. Materials, sequence, and budget are decided deliberately — with the finished home in mind before work begins.",
  },
  {
    number: "03",
    title: "Execution.",
    body: "Plans only matter when they are carried out with precision. The finish, the cleanup, and the details that remain are where the work proves itself.",
  },
];

// Joe's CRAFT acronym (video IMG_1020). `rest` completes the word out of its
// letter — Joe's literal sketch: "C R A F T down the side, the words come
// from it, like C→uriosity."
const craft = [
  {
    letter: "C",
    rest: "uriosity.",
    body: "Curiosity drives how 828 builds — digging deeper into details, uncovering smarter solutions to complex construction challenges.",
  },
  {
    letter: "R",
    rest: "elatability.",
    body: "Relatability guides our work — understanding each client's perspective so we can serve with clarity.",
  },
  {
    letter: "A",
    rest: "lignment.",
    body: "Alignment is where intent, design, and execution come together seamlessly — like the relationship between builder and client.",
  },
  {
    letter: "F",
    rest: "orged.",
    body: "Forged through experience and precision — 828 translates our clients' vision into remarkable spaces defined by design integrity and strategy.",
  },
  {
    letter: "T",
    rest: "ailored.",
    body: "Tailored to each client's vision — 828's approach ensures every detail is shaped through close collaboration between builder and owner, for a truly bespoke result.",
  },
];

// Entrance reveals key off actual on-screen visibility. A previous sticky
// About stack made positional ScrollTriggers brittle after pins, route changes,
// and mid-page refreshes; IO keeps these content reveals tied to what is
// visible instead of to stale document offsets. Words are visible by default in
// JSX and hidden only here, gated. `start` is retained for call-site readability
// as an advisory label.
function useReveal(sectionRef: React.RefObject<HTMLElement | null>, selector: string, _start = "top 78%") {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !AnimationController.shouldAnimate()) return;

    const items = Array.from(section.querySelectorAll<HTMLElement>(selector));
    if (!items.length) return;

    let dispose = () => {};
    const ctx = gsap.context(() => {
      items.forEach((el) => el.setAttribute("data-gsap-reveal", "true"));
      gsap.set(items, { y: 28, opacity: 0 });
      dispose = revealOnVisible([section], () => {
        gsap.to(items, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: true,
        });
      });
    }, sectionRef);

    return () => {
      dispose();
      try {
        ctx.revert();
      } catch {}
    };
  }, [sectionRef, selector, _start]);
}

// ── Hero — open editorial composition with a static brand watermark ─────
function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  useReveal(sectionRef, "[data-hero-reveal]", "top 86%");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const { isMobile, prefersReducedMotion } = AnimationController.getConfig();
    if (!AnimationController.shouldAnimate()) {
      if (!isMobile || prefersReducedMotion) return;

      const items = Array.from(
        section.querySelectorAll<HTMLElement>("[data-hero-reveal]")
      );
      const mobileCtx = gsap.context(() => {
        items.forEach((el, i) => {
          gsap.set(el, { x: i < 2 ? -20 : 20, opacity: 0 });
        });
        gsap.to(items, {
          x: 0,
          opacity: 1,
          duration: 0.68,
          stagger: 0.07,
          delay: 0.12,
          ease: "power3.out",
          overwrite: true,
        });
      }, sectionRef);

      return () => {
        try {
          mobileCtx.revert();
        } catch {}
      };
    }

    const ctx = gsap.context(() => {
      if (photoRef.current) {
        gsap.fromTo(
          photoRef.current,
          { scale: 1.08 },
          {
            scale: 1,
            yPercent: -4,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
          }
        );
      }

      // Proof rows draw their separators as the page settles in.
      statRefs.current.forEach((row, i) => {
        if (!row) return;
        const line = row.querySelector<HTMLElement>("[data-stat-line]");
        if (!line) return;
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 0.9,
            delay: 0.25 + i * 0.14,
            ease: "power2.inOut",
            scrollTrigger: { trigger: section, start: "top 80%", once: true },
          }
        );
      });

      if (railRef.current) {
        gsap.fromTo(
          railRef.current,
          { scaleX: 0.18, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
          }
        );
      }
    }, sectionRef);

    return () => {
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section=""
      data-header-dark=""
      data-header-transparent=""
      className="relative min-h-[100svh] bg-[#0a0a0a] text-white"
      style={{ overflowX: "clip" }}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div ref={photoRef} className="absolute inset-0" style={{ willChange: "transform" }}>
          <Image
            src="/images/generated/about-hero-craft-v7.webp"
            alt=""
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={90}
            className="object-cover object-[66%_center] lg:object-center"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.24)_0%,rgba(10,10,10,0.12)_22%,rgba(10,10,10,0.84)_48%,#0a0a0a_100%)] lg:bg-[linear-gradient(90deg,rgba(10,10,10,0.88)_0%,rgba(10,10,10,0.7)_35%,rgba(10,10,10,0.15)_68%,rgba(10,10,10,0.04)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[112rem] flex-col px-6 pb-9 pt-24 sm:px-10 sm:pb-12 lg:px-12 lg:pt-24 2xl:px-16">
        <div
          data-about-static-title=""
          aria-hidden="true"
          className="about-hero-static-title pointer-events-none w-[calc(100vw-2rem)] self-center select-none whitespace-nowrap text-center font-editorial text-[calc(9.85vw-3.152px)] font-bold uppercase leading-none text-white/[0.22] lg:w-[calc(100vw-4rem)] lg:text-[calc(9.85vw-6.304px)]"
        >
          <span>828 Construction</span>
        </div>

        <div className="flex flex-1 items-end pt-36 sm:pt-56 lg:items-center lg:py-16">
          <div data-about-dossier="" className="w-full max-w-[40rem] lg:w-[58%] lg:max-w-[44rem]">
            <p data-hero-reveal className="mb-6 flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.24em] text-white/70">
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
              About / 828 Construction
            </p>
            <h1 data-hero-reveal className="font-editorial text-[clamp(2rem,9vw,2.5rem)] font-semibold leading-[1.04] tracking-[-0.035em] [text-wrap:balance] sm:text-[clamp(2.5rem,5vw,5rem)]">
              Where quality<br className="sm:hidden" /> meets<br className="hidden sm:block" /> quiet luxury.
            </h1>
            <p data-hero-reveal className="mt-6 max-w-[29rem] text-base leading-[1.75] text-white/75 sm:text-lg">
              Every home is shaped by decades of hands-on experience and building
              science, ensuring exceptional quality and performance.
            </p>

            <div data-hero-reveal className="mt-9 grid grid-cols-3 sm:mt-10">
              {proofStats.map((stat, i) => (
                <div
                  key={stat.label}
                  ref={(el) => {
                    statRefs.current[i] = el;
                  }}
                  className="relative min-w-0 py-5 pr-2 sm:pr-5"
                >
                  <span data-stat-line className="absolute inset-x-0 top-0 h-px bg-white/25" aria-hidden="true" />
                  <span className="block font-labels text-[8px] uppercase tracking-[0.16em] text-white/60 sm:text-[9px] sm:tracking-[0.2em]">{stat.label}</span>
                  <span className="mt-2 block font-numbers text-sm text-white/90 sm:text-lg">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div data-hero-reveal className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/15 pt-5 lg:mt-0">
          {["Plans before promises", "Field-built judgment", "South Bay residential"].map((item) => (
            <span key={item} className="flex items-center gap-2.5">
              <span className="h-1 w-1 rotate-45 bg-accent" aria-hidden="true" />
              <span className="font-labels text-[8px] uppercase tracking-[0.16em] text-white/65 sm:text-[9px]">{item}</span>
            </span>
          ))}
        </div>
      </div>

      <div ref={railRef} className="absolute bottom-0 left-0 z-20 h-px w-full bg-accent" aria-hidden="true" />
    </section>
  );
}

// ── Builder profile — founder statement + standards, no portrait slot ──────
function OriginSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteLineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const founderRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const revealCleanups: Array<() => void> = [];
    const ctx = gsap.context(() => {
      if (!AnimationController.shouldAnimate()) return;

      const label = labelRef.current;
      const founder = founderRef.current;
      const rows = rowRefs.current.filter((row): row is HTMLDivElement => !!row);

      if (label) gsap.set(label, { autoAlpha: 0, x: -20 });
      if (founder) gsap.set(founder, { autoAlpha: 0, x: -30 });
      gsap.set(rows, { autoAlpha: 0, x: 32 });

      if (label) {
        revealCleanups.push(
          revealOnVisible([label], (_el, _index, immediate) => {
            gsap.to(label, {
              autoAlpha: 1,
              x: 0,
              duration: immediate ? 0 : 0.62,
              ease: "power3.out",
              overwrite: "auto",
            });
          })
        );
      }

      if (founder) {
        revealCleanups.push(
          revealOnVisible([founder], (_el, _index, immediate) => {
            gsap.to(founder, {
              autoAlpha: 1,
              x: 0,
              duration: immediate ? 0 : 0.82,
              ease: "power3.out",
              overwrite: "auto",
            });
          })
        );
      }

      revealCleanups.push(
        revealOnVisible(rows, (row, index, immediate) => {
          gsap.to(row, {
            autoAlpha: 1,
            x: 0,
            duration: immediate ? 0 : 0.72,
            delay: immediate ? 0 : Math.min(index, 2) * 0.09,
            ease: "power3.out",
            overwrite: "auto",
          });
        })
      );

      // The maroon quote rule draws down alongside the founder statement.
      if (quoteLineRef.current) {
        gsap.fromTo(
          quoteLineRef.current,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 78%", end: "top 30%", scrub: true },
          }
        );
      }

    }, sectionRef);

    return () => {
      revealCleanups.forEach((dispose) => dispose());
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  return (
    <section ref={sectionRef} data-section="" data-header-dark="" className="relative flex min-h-svh flex-col justify-center bg-[#050505] pb-20 pt-24 text-white lg:pb-24 lg:pt-[7.5rem]" style={{ overflowX: "clip" }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(99,26,22,0.16),transparent_30%)]" />
      <SectionMotionBackdrop tone="light" density="quiet" className="opacity-[0.15]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <p ref={labelRef} data-gsap-reveal="true" className="mb-10 flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.28em] text-white/40 lg:mb-12">
          <span className="h-px w-7 bg-accent" aria-hidden="true" />
          The builder profile
        </p>
        <h2 className="sr-only">The builder profile</h2>

        <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
          <div className="lg:col-span-7">
            <div ref={founderRef} data-gsap-reveal="true" className="relative pl-7 lg:pl-9">
              <span className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-[2px] bg-white/10" aria-hidden="true">
                <span ref={quoteLineRef} className="absolute inset-0 block bg-accent" style={{ display: "block" }} />
              </span>
              <p className="font-editorial text-[clamp(1.4rem,2vw,1.9rem)] font-light leading-[1.34] text-white/88">
                828 Construction is guided by a founder with over two decades of
                hands-on experience in residential construction. This depth of
                knowledge — built from working directly alongside skilled
                tradesmen — shapes a precise understanding of how homes are built
                and perform.
              </p>
            </div>
          </div>

          <div
            className="border-t border-white/10 lg:col-span-5"
          >
            {standards.map((item, index) => (
              <div
                key={item.number}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                data-gsap-reveal="true"
                className="grid gap-3 border-b border-white/10 py-6 sm:grid-cols-[3.2rem_1fr] sm:gap-5 lg:py-7"
              >
                <span className="font-numbers text-[12px]" style={{ color: "var(--color-accent-light)" }}>
                  {item.number}
                </span>
                <div>
                  <h3 className="font-editorial text-[clamp(1.35rem,1.8vw,1.7rem)] font-semibold leading-none">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/56">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CRAFT — the /about signature: words complete out of their letters ──────
function CraftSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const restRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Word-completion uses rect-based IO reveals that play once and always
    // finish. Words are visible by default with no JS; GSAP hides them only
    // here, gated, and failsafes force-reveal stuck rows.
    let rowsDispose = () => {};

    const ctx = gsap.context(() => {
      if (!AnimationController.shouldAnimate()) {
        letterRefs.current.forEach((l) => {
          if (l) l.style.color = "#a3342b";
        });
        return;
      }

      if (watermarkRef.current) {
        gsap.fromTo(
          watermarkRef.current,
          { xPercent: 4 },
          {
            xPercent: -10,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }

      const revealed = new Set<number>();
      const reveal = (index: number, immediate = false) => {
        if (revealed.has(index)) return;
        revealed.add(index);
        const rest = restRefs.current[index];
        const body = rowRefs.current[index]?.querySelector("[data-craft-body]");
        const letter = letterRefs.current[index];
        if (rest) {
          gsap.set(rest, { willChange: "transform" });
          gsap.to(rest, {
            xPercent: 0,
            opacity: 1,
            // Keep the completion readable without letting it trail behind a
            // quick desktop scroll into the next row.
            duration: immediate ? 0 : 1.15,
            ease: "power2.out",
            overwrite: true,
            // Clear the raster-layer hint once the slide finishes — a permanent
            // will-change on reading text keeps it on its own compositor layer
            // and can soften the glyph edges at rest (blur-audit, 2026-07-10).
            onComplete: () => gsap.set(rest, { willChange: "auto" }),
          });
        }
        if (body) {
          gsap.to(body, {
            y: 0,
            opacity: 1,
            duration: immediate ? 0 : 0.85,
            delay: immediate ? 0 : 0.12,
            ease: "power2.out",
            overwrite: true,
          });
        }
        if (letter) letter.style.color = "#a3342b";
      };

      // Hide only now that a reveal path exists (words are visible in JSX).
      rowRefs.current.forEach((row, index) => {
        if (!row) return;
        const rest = restRefs.current[index];
        const body = row.querySelector("[data-craft-body]");
        if (rest) gsap.set(rest, { xPercent: -100, opacity: 0 });
        if (body) gsap.set(body, { y: 18, opacity: 0 });
      });

      const rows = rowRefs.current.filter((row): row is HTMLDivElement => !!row);
      rowsDispose = revealOnVisible(
        rows,
        (row, _index, immediate) => {
          const index = rowRefs.current.indexOf(row as HTMLDivElement);
          if (index >= 0) reveal(index, immediate);
        },
        { rootMargin: "0px 0px -20% 0px", threshold: 0.05 }
      );
    }, sectionRef);

    return () => {
      rowsDispose();
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section=""
      data-header-light=""
      className="relative flex min-h-svh flex-col justify-center bg-white pb-20 pt-24 text-black lg:pb-24 lg:pt-[7.5rem]"
      style={{ overflowX: "clip" }}
    >
      <SectionMotionBackdrop tone="dark" density="quiet" className="opacity-[0.1]" />

      <div
        ref={watermarkRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[3%] right-[-2%] z-0 select-none whitespace-nowrap font-editorial font-bold uppercase leading-none text-black/[0.03]"
        style={{ fontSize: "clamp(6rem, 17vw, 15rem)", letterSpacing: "0.02em", willChange: "transform" }}
      >
        Craft
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
        <div
          className="mb-12 flex flex-wrap items-end justify-between gap-6 lg:mb-14"
          data-motion-reveal="left"
        >
          <div>
            <p className="mb-5 flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.28em] text-black/58">
              <span className="h-px w-7 bg-accent" aria-hidden="true" />
              Method
            </p>
            <h2 className="font-editorial text-[clamp(1.9rem,2.6vw,2.5rem)] font-light leading-[1.05]">
              Exceptional thinking, exceptional building.
            </h2>
          </div>
        </div>

        <div
          className="border-t border-black/10"
          data-motion-reveal="up"
          data-motion-stagger="0.06"
        >
          {craft.map((item, index) => (
            <div
              key={item.letter}
              ref={(el) => {
                rowRefs.current[index] = el;
              }}
              className="grid items-center gap-3 border-b border-black/10 py-6 lg:grid-cols-[minmax(17rem,0.62fr)_1fr] lg:gap-10 lg:py-7"
            >
              <h3 className="flex items-baseline font-editorial text-[clamp(2.6rem,4.6vw,4.4rem)] font-semibold leading-[0.94]">
                <span
                  ref={(el) => {
                    letterRefs.current[index] = el;
                  }}
                  className="transition-colors duration-500"
                  style={{ color: "#a3342b" }}
                >
                  {item.letter}
                </span>
                <span
                  className="inline-block overflow-hidden"
                  style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
                >
                  <span
                    ref={(el) => {
                      restRefs.current[index] = el;
                    }}
                    data-gsap-reveal="true"
                    className="inline-block"
                  >
                    {item.rest}
                  </span>
                </span>
              </h3>
              <p data-craft-body data-gsap-reveal="true" className="max-w-2xl text-[clamp(0.96rem,1.1vw,1.05rem)] leading-relaxed text-black/62">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── South Bay — tight horizon band: marquee + glass card, no dead height ───
function SouthBaySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);

  useReveal(sectionRef, "[data-area-copy]", "top 78%");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !AnimationController.shouldAnimate()) return;

    const ctx = gsap.context(() => {
      if (compassRef.current) {
        gsap.to(compassRef.current, {
          rotate: 72,
          transformOrigin: "50% 50%",
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    }, sectionRef);

    return () => {
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  const marqueeRow = (duration: string, reverse = false) => (
    <div className="overflow-hidden" aria-hidden="true">
      <div
        data-ambient-motion=""
        className="about-area-marquee flex w-max items-center whitespace-nowrap"
        style={{
          animation: `marqueeScroll ${duration} linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          willChange: "transform",
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {SERVICE_AREAS.map((area) => (
              <span key={`${copy}-${area}`} className="flex items-center">
                <span className="font-editorial text-[clamp(1.65rem,7vw,2.6rem)] font-semibold uppercase leading-none text-white/[0.07] min-[1180px]:text-[clamp(2rem,4.2vw,4rem)] min-[1180px]:text-white/[0.08]">
                  {area}
                </span>
                <span className="mx-6 h-1.5 w-1.5 rotate-45 bg-accent/40 min-[1180px]:mx-12 min-[1180px]:bg-accent/45" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      data-section=""
      data-stack-compact=""
      data-header-dark=""
      className="relative flex items-center border-y border-white/10 bg-[#070707] py-16 text-white sm:py-20 xl:py-24"
      style={{ overflowX: "clip" }}
    >
      <div
        className="absolute inset-0 opacity-[0.1]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)",
          backgroundSize: "78px 78px",
        }}
      />
      <SectionMotionBackdrop tone="light" density="quiet" className="opacity-[0.14]" />
      <div ref={compassRef} className="pointer-events-none absolute -left-24 top-1/2 hidden h-[22rem] w-[22rem] -translate-y-1/2 rounded-full border border-white/8 lg:block">
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/6" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-white/6" />
      </div>

      {/* Joe (IMG_1024): cities rolling across the screen — the horizon layer. */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2">
        <div className="flex flex-col gap-4 min-[1180px]:gap-9" data-motion-reveal="left">
          {marqueeRow("74s")}
          {marqueeRow("92s", true)}
        </div>
      </div>

      <div
        className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-12"
        data-motion-reveal="right"
      >
        <div
          data-area-copy
          className="max-w-md border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md lg:ml-auto lg:p-10"
        >
          <p className="mb-5 flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.28em] text-white/44">
            <span className="h-px w-7 bg-accent" aria-hidden="true" />
            South Bay native
          </p>
          <h2 className="font-editorial text-[clamp(1.9rem,2.8vw,2.7rem)] font-semibold leading-[1.02]">
            Looking for a local contractor?
          </h2>
          <p className="mt-5 text-[clamp(1rem,1.2vw,1.1rem)] leading-relaxed text-white/64">
            828 Construction — servicing the South Bay for over two decades.
          </p>
        </div>

        <ul className="sr-only">
          {SERVICE_AREAS.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── CTA — split panel: photo plate left, black invitation panel right ──────
function AboutCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLSpanElement>(null);

  useReveal(sectionRef, "[data-cta-reveal]", "top 72%");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !AnimationController.shouldAnimate()) return;

    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { scale: 1.07 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      }
      if (seamRef.current) {
        gsap.fromTo(
          seamRef.current,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 78%", end: "top 20%", scrub: true },
          }
        );
      }
    }, sectionRef);

    return () => {
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  return (
    <section ref={sectionRef} data-section="" data-header-dark="" data-header-transparent="" className="relative grid min-h-svh bg-black text-white lg:grid-cols-2" style={{ overflowX: "clip" }}>
      <div
        className="relative min-h-[40svh] overflow-hidden lg:min-h-svh"
        data-motion-reveal="left"
      >
        <div ref={imageRef} className="absolute inset-0" style={{ willChange: "transform" }}>
          <Image
            src="/images/generated/about-cta-first-conversation-v2.jpg"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={92}
            className="object-cover"
            style={{ filter: "contrast(1.06) saturate(1.02) brightness(0.92)" }}
          />
        </div>
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 100%)" }}
        />
      </div>

      <div className="relative flex items-center px-6 py-18 lg:min-h-svh lg:px-16 lg:py-24">
        <span ref={seamRef} className="absolute left-0 top-0 hidden h-full w-px bg-accent/60 lg:block" aria-hidden="true" />
        <div className="max-w-lg" data-motion-reveal="right">
          <p data-cta-reveal className="mb-6 flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.28em] text-white/42">
            <span className="h-px w-7 bg-accent" aria-hidden="true" />
            The first conversation
          </p>
          <h2 data-cta-reveal className="font-editorial text-[clamp(2.1rem,3.2vw,3.1rem)] font-semibold leading-[1.02]">
            For those who value experience and quality.
          </h2>
          <p data-cta-reveal className="mt-7 max-w-md text-[clamp(1rem,1.2vw,1.12rem)] leading-relaxed text-white/66">
            Every exceptional home begins with a conversation. By listening
            first, we transform your vision into thoughtfully crafted reality.
          </p>
          <div data-cta-reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-white px-8 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black transition hover:bg-white/90"
            >
              Initial Contact
            </Link>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center justify-center border border-white/22 px-8 py-4 font-numbers text-sm tracking-wide text-white transition hover:border-white/42 hover:bg-white/[0.04]"
            >
              {SITE.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutContent() {
  return (
    <AboutFlow>
      <AboutHero />
      <OriginSection />
      <CraftSection />
      <SouthBaySection />
      <AboutCTA />
    </AboutFlow>
  );
}
