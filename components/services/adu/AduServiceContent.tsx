"use client";

import {
  type SyntheticEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { SITE } from "@/lib/constants";
import { AnimationController } from "@/utils/animationControl";
import { revealOnVisible } from "@/utils/revealOnVisible";
import AduFlow from "@/components/services/adu/AduFlow";

gsap.registerPlugin(ScrollTrigger);

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTExMTEiLz48L3N2Zz4=";

function imgError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.opacity = "0";
}

// Verbatim from Joe's ADU video batch (docs/828_ADU_JOE_FEEDBACK_2026-07-08.md,
// typo cleanups documented there). Words are frozen.
const HERO_PHRASE = "Built with intent";
const HERO_PARAGRAPH =
  "Whether looking to refine a private retreat, ideal for house guests, accommodating family, or simply expanding the living space while elevating the property's value overall — 828 Construction builds with the same seriousness as a primary home.";

// Answers mirror the FAQ JSON-LD in app/services/adu/page.tsx exactly.
const FAQS = [
  {
    q: "How much does an ADU cost in Torrance?",
    a: "ADU construction costs in Torrance typically range from $150,000 to $350,000 depending on size, design, and finishes. 828 Construction provides detailed estimates after a free consultation.",
  },
  {
    q: "Do I need a permit for an ADU in Torrance?",
    a: "Yes, all ADU construction in Torrance requires building permits. 828 Construction manages the permitting process and ensures full compliance with Torrance zoning regulations.",
  },
  {
    q: "How long does it take to build an ADU?",
    a: "A typical ADU takes 6–12 months from initial consultation to completion, including design, permitting, and construction.",
  },
  {
    q: "What types of ADUs can be built on my property?",
    a: "Depending on your lot and zoning, you may qualify for a detached ADU, an attached ADU, a garage conversion, or a Junior ADU (JADU).",
  },
];

// NS Perspectives grammar (Joe's on-screen reference): question cards
// interleaved with photo cells in a checkerboard.
const FAQ_PHOTOS = [
  {
    src: "/images/generated/adu-faq-interior-v3.webp",
    alt: "Finished compact ADU interior with warm kitchen and living area",
  },
  {
    src: "/images/generated/adu-faq-garage-conversion-v3.webp",
    alt: "Garage conversion ADU by 828 Construction",
  },
];

// Verbatim from Joe's phone notes ("ADU means to 828").
const ACRONYM = [
  {
    letter: "A",
    word: "Aligned",
    body: "With the client's vision, ensuring every detail reflects their lifestyle and goals.",
  },
  {
    letter: "D",
    word: "Dedicated",
    body: "Unwavering commitment to exceptional quality, precision, and craftsmanship at every stage.",
  },
  {
    letter: "U",
    word: "Understanding",
    body: "The renovation process is both a structural transformation and a personal journey — guiding clients through with clarity, care, and a steady expertise to make the process feel seamless and supportive.",
  },
];

// Verbatim from Joe's phone notes ("An invitation to work together").
const QUALIFIERS = [
  "Seeking a collaboration with a bespoke builder?",
  "Is uncompromising quality non-negotiable for your project?",
  "Prepared to invest time and resources required to realize your vision?",
  "Do you value clear communication and a highly considerate building experience?",
];

// House-grammar headline reveal: each word rises + fades on its own, driven by
// the existing `.adu-rise` IntersectionObserver pipeline (Fix 22 decisive — no
// scroll math, immune to sticky-stack offset drift). Words are atomic
// inline-block units separated by real breakable spaces, so the line still
// wraps only at word boundaries (Fix 21) and reads verbatim to a screen reader.
// Reduced-motion leaves every word visible (useAduMotion's shouldAnimate gate).
function RevealWords({
  text,
  base = 0,
  step = 0.06,
}: {
  text: string;
  base?: number;
  step?: number;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.flatMap((word, i) => {
        const span = (
          <span
            key={i}
            className="adu-rise inline-block"
            data-stagger={(base + i * step).toFixed(2)}
          >
            {word}
          </span>
        );
        return i < words.length - 1 ? [span, " "] : [span];
      })}
    </>
  );
}

// Live-rect acronym ignition (sticky-proof — PATTERNS.md Fix 22 timing rule).
// Returns a `primary` index (drives the sticky photo crossfade + caption) and
// an `active` mask (drives per-row maroon ignition).
//
// The stacked surface PINS and every row freezes in place while the next
// surface wipes up over them BOTTOM-FIRST, so the last row (U) is covered
// before a moving focus line could ever select it — a single focus line can't
// walk frozen rows, and U never ignites in view (measured:
// .claude-work/research/adu-final/rows-geom.mjs). Both faces of the fix:
//
//   • `active` (per-row maroon ignition): each row LATCHES lit once its center
//     rises into the lower reading band (< 0.85·vh), which EVERY row crosses
//     while still uncovered — so every A/D/U ignites in view before the cover
//     reaches it, on desktop AND mobile.
//   • `primary` (desktop sticky-photo crossfade + caption): still the live
//     focus-band index, so the keyed photograph travels A→D→U with the scroll.
//     Mobile has no sticky photo, so `primary` is just the last latched row.
function useAcronymActive(
  refs: React.MutableRefObject<Array<HTMLElement | null>>,
  focusRatio = 0.52,
  band = 0.85
) {
  const [state, setState] = useState<{ primary: number; active: boolean[] }>({
    primary: 0,
    active: [true, false, false],
  });
  useEffect(() => {
    let raf = 0;
    const latched = refs.current.map(() => false);
    const sameMask = (a: boolean[], b: boolean[]) =>
      a.length === b.length && a.every((v, i) => v === b[i]);
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const desktop = window.innerWidth >= 1024;

      // Ignition mask — latch rows as they enter the reading band (both VPs).
      const bandPx = vh * band;
      refs.current.forEach((el, i) => {
        if (!el || latched[i]) return;
        const r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top + r.height / 2 < bandPx) latched[i] = true;
      });
      const active = latched.slice();

      // Primary — desktop: live focus-band index (drives the traveling photo);
      // mobile: last latched row (no photo, keeps caption in step).
      let primary: number;
      if (desktop) {
        const focus = vh * focusRatio;
        let best = 0;
        let bestDist = Infinity;
        let contained = false;
        refs.current.forEach((el, i) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (!contained && r.top <= focus && r.bottom >= focus) {
            best = i;
            contained = true;
            return;
          }
          if (contained) return;
          const dist = Math.abs(r.top + r.height / 2 - focus);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        primary = best;
      } else {
        primary = active.lastIndexOf(true);
        if (primary < 0) primary = 0;
      }

      setState((prev) =>
        prev.primary === primary && sameMask(prev.active, active)
          ? prev
          : { primary, active }
      );
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [refs, focusRatio, band]);
  return state;
}

// Home-page word-fill grammar (HomeVisionSequence brand statement): SplitType
// words ink from a readable partial opacity to full on scrub. Four-guard
// cleanup per PATTERNS.md Fix 1; initial opacity is WCAG-floor-safe so the
// load state passes axe (the 0.28 home value fails contrast on small text).
function useWordFill(
  ref: React.RefObject<HTMLElement | null>,
  fromOpacity: number
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let split: SplitType | null = null;
    let mounted = true;
    const frame = requestAnimationFrame(() => {
      if (!mounted || !el.isConnected) return;
      if (!AnimationController.shouldAnimate()) return;
      split = new SplitType(el, { types: "words" });
      gsap.fromTo(
        split.words ?? [],
        { opacity: fromOpacity },
        {
          opacity: 1,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            end: "top 52%",
            scrub: 0.9,
          },
        }
      );
    });
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
      if (split && el.isConnected) {
        try {
          split.revert();
        } catch {}
      }
      split = null;
    };
  }, [ref, fromOpacity]);
}

function useAduMotion() {
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
      const rises = gsap.utils.toArray<HTMLElement>(".adu-rise");
      const clips = gsap.utils.toArray<HTMLElement>(".adu-clip");
      const hairlines = gsap.utils.toArray<HTMLElement>(".adu-hairline");
      const vlines = gsap.utils.toArray<HTMLElement>(".adu-vline");
      const parallaxImgs = gsap.utils.toArray<HTMLElement>(".adu-parallax");
      const watermark = root.querySelector<HTMLElement>(".adu-watermark");

      // Initial states live HERE, not in JSX (Fix 14). Rises use opacity, NOT
      // autoAlpha — visibility:hidden pulls h2s out of the accessibility tree
      // and axe then reports h1→h3 as a heading-order violation.
      gsap.set(rises, { opacity: 0, y: 26 });
      gsap.set(clips, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(hairlines, { scaleX: 0, transformOrigin: "left" });
      gsap.set(vlines, { scaleY: 0, transformOrigin: "top" });

      const { enabled, isMobile, prefersReducedMotion } =
        AnimationController.getConfig();

      if (prefersReducedMotion) {
        gsap.set(rises, { opacity: 1, y: 0 });
        gsap.set(clips, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(hairlines, { scaleX: 1 });
        gsap.set(vlines, { scaleY: 1 });
        return;
      }

      // One-shot entrances key off real visibility (Fix 22), never scroll
      // math. data-stagger delays cascade siblings that enter together.
      revealCleanups.push(
        revealOnVisible(rises, (el) => {
          const stagger = parseFloat((el as HTMLElement).dataset.stagger ?? "0");
          const delay = isMobile ? Math.min(stagger * 0.55, 0.18) : stagger;
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.66 : 0.85,
            delay,
            ease: "power3.out",
            overwrite: "auto",
          });
        })
      );
      // Fully-clipped nodes have an empty intersection rect (Fix 23) — observe
      // the unclipped parent, reveal the child.
      revealCleanups.push(
        revealOnVisible(
          clips.map((el) => el.parentElement ?? el),
          (wrapper) => {
            const el =
              (wrapper as HTMLElement).querySelector<HTMLElement>(".adu-clip") ??
              (wrapper as HTMLElement);
            const stagger = parseFloat(el.dataset.stagger ?? "0");
            const delay = isMobile ? Math.min(stagger * 0.55, 0.16) : stagger;
            gsap.to(el, {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: isMobile ? 0.78 : 1.1,
              delay,
              ease: "power3.inOut",
              overwrite: "auto",
            });
          }
        )
      );
      revealCleanups.push(
        revealOnVisible(hairlines, (el) => {
          const stagger = parseFloat((el as HTMLElement).dataset.stagger ?? "0");
          const delay = isMobile ? Math.min(stagger * 0.5, 0.16) : stagger;
          gsap.to(el, {
            scaleX: 1,
            duration: isMobile ? 0.7 : 0.9,
            delay,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        })
      );
      revealCleanups.push(
        revealOnVisible(
          vlines.map((el) => el.parentElement ?? el),
          (wrapper) => {
            const el =
              (wrapper as HTMLElement).querySelector<HTMLElement>(".adu-vline") ??
              (wrapper as HTMLElement);
            gsap.to(el, {
              scaleY: 1,
              duration: isMobile ? 0.78 : 1.2,
              ease: "power2.inOut",
              overwrite: "auto",
            });
          }
        )
      );

      if (!enabled) return;

      // Sustained scrubs (Fix 15) — initial states stay readable (Fix 22).
      parallaxImgs.forEach((el) => {
        gsap.to(el, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.6,
          },
        });
      });

      // Page signature: the ADU watermark drifts as the acronym is read.
      if (watermark) {
        gsap.to(watermark, {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: watermark.parentElement ?? watermark,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.8,
          },
        });
      }
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

// ── Section 1 — hero: "Built with intent" running downwards ─────────────────
function AduHero() {
  return (
    <section
      data-section="adu-hero"
      data-header-dark=""
      data-header-transparent=""
      className="relative bg-black text-white"
      style={{ overflowX: "clip" }}
    >
      {/* CSS keyframe entry (LCP-safe): letters cascade down the plumb line. */}
      <style>{`
        @keyframes aduLetterIn {
          from { opacity: 0; transform: translateY(-0.35em); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aduCueDrop {
          0%   { transform: scaleY(0); transform-origin: top; }
          45%  { transform: scaleY(1); transform-origin: top; }
          55%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        /* Above-the-fold entrance (CSS keyframe = LCP-safe, always ends
           visible), same measured-safe pattern as the letter cascade. */
        @keyframes aduFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .adu-letter { animation: none !important; opacity: 1 !important; transform: none !important; }
          .adu-cue-line { animation: none !important; }
          .adu-fade { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
      <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)]">
        <div className="relative order-2 min-h-[46svh] overflow-hidden lg:order-1 lg:min-h-svh">
          <div className="adu-parallax absolute inset-x-0" style={{ top: "-7.5%", height: "115%" }}>
            <Image
              src="/images/generated/adu-hero-exterior-v4.webp"
              alt="Completed detached South Bay ADU with warm wood, black-framed doors, and drought-tolerant landscaping"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 55vw"
              quality={92}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              onError={imgError}
              className="object-cover"
              style={{ filter: "contrast(1.04) saturate(1.05)" }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-r lg:from-transparent lg:to-black/60" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" aria-hidden="true" />
          <div className="absolute bottom-7 left-7 hidden lg:block">
            <span className="font-labels text-[9px] uppercase tracking-[0.2em] text-white/78">
              Detached ADU / South Bay scale
            </span>
          </div>
        </div>

        <div className="relative order-1 flex flex-col justify-center px-6 pb-14 pt-28 sm:px-10 lg:order-2 lg:px-14 lg:py-28">
          <Link
            href="/services"
            className="adu-fade inline-flex w-fit min-h-11 items-center font-labels text-[10px] uppercase tracking-[0.18em] text-white/65 transition-colors hover:text-white lg:min-h-0"
            style={{ animation: "aduFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}
          >
            Back to services
          </Link>
          <span
            className="adu-fade mt-4 block font-labels text-[10px] uppercase tracking-[0.24em] text-white/48 lg:mt-9"
            style={{ animation: "aduFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}
          >
            ADU Construction / CA License #{SITE.license}
          </span>

          <div className="mt-9 flex flex-col items-stretch gap-6 sm:flex-row sm:gap-8">
            {/* Joe: "the phrase built with intent, but running downwards" */}
            <h1
              aria-label={HERO_PHRASE}
              className="font-display text-[2.75rem] font-bold leading-[0.95] tracking-tight sm:text-[clamp(2.6rem,4.5vw,4.4rem)] sm:leading-none sm:[writing-mode:vertical-rl]"
            >
              <span className="sm:hidden" aria-hidden="true">{HERO_PHRASE}</span>
              <span className="hidden sm:contents" aria-hidden="true">
                {HERO_PHRASE.split("").map((ch, i) => (
                  <span
                    key={i}
                    className="adu-letter inline-block"
                    style={{
                      animation: `aduLetterIn 0.6s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.045}s both`,
                    }}
                  >
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </span>
            </h1>
            <div className="relative h-px w-full shrink-0 self-stretch bg-white/12 sm:h-auto sm:w-[2px]" aria-hidden="true">
              <div className="adu-vline absolute inset-0 bg-[var(--color-accent-light)]" style={{ opacity: 0.9 }} />
            </div>
            <p
              className="adu-fade max-w-md self-start text-[15px] leading-8 text-white/62 sm:self-center sm:text-base"
              style={{ animation: "aduFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s both" }}
            >
              {HERO_PARAGRAPH}
            </p>
          </div>

          <div
            className="adu-fade mt-11 flex flex-wrap items-center gap-4"
            style={{ animation: "aduFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.72s both" }}
          >
            <a
              href={SITE.phoneHref}
              className="btn-shine btn-lift bg-white px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-[var(--color-accent)] hover:text-white"
            >
              Call {SITE.phone}
            </a>
            <Link
              href="/contact"
              className="border border-white/22 px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
            >
              Start ADU
            </Link>
            <div className="ml-auto hidden items-center gap-3 lg:flex" aria-hidden="true">
              <span className="font-labels text-[9px] uppercase tracking-[0.24em] text-white/60">
                Scroll
              </span>
              <span className="relative block h-10 w-px overflow-hidden bg-white/15">
                <span
                  data-ambient-motion=""
                  className="adu-cue-line absolute inset-0 bg-white/70"
                  style={{ animation: "aduCueDrop 2.2s cubic-bezier(0.65,0,0.35,1) 1.4s infinite" }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 2 — FAQ checkerboard (NS Perspectives grammar) ──────────────────
function FaqCard({
  faq,
  index,
  dark,
  stagger,
  className = "",
}: {
  faq: (typeof FAQS)[number];
  index: number;
  dark: boolean;
  stagger: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const panelId = `${baseId}-panel`;
  return (
    <article
      data-stagger={stagger}
      className={`adu-rise flex min-h-[11rem] flex-col justify-between border p-6 sm:min-h-[16rem] sm:p-7 lg:min-h-[19rem] ${
        dark ? "border-transparent bg-[#111] text-white" : "border-black/12 bg-white text-[#111]"
      } ${className}`}
    >
      <div>
        <span
          className={`font-numbers text-xs font-bold ${
            dark ? "text-white/72" : "text-[var(--color-accent)]"
          }`}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 id={headingId} className="mt-4 font-display text-lg leading-snug sm:text-xl">{faq.q}</h3>
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          aria-hidden={!open}
          inert={!open}
          className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <p className={`pt-4 text-sm leading-7 ${dark ? "text-white/62" : "text-black/60"}`}>
              {faq.a}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Close answer" : "Answer"}: ${faq.q}`}
          className={`group/faq flex min-h-11 items-center gap-2 font-labels text-[10px] uppercase tracking-[0.18em] transition-colors ${
            dark ? "text-white/65 hover:text-white" : "text-black/55 hover:text-black"
          }`}
        >
          {open ? "Close" : "Answer"}
          <span
            aria-hidden="true"
            className={`inline-flex h-6 w-6 items-center justify-center border text-sm transition-transform duration-300 ${
              dark ? "border-white/25" : "border-black/20"
            }`}
            style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            +
          </span>
        </button>
      </div>
    </article>
  );
}

function AduFaq() {
  const statementRef = useRef<HTMLHeadingElement>(null);
  // Large text on #f7f7f3 — 0.45 black keeps the load state ≥3:1 (axe floor).
  useWordFill(statementRef, 0.45);

  return (
    <section
      data-section="adu-faq"
      data-header-light=""
      className="relative flex min-h-svh flex-col justify-center bg-[#f7f7f3] text-[#111]"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 lg:px-12 lg:pb-24 lg:pt-[7.5rem]">
        <span className="adu-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-black/55">
          FAQ / Frequently asked questions
        </span>
        {/* Home word-fill grammar: the dictated statement inks in as you scroll */}
        <h2
          ref={statementRef}
          className="mt-5 max-w-4xl font-display font-light leading-[1.14] text-[clamp(1.8rem,3.2vw,3.4rem)]"
        >
          Whether your vision is fully defined or still evolving, 828
          Construction is here to help.
        </h2>
        <div
          className="adu-hairline mt-8 h-px w-24 bg-[var(--color-accent)]"
          style={{ opacity: 0.6 }}
          aria-hidden="true"
        />
        {/* NS Perspectives rhythm, organized: tall photograph one side, the
            "smaller little sections" in a tidy checkerboard beside it.
            Photo slots are swap-ready for the new client images. */}
        <div className="mt-12 grid grid-cols-1 gap-4 lg:mt-14 lg:grid-cols-12">
          <div className="order-2 grid grid-cols-1 gap-4 lg:order-1 lg:col-span-5">
            {FAQ_PHOTOS.map((photo, i) => (
              <div
                key={photo.src}
                className="relative min-h-[15rem] overflow-hidden lg:min-h-[19rem]"
              >
                <div
                  className="adu-clip absolute inset-0"
                  data-gsap-reveal="true"
                  data-stagger={String(i * 0.1)}
                >
                  <div
                    className="adu-parallax absolute inset-x-0"
                    style={{ top: "-6%", height: "112%" }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      quality={92}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      onError={imgError}
                      className="object-cover"
                      style={{ filter: "contrast(1.05) saturate(1.05)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="order-1 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:order-2 lg:col-span-7">
            <FaqCard faq={FAQS[0]} index={0} dark stagger={0} />
            <FaqCard faq={FAQS[1]} index={1} dark={false} stagger={0.08} />
            <FaqCard faq={FAQS[2]} index={2} dark={false} stagger={0.16} />
            <FaqCard faq={FAQS[3]} index={3} dark stagger={0.24} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 3 — what ADU means to 828 (acronym values + watermark drift) ────
const ACRONYM_PHOTOS = [
  {
    src: "/images/generated/adu-acronym-aligned-v3.webp",
    alt: "Contractor and homeowner reviewing a completed ADU exterior together",
  },
  {
    src: "/images/generated/adu-acronym-dedicated-v3.webp",
    alt: "ADU interior finish detail checked carefully with a level",
  },
  {
    src: "/images/generated/adu-acronym-understanding-v3.webp",
    alt: "Contractor guiding a homeowner through organized ADU framing in progress",
  },
];

function AcronymRow({
  item,
  index,
  active,
  setRowRef,
}: {
  item: (typeof ACRONYM)[number];
  index: number;
  active: boolean;
  setRowRef: (index: number, el: HTMLElement | null) => void;
}) {
  const bodyRef = useRef<HTMLParagraphElement>(null);
  // Small text on black — 0.55 white keeps the load state ≥4.5:1 (axe floor).
  useWordFill(bodyRef, 0.55);

  return (
    <div className="relative">
      <div
        className="adu-hairline h-px w-full bg-white/12"
        data-stagger={String(index * 0.12)}
        aria-hidden="true"
      />
      <div
        ref={(el) => {
          setRowRef(index, el);
        }}
        className="adu-rise py-5 lg:py-6"
        data-stagger={String(index * 0.1)}
      >
        <div className="flex items-baseline gap-4 sm:gap-5">
          <span
            className={`w-[0.75em] font-display font-bold leading-none tracking-tight transition-colors duration-500 text-[clamp(2.4rem,3.8vw,3.4rem)] ${
              active ? "text-[var(--color-accent-light)]" : "text-white/[0.22]"
            }`}
            aria-hidden="true"
          >
            {item.letter}
          </span>
          <h3
            className={`font-display leading-none transition-colors duration-500 text-[clamp(1.2rem,1.7vw,1.6rem)] ${
              active ? "text-white" : "text-white/55"
            }`}
          >
            {item.word}
          </h3>
          <span
            className={`mb-1 ml-auto hidden h-px w-10 self-center transition-colors duration-500 sm:block ${
              active ? "bg-[var(--color-accent)]" : "bg-white/15"
            }`}
            aria-hidden="true"
          />
        </div>
        {/* Home word-fill grammar: the definition inks in as you scroll */}
        <p
          ref={bodyRef}
          className="mt-3 max-w-xl text-sm leading-6 text-white/90 sm:ml-[3.4rem] lg:text-[15px] lg:leading-7"
        >
          {item.body}
        </p>
      </div>
    </div>
  );
}

function AduAcronym() {
  const rowRefs = useRef<Array<HTMLElement | null>>([]);
  const { primary: activeIdx, active: activeMask } = useAcronymActive(rowRefs, 0.52);
  const setRowRef = (index: number, el: HTMLElement | null) => {
    rowRefs.current[index] = el;
  };

  return (
    <section
      data-section="adu-acronym"
      data-header-dark=""
      className="relative flex min-h-svh flex-col justify-center bg-black text-white"
      style={{ overflowX: "clip" }}
    >
      {/* Page signature (PATTERNS.md): giant ADU watermark, whisper-quiet, drifting */}
      <div
        className="adu-watermark pointer-events-none absolute -left-6 top-1/2 select-none font-display font-bold leading-none tracking-tight text-white lg:left-6"
        style={{ fontSize: "clamp(9rem,17vw,14rem)", opacity: 0.04 }}
        aria-hidden="true"
      >
        ADU
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-14 pt-24 lg:px-12 lg:pb-16 lg:pt-[7.5rem]">
        <span className="adu-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-white/58">
          What we drive for
        </span>
        <h2 className="mt-5 font-display font-light leading-[1.08] text-[clamp(1.8rem,3.2vw,3.4rem)]">
          <RevealWords text="What ADU means to 828." base={0.05} step={0.06} />
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            {ACRONYM.map((item, i) => (
              <AcronymRow
                key={item.letter}
                item={item}
                index={i}
                active={activeMask[i] ?? false}
                setRowRef={setRowRef}
              />
            ))}
            <div className="adu-hairline h-px w-full bg-white/12" data-stagger="0.36" aria-hidden="true" />
          </div>

          {/* The picture keyed to the igniting letter — sticky, crossfading.
              Slots are swap-ready for the new client images. */}
          {/* Panel height mirrors the compact rows column exactly (absolute
              fill) — the section now rests inside a single viewport. */}
          <div className="relative hidden lg:col-span-5 lg:block" aria-hidden="true">
            <div className="absolute inset-0">
              <div className="adu-clip relative h-full min-h-[20rem] overflow-hidden" data-gsap-reveal="true">
                {ACRONYM_PHOTOS.map((photo, i) => (
                  <div
                    key={photo.src}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: activeIdx === i ? 1 : 0 }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 0px, 40vw"
                      quality={92}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      onError={imgError}
                      className="object-cover"
                      style={{ filter: "contrast(1.05) saturate(1.05)" }}
                    />
                  </div>
                ))}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-14">
                  <p className="font-labels text-[9px] uppercase tracking-[0.2em] text-white/85">
                    {ACRONYM[activeIdx].letter} / {ACRONYM[activeIdx].word}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 4 — an invitation to work together ──────────────────────────────
function AduInvitation() {
  return (
    <section
      data-section="adu-invitation"
      data-stack-compact=""
      data-header-dark=""
      className="relative flex flex-col border-t border-white/10 bg-[#0a0a0a] text-white"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 lg:px-12 lg:pb-28 lg:pt-[7.5rem]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-20">
          <div>
            <span className="adu-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-white/58">
              Start here
            </span>
            <h2 className="mt-5 font-display font-light leading-[1.1] text-[clamp(1.8rem,3.2vw,3.4rem)]">
              <RevealWords text="An invitation to work together" base={0.05} step={0.06} />
            </h2>
            <p className="adu-rise mt-7 max-w-md text-sm leading-7 text-white/55" data-stagger="0.16">
              If this resonates with your expectations, we welcome the
              opportunity to explore your project.
            </p>
            <div
              className="adu-hairline mt-10 h-px w-24 bg-[var(--color-accent)]"
              style={{ opacity: 0.7 }}
              aria-hidden="true"
            />
            <p className="adu-rise mt-8 font-display text-lg leading-snug text-white/88 lg:text-xl" data-stagger="0.2">
              Prepared to proceed with your vision?
            </p>
            <div className="adu-rise mt-7 flex flex-wrap gap-4" data-stagger="0.26">
              <a
                href={SITE.phoneHref}
                className="btn-shine btn-lift bg-white px-8 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-[var(--color-accent)] hover:text-white"
              >
                Call {SITE.phone}
              </a>
              <Link
                href="/contact"
                className="border border-white/22 px-8 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
              >
                Talk through an ADU
              </Link>
            </div>
          </div>

          {/* Joe: the qualifying questions "in a finer print … finely written, nothing crazy" */}
          <div className="lg:pt-2">
            {QUALIFIERS.map((q, i) => (
              <div key={q} className="relative">
                <div
                  className="adu-hairline h-px w-full bg-white/10"
                  data-stagger={String(i * 0.1)}
                  aria-hidden="true"
                />
                <div
                  className="adu-rise grid grid-cols-[auto_1fr] items-baseline gap-5 py-6 sm:gap-7 lg:py-7"
                  data-stagger={String(0.06 + i * 0.1)}
                >
                  <span className="font-numbers text-xs font-bold text-white/72" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-7 text-white/65 lg:text-[15px]">{q}</p>
                </div>
              </div>
            ))}
            <div className="adu-hairline h-px w-full bg-white/10" data-stagger="0.46" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AduServiceContent() {
  const rootRef = useAduMotion();

  return (
    <div ref={rootRef} className="bg-black text-white">
      <AduFlow>
        <AduHero />
        <AduFaq />
        <AduAcronym />
        <AduInvitation />
      </AduFlow>
    </div>
  );
}
