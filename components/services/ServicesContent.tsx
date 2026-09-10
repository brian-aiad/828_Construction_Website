"use client";

import {
  type SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES, SITE } from "@/lib/constants";
import { AnimationController } from "@/utils/animationControl";
import { revealOnVisible } from "@/utils/revealOnVisible";
import ServicesFlow from "@/components/services/ServicesFlow";

gsap.registerPlugin(ScrollTrigger);

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTExMTEiLz48L3N2Zz4=";

function imgError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.opacity = "0";
}

// Joe (services video batch, 2026-06): the services list "whited out", rows
// illuminating on scroll with a picture per service — NS Selected Works grammar.
const SERVICE_ROWS = [
  {
    slug: "adu",
    image: "/images/generated/services-row-adu-v2.jpg",
    line: "New living space, permitted and built to hold value.",
  },
  {
    slug: "remediation",
    image: "/images/generated/services-row-remediation-v2.jpg",
    line: "Find the cause, open only what matters, rebuild correctly.",
  },
  {
    slug: "consulting",
    image: "/images/generated/services-row-consulting-v2.jpg",
    line: "Decide before you spend. Scope, risk, cost, and next moves.",
  },
];

// Verbatim from Joe's phone notes (docs/828_SERVICES_JOE_FEEDBACK_2026-07-08.md,
// typo cleanups documented there). Words are frozen.
const PRINCIPLES = [
  {
    title: "Refined craftsmanship",
    body: "We deliver finely executed detail through skill and intentional building practices that elevate every finish.",
  },
  {
    title: "Proactive client communication",
    body: "We maintain clear, forward-thinking communication to ensure you are informed and confident at every stage.",
  },
  {
    title: "Structural integrity without compromise",
    body: "We build with uncompromising strength and precision to ensure lasting performance and peace of mind.",
  },
  {
    title: "Client centered experience",
    body: "We shape every project around your vision, delivering a seamless and highly personalized building experience.",
  },
];

// Joe (IMG_1080, 45–56s): the values plate shows "some of the CLOSE-UPS that
// have been shot … by the photographer" — plural. One close-up per principle,
// crossfading as its row ignites (Brian 2026-07-09: "different photos,
// something that looks nice").
const PRINCIPLE_PHOTOS = [
  {
    src: "/images/generated/services-principle-craftsmanship-v2.jpg",
    alt: "Finished shower detail with precise tile, black fixtures, and aligned finish work",
  },
  {
    src: "/images/generated/services-principle-communication-v2.jpg",
    alt: "Contractor and homeowner reviewing plans, material samples, and project details together",
  },
  {
    src: "/images/generated/services-principle-structure-v2.jpg",
    alt: "Residential framing hardware and structural members checked for alignment",
  },
  {
    src: "/images/generated/services-principle-client-v2.jpg",
    alt: "Final walkthrough at a completed residential project with contractor and homeowner",
  },
];

// Verbatim stage titles from Joe's phone notes (1-6 stages).
const STAGES = [
  "Initial Contact / Discovery",
  "Pre-Construction",
  "Proposal & Contract",
  "Construction",
  "Project Completion",
  "Post Construction",
];

// Index walk driver. Desktop (xl+): the index panel is CSS-sticky over a tall
// runway and the active service is a pure function of scroll progress —
// runway/3 of dedicated scroll per service. Deterministic math (no rect
// feedback from the expanding stages), so the walk cannot skip, rush, or
// flicker: bulletproof per Brian 2026-07-09. Below xl there is no pin (mobile
// scroll philosophy) — the active row is the last title past the focus line
// (monotone, reflow-immune), with a top-of-page guard so the list opens on ADU.
function useTravelIndex(
  wrapRef: React.RefObject<HTMLElement | null>,
  rowRefs: React.MutableRefObject<Array<HTMLElement | null>>,
  count: number
) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    const coarseTabletQuery = window.matchMedia(
      "(pointer: coarse) and (max-width: 1366px)"
    );
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (desktopQuery.matches && !coarseTabletQuery.matches) {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const runway = wrap.offsetHeight - window.innerHeight;
        if (runway <= 0) {
          setActive(0);
          return;
        }
        const progress = Math.min(
          0.999,
          Math.max(0, -wrap.getBoundingClientRect().top / runway)
        );
        const next = Math.min(count - 1, Math.floor(progress * count));
        setActive((prev) => (prev === next ? prev : next));
        return;
      }
      if (window.scrollY < 80) {
        setActive(0);
        return;
      }
      const focus = window.innerHeight * 0.38;
      let best = 0;
      rowRefs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= focus) best = i;
      });
      setActive((prev) => (prev === best ? prev : best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", onScroll, { passive: true });
    desktopQuery.addEventListener("change", onScroll);
    coarseTabletQuery.addEventListener("change", onScroll);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => onScroll()).catch(() => {});
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onScroll);
      desktopQuery.removeEventListener("change", onScroll);
      coarseTabletQuery.removeEventListener("change", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [wrapRef, rowRefs, count]);
  return active;
}

function useServicesMotion() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(
    () => () => {
      try {
        ctxRef.current?.revert();
      } catch {}
    },
    []
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const revealCleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const rises = gsap.utils.toArray<HTMLElement>(".svc-rise");
      // Headings drift in position-only (never opacity/visibility-hidden):
      // axe skips hidden headings, which breaks the page's heading order.
      const shifts = gsap.utils.toArray<HTMLElement>(".svc-shift");
      const clips = gsap.utils.toArray<HTMLElement>(".svc-clip");
      const hairlines = gsap.utils.toArray<HTMLElement>(".svc-hairline");
      const seams = gsap.utils.toArray<HTMLElement>(".svc-seam");
      const parallaxImgs = gsap.utils.toArray<HTMLElement>(".svc-parallax");

      // Initial states live HERE, not in JSX (Fix 14).
      gsap.set(rises, { autoAlpha: 0, y: 26 });
      gsap.set(shifts, { y: 30 });
      gsap.set(clips, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(hairlines, { scaleX: 0, transformOrigin: "left" });
      gsap.set(seams, { scaleY: 0, transformOrigin: "top" });

      const { isMobile, prefersReducedMotion } = AnimationController.getConfig();
      const riseDuration = isMobile ? 0.64 : 0.8;
      const lineDuration = isMobile ? 0.72 : 1;

      if (prefersReducedMotion) {
        // Reduced motion ONLY: everything readable immediately, no entrance.
        // (Mobile is handled below — it now earns the same house-grammar
        // entrances desktop has; Brian 2026-07-13: "some sections nothing pops
        // up when you scroll to them." Reduced-motion never hides.)
        gsap.set(rises, { autoAlpha: 1, y: 0 });
        gsap.set(shifts, { y: 0 });
        gsap.set(clips, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(hairlines, { scaleX: 1 });
        gsap.set(seams, { scaleY: 1 });
        return;
      }

      // One-shot entrances key off real visibility (Fix 22) — runs on BOTH
      // desktop AND mobile (transform/opacity only, no scroll-hijack). A
      // fully-clipped element never intersects (Fix 23) — observe parents,
      // reveal children. Decisive `gsap.to` (no scrub) always completes inside
      // sticky-stacked surfaces (Fix 25).
      revealCleanups.push(
        revealOnVisible(rises, (el, _index, immediate) => {
          const stagger = Math.min(
            Number.parseFloat((el as HTMLElement).dataset.stagger ?? "0") || 0,
            isMobile ? 0.16 : 0.22
          );
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: immediate ? 0 : riseDuration,
            delay: immediate ? 0 : stagger,
            ease: "power3.out",
            overwrite: "auto",
          });
        })
      );
      revealCleanups.push(
        revealOnVisible(shifts, (el, _index, immediate) => {
          gsap.to(el, {
            y: 0,
            duration: immediate ? 0 : isMobile ? 0.68 : 0.9,
            ease: "power3.out",
            overwrite: "auto",
          });
        })
      );
      revealCleanups.push(
        revealOnVisible(
          clips.map((el) => el.parentElement ?? el),
          (wrapper, _index, immediate) => {
            const el =
              (wrapper as HTMLElement).querySelector<HTMLElement>(".svc-clip") ??
              (wrapper as HTMLElement);
            gsap.to(el, {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: immediate ? 0 : isMobile ? 0.9 : 1.15,
              ease: "power3.inOut",
              overwrite: "auto",
            });
          }
        )
      );
      revealCleanups.push(
        revealOnVisible(hairlines, (el, _index, immediate) => {
          gsap.to(el, {
            scaleX: 1,
            duration: immediate ? 0 : lineDuration,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        })
      );
      revealCleanups.push(
        revealOnVisible(seams, (el, _index, immediate) => {
          gsap.to(el, {
            scaleY: 1,
            duration: immediate ? 0 : lineDuration,
            delay: immediate ? 0 : isMobile ? 0.08 : 0.2,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        })
      );

      if (isMobile) {
        // Mobile scroll philosophy: entrances only, NO scrubbed parallax
        // (avoids drift/jank on touch). The section walks (index + principles)
        // run from useTravelIndex regardless.
        //
        // Never-missing-text failsafe (Fix 25 standard), mobile-only: the whole
        // page's motion now rides on these IO entrances, so a belt-and-suspenders
        // sweep force-reveals any target on-screen yet still hidden. Desktop
        // already has LenisProvider's global failsafe (Fix 18). Self-clears once
        // nothing is stuck (or after ~12s).
        const revealTargets = [...rises, ...clips, ...hairlines, ...seams];
        let sweeps = 0;
        const failsafe = window.setInterval(() => {
          sweeps += 1;
          let remaining = 0;
          revealTargets.forEach((el) => {
            if (!el.isConnected) return;
            const cs = getComputedStyle(el);
            const hidden =
              parseFloat(cs.opacity) < 0.05 ||
              cs.visibility === "hidden" ||
              (cs.clipPath || "").includes("100%");
            if (!hidden) return;
            const r = el.getBoundingClientRect();
            const onScreen = r.top < window.innerHeight * 0.8 && r.bottom > 0;
            if (onScreen) {
              gsap.set(el, {
                autoAlpha: 1,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                clipPath: "inset(0% 0% 0% 0%)",
                overwrite: true,
              });
            } else {
              remaining += 1;
            }
          });
          if (remaining === 0 || sweeps > 12) window.clearInterval(failsafe);
        }, 1000);
        revealCleanups.push(() => window.clearInterval(failsafe));
        return;
      }

      // Sustained scrubs (Fix 15) — initial states stay readable (Fix 22).
      // Photographs breathe: parallax drift + a scale settle (1.07 → 1.0)
      // across their whole viewport transit.
      parallaxImgs.forEach((el) => {
        gsap.set(el, { scale: 1.07, transformOrigin: "center center" });
        gsap.to(el, {
          yPercent: -8,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.6,
          },
        });
      });

      // Stage band is STATIC (Brian 2026-07-13: the sliding strip hid steps —
      // "I want to see all the steps, maybe no animation"). All six stages lay
      // out in one composed band; no scrub, no travel.
    }, root);

    ctxRef.current = ctx;
    return () => {
      revealCleanups.forEach((dispose) => dispose());
      ctxRef.current = null;
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  return rootRef;
}

// ── Section 1 — the services index (page signature: illuminating rows with a
// traveling picture). Joe (IMG_1075) via Brian: rows run across the screen
// "long ways" — no side plate. ONE picture at a time lives under/overlapping
// the active word and swaps as you scroll. Desktop pins the panel over a tall
// runway so every service gets a deliberate stretch of scroll (bulletproof —
// cannot be rushed past); mobile walks in natural flow. Whole row is the link.
function ServicesIndex() {
  const wrapRef = useRef<HTMLElement | null>(null);
  const rowRefs = useRef<Array<HTMLElement | null>>([]);
  const focusIdx = useTravelIndex(wrapRef, rowRefs, SERVICE_ROWS.length);
  // Ink and picture BOTH follow scroll — never hover. A hover override kept
  // whichever row the idle cursor sat on bolded while the pinned panel walked
  // to the next service underneath it (Brian's 2026-07-12 screenshots: "ADU
  // still bolded showing a remediation photo"). Hover keeps only the arrow
  // affordance, via CSS group-hover.
  const activeIdx = focusIdx;

  return (
    <section
      ref={wrapRef}
      data-section="services-index"
      data-header-light=""
      className="motion-runway relative bg-[#f7f7f3] text-[#141414] lg:h-[calc(100svh+210vh)]"
      style={{ overflowX: "clip" }}
    >
      <div className="lg:sticky lg:top-0 lg:h-svh lg:overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-20 lg:px-12 lg:pb-0 lg:pt-[6.75rem]">
          <div className="flex items-center justify-between gap-6 border-b border-black/12 pb-6 lg:pb-7">
            <h1 className="font-labels text-[10px] uppercase tracking-[0.24em] text-black/65">
              Services / CA License #{SITE.license}
            </h1>
            <span className="hidden font-labels text-[9px] uppercase tracking-[0.2em] text-black/56 sm:inline">
              Select a service
            </span>
          </div>

          {/* Full-width list: dim rows illuminate; the photograph stage travels */}
          <div className="svc-shift">
            {SERVICE_ROWS.map((row, i) => {
              const service = SERVICES.find((s) => s.slug === row.slug)!;
              const open = activeIdx === i;
              return (
                <Link
                  key={row.slug}
                  href={`/services/${row.slug}`}
                  className="group block border-b border-black/12"
                >
                  <div
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    className="relative z-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 lg:py-3"
                  >
                    <span
                      className={`svc-row-title font-display font-normal leading-[1.02] tracking-tight transition-colors duration-300 text-[clamp(2.3rem,4.9vw,4.4rem)] ${
                        open ? "text-[#141414]" : "text-black/[0.46]"
                      }`}
                    >
                      {service.title}
                    </span>
                    <span
                      className={`svc-row-tag font-labels text-[9px] uppercase tracking-[0.16em] transition-colors duration-300 ${
                        open ? "text-black/75" : "text-black/60"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")} / {service.short}
                      <span
                        className={`ml-3 inline-block transition-[color,transform] duration-300 group-hover:translate-x-0 group-hover:text-[var(--color-accent)] ${
                          open
                            ? "translate-x-0 text-[var(--color-accent)]"
                            : "-translate-x-1"
                        }`}
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </span>
                  </div>

                  {/* Desktop keeps the traveling picture handoff. Touch layouts
                      reserve stable image space so scroll-triggered row changes
                      cannot move surrounding content. */}
                  <div
                    className={`svc-row-stage grid max-xl:grid-rows-[1fr] ${
                      open
                        ? "xl:grid-rows-[1fr]"
                        : "xl:grid-rows-[0fr]"
                    }`}
                    style={{
                      transition:
                        "grid-template-rows 360ms cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="relative -mt-2 mb-6 h-[42svh] overflow-hidden lg:mb-4 lg:h-[calc(100svh-36.25rem)] lg:min-h-[12rem]">
                        <Image
                          src={row.image}
                          alt={`${service.title} by 828 Construction`}
                          fill
                          loading={i === 0 ? "eager" : "lazy"}
                          fetchPriority={i === 0 ? "high" : "auto"}
                          sizes="(max-width: 1536px) 100vw, 1280px"
                          quality={92}
                          placeholder="blur"
                          blurDataURL={BLUR_PLACEHOLDER}
                          onError={imgError}
                          className="object-cover transition-transform duration-[1600ms] ease-out"
                          style={{
                            filter: "contrast(1.05) saturate(1.05)",
                            transform: open ? "scale(1.03)" : "scale(1.08)",
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-black/62 to-transparent px-5 pb-5 pt-16 lg:px-7 lg:pb-8">
                          <p className="max-w-md text-[13px] leading-5 text-white/85">
                            {row.line}
                          </p>
                          <span className="hidden shrink-0 font-labels text-[9px] uppercase tracking-[0.2em] text-white/85 sm:inline">
                            View {service.title} →
                          </span>
                        </div>
                        <div
                          className="absolute left-0 top-0 h-[2px] bg-[var(--color-accent)]"
                          style={{
                            width: open ? "100%" : "0%",
                            opacity: 0.8,
                            transition:
                              "width 900ms cubic-bezier(0.16,1,0.3,1) 150ms",
                          }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 2 — vision statement + full-bleed photograph ────────────────────
function VisionStatement() {
  return (
    <section
      data-section="services-vision"
      data-header-dark=""
      className="relative min-h-svh bg-black text-white"
      style={{ overflowX: "clip" }}
    >
      {/* Same 0.9fr/1.1fr split as the values section below — the center seam
          must land on the identical X so the line reads continuous while the
          surfaces stack (Brian 2026-07-10: "perfect line down the middle"). */}
      <div className="grid min-h-svh grid-cols-1 grid-rows-[auto_minmax(52svh,1fr)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-1">
        <div
          className="relative flex items-center px-6 py-24 lg:pr-16"
          style={{ paddingLeft: undefined }}
        >
          <div className="w-full lg:pl-[max(3rem,calc((100vw-96rem)/2+3rem))]">
            <span className="svc-rise block font-labels text-[10px] uppercase tracking-[0.24em] text-white/60">
              The 828 standard
            </span>
            <h2 className="svc-shift mt-5 max-w-xl font-display font-light leading-[1.14] text-[clamp(1.7rem,3vw,3.1rem)]">
              Where your vision meets uncompromising quality.
            </h2>
            <div
              className="svc-hairline mt-8 h-px w-24 bg-[var(--color-accent)]"
              style={{ opacity: 0.6 }}
              aria-hidden="true"
            />
          </div>
          {/* Seam between copy and photograph */}
          <div
            className="svc-seam absolute bottom-10 right-0 top-10 hidden w-px bg-white/12 lg:block"
            aria-hidden="true"
          />
        </div>
        {/* TODO(client): swap for the real "homeowner looking back at the finished
            property" photo when photography lands — Joe's preferred subject. */}
        <div
          className="svc-clip relative min-h-[52svh] overflow-hidden lg:h-svh lg:min-h-0"
          data-gsap-reveal="true"
        >
          <div className="svc-parallax absolute inset-x-0" style={{ top: "-7.5%", height: "115%" }}>
            <Image
              src="/images/generated/services-vision-homeowner-adu-v2.jpg"
              alt="Homeowner admiring a completed ADU-style residential project"
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 60vw"
              quality={92}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              onError={imgError}
              className="object-cover"
              style={{ filter: "contrast(1.05) saturate(1.08)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 3 — "Ever present" values: photo left, ink panel right ──────────
// Literal to the split-screen Joe pointed at (NS "Build with purpose"):
// photograph one side, dark panel with numbered principles the other,
// numbers/titles one side of the panel, phrases the opposite side.
// Desktop pins the split over a 240vh runway — each principle owns ~60vh of
// dedicated scroll, same bulletproof mechanic as the index (Brian 2026-07-12:
// the free-flowing rows blew through 01→04 in one gesture and the settle
// glide finished the job). Inside a pinned runway the junction settle stays
// quiet by design. Mobile keeps the natural in-flow walk.
function PrinciplesSection() {
  const wrapRef = useRef<HTMLElement | null>(null);
  const rowRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIdx = useTravelIndex(wrapRef, rowRefs, PRINCIPLES.length);

  return (
    <section
      ref={wrapRef}
      data-section="services-principles"
      data-flow-rail-pause=""
      data-header-dark=""
      className="motion-runway relative bg-[#0a0a0a] text-white max-xl:flex max-xl:min-h-svh max-xl:flex-col max-xl:justify-center lg:h-[calc(100svh+240vh)]"
      style={{ overflowX: "clip" }}
    >
      <div className="lg:sticky lg:top-0 lg:h-svh lg:overflow-hidden">
      <div className="grid grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Close-up plate — photographer close-ups, per Joe: one per principle.
            All four stack as persistent opacity layers and crossfade as their
            row ignites — decoded up front so a swap never flashes the blur
            placeholder (keyed remount did), and only the active photo is opaque
            at rest (never two photos mid-blend once settled). */}
        <div className="svc-clip relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-auto lg:min-h-full" data-gsap-reveal="true">
          <div className="svc-parallax absolute inset-x-0" style={{ top: "-7.5%", height: "115%" }}>
            {PRINCIPLE_PHOTOS.map((photo, i) => (
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 46vw"
                quality={92}
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                onError={imgError}
                aria-hidden={activeIdx !== i}
                className="object-cover transition-opacity duration-[550ms] ease-out"
                style={{
                  filter: "contrast(1.05) saturate(1.05)",
                  opacity: activeIdx === i ? 1 : 0,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 hidden items-end justify-between bg-gradient-to-t from-black/55 to-transparent px-6 pb-5 pt-14 lg:flex">
            <p className="font-labels text-[9px] uppercase tracking-[0.22em] text-white/75">
              Detail work / South Bay
            </p>
            <p className="font-numbers text-xs text-white/70" aria-hidden="true">
              {String(activeIdx + 1).padStart(2, "0")} / 04
            </p>
          </div>
        </div>

        {/* Ink panel — vertically centered inside the pinned viewport */}
        <div className="px-6 py-16 lg:flex lg:h-full lg:flex-col lg:justify-center lg:px-16 lg:py-0 xl:px-20">
          <span className="svc-rise block font-labels text-[10px] uppercase tracking-[0.24em] text-white/60">
            Through all projects
          </span>
          <h2 className="svc-shift mt-5 font-display font-light leading-[1.1] text-[clamp(1.8rem,3vw,3rem)]">
            Ever present
          </h2>

          <div className="relative mt-10">
            {/* Reading-progress seam: grows down the panel as rows ignite */}
            <div className="absolute -left-5 top-0 hidden h-full w-px bg-white/10 lg:block xl:-left-8" aria-hidden="true" />
            <div
              className="absolute -left-5 top-0 hidden w-px bg-[var(--color-accent)] lg:block xl:-left-8"
              style={{
                height: `${((activeIdx + 1) / PRINCIPLES.length) * 100}%`,
                opacity: 0.85,
                transition: "height 650ms cubic-bezier(0.16,1,0.3,1)",
              }}
              aria-hidden="true"
            />
            {PRINCIPLES.map((p, i) => {
              const active = activeIdx === i;
              return (
                <div
                  key={p.title}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  className="grid grid-cols-1 gap-2 border-t border-white/[0.08] py-6 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] sm:gap-8 lg:py-7"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`font-numbers text-[19px] font-bold leading-6 transition-colors duration-500 ${
                        active ? "text-white/90" : "text-white/55"
                      }`}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className={`font-display text-[17px] leading-6 transition-colors duration-500 lg:text-lg ${
                        active ? "text-white" : "text-white/60"
                      }`}
                    >
                      {p.title}
                    </h3>
                  </div>
                  <p
                    className={`text-sm leading-6 transition-colors duration-500 ${
                      active ? "text-white/75" : "text-white/55"
                    }`}
                  >
                    {p.body}
                  </p>
                </div>
              );
            })}
            <div className="h-px w-full bg-white/[0.08]" aria-hidden="true" />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

// ── Section 4 — foundational principles + the stage strip + media band ──────
// Mimics the NS Process composition Joe showed: light surface, heading split,
// a slim hairline strip of the six stages, then the media band. On desktop the
// photograph absorbs the remaining viewport so the close stays immersive;
// touch layouts keep the same content in natural document flow.
function ProcessSection() {
  return (
    <section
      data-section="services-process"
      data-flow-rail-pause=""
      data-header-light=""
      className="relative flex flex-col bg-[#f7f7f3] text-[#141414] xl:h-svh"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-auto w-full max-w-7xl px-6 pt-24 lg:px-12 lg:pt-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <span className="svc-rise block font-labels text-[10px] uppercase tracking-[0.24em] text-black/65">
              Our process
            </span>
          </div>
          <p className="svc-rise max-w-3xl font-display font-light leading-[1.35] text-[clamp(1.2rem,1.9vw,1.7rem)] text-black/85 lg:col-span-8">
            Guided by our foundational principles, we consistently uphold the
            highest standards in every project, ensuring flawless execution and
            meticulous attention to detail at every stage.
          </p>
        </div>
      </div>

      {/* Slim stage strip — hairline / one line of stages / hairline. No block
          of dead space beneath (Brian 2026-07-13). */}
      <div className="relative mt-12 lg:mt-8">
        <div className="svc-hairline absolute left-0 top-0 h-px w-full bg-black/15" aria-hidden="true" />
        <ol className="grid grid-cols-2 gap-x-4 gap-y-6 px-6 py-6 lg:grid-cols-3 lg:gap-y-6 lg:px-12 lg:py-5 xl:flex xl:items-baseline xl:justify-between xl:gap-0">
          {STAGES.map((stage, i) => (
            <li
              key={stage}
              className="svc-rise lg:flex lg:items-baseline lg:gap-2.5 lg:whitespace-nowrap"
              data-stagger={String(Math.min(i * 0.055, 0.22))}
            >
              <span className="font-numbers text-[11px] text-[var(--color-accent)]" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 font-labels text-[10px] uppercase leading-5 tracking-[0.15em] text-black/80 lg:mt-0 lg:text-[11px] lg:tracking-[0.16em] xl:text-[10px] 2xl:text-[11px]">
                {stage}
              </p>
            </li>
          ))}
        </ol>
        <div className="absolute bottom-0 left-0 h-px w-full bg-black/15" aria-hidden="true" />
      </div>

      {/* Full-bleed media band with the start CTA. */}
      <div className="svc-clip relative h-[62vh] overflow-hidden lg:h-auto lg:min-h-[18rem] lg:flex-1" data-gsap-reveal="true" data-header-dark="">
        <div className="svc-parallax absolute inset-x-0" style={{ top: "-7.5%", height: "115%" }}>
          <Image
            src="/images/generated/services-process-vision-build-v3.webp"
            alt="Clean residential construction framing progressing toward a finished vision"
            fill
            loading="lazy"
            sizes="100vw"
            quality={92}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            onError={imgError}
            className="object-cover"
            style={{ filter: "contrast(1.05) saturate(1.05)" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-10 lg:px-12 lg:pb-14">
          <div className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="svc-rise font-display font-light leading-[1.2] text-white text-[clamp(1.5rem,2.5vw,2.4rem)]" data-stagger="0.08">
                Committed to bringing your vision to life.
              </p>
              <div
                className="svc-hairline mt-5 h-px w-20 bg-[var(--color-accent)]"
                style={{ opacity: 0.7 }}
                aria-hidden="true"
              />
            </div>
            <div className="svc-rise flex flex-wrap gap-4" data-stagger="0.16">
              <Link
                href="/contact"
                className="btn-shine btn-lift bg-white px-8 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-[var(--color-accent)] hover:text-white"
              >
                Phase One
              </Link>
              <a
                href={SITE.phoneHref}
                className="border border-white/35 bg-black/20 px-8 py-4 font-labels font-numbers text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors hover:border-white"
              >
                Call {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ServicesContent() {
  const rootRef = useServicesMotion();

  return (
    <div ref={rootRef} className="bg-black">
      <ServicesFlow>
        <ServicesIndex />
        <VisionStatement />
        <PrinciplesSection />
        <ProcessSection />
      </ServicesFlow>
    </div>
  );
}
