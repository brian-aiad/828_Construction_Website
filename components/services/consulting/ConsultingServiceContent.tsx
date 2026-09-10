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
import { SITE } from "@/lib/constants";
import { AnimationController } from "@/utils/animationControl";
import { revealOnVisible } from "@/utils/revealOnVisible";
import ConsultingFlow from "@/components/services/consulting/ConsultingFlow";

gsap.registerPlugin(ScrollTrigger);

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTExMTEiLz48L3N2Zz4=";

function imgError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.opacity = "0";
}

// Verbatim from Joe's consulting video batch
// (docs/828_CONSULTING_JOE_FEEDBACK_2026-07-09.md, cleanups documented there).
// Words are frozen.
const HERO_H1 = "Building solutions beyond the blueprint.";
const HERO_PARAGRAPH =
  "Elevating the construction experience through guidance, helping homeowners make strategic decisions that preserve their time, budget and peace of mind.";

const SOLUTIONS_HEADLINE = "Delivering considerate solutions.";
const SOLUTIONS_BODY =
  "Understanding your project budget timeline, goals, and design vision, what challenges you are currently facing through careful evaluation and clear communication. We deliver responsible tailored solutions that align with your project's unique needs.";

// Joe's phone notes: "What included changes → Benefits", 01–05.
const BENEFITS = [
  "Early detection of issues",
  "Creative problem solved",
  "Expert insight for preventative care",
  "Design & structure enhancement / assessments",
  "Peace of mind",
];

const BENEFIT_PHOTOS = [
  {
    src: "/images/projects/consulting-inspection.jpg",
    alt: "Opened residential wall inspected with moisture meter and consulting tools",
    label: "Early detection",
  },
  {
    src: "/images/generated/services-consulting-table-v2.webp",
    alt: "Construction plans and material samples arranged for consulting problem solving",
    label: "Creative solution",
  },
  {
    src: "/images/services/consulting-detail.jpg",
    alt: "Window flashing and exterior detail reviewed with preventative care tools",
    label: "Preventative care",
  },
  {
    src: "/images/projects/consulting-blueprints.jpg",
    alt: "Framed residential opening assessed with plans, level, and construction tools",
    label: "Structure assessment",
  },
  {
    src: "/images/generated/consulting-hero-advisory-table-v3.webp",
    alt: "Organized consulting table with plans and material samples in a finished home",
    label: "Peace of mind",
  },
] as const;

const FAQ_INTRO =
  "As a general contractor offering consulting and home inspection servicing, we provide the peace of mind by uncovering hidden issues, ensuring structural integrity, and delivering tailored solutions that align with your vision.";

// Questions posed TO the visitor — always visible, no accordions.
// (Page signature: large-format self-selection prompts.)
const QUESTIONS = [
  "What challenge or uncertainties are you currently experiencing with your home project that require expert guidance?",
  "What outcomes or improvements are you seeking through professional construction, consulting, and inspection services?",
  "How important is clarity, accuracy, and expert oversight in achieving your project's success and long-term value?",
];

const CTA_HEADLINE = "Engineered solutions tailored to your project";

const FAQ_PHOTOS = [
  {
    src: "/images/generated/consulting-question-inspection-v3.webp",
    alt: "Construction consultant inspecting an opened residential wall condition",
  },
  {
    src: "/images/generated/consulting-question-plans-budget-v3.webp",
    alt: "Construction plans, budget documents, and material samples reviewed during consulting",
  },
];

// Live-rect focus selection (sticky-proof — PATTERNS.md Fix 22 timing rule).
// `coverSelector` names the next stacked surface: this ledger lives in a pinned
// stacked surface, so once it pins the rows FREEZE and the focus line can never
// reach the last row before the covering surface rides over it (measured: the
// last benefit sits ~0.67vh and only the focus band ~0.55vh ever selects, so
// "Peace of mind" would never ignite). When the covering surface has risen into
// its final approach on the last row, we light that row in its brief visible
// window — every benefit ignites in view (Fix 22 / Fix 25 class, cover-driven).
function useFocusIndex(
  refs: React.MutableRefObject<Array<HTMLElement | null>>,
  focusRatio = 0.55,
  coverSelector?: string
) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const vh = window.innerHeight;
      const focus = vh * focusRatio;
      const count = refs.current.filter(Boolean).length;
      const lastIdx = count - 1;
      const firstEl = refs.current.find(Boolean) ?? null;
      const section = firstEl?.closest<HTMLElement>("[data-section]") ?? null;
      const cover = coverSelector
        ? document.querySelector<HTMLElement>(coverSelector)
        : null;
      const secRect = section ? section.getBoundingClientRect() : null;
      const secH = secRect ? secRect.height : Infinity;
      const coverTop = cover ? cover.getBoundingClientRect().top : Infinity;

      let best = 0;

      // Pinned-and-covered phase (short stacked surface, desktop): once the
      // section stops at the top and the covering surface begins riding up from
      // the bottom, the row rects FREEZE — the focus line can no longer sweep
      // them (PATTERNS.md Fix 27, the short-section trap). Drive the active row
      // off the cover's rise progress instead, so the highlight + maroon rail
      // travel continuously across ALL rows (no dead frame, no 0→last jump) and
      // reverse cleanly as the cover recedes.
      //
      // Detect the phase by the cover's OVERLAP with the short section box
      // (coverTop <= secH), not a secTop threshold — the latter jitters ±px
      // around the pin boundary and flips the branch back to focus-band, which
      // resets active to 0 mid-sweep. Overlap is monotonic in scroll, so the
      // cascade never reverses spuriously.
      // These stacked surfaces are sticky-positioned on EVERY device
      // (ConsultingFlow.applyStackTops runs regardless of shouldAnimate), so a
      // short section pins at top:0 and a tall one pins with its bottom at the
      // viewport bottom. In both cases the covering surface (questions) then
      // rides up from the bottom and the row rects FREEZE — a focus-band sweep
      // can no longer reach the lower rows before they are covered (Fix 27).
      // The cover first touches the pinned section at coverTop ≈ min(secH, vh).
      const coverStart = Math.min(secH, vh);
      if (section && cover && coverTop <= coverStart) {
        // Complete the whole 0→last cascade within the window where the LAST
        // row is still uncovered (cover edge above its top), so every row
        // ignites while fully visible. Anchor progress to coverStart (prog 0 →
        // row 0 the instant the cover touches) and reach the last row's top at
        // prog 1. Fully monotonic — no dead frame, no 0→last jump, reverses
        // cleanly as the cover recedes.
        const lastEl = refs.current[lastIdx];
        const lastTop = lastEl ? lastEl.getBoundingClientRect().top : coverStart * 0.8;
        const span = Math.max(1, coverStart - lastTop);
        const prog = Math.min(1, Math.max(0, (coverStart - coverTop) / span));
        best = Math.min(lastIdx, Math.floor(prog * count));
      } else if (section && cover) {
        // Approach, before the cover overlaps: hold row 0 so the whole ignition
        // is ONE clean sweep during the pinned cover phase (letting a focus-band
        // sweep run here would light 0→n as the section rises, then the pin
        // phase would re-sweep from 0 — a visible double cascade).
        best = 0;
      } else {
        // Approach / non-pinned (mobile scrolls this section normally): the row
        // that owns the focus band, else the nearest by center.
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
      }
      setActive((prev) => (prev === best ? prev : best));
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
  }, [refs, focusRatio, coverSelector]);
  return active;
}

function useConsultingMotion() {
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
      const rises = gsap.utils.toArray<HTMLElement>(".con-rise");
      const clips = gsap.utils.toArray<HTMLElement>(".con-clip");
      const hairlines = gsap.utils.toArray<HTMLElement>(".con-hairline");
      const parallaxImgs = gsap.utils.toArray<HTMLElement>(".con-parallax");

      const { enabled, isMobile, prefersReducedMotion } =
        AnimationController.getConfig();

      // Reduced motion: reveal everything immediately, hide nothing (mandate).
      if (prefersReducedMotion) {
        gsap.set(rises, { opacity: 1, y: 0 });
        gsap.set(clips, { clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(hairlines, { scaleX: 1 });
        return;
      }

      // Initial states live HERE, not in JSX (Fix 14). Rises use opacity, NOT
      // autoAlpha — visibility:hidden pulls headings out of the a11y tree.
      // These apply on mobile AND desktop: the entrances below are
      // IntersectionObserver-driven (native-scroll, no scroll hijack), so mobile
      // gets the same quiet rise/clip/hairline reveals the desktop does — the
      // whole page no longer pops in statically below 1024px (V4 direction #7).
      gsap.set(rises, { opacity: 0, y: 26 });
      gsap.set(clips, { clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(hairlines, { scaleX: 0, transformOrigin: "left" });

      // One-shot entrances key off real visibility (Fix 22/23) — decisive,
      // failsafe-tagged (data-gsap-reveal on clip wrappers), mobile-safe.
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
      // Fully-clipped nodes never intersect (Fix 23) — observe the parent.
      revealCleanups.push(
        revealOnVisible(
          clips.map((el) => el.parentElement ?? el),
          (wrapper) => {
            const el =
              (wrapper as HTMLElement).querySelector<HTMLElement>(".con-clip") ??
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

      // Sustained parallax scrub (Fix 15) — DESKTOP ONLY. Scroll-linked motion
      // stays off touch to avoid scroll-coupled jank; the photo rests static and
      // fully visible on mobile (no hidden initial state on the parallax layer).
      if (enabled) {
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

// ── Section 1 — hero: beyond the blueprint ───────────────────────────────────
function ConsultingHero() {
  return (
    <section
      data-section="consulting-hero"
      data-header-light=""
      className="relative bg-[#f7f7f3] text-[#141414]"
      style={{ overflowX: "clip" }}
    >
      <style>{`
        @keyframes conMobileHeroIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1279px) {
          .con-mobile-hero {
            animation: conMobileHeroIn 0.72s cubic-bezier(0.16,1,0.3,1) both;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .con-mobile-hero { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
      <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)]">
        <div className="relative flex flex-col justify-center px-6 pb-14 pt-28 sm:px-10 lg:pl-[max(3rem,calc((100vw-96rem)/2+3rem))] lg:pr-14 lg:py-28">
          <Link
            href="/services"
            className="block py-4 -my-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black/65 transition-colors hover:text-black"
          >
            <span className="inline-block">Back to services</span>
          </Link>
          <span
            className="con-mobile-hero mt-9 block font-labels text-[10px] uppercase tracking-[0.24em] text-black/65"
            style={{ animationDelay: "0.08s" }}
          >
            Construction Consulting / CA License #{SITE.license}
          </span>
          {/* LCP anchor: renders on first paint, no hidden initial state */}
          <h1
            className="con-mobile-hero mt-8 max-w-[13ch] font-display font-bold leading-[1.04] tracking-tight text-[clamp(2.2rem,4.5vw,4.6rem)]"
            style={{ animationDelay: "0.16s" }}
          >
            {HERO_H1}
          </h1>
          <div
            className="con-hairline mt-8 h-px w-24 bg-[var(--color-accent)]"
            style={{ opacity: 0.65 }}
            aria-hidden="true"
          />
          <p
            className="con-mobile-hero mt-7 max-w-lg text-[15px] leading-8 text-black/70 sm:text-base"
            style={{ animationDelay: "0.24s" }}
          >
            {HERO_PARAGRAPH}
          </p>
          <div
            className="con-mobile-hero mt-10 flex flex-wrap gap-4"
            style={{ animationDelay: "0.32s" }}
          >
            <a
              href={SITE.phoneHref}
              className="btn-shine btn-lift bg-black px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-accent)]"
            >
              Call {SITE.phone}
            </a>
            <Link
              href="/contact"
              className="border border-black/20 px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:border-black"
            >
              Request consulting
            </Link>
          </div>
        </div>

        {/* Photograph flush to the right edge, riding under the header */}
        <div className="relative min-h-[48svh] overflow-hidden lg:min-h-svh">
          <div className="con-parallax absolute inset-x-0" style={{ top: "-7.5%", height: "115%" }}>
            <Image
              src="/images/generated/consulting-hero-advisory-table-v3.webp"
              alt="Consulting session over construction plans and material samples"
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 52vw"
              quality={92}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              onError={imgError}
              className="object-cover"
              style={{ filter: "contrast(1.04) saturate(1.04)" }}
            />
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-black/10"
            aria-hidden="true"
          />
          <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8">
            <span className="font-labels text-[9px] uppercase tracking-[0.2em] text-white/85">
              Expert advisory / South Bay
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 2 — considerate solutions + the benefits ledger ─────────────────
function SolutionsSection() {
  const rowRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIdx = useFocusIndex(
    rowRefs,
    0.55,
    '[data-section="consulting-questions"]'
  );
  const activePhoto = BENEFIT_PHOTOS[activeIdx] ?? BENEFIT_PHOTOS[0];

  return (
    <section
      data-section="consulting-solutions"
      data-header-dark=""
      className="relative flex min-h-svh flex-col justify-center bg-black text-white"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 pb-20 pt-28 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-20 lg:px-12 lg:py-28">
        <div>
          <span className="con-rise block font-labels text-[10px] uppercase tracking-[0.24em] text-white/60">
            Field-based advisory
          </span>
          <h2
            className="con-rise mt-5 max-w-md font-display font-light leading-[1.1] text-[clamp(1.8rem,3.2vw,3.4rem)]"
            data-stagger="0.08"
          >
            {SOLUTIONS_HEADLINE}
          </h2>
          <div
            className="con-hairline mt-9 h-px w-24 bg-[var(--color-accent)]"
            style={{ opacity: 0.7 }}
            aria-hidden="true"
          />
          <p
            className="con-rise mt-8 max-w-md text-[15px] leading-8 text-white/62"
            data-stagger="0.14"
          >
            {SOLUTIONS_BODY}
          </p>
          <div
            className="con-rise mt-10 hidden overflow-hidden border border-white/10 bg-white/[0.03] lg:block"
            data-stagger="0.2"
          >
            <div className="relative h-[19rem]">
              {BENEFIT_PHOTOS.map((photo, i) => {
                const active = activeIdx === i;
                return (
                  <div
                    key={photo.src}
                    aria-hidden={!active}
                    className="absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ opacity: active ? 1 : 0 }}
                  >
                    <Image
                      src={photo.src}
                      alt={active ? photo.alt : ""}
                      fill
                      loading="lazy"
                      sizes="(max-width: 1024px) 0px, 36vw"
                      quality={92}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      onError={imgError}
                      className="object-cover"
                      style={{ filter: "contrast(1.05) saturate(1.04)" }}
                    />
                  </div>
                );
              })}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
              <span className="absolute bottom-5 left-5 font-labels text-[9px] uppercase tracking-[0.2em] text-white/72">
                {activePhoto.label}
              </span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:hidden">
            {BENEFIT_PHOTOS.map((photo) => (
              <div
                key={photo.src}
                className="con-rise relative min-h-[9.5rem] overflow-hidden bg-white/[0.04]"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  loading="lazy"
                  sizes="50vw"
                  quality={88}
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  onError={imgError}
                  className="object-cover"
                  style={{ filter: "contrast(1.05) saturate(1.04)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 font-labels text-[8px] uppercase tracking-[0.18em] text-white/72">
                  {photo.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits ledger — rows ignite in the focus band, maroon rail tracks */}
        <div className="relative lg:pt-2">
          <span className="con-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-white/58">
            Benefits
          </span>
          <div className="relative mt-6">
            <div
              className="absolute -left-5 top-0 hidden h-full w-px bg-white/10 lg:block xl:-left-8"
              aria-hidden="true"
            />
            <div
              className="absolute -left-5 top-0 hidden w-px bg-[var(--color-accent)] lg:block xl:-left-8"
              style={{
                height: `${((activeIdx + 1) / BENEFITS.length) * 100}%`,
                opacity: 0.85,
                transition: "height 650ms cubic-bezier(0.16,1,0.3,1)",
              }}
              aria-hidden="true"
            />
            {BENEFITS.map((benefit, i) => {
              const active = activeIdx === i;
              return (
                <div key={benefit} className="relative">
                  <div
                    className="con-hairline h-px w-full bg-white/10"
                    data-stagger={String(i * 0.08)}
                    aria-hidden="true"
                  />
                  <div
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    className="con-rise grid grid-cols-[auto_1fr] items-baseline gap-5 py-6 sm:gap-8 lg:py-7"
                    data-stagger={String(0.05 + i * 0.08)}
                  >
                    <span
                      className={`font-numbers text-[15px] font-bold transition-colors duration-500 ${
                        active ? "text-[var(--color-accent-light)]" : "text-white/55"
                      }`}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className={`font-display leading-snug transition-colors duration-500 text-[clamp(1.15rem,1.9vw,1.7rem)] ${
                        active ? "text-white" : "text-white/55"
                      }`}
                    >
                      {benefit}
                    </h3>
                  </div>
                </div>
              );
            })}
            <div className="con-hairline h-px w-full bg-white/10" data-stagger="0.45" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 3 — questions and answers (card grid, ADU/Remediation grammar) ──
// Page signature: the questions are posed TO the visitor and stay permanently
// visible — no accordions. Self-selection prompts in large format.
function QuestionCard({
  question,
  index,
  dark,
  stagger,
  className = "",
}: {
  question: string;
  index: number;
  dark: boolean;
  stagger: number;
  className?: string;
}) {
  return (
    <article
      data-stagger={stagger}
      className={`con-rise flex min-h-[15rem] flex-col justify-between border p-6 sm:p-7 lg:min-h-[19rem] ${
        dark ? "border-transparent bg-[#111] text-white" : "border-black/12 bg-white text-[#111]"
      } ${className}`}
    >
      <span
        className={`font-numbers text-xs font-bold ${
          dark ? "text-white/72" : "text-[var(--color-accent)]"
        }`}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="mt-5 font-display font-normal leading-snug text-[clamp(1.15rem,1.7vw,1.5rem)]">
        {question}
      </h3>
      <div className="mt-6">
        <span
          className={`font-labels text-[9px] uppercase tracking-[0.2em] ${
            dark ? "text-white/60" : "text-black/55"
          }`}
        >
          Worth a conversation
        </span>
      </div>
    </article>
  );
}

function QuestionsSection() {
  return (
    <section
      data-section="consulting-questions"
      data-header-light=""
      className="relative flex min-h-svh flex-col justify-center bg-[#f7f7f3] text-[#111]"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-28 lg:px-12 lg:py-28">
        <span className="con-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-black/55">
          Questions and answers
        </span>
        <h2
          className="con-rise mt-5 max-w-4xl font-display font-light leading-[1.2] text-[clamp(1.5rem,2.6vw,2.7rem)]"
          data-stagger="0.08"
        >
          {FAQ_INTRO}
        </h2>
        <div
          className="con-hairline mt-8 h-px w-24 bg-[var(--color-accent)]"
          style={{ opacity: 0.6 }}
          aria-hidden="true"
        />
        {/* Checkerboard: question cards interleaved with photo cells */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          <QuestionCard question={QUESTIONS[0]} index={0} dark stagger={0} className="lg:col-span-2" />
          <div className="relative hidden min-h-[15rem] overflow-hidden sm:block lg:min-h-[19rem]">
            <div className="con-clip absolute inset-0" data-gsap-reveal="true" data-stagger="0.1">
              <Image
                src={FAQ_PHOTOS[0].src}
                alt={FAQ_PHOTOS[0].alt}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                quality={92}
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                onError={imgError}
                className="object-cover"
                style={{ filter: "contrast(1.05) saturate(1.05)" }}
              />
            </div>
          </div>
          <QuestionCard question={QUESTIONS[1]} index={1} dark={false} stagger={0.16} />
          <div className="relative hidden min-h-[15rem] overflow-hidden sm:block lg:min-h-[19rem]">
            <div className="con-clip absolute inset-0" data-gsap-reveal="true" data-stagger="0.22">
              <Image
                src={FAQ_PHOTOS[1].src}
                alt={FAQ_PHOTOS[1].alt}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                quality={92}
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                onError={imgError}
                className="object-cover"
                style={{ filter: "contrast(1.05) saturate(1.05)" }}
              />
            </div>
          </div>
          <QuestionCard
            question={QUESTIONS[2]}
            index={2}
            dark
            stagger={0.3}
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>
      </div>
    </section>
  );
}

// ── Section 4 — engineered solutions (clean statement band, no ornaments) ───
function ConsultingCta() {
  return (
    <section
      data-section="consulting-cta"
      data-header-dark=""
      className="relative flex min-h-svh flex-col justify-center bg-black text-white"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-auto w-full max-w-[96rem] px-6 pb-24 pt-28 lg:px-12 lg:pb-32 lg:pt-28">
        <span className="con-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-white/58">
          Start the conversation
        </span>
        <h2
          className="con-rise mt-6 max-w-5xl font-display text-[1.9rem] font-light leading-[1.08] sm:text-[2.6rem] lg:text-[3.6rem] 2xl:text-[4.75rem]"
          data-stagger="0.08"
        >
          {CTA_HEADLINE}
        </h2>
        <div
          className="con-hairline mt-10 h-px w-28 bg-[var(--color-accent)] 2xl:mt-12 2xl:w-36"
          style={{ opacity: 0.75 }}
          aria-hidden="true"
        />
        <div className="con-rise mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 2xl:mt-11 2xl:gap-x-10" data-stagger="0.16">
          <a
            href={SITE.phoneHref}
            className="group -my-2.5 inline-flex items-baseline gap-3 py-2.5 font-display text-lg text-white/85 transition-colors hover:text-white lg:text-xl 2xl:text-2xl"
          >
            Call {SITE.phone}
            <span
              className="inline-block transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </a>
          <Link
            href="/contact"
            className="inline-block py-4 -my-4 font-labels text-[10px] uppercase tracking-[0.18em] text-white/65 underline decoration-white/25 underline-offset-8 transition-colors hover:text-white hover:decoration-[var(--color-accent)]"
          >
            Request consulting
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ConsultingServiceContent() {
  const rootRef = useConsultingMotion();

  return (
    <div ref={rootRef} className="bg-black">
      <ConsultingFlow>
        <ConsultingHero />
        <SolutionsSection />
        <QuestionsSection />
        <ConsultingCta />
      </ConsultingFlow>
    </div>
  );
}
