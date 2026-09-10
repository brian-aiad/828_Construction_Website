"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/constants";
import {
  PORTFOLIO_CASES,
  PortfolioCase,
} from "@/components/portfolio/portfolioCases.data";
import PortfolioFlow from "@/components/portfolio/PortfolioFlow";
import { AnimationController } from "@/utils/animationControl";
import { lqip } from "@/lib/image-placeholders";

gsap.registerPlugin(ScrollTrigger);

const ProjectInspectionViewer = dynamic(
  () => import("@/components/portfolio/ProjectInspectionViewer"),
  { ssr: false }
);

// Each photographed project has its own art-directed case study. The shared
// field-documentation language keeps the page cohesive without reducing the
// three projects to one repeated template.

type LightboxState = { c: number; p: number } | null;

function usePortfolioMotion() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => () => {
    try {
      ctxRef.current?.revert();
    } catch {}
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !AnimationController.shouldAnimate() || window.innerWidth < 1024) return;

    const ctx = gsap.context(() => {
      // The working-frame strips drift like contact sheets passing across an
      // inspection table. The track is decorative and uses transforms only.
      gsap.utils.toArray<HTMLElement>("[data-strip-track]").forEach((track, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          track,
          { xPercent: direction * 4 },
          {
            xPercent: direction * -4,
            force3D: true,
            ease: "none",
            scrollTrigger: {
              trigger: track,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
              onEnter: () => gsap.set(track, { willChange: "transform" }),
              onEnterBack: () => gsap.set(track, { willChange: "transform" }),
              onLeave: () => gsap.set(track, { willChange: "auto" }),
              onLeaveBack: () => gsap.set(track, { willChange: "auto" }),
            },
          }
        );
      });

      // Maroon hairlines draw on scrub (decorative).
      gsap.utils.toArray<HTMLElement>(".draw-line").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            transformOrigin: "left",
            scrollTrigger: { trigger: el, start: "top 92%", end: "top 60%", scrub: 1 },
          }
        );
      });

      // Lead photos breathe: slow inner parallax on scrub (decorative).
      gsap.utils.toArray<HTMLElement>("[data-lead-parallax] img").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -5, scale: 1.08 },
          {
            yPercent: 5,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.6,
            },
          }
        );
      });
    }, rootRef);

    ctxRef.current = ctx;
    return () => {
      ctxRef.current = null;
      try {
        ctx.revert();
      } catch {}
    };
  }, []);

  return rootRef;
}

function CaseTile({
  src,
  caseData,
  index,
  dark,
  aspect = "aspect-[4/5]",
  sizes,
  lead = false,
  onOpen,
}: {
  src: string;
  caseData: PortfolioCase;
  index: number;
  dark: boolean;
  aspect?: string;
  sizes: string;
  lead?: boolean;
  onOpen: (src: string) => void;
}) {
  const fallbackTone = dark
    ? "bg-[linear-gradient(135deg,#171313,#070707_56%,rgba(99,26,22,0.28))]"
    : "bg-[linear-gradient(135deg,#efe7dc,#d8cab8_56%,rgba(99,26,22,0.16))]";
  const galleryIndex = caseData.gallery.photos.indexOf(src);
  const photoPosition = galleryIndex >= 0 ? galleryIndex + 1 : index + 1;

  return (
    <button
      type="button"
      data-lead-parallax={lead ? "" : undefined}
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        onOpen(src);
      }}
      aria-label={`View photo ${photoPosition} of ${caseData.gallery.photos.length} — ${caseData.gallery.title}`}
      className={`pf-tile group relative block w-full overflow-hidden text-left ${aspect} ${
        dark ? "bg-[#111]" : "bg-[#e8e3da]"
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]`}
    >
      <span aria-hidden="true" className={`absolute inset-0 ${fallbackTone}`} />
      <span
        aria-hidden="true"
        className={`absolute inset-x-4 top-4 h-px ${dark ? "bg-white/12" : "bg-black/10"}`}
      />
      <span className="absolute inset-0 overflow-hidden">
        <Image
          src={src}
          alt={`${caseData.gallery.title} — ${caseData.gallery.scope}, detail ${photoPosition}`}
          fill
          loading="lazy"
          sizes={sizes}
          quality={82}
          placeholder="blur"
          blurDataURL={lqip(src)}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
        />
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-500 group-hover:scale-x-100"
      />
    </button>
  );
}

function ContactStrip({
  photos,
  title,
  dark,
}: {
  photos: string[];
  title: string;
  dark: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      data-motion-reveal="up"
      className="pointer-events-none mt-12 overflow-hidden lg:mt-16"
    >
      <div
        data-strip-track=""
        className="flex w-[108%] -ml-[4%] gap-3 lg:gap-4"
      >
        {photos.map((src) => (
          <div
            key={src}
            className={`relative h-28 min-w-0 flex-1 overflow-hidden sm:h-40 lg:h-52 ${
              dark ? "bg-[#111]" : "bg-[#e8e3da]"
            }`}
          >
            <Image
              src={src}
              alt=""
              fill
              loading="lazy"
              decoding="async"
              sizes="(max-width: 1024px) 36vw, 34vw"
              quality={62}
              placeholder="blur"
              blurDataURL={lqip(src)}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div
        className={`mt-3 font-labels text-[8px] uppercase tracking-[0.2em] ${
          dark ? "text-white/58" : "text-black/58"
        }`}
      >
        {title} / working frames
      </div>
    </div>
  );
}

function CaseLedger({
  caseData,
  dark,
  onOpenSet,
}: {
  caseData: PortfolioCase;
  dark: boolean;
  onOpenSet: () => void;
}) {
  const { project, gallery } = caseData;
  const hairline = dark ? "border-white/12" : "border-black/12";
  const label = dark ? "text-white/58" : "text-black/62";
  const value = dark ? "text-white/72" : "text-black/78";
  const rows: Array<[string, string]> = [
    ["Scope", gallery.scope],
    ["Location", project.location],
    ["Detail", project.spec],
    ["Documentation", `${gallery.photos.length} photographs`],
  ];

  return (
    <div>
      <dl>
        {rows.map(([k, v]) => (
          <div key={k} className={`grid grid-cols-[7.5rem_1fr] gap-4 border-t ${hairline} py-3.5`}>
            <dt className={`font-labels text-[9px] uppercase leading-5 tracking-[0.18em] ${label}`}>{k}</dt>
            <dd className={`text-[13px] leading-6 ${value}`}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="draw-line h-px bg-[var(--color-accent)]/55" />
      <p className={`mt-6 max-w-md text-sm leading-7 ${dark ? "text-white/56" : "text-black/62"}`}>
        {project.description}
      </p>
      <button
        type="button"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          onOpenSet();
        }}
        aria-label={`Open the full set — ${gallery.title}`}
        className={`mt-8 inline-flex min-h-[44px] items-center gap-3 border px-6 py-3.5 font-labels text-[9px] uppercase tracking-[0.18em] transition-colors ${
          dark
            ? "border-white/25 text-white/80 hover:border-white hover:text-white"
            : "border-black/25 text-black/75 hover:border-black hover:text-black"
        }`}
      >
        Open the full set
        <span className={`font-numbers text-[10px] ${dark ? "text-white/85" : "text-[var(--color-accent)]"}`}>
          {gallery.photos.length}
        </span>
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
      </button>
    </div>
  );
}

function CaseNumberBlock({ index, title, dark }: { index: number; title: string; dark: boolean }) {
  return (
    <div>
      {/* Maroon fails contrast on the dark surfaces — white numeral with a
          maroon tick keeps the accent vocabulary without the 1.6:1 read. */}
      <span className={`inline-flex items-center gap-2 font-numbers text-[11px] font-bold ${dark ? "text-white/85" : "text-[var(--color-accent)]"}`}>
        {dark && <span className="h-[2px] w-5 bg-[var(--color-accent)]" aria-hidden="true" />}
        {String(index + 1).padStart(2, "0")}
      </span>
      <h2
        className={`mt-3 font-editorial text-[clamp(1.9rem,3.2vw,3.4rem)] leading-[0.94] ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}

export default function PortfolioContent() {
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const lightboxOpenRef = useRef(false);
  const [heroPreview, setHeroPreview] = useState<number | null>(null);
  const rootRef = usePortfolioMotion();

  // Deep-link landing (home cards → /portfolio#<residence>): jump instantly
  // to the anchored case, re-asserting across the browser fragment scroll,
  // the Lenis mount reset, hash-only navigation, and late layout. A real
  // scroll gesture aborts the current landing routine.
  useEffect(() => {
    let stopLanding: (() => void) | null = null;

    const beginLanding = () => {
      const id = window.location.hash.replace("#", "");
      if (!PORTFOLIO_CASES.some((c) => c.gallery.id === id)) return () => {};

      let aborted = false;
      let layoutFrame = 0;
      let layoutObserver: ResizeObserver | null = null;
      const abort = () => {
        aborted = true;
        layoutObserver?.disconnect();
      };
      const jump = () => {
        if (aborted) return;
        const el = document.getElementById(id);
        if (!el) return;
        const stack = el.closest<HTMLElement>("[data-stack-surface]");
        const flow = stack?.parentElement;
        const surfaces = flow
          ? Array.from(flow.children).filter(
              (child): child is HTMLElement =>
                child instanceof HTMLElement && child.hasAttribute("data-stack-surface")
            )
          : [];
        const stackIndex = stack ? surfaces.indexOf(stack) : -1;
        const stableStackTop = stackIndex >= 0
          ? surfaces
              .slice(0, stackIndex)
              .reduce((top, surface) => top + surface.offsetHeight, 0)
          : 0;
        const y = stack && flow && stackIndex >= 0
          ? flow.getBoundingClientRect().top + window.scrollY + stableStackTop
          : el.getBoundingClientRect().top + window.scrollY;
        const root = document.documentElement;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        const lenis = (window as unknown as {
          __lenis828?: { scrollTo: (target: number, options: { immediate: boolean }) => void };
        }).__lenis828;
        lenis?.scrollTo(Math.max(0, y), { immediate: true });
        window.scrollTo(0, Math.max(0, y));
        root.style.scrollBehavior = prev;
      };

      window.addEventListener("wheel", abort, { passive: true, once: true });
      window.addEventListener("touchmove", abort, { passive: true, once: true });
      const raf = window.requestAnimationFrame(jump);
      const timers = [120, 350, 700, 1100, 1800, 3000, 4800].map((ms) =>
        setTimeout(jump, ms)
      );
      const observedSurfaces = Array.from(
        document.querySelectorAll<HTMLElement>("[data-portfolio-flow] > [data-stack-surface]")
      );
      if (typeof ResizeObserver !== "undefined" && observedSurfaces.length) {
        layoutObserver = new ResizeObserver(() => {
          if (aborted || layoutFrame) return;
          layoutFrame = window.requestAnimationFrame(() => {
            layoutFrame = 0;
            jump();
          });
        });
        observedSurfaces.forEach((surface) => layoutObserver?.observe(surface));
      }
      const onLoad = () => jump();
      window.addEventListener("load", onLoad, { once: true });
      document.fonts?.ready.then(jump).catch(() => {});

      return () => {
        aborted = true;
        window.cancelAnimationFrame(raf);
        if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
        timers.forEach(clearTimeout);
        layoutObserver?.disconnect();
        window.removeEventListener("load", onLoad);
        window.removeEventListener("wheel", abort);
        window.removeEventListener("touchmove", abort);
      };
    };

    const onHashChange = () => {
      stopLanding?.();
      stopLanding = beginLanding();
    };
    stopLanding = beginLanding();
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      stopLanding?.();
    };
  }, []);

  const close = useCallback(() => {
    lightboxOpenRef.current = false;
    setLightbox(null);
  }, []);

  const openAt = useCallback((c: number, src?: string) => {
    const photos = PORTFOLIO_CASES[c].gallery.photos;
    const p = src ? Math.max(0, photos.indexOf(src)) : 0;
    lightboxOpenRef.current = true;
    setLightbox({ c, p });
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !lightboxOpenRef.current) return;
      event.preventDefault();
      close();
    };
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [close]);

  const active = lightbox ? PORTFOLIO_CASES[lightbox.c] : null;
  const [cerritos, elSereno, tustin] = PORTFOLIO_CASES;

  return (
    <div ref={rootRef} className="bg-[#f5f0e9] text-black">
      <PortfolioFlow>
        {/* ── Surface 1 · Hero: editorial ledger + project triptych ── */}
        <section
          data-section="portfolio-hero"
          data-header-dark=""
          className="relative min-h-[max(100svh,46rem)] bg-black px-6 pb-16 pt-28 text-white lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:px-12 lg:pb-20 lg:pt-32"
          style={{ overflowX: "clip" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_12%,rgba(99,26,22,0.16),transparent_30%)]" aria-hidden="true" />
          <div className="relative z-10 mx-auto w-full max-w-[100rem]">
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:gap-12 2xl:gap-20">
              <div className="flex flex-col justify-between" data-motion-reveal="left" data-motion-stagger="0.1">
                <div>
                  <span className="font-labels text-[10px] uppercase tracking-[0.24em] text-white/62">
                    Portfolio / Selected project work
                  </span>
                  <h1 className="mt-5 max-w-xl font-editorial text-[clamp(2.75rem,5.2vw,5.4rem)] leading-[0.9]">
                    Remodels, ADUs, Repairs.
                  </h1>
                  <p className="mt-6 max-w-md text-sm leading-7 text-white/56">
                    Three projects, photographed the way they were built — completely.
                    Open any project for the full set.
                  </p>
                  <a
                    href={`#${cerritos.gallery.id}`}
                    aria-label={`View ${cerritos.gallery.title}`}
                    className="mt-7 inline-flex h-12 w-12 items-center justify-center border border-white/32 text-white transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:hidden"
                  >
                    <ArrowDown aria-hidden="true" className="h-5 w-5 animate-bounce stroke-[1.5] motion-reduce:animate-none" />
                  </a>
                </div>

                <nav
                  aria-label="Project index"
                  className="mt-10 lg:mt-8"
                  onMouseLeave={() => setHeroPreview(null)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setHeroPreview(null);
                  }}
                >
                  {PORTFOLIO_CASES.map((c, i) => {
                    const selected = heroPreview === i;
                    return (
                      <a
                        key={c.gallery.id}
                        href={`#${c.gallery.id}`}
                        onMouseEnter={() => setHeroPreview(i)}
                        onFocus={() => setHeroPreview(i)}
                        className={`group relative grid min-h-[4.75rem] grid-cols-[2.6rem_minmax(0,1fr)_auto] items-center gap-4 border-t border-white/12 py-3.5 transition-colors hover:bg-white/[0.045] focus-visible:bg-white/[0.045] ${selected ? "bg-white/[0.035]" : ""}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute inset-y-0 left-0 w-px origin-center bg-[var(--color-accent)] transition-transform duration-300 ${selected ? "scale-y-100" : "scale-y-0"}`}
                        />
                        <span className={`font-numbers text-sm font-bold transition-colors ${selected ? "text-[var(--color-accent)]" : "text-white/28"}`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className={`block truncate font-editorial text-[clamp(1.2rem,1.8vw,1.8rem)] leading-tight transition-colors ${selected ? "text-white" : "text-white/82"}`}>
                            {c.gallery.title}
                          </span>
                          <span className="mt-1 block truncate font-labels text-[8px] uppercase leading-4 tracking-[0.16em] text-white/48">
                            {c.gallery.scope} / {c.project.location}
                          </span>
                        </span>
                        <span className="hidden font-numbers text-[10px] text-white/52 sm:block">
                          {c.gallery.photos.length} photos
                        </span>
                      </a>
                    );
                  })}
                  <div className="draw-line h-px bg-[var(--color-accent)]/55" />
                </nav>
              </div>

              <div
                className="grid min-h-[24rem] grid-cols-2 grid-rows-2 gap-3 sm:min-h-[32rem] lg:min-h-[min(68svh,48rem)]"
                data-motion-reveal="right"
                onMouseLeave={() => setHeroPreview(null)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setHeroPreview(null);
                }}
              >
                {[cerritos, elSereno, tustin].map((c, i) => (
                  <a
                    key={c.gallery.id}
                    href={`#${c.gallery.id}`}
                    onMouseEnter={() => setHeroPreview(i)}
                    onFocus={() => setHeroPreview(i)}
                    className={`group relative block overflow-hidden bg-[#111] transition-opacity duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] ${i === 0 ? "row-span-2" : ""} ${heroPreview === null || heroPreview === i ? "opacity-100" : "opacity-45"}`}
                  >
                    <Image
                      src={c.heroImage}
                      alt={`${c.gallery.title} — ${c.gallery.scope}`}
                      fill
                      priority={i === 0}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      quality={94}
                      sizes={i === 0 ? "(max-width: 1024px) 50vw, 30vw" : "(max-width: 1024px) 50vw, 28vw"}
                      placeholder="blur"
                      blurDataURL={lqip(c.heroImage)}
                      className={`object-cover transition-transform duration-700 group-hover:scale-[1.025] group-focus-visible:scale-[1.025] motion-reduce:transition-none ${i === 0 ? "object-center" : i === 1 ? "object-[50%_58%]" : "object-[50%_54%]"}`}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/64 via-transparent to-black/5" aria-hidden="true" />
                    <span className="absolute bottom-4 left-4 font-labels text-[8px] uppercase tracking-[0.2em] text-white/88">
                      {c.project.location}
                    </span>
                    <span className={`absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--color-accent)] transition-transform duration-500 ${heroPreview === i ? "scale-x-100" : "scale-x-0"}`} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <a
            href={`#${cerritos.gallery.id}`}
            aria-label={`View ${cerritos.gallery.title}`}
            className="absolute bottom-5 left-1/2 z-20 hidden h-12 w-12 -translate-x-1/2 items-center justify-center border border-white/36 bg-black/42 text-white backdrop-blur-sm transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:flex"
          >
            <ArrowDown aria-hidden="true" className="h-5 w-5 animate-bounce stroke-[1.5] motion-reduce:animate-none" />
          </a>
        </section>

        {/* Cerritos: architectural split, lead image left and dossier right. */}
        <section
          id={cerritos.gallery.id}
          data-section="case-cerritos"
          data-header-light=""
          className="relative flex min-h-svh scroll-mt-[49px] flex-col justify-center bg-[#f5f0e9] px-6 pb-20 pt-24 lg:px-12 lg:pb-28 lg:pt-28 xl:scroll-mt-[52px]"
          style={{ overflowX: "clip" }}
        >
          <div className="relative z-10 mx-auto w-full max-w-[100rem]">
            <div className="grid gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-start lg:gap-14 2xl:gap-20">
              <div
                data-lead-parallax=""
                data-motion-reveal="left"
                className="relative aspect-[4/5] overflow-hidden bg-[#e8e3da] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[min(68svh,48rem)]"
              >
                <Image
                  src={cerritos.lead}
                  alt="Cerritos bath remodel overview — frameless glass shower, dark vertical feature tile, dual marble vanity"
                  fill
                  quality={86}
                  sizes="(max-width: 1024px) 100vw, 54vw"
                  placeholder="blur"
                  blurDataURL={lqip(cerritos.lead)}
                  className="object-cover"
                />
              </div>
              <div className="lg:self-stretch">
                <div
                  className="lg:sticky lg:top-28"
                  data-motion-reveal="right"
                  data-motion-stagger="0.08"
                >
                  <CaseNumberBlock index={0} title={cerritos.gallery.title} dark={false} />
                  <div className="mt-8">
                    <CaseLedger caseData={cerritos} dark={false} onOpenSet={() => openAt(0)} />
                  </div>
                </div>
              </div>
            </div>

            <div
              data-tile-group=""
              data-motion-reveal="up"
              data-motion-stagger="0.065"
              className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:mt-14 lg:gap-4"
            >
              {cerritos.grid.map((src, index) => (
                <CaseTile
                  key={src}
                  src={src}
                  caseData={cerritos}
                  index={index}
                  dark={false}
                  aspect={index === 0 ? "col-span-2 aspect-[8/5]" : "aspect-[4/5]"}
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
                  onOpen={(src) => openAt(0, src)}
                />
              ))}
            </div>

            <ContactStrip photos={cerritos.strip} title={cerritos.gallery.title} dark={false} />
          </div>
        </section>

        {/* El Sereno: cinematic lead followed by separate bath/deck chapters. */}
        <section
          id={elSereno.gallery.id}
          data-section="case-el-sereno"
          data-header-dark=""
          className="relative flex min-h-svh scroll-mt-[49px] flex-col justify-center bg-[#0a0a0a] px-6 pb-20 pt-24 text-white lg:px-12 lg:pb-28 lg:pt-28 xl:scroll-mt-[52px]"
          style={{ overflowX: "clip" }}
        >
          <div className="relative z-10 mx-auto w-full max-w-[100rem]">
            <div
              data-lead-parallax=""
              data-motion-reveal="up"
              className="relative aspect-[4/3] overflow-hidden bg-[#111] sm:aspect-[16/8] lg:aspect-[21/9]"
            >
              <Image
                src={elSereno.lead}
                alt="El Sereno bath remodel — geometric star-pattern tile, soaking tub, and matte black fixtures"
                fill
                quality={88}
                sizes="(max-width: 1600px) 100vw, 1600px"
                placeholder="blur"
                blurDataURL={lqip(elSereno.lead)}
                className="object-cover object-[50%_68%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-transparent to-transparent" />
            </div>

            <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
              <div className="lg:sticky lg:top-28" data-motion-reveal="left" data-motion-stagger="0.08">
                <CaseNumberBlock index={1} title={elSereno.gallery.title} dark />
                <div className="mt-8">
                  <CaseLedger caseData={elSereno} dark onOpenSet={() => openAt(1)} />
                </div>
              </div>

              <div>
                {[elSereno.grid, elSereno.gridB ?? []].map((chapter, chapterIndex) =>
                  chapter.length ? (
                    <div key={chapterIndex} className={chapterIndex === 1 ? "mt-10" : ""}>
                      <div className="mb-4 flex items-center gap-3" data-motion-reveal="right">
                        <span className="h-px w-8 bg-[var(--color-accent)]/70" aria-hidden="true" />
                        <span className="font-labels text-[9px] uppercase tracking-[0.2em] text-white/62">
                          {elSereno.chapterLabels?.[chapterIndex]}
                        </span>
                      </div>
                      <div
                        data-tile-group=""
                        data-motion-reveal="up"
                        data-motion-stagger="0.07"
                        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4"
                      >
                        {chapter.map((src, index) => (
                          <CaseTile
                            key={src}
                            src={src}
                            caseData={elSereno}
                            index={chapterIndex * chapter.length + index}
                            dark
                            aspect={index === 0 ? "col-span-2 aspect-[4/5] md:col-span-1" : "aspect-[4/5]"}
                            sizes="(max-width: 768px) 50vw, 20vw"
                            onOpen={(src) => openAt(1, src)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>

            <ContactStrip photos={elSereno.strip} title={elSereno.gallery.title} dark />
          </div>
        </section>

        {/* Tustin: specification bar above an offset, two-column mosaic. */}
        <section
          id={tustin.gallery.id}
          data-section="case-tustin"
          data-header-light=""
          className="relative flex min-h-svh scroll-mt-[49px] flex-col justify-center bg-[#f5f0e9] px-6 pb-20 pt-24 lg:px-12 lg:pb-28 lg:pt-28 xl:scroll-mt-[52px]"
          style={{ overflowX: "clip" }}
        >
          <div className="relative z-10 mx-auto w-full max-w-[100rem]">
            <div className="grid gap-9 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:gap-16">
              <div data-motion-reveal="left">
                <CaseNumberBlock index={2} title={tustin.gallery.title} dark={false} />
              </div>
              <div data-motion-reveal="right" data-motion-stagger="0.08">
                <CaseLedger caseData={tustin} dark={false} onOpenSet={() => openAt(2)} />
              </div>
            </div>

            <div className="mt-10 grid gap-3 lg:mt-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-4">
              <div data-tile-group="" data-motion-reveal="left" data-motion-stagger="0.08" className="grid gap-3 lg:gap-4">
                <CaseTile
                  src={tustin.lead}
                  caseData={tustin}
                  index={0}
                  dark={false}
                  lead
                  aspect="aspect-[4/3]"
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  onOpen={(src) => openAt(2, src)}
                />
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {tustin.grid.slice(0, 2).map((src, index) => (
                    <CaseTile
                      key={src}
                      src={src}
                      caseData={tustin}
                      index={index + 1}
                      dark={false}
                      sizes="(max-width: 1024px) 50vw, 22vw"
                      onOpen={(src) => openAt(2, src)}
                    />
                  ))}
                </div>
              </div>
              <div data-tile-group="" data-motion-reveal="right" data-motion-stagger="0.08" className="grid gap-3 lg:mt-16 lg:gap-4">
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {tustin.grid.slice(2, 4).map((src, index) => (
                    <CaseTile
                      key={src}
                      src={src}
                      caseData={tustin}
                      index={index + 3}
                      dark={false}
                      sizes="(max-width: 1024px) 50vw, 18vw"
                      onOpen={(src) => openAt(2, src)}
                    />
                  ))}
                </div>
                <CaseTile
                  src={tustin.grid[4]}
                  caseData={tustin}
                  index={5}
                  dark={false}
                  aspect="aspect-[4/3]"
                  sizes="(max-width: 1024px) 100vw, 36vw"
                  onOpen={(src) => openAt(2, src)}
                />
              </div>
            </div>

            <ContactStrip photos={tustin.strip} title={tustin.gallery.title} dark={false} />
          </div>
        </section>

        {/* ── Surface 5 · CTA ── */}
        <section
          data-section="portfolio-cta"
          data-stack-compact=""
          data-header-light=""
          className="relative flex min-h-[22rem] flex-col justify-center bg-[#f5f0e9] px-6 py-16 sm:min-h-[24rem] sm:py-20 lg:px-12 xl:min-h-[clamp(26rem,50svh,38rem)] xl:py-20"
          style={{ overflowX: "clip" }}
        >
          <div className="relative z-10 mx-auto grid w-full max-w-[100rem] gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 2xl:gap-20">
            <div data-motion-reveal="left" data-motion-stagger="0.08">
              <span className="font-labels text-[10px] uppercase tracking-[0.22em] text-black/62">
                Ready to compare notes
              </span>
              <h2 className="mt-3 max-w-4xl font-editorial text-[2rem] leading-[0.94] sm:text-[2.6rem] lg:text-[3.4rem] 2xl:text-[4.75rem]">
                Ready to price the next scope?
              </h2>
            </div>
            <div
              className="flex flex-wrap gap-3 lg:justify-end"
              data-motion-reveal="right"
            >
              <a
                href={SITE.phoneHref}
                className="min-h-[44px] bg-black px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--color-accent)] 2xl:min-h-16 2xl:px-10 2xl:py-5"
              >
                Call {SITE.phone}
              </a>
              <Link
                href="/contact"
                className="min-h-[44px] border border-black/20 px-7 py-4 font-labels text-[10px] uppercase tracking-[0.18em] text-black/70 transition-colors hover:border-black hover:text-black 2xl:min-h-16 2xl:px-10 2xl:py-5"
              >
                Start a project
              </Link>
            </div>
          </div>
        </section>
      </PortfolioFlow>

      {/* Project inspection viewer: swipe/zoom stage plus a bounded contact rail. */}
      {active && lightbox && (
        <ProjectInspectionViewer
          caseData={active}
          initialIndex={lightbox.p}
          onIndexChange={(p) =>
            setLightbox((current) => (current ? { ...current, p } : current))
          }
          onClose={close}
        />
      )}
    </div>
  );
}
