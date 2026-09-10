"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { PROCESS_STEPS_V2, SITE } from "@/lib/constants";
import { lqip } from "@/lib/image-placeholders";
import { AnimationController } from "@/utils/animationControl";
import { revealOnVisible } from "@/utils/revealOnVisible";

gsap.registerPlugin(ScrollTrigger);

// NS-grammar vision + process: light editorial flow. Asymmetric intro split,
// full-width landscape photograph with parallax scrub, quiet marquee strip,
// then the five-step process as hairline-divided rows that reveal as the
// reader scrolls past each one. No pins, no background washes.

const marquee = [
  "active listening",
  "build your vision",
  "dedicated to your dream",
  "refined building",
  "lasting partnerships",
];

const processImages = [
  "/images/generated/home-process-initial-contact-v2.jpg",
  "/images/generated/home-process-site-visit-v2.jpg",
  "/images/generated/home-process-permit-approval-v2.jpg",
  "/images/generated/home-process-construction-v2.jpg",
  "/images/generated/home-process-post-construction-v2.jpg",
];

export default function HomeVisionSequence({
  part,
}: {
  part: "intro" | "process";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const photoFrameRef = useRef<HTMLDivElement>(null);
  const photoInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const statementEl = statementRef.current;
    if (!section) return;

    // Word-fill scrub on the brand statement (Fix 1 — four-guard cleanup)
    let split: SplitType | null = null;
    let mounted = true;
    const frame = requestAnimationFrame(() => {
      if (!mounted || !statementEl?.isConnected) return;
      if (!AnimationController.shouldAnimate()) return;
      split = new SplitType(statementEl, { types: "words" });
      gsap.fromTo(
        split.words ?? [],
        { opacity: 0.28 },
        {
          opacity: 1,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: {
            trigger: statementEl,
            start: "top 88%",
            end: "top 55%",
            scrub: 0.9,
          },
        }
      );
    });

    // One-shot reveals ride IntersectionObserver, not ScrollTrigger positions —
    // positional once-triggers go stale inside the sticky stack and after
    // client-side route transitions (PATTERNS.md Fix 22).
    const revealCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const headlineLines = gsap.utils.toArray<HTMLElement>(".vision-headline-line");
      const introEls = gsap.utils.toArray<HTMLElement>(".vision-intro-el");
      const processRows = gsap.utils.toArray<HTMLElement>(".process-row");
      const processHead = gsap.utils.toArray<HTMLElement>(".process-head-el");
      const closingEls = gsap.utils.toArray<HTMLElement>(".vision-closing-el");
      const travelEl = section.querySelector<HTMLElement>(".process-travel");
      const railFillEl = section.querySelector<HTMLElement>(".process-rail-fill");

      gsap.set(headlineLines, { yPercent: 110 });
      gsap.set(introEls, { y: 22, opacity: 0 });
      gsap.set(processRows, { y: 26, opacity: 0 });
      gsap.set(processHead, { y: 20, opacity: 0 });
      gsap.set(closingEls, { y: 18, opacity: 0 });
      if (railFillEl) gsap.set(railFillEl, { scaleY: 0, transformOrigin: "top" });
      if (photoFrameRef.current) gsap.set(photoFrameRef.current, { clipPath: "inset(10% 9% 10% 9%)" });

      if (!AnimationController.shouldAnimate()) {
        gsap.set(headlineLines, { yPercent: 0 });
        if (railFillEl) gsap.set(railFillEl, { scaleY: 1, transformOrigin: "top" });
        if (photoFrameRef.current) gsap.set(photoFrameRef.current, { clipPath: "inset(0%)" });

        // The shared section controller owns mobile/tablet entrances. Local
        // child states remain visible under skipped sections and back-scroll.
        gsap.set([...introEls, ...processRows, ...processHead, ...closingEls], {
          x: 0,
          y: 0,
          opacity: 1,
        });
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
        revealOnVisible(introEls, (el, i) => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.06,
            ease: "power3.out",
          });
        })
      );

      // Landscape photograph — grows from an inset frame to full bleed
      if (photoFrameRef.current) {
        gsap.to(photoFrameRef.current, {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: photoRef.current,
            start: "top 88%",
            end: "center 45%",
            scrub: 0.9,
          },
        });
      }
      if (photoInnerRef.current) {
        gsap.fromTo(
          photoInnerRef.current,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: photoRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          }
        );
      }

      revealCleanups.push(
        revealOnVisible(processHead, (el, i) => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: i * 0.07,
            ease: "power3.out",
          });
        })
      );

      // Process rows — decisive reveal per row
      revealCleanups.push(
        revealOnVisible(processRows, (row) => {
          gsap.to(row, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          });
        })
      );

      // Step-by-step highlight walk (exactly ONE row lit at a time) + progress
      // rail. Desktop (xl+): the process panel is CSS-sticky over a tall runway
      // (.process-travel) and the active row is a PURE FUNCTION of scroll
      // progress — runway/5 of dedicated scroll each. The travel wrapper itself
      // is never sticky, so its rect tracks scroll linearly until the whole
      // EditorialFlow surface pins, which happens exactly at progress 1; the
      // walk therefore always completes (05 gets its lit moment and stays lit)
      // BEFORE the next surface can cover the panel. Deterministic math, no rect
      // feedback: cannot be rushed, skipped, or frozen half-lit (services
      // pattern, commit 3d15bdb; PATTERNS Fix 25 class). Below xl there is no
      // pin — the active row is the last title past the focus line (monotone,
      // reflow-immune), preserving the mobile natural-flow reveals.
      const stepList = section.querySelector<HTMLElement>(".process-list");
      if (stepList && processRows.length) {
        const count = processRows.length;
        const desktopQuery = window.matchMedia("(min-width: 1280px)");
        const coarseTabletQuery = window.matchMedia(
          "(pointer: coarse) and (max-width: 1366px)"
        );
        const setActive = (idx: number) => {
          processRows.forEach((row, i) =>
            row.classList.toggle("process-row-active", i === idx)
          );
        };
        const setRail = (p: number) => {
          if (railFillEl) {
            railFillEl.style.transformOrigin = "top";
            railFillEl.style.transform = `scaleY(${Math.min(1, Math.max(0, p))})`;
          }
        };
        const updateActive = () => {
          let idx: number;
          let railP: number;
          if (desktopQuery.matches && !coarseTabletQuery.matches && travelEl) {
            const runway = travelEl.offsetHeight - window.innerHeight;
            if (runway <= 0) {
              idx = 0;
              railP = 0;
            } else {
              const progress = Math.min(
                0.9999,
                Math.max(0, -travelEl.getBoundingClientRect().top / runway)
              );
              idx = Math.min(count - 1, Math.floor(progress * count));
              railP = progress;
            }
          } else {
            // Mobile / no-pin: last row whose top has crossed the focus line.
            const focusY = window.innerHeight * 0.62;
            const listRect = stepList.getBoundingClientRect();
            if (listRect.top > focusY) {
              idx = -1;
            } else if (listRect.bottom < focusY) {
              idx = count - 1;
            } else {
              idx = 0;
              processRows.forEach((row, i) => {
                if (row.getBoundingClientRect().top <= focusY) idx = i;
              });
            }
            railP = idx < 0 ? 0 : (idx + 1) / count;
          }
          setActive(idx);
          setRail(railP);
        };
        ScrollTrigger.create({
          trigger: travelEl ?? stepList,
          start: "top bottom",
          end: "bottom top",
          onUpdate: updateActive,
          onRefresh: updateActive,
          onEnter: updateActive,
          onLeave: updateActive,
          onEnterBack: updateActive,
          onLeaveBack: updateActive,
        });
        desktopQuery.addEventListener("change", updateActive);
        coarseTabletQuery.addEventListener("change", updateActive);
        revealCleanups.push(() =>
          desktopQuery.removeEventListener("change", updateActive)
        );
        revealCleanups.push(() =>
          coarseTabletQuery.removeEventListener("change", updateActive)
        );
        updateActive();
      }

      // Hairline under each row draws as it reveals
      const rules = gsap.utils.toArray<HTMLElement>(".process-rule");
      gsap.set(rules, { scaleX: 0, transformOrigin: "left" });
      revealCleanups.push(
        revealOnVisible(rules, (rule) => {
          gsap.to(rule, {
            scaleX: 1,
            duration: 0.9,
            ease: "power2.inOut",
          });
        })
      );

      revealCleanups.push(
        revealOnVisible(closingEls, (el, i) => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.75,
            delay: i * 0.08,
            ease: "power3.out",
          });
        })
      );
    }, sectionRef);

    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      revealCleanups.forEach((dispose) => dispose());
      if (split && statementEl?.isConnected) {
        try {
          split.revert();
        } catch {}
      }
      split = null;
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section={part === "intro" ? "vision" : "vision-process"}
      data-header-dark=""
      {...(part === "intro" ? { "data-header-transparent": "" } : {})}
      {...(part === "process" ? { "data-flow-rail-pause": "" } : {})}
      className={`relative text-white ${part === "intro" ? "bg-[#050505]" : "bg-[#0a0a0a]"}`}
    >
      {part === "intro" && (
        <>
      {/* Intro — asymmetric editorial split. FULL SCREEN on desktop (Brian,
          2026-07-13 round 2): the statement owns the whole viewport at its
          snapped rest; the white marquee strip lives at the top of the NEXT
          section (the approach panel) instead of under this one. */}
      <div
        ref={photoRef}
        data-header-dark=""
        data-header-transparent=""
        className="relative min-h-[max(44rem,100svh)] overflow-hidden bg-[#050505] text-white sm:min-h-[max(48rem,100svh)] lg:h-svh"
        data-gsap-reveal="true"
      >
        <div
          ref={photoFrameRef}
          className="absolute inset-0 overflow-hidden"
          style={{ willChange: "clip-path" }}
          aria-hidden="true"
        >
          <div ref={photoInnerRef} className="absolute -inset-y-[10%] inset-x-0" style={{ willChange: "transform" }}>
            <Image
              src="/images/generated/home-vision-fireplace-work-v2.webp"
              alt=""
              fill
              loading="lazy"
              placeholder="blur"
              blurDataURL={lqip("/images/generated/home-vision-fireplace-work-v2.webp")}
              sizes="100vw"
              className="object-cover"
              style={{ filter: "contrast(1.04) saturate(1.04)" }}
            />
          </div>
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.54)_44%,rgba(0,0,0,0.2)_100%),linear-gradient(180deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.18)_48%,rgba(0,0,0,0.72)_100%)]"
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[44rem] max-w-[1680px] flex-col justify-end px-6 pb-16 pt-24 sm:min-h-[48rem] lg:h-full lg:min-h-0 lg:px-12 lg:pb-20 lg:pt-20">
          <div
            className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12"
            data-motion-reveal="up"
            data-motion-stagger="0.08"
          >
          <div className="lg:col-span-7">
            <p className="vision-intro-el mb-6 flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.26em] text-white/64 lg:mb-8">
              <span
                aria-hidden="true"
                className="inline-block h-px w-10 bg-[var(--color-accent-light)]"
              />
              Our first step is listening
            </p>
            <h3
              ref={headlineRef}
              className="max-w-[12ch] font-editorial text-[clamp(3rem,5vw,5.25rem)] font-normal leading-[1.04] text-white"
            >
              <span className="-my-[0.24em] block overflow-hidden py-[0.24em]">
                <span className="vision-headline-line block">
                  Quality over quantity.
                </span>
              </span>
            </h3>
          </div>

          <div className="flex flex-col justify-end lg:col-span-5 lg:col-start-8">
            <p className="vision-intro-el max-w-md text-[15px] leading-7 text-white/72">
              A short call to understand the project, the site, and the right
              next move.
            </p>
            <p
              ref={statementRef}
              className="vision-intro-el mt-7 max-w-md border-l-2 border-[var(--color-accent-light)] pl-5 text-[15px] leading-7 text-white/84 lg:pl-6"
            >
              Embodying meticulous planning, seamless communication, and
              unparalleled craftsmanship from the first consultation through
              post-construction, ensuring every detail exceeds expectation.
            </p>
            <div className="vision-intro-el mt-8 flex flex-wrap gap-3">
              <a
                href={SITE.phoneHref}
                className="bg-white px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-[var(--color-accent)] hover:text-white"
              >
                Call {SITE.phone}
              </a>
              <Link
                href="/contact"
                className="border border-white/28 px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-white/74 transition-colors hover:border-white/60 hover:text-white"
              >
                Send project details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Landscape photograph — expands from an inset frame to full bleed
          as the reader scrolls through it */}
      </div>
        </>
      )}

      {part === "process" && (
        <>
      {/* Process — full-bleed black panel, maroon ignition, progress rail.
          Desktop (xl+): the panel is CSS-sticky over a runway so the 5-row
          highlight walk owns dedicated scroll and every step gets its lit
          moment before the next surface can cover it (services pattern,
          3d15bdb). Runway trimmed 190vh → 120vh (Brian, 2026-07-13: the walk
          took too long — a nudge barely advanced it). The white marquee strip
          rides at the TOP of this pinned panel (moved out from under the
          statement, Brian round 2). Mobile keeps the compact natural flow. */}
      <div
        data-header-dark=""
        className="process-travel relative bg-[#0a0a0a] text-white xl:h-[calc(100svh+120vh)]"
      >
        <div className="xl:sticky xl:top-14 xl:flex xl:h-[calc(100svh-3.5rem)] xl:flex-col xl:overflow-hidden">
        {/* Marquee — refined mono strip, hairline-bounded, pinned with the panel */}
        <div
          className="flex h-14 w-full items-center overflow-hidden border-y border-white/10 bg-[#050505]"
          aria-hidden="true"
        >
          <div
            data-ambient-motion=""
            className="home-vision-marquee flex h-full w-max items-center gap-10 whitespace-nowrap font-labels text-[11px] uppercase leading-none tracking-[0.3em] text-white/64"
            style={{ animation: "marqueeScroll 72s linear infinite" }}
          >
            {[...marquee, ...marquee, ...marquee, ...marquee].map((item, i) => (
              <span key={`${item}-${i}`} className="flex h-full items-center gap-10">
                <span style={i % 5 === 2 ? { color: "#D08A84" } : undefined}>
                  {item}
                </span>
                <span
                  className="h-1.5 w-1.5 rotate-45"
                  style={{ background: "var(--color-accent)", opacity: 0.55 }}
                />
              </span>
            ))}
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[1680px] flex-col px-6 pt-14 pb-16 min-[1180px]:flex-1 min-[1180px]:justify-center min-[1180px]:px-12 min-[1180px]:pb-14 min-[1180px]:pt-10">
          <div
            className="grid gap-10 min-[1180px]:grid-cols-12 min-[1180px]:items-center min-[1180px]:gap-12"
            data-motion-reveal="up"
            data-motion-stagger="0.08"
          >
            <div className="relative min-[1180px]:col-span-5 min-[1180px]:flex min-[1180px]:max-w-[34rem] min-[1180px]:flex-col min-[1180px]:justify-center min-[1180px]:border-l min-[1180px]:border-white/12 min-[1180px]:py-2 min-[1180px]:pl-9">
              <span
                aria-hidden="true"
                className="absolute left-[-1px] top-0 hidden h-20 w-[2px] bg-[var(--color-accent)] min-[1180px]:block"
              />
              <p className="process-head-el mb-5 flex items-center gap-3 font-labels text-[10px] uppercase tracking-[0.26em] text-[var(--color-accent-light)] lg:mb-7">
                <span
                  aria-hidden="true"
                  className="inline-block h-px w-10 bg-[var(--color-accent-light)]"
                />
                The approach
              </p>
              <h3 className="process-head-el max-w-[12.5ch] font-editorial text-[clamp(2.45rem,3.65vw,3.85rem)] font-normal leading-[0.98] text-white">
                Build Philosophy
              </h3>
              <p className="process-head-el mt-6 max-w-[24rem] text-[15px] leading-7 text-white/60">
                Clear communication, clean sequencing, and a finish that holds
                up after the crew leaves.
              </p>
              <div className="process-head-el mt-7">
                <Link
                  href="/contact"
                  className="inline-flex w-fit items-center gap-3 bg-white px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-[var(--color-accent)] hover:text-white"
                >
                  Start Step 01
                  <span aria-hidden="true">+</span>
                </Link>
              </div>
            </div>

            <div className="min-[1180px]:col-span-6 min-[1180px]:col-start-7">
              <div className="process-list relative pl-6 min-[1180px]:pl-8">
                {/* Progress rail — maroon fill draws down as the rows pass */}
                <div
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 top-0 w-px bg-white/12"
                />
                <div
                  aria-hidden="true"
                  className="process-rail-fill absolute bottom-0 left-0 top-0 w-px bg-[var(--color-accent-light)]"
                />
                <ol className="border-t border-white/12">
                  {PROCESS_STEPS_V2.map((step, i) => (
                    <li key={step.number} className="relative">
                      <div className="process-row grid grid-cols-[1.5rem_4.75rem_minmax(0,1fr)] items-center gap-3.5 py-4 sm:grid-cols-[3.25rem_9.5rem_minmax(0,1fr)] sm:gap-4 min-[1180px]:grid-cols-[3.5rem_9.5rem_minmax(0,1fr)] min-[1180px]:gap-5 min-[1180px]:py-4 2xl:grid-cols-[3.5rem_11.5rem_minmax(0,1fr)_auto] 2xl:py-5">
                        <span className="process-num font-numbers text-[11px] text-white/50 transition-colors duration-400">
                          {step.number}
                        </span>
                        <div className="process-thumb relative h-14 overflow-hidden bg-white/5 sm:h-20 lg:h-[5.5rem]">
                          <Image
                            src={processImages[i] ?? "/images/process/detail.jpg"}
                            alt=""
                            fill
                            placeholder="blur"
                            blurDataURL={lqip(processImages[i] ?? "/images/process/detail.jpg")}
                            sizes="(max-width: 640px) 128px, (max-width: 1024px) 152px, 184px"
                            quality={92}
                            className="object-cover opacity-90 transition-[transform,opacity] duration-500"
                            style={{ filter: "contrast(1.06) saturate(1.08)" }}
                          />
                        </div>
                        <h4 className="process-title font-editorial text-[1.15rem] font-normal leading-tight text-white/70 transition-[color,transform] duration-400 sm:text-[clamp(1.25rem,2.15vw,2.1rem)]">
                          {step.title}
                        </h4>
                        <span className="process-sub hidden font-labels text-[9px] uppercase tracking-[0.2em] text-white/48 transition-colors duration-400 2xl:block">
                          {step.subtitle}
                        </span>
                      </div>
                      <div className="process-rule h-px w-full bg-white/12" aria-hidden="true" />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Section footnote */}
          <p className="vision-closing-el mt-8 border-t border-white/10 pt-4 font-labels text-[9px] uppercase tracking-[0.22em] text-white/62 lg:mt-10">
            {SITE.address.city}, CA / South Bay / CA #{SITE.license}
          </p>
        </div>
        </div>
      </div>
        </>
      )}
    </section>
  );
}
