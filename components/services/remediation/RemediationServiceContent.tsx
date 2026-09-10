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
import { SITE } from "@/lib/constants";
import { AnimationController } from "@/utils/animationControl";
import { revealOnVisible } from "@/utils/revealOnVisible";
import RemediationFlow from "@/components/services/remediation/RemediationFlow";

gsap.registerPlugin(ScrollTrigger);

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMxMTExMTEiLz48L3N2Zz4=";

function imgError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.opacity = "0";
}

// Verbatim from Joe's remediation video batch
// (docs/828_REMEDIATION_JOE_FEEDBACK_2026-07-08.md, typo cleanups documented
// there). Words are frozen.
const HERO_PARAGRAPH =
  "Above all else, your peace of mind is paramount. We understand the disruption and urgency that follows damage — from restoring environmental integrity to complete reconstruction. 828 Construction delivers a seamless, disciplined process from remediation through completion.";

const FAQ_INTRO =
  "Mold remediation is necessary when moisture intrusion happens to a structure — whether from a leaky roof, cracked pipes, or old windows. Beyond visible damage, the hidden dangers in mold spores in between materials and long-term exposure may contribute to respiratory issues, allergies, and other health concerns.";

// Answers mirror the FAQ JSON-LD in app/services/remediation/page.tsx exactly.
const FAQS = [
  {
    q: "What causes mold growth?",
    a: "Mold needs moisture, oxygen, and organic materials to grow. Common causes: poor ventilation, high humidity, and water intrusion or leaks.",
  },
  {
    q: "What is mold remediation?",
    a: "It is a process of identifying, containing, removing, and preventing mold growth. It includes cleanup, air filtration, and addressing the moisture source.",
  },
  {
    q: "Can mold affect my health?",
    a: "Yes — exposure may cause coughing, sneezing, headaches, skin irritation, asthma flare-ups, and fatigue, especially in sensitive individuals.",
  },
];

// Verbatim from Joe's phone notes ("Section 3 process — Remediation: The
// approach / Build philosophy").
const FAQ_PHOTOS = [
  {
    src: "/images/generated/remediation-faq-cause-moisture-v3.webp",
    alt: "Moisture intrusion inspection at an opened residential wall section",
  },
  {
    src: "/images/generated/remediation-faq-containment-v3.webp",
    alt: "Clean remediation containment setup with air filtration equipment",
  },
  {
    src: "/images/generated/remediation-faq-air-quality-v3.webp",
    alt: "Air quality and moisture control equipment in a clean residential remediation area",
  },
] as const;

const APPROACH = [
  ["01", "Initial call"],
  ["02", "Visual inspection / Testing"],
  ["03", "Remediation / Scope of work"],
  ["04", "Build back / Reconstruction"],
] as const;

const APPROACH_PHOTOS = [
  {
    src: "/images/generated/remediation-step-initial-call-v3.webp",
    alt: "Initial remediation call setup with project notes, plans, and phone",
    label: "Initial call",
  },
  {
    src: "/images/generated/remediation-step-visual-testing-v3.webp",
    alt: "Moisture testing at an opened residential wall during remediation inspection",
    label: "Visual inspection / Testing",
  },
  {
    src: "/images/generated/remediation-step-scope-work-v3.webp",
    alt: "Remediation scope of work documents, floor plans, and marked project photos",
    label: "Remediation / Scope of work",
  },
  {
    src: "/images/generated/remediation-step-reconstruction-v3.webp",
    alt: "Clean residential rebuild with new drywall after remediation",
    label: "Build back / Reconstruction",
  },
] as const;

// Verbatim from Joe's phone notes (Section 4, start pointer "The company
// integrated…" → end pointer "…exceeds industry standards").
const METHOD_LEAD =
  "828's integrated remediation and restoration approach ensures a seamless transition, allowing clients to swiftly reclaim their space and return to daily life with minimal disruptions.";
const METHOD_BODY = [
  "With decades of expertise, 828 brings a refined understanding of mold and its underlying causes — beyond visible factors such as water intrusion and construction defects — employing a comprehensive diagnostic approach to concealed conditions.",
  "This informs an advanced remediation methodology that exceeds industry standards.",
];

// Joe's Section 5 note: "Picture of the flair E8 and 277 MR" — real photos
// pending; plates hold the layout (page signature, PATTERNS.md).
const EQUIPMENT = [
  {
    model: "Flair E8",
    role: "Air filtration",
    src: "/images/generated/remediation-equipment-air-filtration-v3.webp",
    alt: "Portable air filtration equipment in a clean remediation workspace",
  },
  {
    model: "277 MR",
    role: "Moisture control",
    src: "/images/generated/remediation-equipment-moisture-control-v3.webp",
    alt: "Professional moisture control equipment in a contained remediation workspace",
  },
];

// Step-walk driver (services-page "bulletproof index walk" grammar, Brian
// 2026-07-13): desktop (xl+) pins the approach panel over a tall runway and
// the active step is a pure function of scroll progress — runway/4 of
// dedicated scroll per step. The section ARRIVES FIRST (progress 0 until its
// top reaches the viewport top), then the walk plays; no rect feedback, no
// focus-ratio tuning, cannot skip or ignite mid-arrival. Below xl there is no
// pin (mobile scroll philosophy) — monotone last-row-past-focus walk with an
// arrival guard.
function useStepWalk(
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
      const wrap = wrapRef.current;
      if (!wrap) return;
      if (desktopQuery.matches && !coarseTabletQuery.matches) {
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
      if (wrap.getBoundingClientRect().top > window.innerHeight * 0.6) {
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
    desktopQuery.addEventListener("change", onScroll);
    coarseTabletQuery.addEventListener("change", onScroll);
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => onScroll()).catch(() => {});
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      desktopQuery.removeEventListener("change", onScroll);
      coarseTabletQuery.removeEventListener("change", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [wrapRef, rowRefs, count]);
  return active;
}

function useRemediationMotion() {
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
      const rises = gsap.utils.toArray<HTMLElement>(".rem-rise");
      const clips = gsap.utils.toArray<HTMLElement>(".rem-clip");
      const hairlines = gsap.utils.toArray<HTMLElement>(".rem-hairline");
      const cards = gsap.utils.toArray<HTMLElement>(".rem-card");
      const mphotos = gsap.utils.toArray<HTMLElement>(".rem-mphoto");
      const parallaxImgs = gsap.utils.toArray<HTMLElement>(".rem-parallax");
      const parallaxSoft = gsap.utils.toArray<HTMLElement>(".rem-parallax-soft");
      const heroMedia = root.querySelector<HTMLElement>(".rem-hero-media");
      const heroLines = gsap.utils.toArray<HTMLElement>(".rem-hero-line");
      const seam = root.querySelector<HTMLElement>(".rem-seam");
      const plateL = root.querySelector<HTMLElement>(".rem-plate-left");
      const plateR = root.querySelector<HTMLElement>(".rem-plate-right");

      const { isMobile, prefersReducedMotion } = AnimationController.getConfig();

      // Initial states live HERE, not in JSX (Fix 14). Rises use opacity, NOT
      // autoAlpha: visibility:hidden drops below-fold headings out of the
      // accessibility tree and breaks axe heading-order (h1 → h3).
      gsap.set(rises, { opacity: 0, y: 26 });
      // Photos settle in (opacity+scale) — ANY clip direction shows a
      // stray sliver when a sweep frame catches the first tween moments.
      gsap.set(clips, { opacity: 0, scale: 1.04, transformOrigin: "center" });
      gsap.set(mphotos, { opacity: 0, y: 30, scale: 1.03, transformOrigin: "center" });
      gsap.set(hairlines, { scaleX: 0, transformOrigin: "left" });
      gsap.set(cards, { y: 34, opacity: 0 });
      // Plates slide from the outer edges on desktop; on mobile they rise
      // (an x-slide on two side-by-side narrow plates shifts within the
      // clipped section and reads as a wobble, so keep mobile transform on Y).
      if (plateL) gsap.set(plateL, isMobile ? { y: 30, opacity: 0 } : { x: -44, opacity: 0 });
      if (plateR) gsap.set(plateR, isMobile ? { y: 30, opacity: 0 } : { x: 44, opacity: 0 });
      if (seam) gsap.set(seam, { scaleY: 0, transformOrigin: "top" });

      // Reduced motion is the ONLY branch that never hides — everything paints
      // in its final state, no reveals. Mobile (below) still reveals on scroll
      // so the page doesn't read as a wall of static text (Brian 2026-07-13:
      // "nothing pops up when you scroll to them").
      if (prefersReducedMotion) {
        gsap.set(rises, { opacity: 1, y: 0 });
        gsap.set(clips, { opacity: 1, scale: 1 });
        gsap.set(mphotos, { opacity: 1, y: 0, scale: 1 });
        gsap.set(hairlines, { scaleX: 1 });
        gsap.set(cards, { y: 0, opacity: 1 });
        if (plateL) gsap.set(plateL, { x: 0, y: 0, opacity: 1 });
        if (plateR) gsap.set(plateR, { x: 0, y: 0, opacity: 1 });
        if (seam) gsap.set(seam, { scaleY: 1 });
        return;
      }

      // ── Shared IO reveals (desktop AND mobile) — one-shot entrances key off
      // real on-screen visibility (Fix 22), never scroll math. On mobile these
      // replace the old "show everything instantly" branch. ──
      revealCleanups.push(
        revealOnVisible(rises, (el) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: isMobile ? 0.64 : 0.8,
            ease: "power3.out",
            overwrite: "auto",
          });
        })
      );
      // Fully-clipped nodes have an empty intersection rect (Fix 23) — observe
      // the unclipped parent, reveal the child. (These use scale, not clip, but
      // the parent-observe pattern is kept for consistency + robustness.)
      revealCleanups.push(
        revealOnVisible(
          clips.map((el) => el.parentElement ?? el),
          (wrapper) => {
            const el =
              (wrapper as HTMLElement).querySelector<HTMLElement>(".rem-clip") ??
              (wrapper as HTMLElement);
            gsap.to(el, {
              opacity: 1,
              scale: 1,
              duration: isMobile ? 0.72 : 0.85,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        )
      );
      // Mobile-only approach photo strip (desktop shows the sticky crossfade
      // plate instead; these are lg:hidden so IO never fires on desktop).
      if (mphotos.length) {
        revealCleanups.push(
          revealOnVisible(mphotos, (el, i) => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: isMobile ? 0.68 : 0.8,
              delay: 0.06 * (i % 2),
              ease: "power3.out",
              overwrite: "auto",
            });
          })
        );
      }
      revealCleanups.push(
        revealOnVisible(hairlines, (el) => {
          gsap.to(el, {
            scaleX: 1,
            duration: isMobile ? 0.7 : 0.9,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        })
      );
      // Stacked-surface rule (About grammar): reveals INSIDE a sticky surface
      // must be decisive once-reveals keyed to real visibility — scroll-math
      // scrubs park once the surface pins (PATTERNS Fix 22 / Fix 25).
      revealCleanups.push(
        revealOnVisible(cards, (el) => {
          const siblings = Array.from(el.parentElement?.children ?? []);
          const idx = Math.max(0, siblings.indexOf(el));
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: isMobile ? 0.7 : 0.85,
            delay: (isMobile ? 0.05 : 0.09) * idx,
            ease: "power3.out",
            overwrite: "auto",
          });
        })
      );
      if (plateL && plateR && plateL.parentElement) {
        revealCleanups.push(
          revealOnVisible([plateL.parentElement], () => {
            gsap.to(plateL, {
              x: 0,
              y: 0,
              opacity: 1,
              duration: isMobile ? 0.72 : 0.95,
              ease: "power3.out",
              overwrite: "auto",
            });
            gsap.to(plateR, {
              x: 0,
              y: 0,
              opacity: 1,
              duration: isMobile ? 0.72 : 0.95,
              delay: isMobile ? 0.05 : 0.08,
              ease: "power3.out",
              overwrite: "auto",
            });
          })
        );
      }
      if (seam && seam.parentElement) {
        revealCleanups.push(
          revealOnVisible([seam.parentElement.parentElement ?? seam.parentElement], () => {
            gsap.to(seam, {
              scaleY: 1,
              duration: isMobile ? 0.78 : 1.2,
              ease: "power2.inOut",
              overwrite: "auto",
            });
          })
        );
      }

      // ── Desktop-only flourishes (loved as-is; NOT run on mobile) ──
      if (isMobile) return;

      // Hero entrance — transform-only on text (above-the-fold, LCP-safe:
      // no opacity change) + media wipes in from the copy side.
      if (heroMedia) {
        gsap.fromTo(
          heroMedia,
          { clipPath: "inset(0% 0% 0% 22%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "power3.out", delay: 0.1 }
        );
      }
      if (heroLines.length) {
        gsap.fromTo(
          heroLines,
          { y: 30 },
          { y: 0, duration: 0.95, stagger: 0.09, ease: "power3.out" }
        );
      }

      // Layered parallax — two depths for dimension.
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
      parallaxSoft.forEach((el) => {
        gsap.to(el, {
          yPercent: -4,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.9,
          },
        });
      });
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

// ── Section 1 — hero: healthier environments ────────────────────────────────
function RemediationHero() {
  return (
    <section
      data-section="rem-hero"
      data-header-dark=""
      data-header-transparent=""
      className="relative bg-black text-white"
      style={{ overflowX: "clip" }}
    >
      <style>{`
        @keyframes remMobileHeroIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1279px) {
          .rem-hero-line {
            animation: remMobileHeroIn 0.72s cubic-bezier(0.16,1,0.3,1) both;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rem-hero-line { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
      <div className="grid min-h-svh grid-cols-1 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
        <div className="relative order-1 flex flex-col justify-center px-6 pb-14 pt-28 sm:px-10 lg:px-14 lg:pb-28 lg:pt-32">
          <Link
            href="/services"
            className="inline-flex min-h-11 w-fit items-center font-labels text-[10px] uppercase tracking-[0.18em] text-white/64 transition-colors hover:text-white lg:min-h-0"
          >
            Back to services
          </Link>
          <span className="mt-9 block font-labels text-[10px] uppercase tracking-[0.24em] text-white/64">
            Remediation / CA License #{SITE.license}
          </span>

          <h1
            className="rem-hero-line mt-9 font-display font-bold leading-[1.04] tracking-tight text-[clamp(2.2rem,4.5vw,4.4rem)]"
            style={{ animationDelay: "0.12s" }}
          >
            828 — creating healthier environments, one home at a time.
          </h1>

          <div
            className="rem-hairline mt-8 h-px w-24 bg-[var(--color-accent)]"
            style={{ opacity: 0.7 }}
            aria-hidden="true"
          />

          <p
            className="rem-hero-line mt-8 max-w-xl text-[15px] leading-8 text-white/62 sm:text-base"
            style={{ animationDelay: "0.22s" }}
          >
            {HERO_PARAGRAPH}
          </p>

          <div
            className="rem-hero-line mt-11 flex flex-wrap gap-4"
            style={{ animationDelay: "0.32s" }}
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
              Start restoration
            </Link>
          </div>
        </div>

        <div className="rem-hero-media relative order-2 min-h-[46svh] overflow-hidden lg:min-h-svh">
          <div className="rem-parallax absolute inset-x-0" style={{ top: "-7.5%", height: "115%" }}>
            <Image
              src="/images/generated/remediation-hero-controlled-work-v3.webp"
              alt="Controlled remediation work area with exposed framing and drying equipment"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-l lg:from-transparent lg:to-black/60" />
          <div className="absolute bottom-7 right-7 hidden lg:block">
            <span className="font-labels text-[9px] uppercase tracking-[0.2em] text-white/55">
              Controlled work area / South Bay
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section 2 — FAQ (NS Perspectives grammar) ───────────────────────────────
function FaqCard({
  faq,
  index,
  photo,
}: {
  faq: (typeof FAQS)[number];
  index: number;
  photo: (typeof FAQ_PHOTOS)[number];
}) {
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const panelId = `${baseId}-panel`;
  const dark = index % 2 === 0;
  return (
    <article
      data-gsap-reveal="true"
      className={`rem-card flex flex-col justify-between border p-6 sm:p-7 ${
        dark
          ? "border-transparent bg-[#111] text-white"
          : "border-black/12 bg-white text-[#111]"
      }`}
    >
      <div>
        <div className="relative mb-6 h-40 overflow-hidden bg-black/5 sm:h-44">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            quality={90}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            onError={imgError}
            className="object-cover"
            style={{
              filter: dark
                ? "contrast(1.05) saturate(1.03)"
                : "contrast(1.02) saturate(1.02)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>
        <span
          className={`font-numbers text-xs font-bold ${
            dark ? "text-white/72" : "text-[var(--color-accent)]"
          }`}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 id={headingId} className="mt-4 font-display text-lg leading-snug sm:text-xl">{faq.q}</h3>
      </div>
      <div className="mt-6">
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
            <p className={`pb-5 text-sm leading-7 ${dark ? "text-white/62" : "text-black/60"}`}>
              {faq.a}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? "Close answer" : "Answer"}: ${faq.q}`}
          className={`flex min-h-11 items-center gap-2 font-labels text-[10px] uppercase tracking-[0.18em] transition-colors ${
            dark ? "text-white/65 hover:text-white" : "text-black/55 hover:text-black"
          }`}
        >
          {open ? "Close" : "Answer"}
          <span
            aria-hidden="true"
            className="inline-block text-sm transition-transform duration-300"
            style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
          >
            +
          </span>
        </button>
      </div>
    </article>
  );
}

function RemediationFaq() {
  return (
    <section
      data-section="rem-faq"
      data-header-light=""
      className="relative flex min-h-svh flex-col justify-center bg-[#f7f7f3] pt-24 text-[#111]"
      style={{ overflowX: "clip" }}
    >
      {/* NS Perspectives echo: rolling strip of the three questions (decorative;
          the real headings live in the cards below). */}
      <div className="overflow-hidden border-b border-black/[0.06] py-6" aria-hidden="true">
        <div
          data-ambient-motion=""
          className="flex w-max items-center"
          style={{ animation: "marqueeScroll 58s linear infinite" }}
        >
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {FAQS.map((faq) => (
                <span key={faq.q} className="flex items-center whitespace-nowrap">
                  <span className="px-8 font-display font-light text-black/50 text-[clamp(1.6rem,2.6vw,2.6rem)]">
                    {faq.q}
                  </span>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
                    style={{ opacity: 0.55 }}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)] lg:gap-16">
          <div>
            <span className="rem-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-black/60">
              Identifying the reason for service
            </span>
            <h2 className="rem-rise mt-5 font-display font-light leading-[1.14] text-[clamp(1.8rem,3.2vw,3.4rem)]">
              When mold remediation is necessary
            </h2>
            <div
              className="rem-hairline mt-8 h-px w-24 bg-[var(--color-accent)]"
              style={{ opacity: 0.6 }}
              aria-hidden="true"
            />
          </div>
          <p className="rem-rise max-w-xl text-[15px] leading-8 text-black/62 lg:self-end">
            {FAQ_INTRO}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:mt-16">
          {FAQS.map((faq, i) => (
            <FaqCard key={faq.q} faq={faq} index={i} photo={FAQ_PHOTOS[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section 3 — the approach / build philosophy ─────────────────────────────
function RemediationApproach() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const rowRefs = useRef<Array<HTMLElement | null>>([]);
  // Desktop: 260svh runway — the panel pins once the section has fully
  // arrived, then each step owns ~40svh of dedicated scroll (services-page
  // bulletproof-walk grammar). Mobile: natural height, monotone focus walk.
  const activeIdx = useStepWalk(sectionRef, rowRefs, APPROACH.length);
  const activePhoto = APPROACH_PHOTOS[activeIdx] ?? APPROACH_PHOTOS[0];

  return (
    <section
      ref={sectionRef}
      data-section="rem-approach"
      data-header-dark=""
      className="motion-runway relative bg-black text-white max-xl:flex max-xl:min-h-svh max-xl:flex-col max-xl:justify-center lg:h-[260svh]"
      style={{ overflowX: "clip" }}
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-20 lg:px-12 lg:pb-10 lg:pt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:gap-20">
          <div>
            <span className="rem-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-white/64">
              Build philosophy
            </span>
            <h2 className="rem-rise mt-5 font-display font-light leading-[1.08] text-[clamp(1.8rem,3.2vw,3.4rem)]">
              The approach
            </h2>

            <div className="relative mt-10 border-b border-white/10 lg:mt-12">
              {/* Maroon plumb rail fills as steps ignite — live-rect state,
                  sticky-proof (scroll-math scrubs park inside stuck surfaces) */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 top-0 w-[2px] bg-white/[0.07]"
                aria-hidden="true"
              >
                <div
                  className="h-full w-full bg-[var(--color-accent)] transition-transform duration-700 ease-out"
                  style={{
                    opacity: 0.9,
                    transform: `scaleY(${(activeIdx + 1) / APPROACH.length})`,
                    transformOrigin: "top",
                  }}
                />
              </div>
              {APPROACH.map(([num, title], i) => {
                const active = activeIdx === i;
                return (
                  <div
                    key={num}
                    ref={(el) => {
                      rowRefs.current[i] = el;
                    }}
                    className={`flex items-baseline gap-5 border-t py-6 pl-7 transition-colors duration-500 sm:gap-9 sm:pl-9 lg:py-8 ${
                      active ? "border-[var(--color-accent)]/80" : "border-white/10"
                    }`}
                  >
                    <span
                      className={`font-numbers text-2xl font-bold leading-none transition-colors duration-500 sm:text-3xl ${
                        active ? "text-white" : "text-white/40"
                      }`}
                      aria-hidden="true"
                    >
                      {num}
                    </span>
                    <h3
                      className={`min-w-0 break-words font-display text-[1.18rem] leading-tight transition-colors duration-500 sm:text-[clamp(1.25rem,2.2vw,1.9rem)] ${
                        active ? "text-white" : "text-white/55"
                      }`}
                    >
                      {title}
                    </h3>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
              {APPROACH_PHOTOS.map((photo) => (
                <div
                  key={photo.src}
                  data-gsap-reveal="true"
                  className="rem-mphoto relative min-h-[15rem] overflow-hidden bg-white/5"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    quality={92}
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    onError={imgError}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 font-labels text-[9px] uppercase tracking-[0.2em] text-white/70">
                    {photo.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="h-[min(calc(100svh-14rem),34rem)] min-h-[24rem] overflow-hidden">
              <div className="rem-clip absolute inset-0" data-gsap-reveal="true">
                {/* Crossfading plate: inspection (steps 01–02) → rebuilt (03–04) */}
                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: 1 }}
                >
                  <div className="rem-parallax absolute inset-x-0" style={{ top: "-7.5%", height: "115%" }}>
                    <Image
                      src={activePhoto.src}
                      alt={activePhoto.alt}
                      fill
                      sizes="45vw"
                      quality={92}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      onError={imgError}
                      className="object-cover"
                      style={{ filter: "contrast(1.03) saturate(1.02)" }}
                    />
                  </div>
                </div>
                <div
                  className="absolute inset-0 transition-opacity duration-700"
                  style={{ opacity: 0 }}
                >
                  <div className="rem-parallax-soft absolute inset-x-0" style={{ top: "-7.5%", height: "115%" }}>
                    <Image
                      src={activePhoto.src}
                      alt={activePhoto.alt}
                      fill
                      sizes="45vw"
                      quality={92}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      onError={imgError}
                      className="object-cover"
                      style={{ filter: "contrast(1.04) saturate(1.03)" }}
                    />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="font-labels text-[9px] uppercase tracking-[0.2em] text-white/60">
                    {activePhoto.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

// ── Section 4 — integrated method (Joe's Section 4 verbiage; lead statement
// moved out per Brian 2026-07-10 — it lives in the CTA small print per Joe's
// IMG_1113 "as well") ────────────────────────────────────────────────────────
const METHOD_PHOTOS = [
  // Swappable slots — Brian is generating a multi-photo set to drop in here.
  {
    src: "/images/generated/remediation-method-diagnostic-v4.webp",
    alt: "Opened wall condition before remediation repair",
  },
  {
    src: "/images/generated/remediation-method-restoration-v4.webp",
    alt: "Remediation drying equipment in a clean work area",
  },
];

function RemediationMethod() {
  return (
    <section
      data-section="rem-method"
      data-stack-compact=""
      data-header-light=""
      className="relative flex flex-col bg-[#f7f4f0] text-black"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-28 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-12 lg:pb-20 lg:pt-[7.5rem]">
        <div className="grid grid-cols-2 gap-3">
          {METHOD_PHOTOS.map((photo, i) => (
            <div
              key={photo.src}
              className="relative min-h-[20rem] overflow-hidden sm:min-h-[24rem]"
            >
              <div className="rem-clip absolute inset-0" data-gsap-reveal="true">
                <div
                  className={`${i % 2 === 0 ? "rem-parallax" : "rem-parallax-soft"} absolute inset-x-0`}
                  style={{ top: "-7.5%", height: "115%" }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    loading="eager"
                    sizes="(max-width: 1024px) 50vw, 24vw"
                    quality={92}
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    onError={imgError}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-center">
          <span className="rem-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-black/60">
            Integrated remediation &amp; restoration
          </span>
          <p className="rem-rise mt-6 font-display font-light leading-[1.35] text-[clamp(1.3rem,2.2vw,2rem)]">
            {METHOD_BODY[0]}
          </p>
          <div
            className="rem-hairline mt-8 h-px w-24 bg-[var(--color-accent)]"
            style={{ opacity: 0.6 }}
            aria-hidden="true"
          />
          <p className="rem-rise mt-6 max-w-xl text-[15px] leading-8 text-black/62">
            {METHOD_BODY[1]}
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Section 5 — where recovery begins + equipment showcase (signature) ──────
function RemediationCta() {
  return (
    <section
      data-section="rem-cta"
      data-stack-compact=""
      data-header-dark=""
      className="relative flex flex-col border-t border-white/10 bg-[#0a0a0a] text-white"
      style={{ overflowX: "clip" }}
    >
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 lg:px-12 lg:py-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-20">
          <div className="flex flex-col justify-between gap-10">
            <div>
              {/* Joe: "Start restoration small letters" */}
              <span className="rem-rise block font-labels text-[10px] uppercase tracking-[0.22em] text-white/64">
                Start restoration
              </span>
              <h2 className="rem-rise mt-5 font-display font-light leading-[1.1] text-[clamp(1.8rem,3.2vw,3.4rem)]">
                Where recovery begins
              </h2>
              {/* Joe: "Begin the path to renewal bold letter" */}
              <p className="rem-rise mt-7 font-display text-xl font-semibold leading-snug text-white/92 lg:text-2xl">
                Begin the path to renewal
              </p>
              {/* Joe: "we will use this paragraph right here as well in small print" */}
              <p className="rem-rise mt-6 max-w-md text-sm leading-7 text-white/55">
                {METHOD_LEAD}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
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
                Discuss remediation
              </Link>
            </div>
          </div>

          {/* Page signature (PATTERNS.md): equipment model showcase. Plates
              settle in from opposite sides on scrub; maroon seam draws between
              them. Real photos of the Flair E8 + 277 MR pending from Joe. */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div data-gsap-reveal="true" className="rem-plate-left relative flex min-h-[19rem] flex-col justify-between border border-white/10 bg-[#111] p-6 sm:min-h-[22rem] sm:p-7">
                <span className="font-labels text-[9px] uppercase tracking-[0.2em] text-white/60">
                  Equipment / {EQUIPMENT[0].role}
                </span>
                <div>
                  <div className="relative mb-5 h-24 overflow-hidden border border-white/12 sm:h-32">
                    <Image
                      src={EQUIPMENT[0].src}
                      alt={EQUIPMENT[0].alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 16vw"
                      quality={92}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      onError={imgError}
                      className="object-cover"
                    />
                  </div>
                  <span className="inline-block bg-[var(--color-accent)]/90 px-2 py-1 font-labels text-[9px] uppercase tracking-[0.18em] text-white">
                    On every job
                  </span>
                  <p className="mt-3 font-numbers text-2xl font-bold sm:text-3xl">
                    {EQUIPMENT[0].model}
                  </p>
                </div>
              </div>
              <div data-gsap-reveal="true" className="rem-plate-right relative flex min-h-[19rem] flex-col justify-between border border-white/10 bg-[#111] p-6 sm:min-h-[22rem] sm:p-7">
                <span className="font-labels text-[9px] uppercase tracking-[0.2em] text-white/60">
                  Equipment / {EQUIPMENT[1].role}
                </span>
                <div>
                  <div className="relative mb-5 h-24 overflow-hidden border border-white/12 sm:h-32">
                    <Image
                      src={EQUIPMENT[1].src}
                      alt={EQUIPMENT[1].alt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 16vw"
                      quality={92}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                      onError={imgError}
                      className="object-cover"
                    />
                  </div>
                  <span className="inline-block bg-[var(--color-accent)]/90 px-2 py-1 font-labels text-[9px] uppercase tracking-[0.18em] text-white">
                    On every job
                  </span>
                  <p className="mt-3 font-numbers text-2xl font-bold sm:text-3xl">
                    {EQUIPMENT[1].model}
                  </p>
                </div>
              </div>
            </div>
            {/* Maroon seam between the plates */}
            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
              aria-hidden="true"
            >
              <div className="rem-seam h-full w-full bg-[var(--color-accent)]" style={{ opacity: 0.75 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RemediationServiceContent() {
  const rootRef = useRemediationMotion();

  return (
    <div ref={rootRef} className="bg-black text-white">
      <RemediationFlow>
        <RemediationHero />
        <RemediationFaq />
        <RemediationApproach />
        <RemediationMethod />
        <RemediationCta />
      </RemediationFlow>
    </div>
  );
}
