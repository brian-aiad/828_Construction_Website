"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import { SITE, SERVICES, PROJECTS } from "@/lib/constants";
import { AnimationController } from "@/utils/animationControl";
import { useMobile } from "@/hooks/useMobile";
import MagneticButton from "@/components/ui/MagneticButton";
import ServicePageContactForm from "@/components/contact/ServicePageContactForm";
import PrecisionOverlay from "@/components/shared/PrecisionOverlay";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceData {
  slug: string;
  title: string;
  short: string;
  description: string;
  details: string[];
}

interface NextService {
  slug: string;
  title: string;
  short: string;
}

interface AduFaqItem {
  q: string;
  a: string;
}

interface Props {
  service: ServiceData;
  nextService: NextService;
  keywords: string[];
  aduFaq?: AduFaqItem[];
  serviceImageSrc: string;
  serviceImageCaption: string;
}

// ─── Per-service data ─────────────────────────────────────────────────────────

const STRIP_LABELS: Record<string, string[]> = {
  adu: [
    "ADU Construction",
    "Accessory Dwelling Unit",
    "Torrance CA",
    "South Bay",
    "Permitted Plans",
    "Full Build",
    "Site Prep",
    "CA Licensed",
  ],
  remediation: [
    "Remediation Services",
    "Moisture Control",
    "Mold Assessment",
    "Foundation Repair",
    "Torrance CA",
    "South Bay",
    "Structural Repair",
    "CA Licensed",
  ],
  consulting: [
    "Building Consulting",
    "Code Compliance",
    "Building Science",
    "South Bay CA",
    "Expert Advisory",
    "Site Assessment",
    "CA Licensed",
    "25+ Years",
  ],
};

const QUALIFIER_ITEMS: Record<string, string[]> = {
  adu: [
    "You own South Bay property and want to add a permitted rental unit or living space",
    "You need someone who handles design coordination and Torrance permits — not just framing",
    "You're converting a garage, adding a detached unit, or building a JADU",
    "You want durable construction with building science behind every decision",
  ],
  remediation: [
    "You have persistent water intrusion, mold, or structural damage that others misdiagnosed",
    "A previous contractor's work failed — or was never finished correctly",
    "You need root-cause identification, not surface-level repairs that come back",
    "You're dealing with a construction defect and need a licensed expert's assessment",
  ],
  consulting: [
    "You're buying or investing in a property and want to know what you're really getting into",
    "You're reviewing contractor bids and need independent expert verification",
    "You want feasibility analysis before committing to design or permits",
    "You have a complex project and need an owner's representative with 25+ years of experience",
  ],
};

const SERVICE_PROCESS: Record<
  string,
  Array<{ num: string; title: string; desc: string }>
> = {
  adu: [
    {
      num: "01",
      title: "Site Visit & Zoning Review",
      desc: "We walk your property and review local zoning before any design work begins. No commitments until you have clarity.",
    },
    {
      num: "02",
      title: "Design Coordination",
      desc: "We work with your architect or refer one — scope aligned before permit submittal. You never have to chase two parties.",
    },
    {
      num: "03",
      title: "Permits & Approvals",
      desc: "828 manages the permit process with Torrance Planning and Building Departments, start to approval.",
    },
    {
      num: "04",
      title: "Full Build",
      desc: "Licensed construction from foundation to finish — managed by Joe personally. One point of accountability, end to end.",
    },
  ],
  remediation: [
    {
      num: "01",
      title: "Diagnostic Assessment",
      desc: "We identify the root cause, not just the symptom. Every scope begins with a thorough investigation before any work is priced.",
    },
    {
      num: "02",
      title: "Written Findings",
      desc: "You receive a written assessment before any work is authorized. Every finding is documented, every risk rated. No surprises.",
    },
    {
      num: "03",
      title: "Remediation Plan",
      desc: "We scope the fix to the real problem — nothing more, nothing less. Transparent pricing before a single tool is picked up.",
    },
    {
      num: "04",
      title: "Documented Completion",
      desc: "Full documentation at project close — useful for insurance claims, resale disclosures, or future reference.",
    },
  ],
  consulting: [
    {
      num: "01",
      title: "Intake & Scope Review",
      desc: "We understand what you need to know and what's at stake before we schedule a visit. No wasted site time.",
    },
    {
      num: "02",
      title: "On-Site Assessment",
      desc: "We walk the property with 25 years of pattern recognition. We look where others don't.",
    },
    {
      num: "03",
      title: "Written Report",
      desc: "You receive a written analysis with findings, risk ratings, and recommended actions. Something you can act on — or negotiate with.",
    },
    {
      num: "04",
      title: "Follow-On Advisory",
      desc: "We stay available for contractor review, bid comparison, and decision support. The relationship doesn't end at delivery.",
    },
  ],
};

const CATEGORY_MAP: Record<string, string> = {
  adu: "ADU Construction",
  remediation: "Remediation",
  consulting: "Consulting",
};

// ─── Section 1: Hero ──────────────────────────────────────────────────────────

function DetailHero({
  service,
  serviceImageSrc,
}: {
  service: ServiceData;
  serviceImageSrc: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const splitRef = useRef<SplitType | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  useLayoutEffect(() => () => { if (splitRef.current) { try { splitRef.current.revert(); } catch {} } try { ctxRef.current?.revert(); } catch {} }, []);

  useEffect(() => {
    if (!AnimationController.shouldAnimate()) return;
    let mounted = true;
    let splitFrame = -1;
    let locLineEl: HTMLElement | null = null;
    let locSplit: SplitType | null = null;
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: -15, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(midRef.current, {
        yPercent: -8, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(headlineRef.current, {
        yPercent: 5, ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", end: "top 20%", scrub: 1 },
        });
      }
      if (counterRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 25, duration: 2, ease: "power2.out", immediateRender: false,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%", once: true },
          onUpdate: () => {
            const v = Math.round(obj.val);
            if (counterRef.current && v > 0) counterRef.current.textContent = v + "+";
          },
        });
      }
      splitFrame = requestAnimationFrame(() => {
        if (!mounted) return;
        const locLine = sectionRef.current?.querySelector<HTMLElement>(".loc-line");
        if (!locLine || !locLine.isConnected) return;
        locLineEl = locLine;
        const split = new SplitType(locLine, { types: "words,chars" });
        locSplit = split;
        splitRef.current = split;
        if (split.chars?.length) {
          gsap.to(split.chars, {
            yPercent: -120, opacity: 0,
            stagger: { each: 0.012, from: "random" },
            scrollTrigger: { trigger: sectionRef.current, start: "20% top", end: "75% top", scrub: 0.8 },
          });
        }
      });
    }, sectionRef);
    ctxRef.current = ctx;
    return () => {
      mounted = false;
      cancelAnimationFrame(splitFrame);
      if (locSplit && locLineEl?.isConnected) { try { locSplit.revert(); } catch {} }
      splitRef.current = null;
      ctxRef.current = null; try { ctx.revert(); } catch {}
    };
  }, [service.slug]);

  const heroImg = serviceImageSrc || "/images/hero/hero-night.jpg";

  return (
    <section
      ref={sectionRef}
      data-section="service-detail-hero"
      className="relative overflow-hidden"
      style={{ minHeight: "72vh" }}
    >
      <div ref={bgRef} className="absolute inset-0" style={{ scale: "1.12" }}>
        <Image
          src={heroImg}
          alt=""
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="100vw"
        />
      </div>
      <div
        ref={midRef}
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.52) 55%, rgba(0,0,0,0.88) 100%)",
        }}
      />
      <PrecisionOverlay tone="dark" opacity={0.10} />
      <div ref={headlineRef} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-40 pb-24">
        <div className="mb-6">
          <Link
            href="/services"
            className="font-labels text-[10px] text-gray-400 tracking-[0.18em] uppercase hover:text-white transition-colors inline-flex items-center gap-1"
          >
            ← Services
          </Link>
        </div>
        <div
          ref={hairlineRef}
          className="mb-6"
          style={{ height: 1, background: "#B87333", transformOrigin: "left", maxWidth: "60px" }}
        />
        <span
          className="font-labels text-[10px] text-gray-400 tracking-[0.22em] uppercase block mb-4 hero-meta-animate"
          style={{ animationDelay: "0.1s" }}
        >
          {service.short}
        </span>
        <h1
          className="font-display font-bold text-white tracking-tight leading-[0.88]"
          style={{ fontSize: "clamp(3rem, 7vw, 7rem)" }}
        >
          <span className="block overflow-hidden">
            <span className="hero-line-animate block" style={{ animationDelay: "0.15s" }}>
              {service.title}
            </span>
          </span>
          <span className="block overflow-hidden">
            <span className="loc-line block" style={{ color: "rgba(255,255,255,0.55)" }}>
              {service.slug === "consulting" ? "South Bay, CA" : "In Torrance, CA"}
            </span>
          </span>
        </h1>
        <div className="mt-10 flex items-baseline gap-3">
          <span
            ref={counterRef}
            className="font-numbers font-bold text-[#B87333]"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1 }}
          >
            25+
          </span>
          <span className="font-labels text-[10px] text-gray-400 tracking-[0.18em] uppercase">
            Years Experience
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Section 2: Service Strip ─────────────────────────────────────────────────

function DetailStrip({ slug }: { slug: string }) {
  const labels = STRIP_LABELS[slug] ?? STRIP_LABELS["adu"];
  const doubled = [...labels, ...labels];
  return (
    <div
      className="bg-black border-t border-b border-[#B87333]/20 py-3 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="flex whitespace-nowrap"
        style={{ width: "max-content", animation: "marqueeScroll 18s linear infinite" }}
      >
        {doubled.map((label, i) => (
          <span
            key={i}
            className="font-labels text-[10px] tracking-[0.22em] uppercase px-8"
            style={{ color: i % 2 === 0 ? "#B87333" : "rgba(255,255,255,0.35)" }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: Pinned "Why 828" — page signature ─────────────────────────────
// Signature: PinnedWhy with copper border activation (not opacity fade)
// Panels activate via borderColor snap (copper on active, gray on inactive)
// Counter in top-right snaps 01→04 as panels progress.

const WHY_PANELS = [
  {
    num: "01",
    title: "25+ Years Experience",
    body: "Decades of hands-on building science knowledge applied to your project.",
  },
  {
    num: "02",
    title: "Licensed in California",
    body: `CA License #${SITE.license} — fully insured and compliant with all local codes.`,
  },
  {
    num: "03",
    title: "South Bay Focus",
    body: "We know local codes, contractors, and conditions in Torrance and surrounding cities.",
  },
  {
    num: "04",
    title: "Science-Backed Approach",
    body: "Every decision is grounded in building science, not guesswork or gut feel.",
  },
];

function PinnedWhy() {
  const isMobile = useMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const pinCtxRef = useRef<gsap.Context | null>(null);
  useLayoutEffect(() => () => { if (pinCtxRef.current) { try { pinCtxRef.current.revert(); } catch {} } }, []);

  const setActive = (activeIndex: number) => {
    WHY_PANELS.forEach((_, i) => {
      const panel = panelRefs.current[i];
      const num = numRefs.current[i];
      if (!panel || !num) return;
      const isActive = i === activeIndex;
      const heading = panel.querySelector<HTMLElement>(".why-heading");
      const body = panel.querySelector<HTMLElement>(".why-body");
      if (heading) gsap.to(heading, { color: isActive ? "#ffffff" : "rgba(255,255,255,0.25)", duration: 0.35 });
      if (body) gsap.to(body, { opacity: isActive ? 1 : 0.25, duration: 0.35 });
      gsap.to(num, { color: isActive ? "#B87333" : "rgba(255,255,255,0.25)", duration: 0.35 });
      gsap.to(panel, { borderColor: isActive ? "rgba(184,115,51,0.5)" : "rgba(255,255,255,0.04)", duration: 0.35 });
    });
  };

  useEffect(() => {
    setActive(0);
    if (!AnimationController.shouldAnimate()) return;
    const ctx = gsap.context(() => {
      if (hairlineRef.current && window.innerWidth >= 1024) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", end: "top 30%", scrub: 1 },
        });
      } else if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", once: true },
        });
      }
      if (window.innerWidth < 1024) {
        const panels = wrapperRef.current?.querySelectorAll<HTMLElement>(".why-panel");
        if (panels?.length) {
          gsap.fromTo(panels, { opacity: 0, y: 24 }, {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power3.out",
            scrollTrigger: { trigger: wrapperRef.current, start: "top 72%", once: true },
          });
        }
        return;
      }
      if (counterRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 4, ease: "none",
          scrollTrigger: { trigger: wrapperRef.current, start: "top 40%", end: "bottom 60%", scrub: 1.5 },
          onUpdate: () => {
            if (counterRef.current)
              counterRef.current.textContent = Math.round(obj.val).toString().padStart(2, "0");
          },
        });
      }
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        pin: stickyRef.current,
        start: "top top",
        end: "+=" + window.innerHeight * 1.8,
        scrub: 0.8,
        pinSpacing: false,
        onUpdate: (self) => {
          const p = self.progress;
          if (p < 0.28) setActive(0);
          else if (p < 0.52) setActive(1);
          else if (p < 0.76) setActive(2);
          else setActive(3);
        },
      });
    }, wrapperRef);
    pinCtxRef.current = ctx;
    return () => { pinCtxRef.current = null; try { ctx.revert(); } catch {} };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="bg-black"
      style={{ minHeight: isMobile ? "auto" : "280vh", position: "relative", zIndex: 2 }}
    >
      <div ref={stickyRef} className="flex items-center justify-center lg:sticky lg:top-0" style={{ minHeight: isMobile ? "auto" : "100vh" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full py-16 lg:py-24">
          <div className="flex items-end justify-between mb-10 lg:mb-16">
            <div>
              <div
                ref={hairlineRef}
                className="mb-4"
                style={{ height: 1, background: "#B87333", transformOrigin: "left", maxWidth: "48px" }}
              />
              <h2 className="font-labels text-[10px] text-gray-400 tracking-[0.22em] uppercase">
                Why 828 Construction
              </h2>
            </div>
            <div className="text-right">
              <span
                ref={counterRef}
                className="font-numbers font-bold text-[#B87333]"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1 }}
              >
                04
              </span>
              <span className="font-labels text-[10px] text-gray-400 tracking-[0.14em] uppercase block">
                / 04 Standards
              </span>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-white/[0.04]">
            {WHY_PANELS.map((panel, i) => (
              <div
                key={panel.num}
                ref={(el) => { panelRefs.current[i] = el; }}
                className="why-panel border border-transparent py-6 lg:py-8"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-start gap-5 lg:gap-8">
                  <span
                    ref={(el) => { numRefs.current[i] = el; }}
                    className="font-numbers font-bold flex-shrink-0"
                    aria-hidden="true"
                    style={{
                      fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                      color: i === 0 ? "#B87333" : "rgba(255,255,255,0.25)",
                      lineHeight: 1,
                    }}
                  >
                    {panel.num}
                  </span>
                  <div>
                    <h3
                      className="why-heading font-display font-bold mb-3 tracking-tight"
                      style={{
                        fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                        color: i === 0 ? "#ffffff" : "rgba(255,255,255,0.25)",
                      }}
                    >
                      {panel.title}
                    </h3>
                    <p className="why-body text-gray-400 leading-relaxed" style={{ opacity: i === 0 ? 1 : 0.25 }}>
                      {panel.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 4: Main Content + Sidebar ───────────────────────────────────────

function DetailContent({
  service,
  nextService,
  keywords,
  aduFaq,
  serviceImageSrc,
  serviceImageCaption,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const imagePaneRef = useRef<HTMLDivElement>(null);
  const imgInnerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const h2Ref = useRef<HTMLHeadingElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const h2SplitRef = useRef<SplitType | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  useLayoutEffect(() => () => { if (h2SplitRef.current) { try { h2SplitRef.current.revert(); } catch {} } try { ctxRef.current?.revert(); } catch {} }, []);

  useEffect(() => {
    if (!AnimationController.shouldAnimate()) return;
    let mounted = true;
    let h2SplitFrame = -1;
    const h2El: HTMLHeadingElement | null = h2Ref.current;
    let h2LocalSplit: SplitType | null = null;
    const ctx = gsap.context(() => {
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", end: "top 40%", scrub: 1 },
        });
      }
      if (imagePaneRef.current) {
        gsap.fromTo(imagePaneRef.current, { clipPath: "inset(0% 100% 0% 0%)" }, {
          clipPath: "inset(0% 0% 0% 0%)", ease: "none",
          scrollTrigger: { trigger: imagePaneRef.current, start: "top 80%", end: "top 30%", scrub: 1.2 },
        });
      }
      if (imgInnerRef.current) {
        gsap.fromTo(imgInnerRef.current, { scale: 1.08 }, {
          scale: 1.0, ease: "none",
          scrollTrigger: { trigger: imagePaneRef.current, start: "top 80%", end: "top 20%", scrub: 1.5 },
        });
      }
      if (h2El) {
        const _h2 = h2El;
        h2SplitFrame = requestAnimationFrame(() => {
          if (!mounted || !_h2.isConnected) return;
          const split = new SplitType(_h2, { types: "words,chars" });
          h2LocalSplit = split;
          h2SplitRef.current = split;
          if (split.chars?.length) {
            gsap.fromTo(split.chars, { opacity: 0, yPercent: 40 }, {
              opacity: 1, yPercent: 0,
              stagger: { each: 0.025 }, ease: "none",
              scrollTrigger: { trigger: _h2, start: "top 85%", end: "top 45%", scrub: 1 },
            });
          }
        });
      }
      const mainEls = sectionRef.current?.querySelectorAll<HTMLElement>(".main-el");
      if (mainEls?.length) {
        mainEls.forEach((el) => {
          gsap.fromTo(el, { y: 28, opacity: 0 }, {
            y: 0, opacity: 1, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", end: "top 52%", scrub: 1.2 },
          });
        });
      }
      const sideEls = sidebarRef.current?.querySelectorAll<HTMLElement>(".side-el");
      if (sideEls?.length) {
        sideEls.forEach((el) => {
          gsap.fromTo(el, { y: 24, opacity: 0 }, {
            y: 0, opacity: 1, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", end: "top 55%", scrub: 1.2 },
          });
        });
      }
    }, sectionRef);
    ctxRef.current = ctx;
    return () => {
      mounted = false;
      cancelAnimationFrame(h2SplitFrame);
      if (h2LocalSplit && h2El?.isConnected) { try { h2LocalSplit.revert(); } catch {} }
      h2SplitRef.current = null;
      ctxRef.current = null; try { ctx.revert(); } catch {}
    };
  }, [service.slug]);

  return (
    <section
      ref={sectionRef}
      data-section="service-detail-content"
      className="bg-white py-16 lg:py-24"
      style={{ position: "relative", zIndex: 3, marginTop: "-5vh" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={hairlineRef}
          className="mb-10 lg:mb-16"
          style={{ height: 1, background: "#B87333", transformOrigin: "left", maxWidth: "60px" }}
        />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">

          {/* ── Main Column ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <p className="main-el mb-10 text-lg leading-relaxed text-gray-600 lg:mb-12 lg:text-xl">
              {service.description}
            </p>
            <h2 ref={h2Ref} className="font-display font-bold text-2xl text-black mb-6 tracking-tight">
              What&apos;s Included
            </h2>
            <ul className="main-el mb-12 space-y-4 lg:mb-16">
              {service.details.map((detail) => (
                <li key={detail} className="flex items-start gap-4 group">
                  <span
                    className="w-px h-4 flex-shrink-0 mt-1.5 transition-colors duration-200 group-hover:bg-[#B87333]"
                    style={{ background: "rgba(184,115,51,0.6)" }}
                  />
                  <span className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-200">
                    {detail}
                  </span>
                </li>
              ))}
            </ul>

            {aduFaq && aduFaq.length > 0 && (
              <div className="main-el mb-12 border-t border-gray-100 pt-10 lg:mb-16 lg:pt-12">
                <h2 className="font-display font-bold text-2xl text-black mb-8 tracking-tight">
                  ADU Questions &amp; Answers
                </h2>
                <div className="space-y-6">
                  {aduFaq.map((item) => (
                    <div key={item.q} className="border-b border-gray-100 pb-6">
                      <h3 className="font-display font-bold text-base text-black mb-3">{item.q}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {keywords.length > 0 && (
              <div className="main-el border-t border-gray-100 pt-8">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="font-labels text-[10px] text-gray-500 border border-gray-200 px-3 py-1 tracking-[0.1em] hover:border-[#B87333]/60 hover:text-gray-700 transition-colors duration-200 cursor-default"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <div ref={sidebarRef} className="space-y-6">
            {serviceImageSrc && (
              <div ref={imagePaneRef} className="relative overflow-hidden" style={{ height: "280px" }}>
                <div ref={imgInnerRef} className="absolute inset-0" style={{ scale: "1.08" }}>
                  <Image
                    src={serviceImageSrc}
                    alt={`828 Construction — ${service.title}`}
                    fill
                    className="object-cover project-img"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {serviceImageCaption && (
                  <div className="absolute bottom-4 left-4">
                    <span className="font-labels text-[9px] text-white/60 tracking-[0.18em] uppercase">
                      {serviceImageCaption}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CTA — anchor to on-page form */}
            <div className="side-el bg-black p-8">
              <h3 className="font-display font-bold text-lg text-white mb-4">
                Get a Free Estimate
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Ready to discuss your {service.title.toLowerCase()} project?
                We&apos;ll get back to you within 24 hours.
              </p>
              <MagneticButton strength={0.3}>
                <a
                  href="#get-estimate"
                  className="btn-shine btn-lift block text-center bg-white text-black px-5 py-3 font-labels text-[10px] tracking-[0.18em] uppercase hover:bg-[#B87333] hover:text-white transition-colors mb-4"
                >
                  Request Estimate
                </a>
              </MagneticButton>
              <a
                href={SITE.phoneHref}
                className="block text-center border border-gray-700 text-white px-5 py-3 font-labels text-[10px] tracking-[0.18em] uppercase hover:border-white transition-colors font-numbers"
              >
                {SITE.phone}
              </a>
            </div>

            {/* Service area */}
            <div className="side-el border border-gray-200 p-8">
              <div className="font-labels text-[9px] text-gray-500 tracking-[0.2em] uppercase mb-4">
                Service Area
              </div>
              <div className="space-y-2">
                {SITE.serviceArea.map((city) => (
                  <div key={city} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full" />
                    <span className="text-sm text-gray-500">{city}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next service */}
            <div className="side-el border border-gray-200 p-8">
              <div className="font-labels text-[9px] text-gray-500 tracking-[0.2em] uppercase mb-4">
                Next Service
              </div>
              <Link href={`/services/${nextService.slug}`} className="group block">
                <div className="font-display font-bold text-black group-hover:text-gray-600 transition-colors mb-1">
                  {nextService.title}
                </div>
                <div className="font-labels text-[10px] text-gray-500 tracking-[0.15em] uppercase">
                  {nextService.short} →
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 5: Qualifier ─────────────────────────────────────────────────────
// "You need this if..." — editorial list, dark bg

function QualifierSection({ slug }: { slug: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitType | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => () => {
    if (splitRef.current) { try { splitRef.current.revert(); } catch {} }
    try { ctxRef.current?.revert(); } catch {}
  }, []);

  useEffect(() => {
    if (!AnimationController.shouldAnimate()) return;
    let mounted = true;
    let splitFrame = -1;
    let headlineSplit: SplitType | null = null;
    const headlineEl = headlineRef.current;

    const ctx = gsap.context(() => {
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 55%", scrub: 1 },
        });
      }

      if (headlineEl) {
        const _el = headlineEl;
        splitFrame = requestAnimationFrame(() => {
          if (!mounted || !_el.isConnected) return;
          const split = new SplitType(_el, { types: "words,chars" });
          headlineSplit = split;
          splitRef.current = split;
          if (split.chars?.length) {
            gsap.fromTo(split.chars, { opacity: 0, yPercent: 60 }, {
              opacity: 1, yPercent: 0,
              stagger: { each: 0.03, from: "start" }, ease: "none",
              scrollTrigger: { trigger: sectionRef.current, start: "top 78%", end: "top 38%", scrub: 1.2 },
            });
          }
        });
      }

      // Per-item scrub reveal (Fix 15: each item reveals as you scroll past it)
      const items = sectionRef.current?.querySelectorAll<HTMLElement>(".qualifier-item");
      if (items?.length) {
        items.forEach((item) => {
          gsap.fromTo(item, { opacity: 0, x: -20 }, {
            opacity: 1, x: 0, ease: "power2.out",
            scrollTrigger: { trigger: item, start: "top 85%", end: "top 55%", scrub: 1.2 },
          });
        });
      }
    }, sectionRef);

    ctxRef.current = ctx;
    return () => {
      mounted = false;
      cancelAnimationFrame(splitFrame);
      if (headlineSplit && headlineEl?.isConnected) { try { headlineSplit.revert(); } catch {} }
      splitRef.current = null;
      ctxRef.current = null;
      try { ctx.revert(); } catch {}
    };
  }, [slug]);

  const items = QUALIFIER_ITEMS[slug] ?? QUALIFIER_ITEMS["adu"];

  return (
    <section
      ref={sectionRef}
      data-section="service-qualifier"
      className="py-24 lg:py-32"
      style={{ background: "#0a0a0a" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={hairlineRef}
          className="mb-10"
          style={{ height: 1, background: "#B87333", opacity: 0.45, transformOrigin: "left", maxWidth: "60px" }}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: headline */}
          <div className="lg:col-span-5">
            <span className="font-labels text-[10px] text-gray-500 tracking-[0.22em] uppercase block mb-4">
              Is This Right for You?
            </span>
            <h2
              ref={headlineRef}
              className="font-display font-bold text-white tracking-tight leading-[0.92]"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)" }}
            >
              You need this if.
            </h2>
          </div>

          {/* Right: qualifier items */}
          <div className="lg:col-span-7">
            <ul className="space-y-0 divide-y divide-white/[0.06]">
              {items.map((item, i) => (
                <li key={i} className="qualifier-item flex items-start gap-6 py-7 group">
                  <span
                    className="font-numbers font-bold flex-shrink-0 leading-none mt-1"
                    aria-hidden="true"
                    style={{
                      fontSize: "clamp(1rem, 1.8vw, 1.3rem)",
                      color: "#B87333",
                      opacity: 0.5,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p
                    className="text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-200"
                    style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)" }}
                  >
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 6: Featured Work ─────────────────────────────────────────────────
// Projects filtered by service category — clip-path reveal + parallax

function FeaturedWork({ slug }: { slug: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctxRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => () => { try { ctxRef.current?.revert(); } catch {} }, []);

  const category = CATEGORY_MAP[slug] ?? "ADU Construction";
  const categoryProjects = PROJECTS.filter((p) => p.category === category);
  // Prefer featured, take up to 3
  const featured = categoryProjects.filter((p) => p.featured);
  const rest = categoryProjects.filter((p) => !p.featured);
  const projects = [...featured, ...rest].slice(0, 3);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Fix 14: set initial clip-path BEFORE gate so mobile can clear it
    cardWrapperRefs.current.forEach((wrap) => {
      if (wrap) gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
    });

    if (!AnimationController.shouldAnimate()) {
      // Mobile: immediately reveal all cards (Fix 14 mobile branch)
      cardWrapperRefs.current.forEach((wrap) => {
        if (wrap) gsap.set(wrap, { clipPath: "inset(0% 0 0 0)" });
      });
      return;
    }

    const ctx = gsap.context(() => {
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 55%", scrub: 1 },
        });
      }

      // Per-card clip-path reveal (scrubbed, not once)
      cardWrapperRefs.current.forEach((wrap, i) => {
        if (!wrap) return;
        gsap.fromTo(wrap, { clipPath: "inset(100% 0 0 0)" }, {
          clipPath: "inset(0% 0 0 0)", ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top 88%",
            end: "top 42%",
            scrub: 1.2 + i * 0.1,
          },
        });
      });

      // Parallax on each image inner (Pattern F)
      imgInnerRefs.current.forEach((inner) => {
        if (!inner) return;
        gsap.to(inner, {
          yPercent: -10, ease: "none",
          scrollTrigger: { trigger: inner.parentElement, start: "top bottom", end: "bottom top", scrub: 1.5 },
        });
      });
    }, sectionRef);

    ctxRef.current = ctx;
    return () => { ctxRef.current = null; try { ctx.revert(); } catch {} };
  }, [slug]);

  if (projects.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      data-section="service-featured-work"
      className="bg-black py-24 lg:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={hairlineRef}
          className="mb-10"
          style={{ height: 1, background: "#B87333", opacity: 0.45, transformOrigin: "left", maxWidth: "60px" }}
        />
        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="font-labels text-[10px] text-gray-500 tracking-[0.22em] uppercase block mb-3">
              Featured Work
            </span>
            <h2
              ref={headlineRef}
              className="font-display font-bold text-white tracking-tight leading-[0.92]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
            >
              Work that speaks first.
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="hidden sm:inline-flex items-center gap-2 font-labels text-[10px] text-gray-400 tracking-[0.18em] uppercase border-b border-transparent hover:border-[#B87333] hover:text-[#B87333] transition-colors duration-200 group"
          >
            All Projects
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Projects grid */}
        <div
          className={`grid gap-[2px] grid-cols-1 ${
            projects.length === 1
              ? "md:grid-cols-1"
              : projects.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-3"
          }`}
        >
          {projects.map((project, i) => (
            <div key={project.id} className="group relative">
              {/* Card wrapper — clip-path reveal (Fix 14 + Fix 17) */}
              <div
                ref={(el) => { cardWrapperRefs.current[i] = el; }}
                data-gsap-reveal="true"
                className="relative overflow-hidden"
                style={{ aspectRatio: i === 0 && projects.length === 3 ? "3/4" : "4/3" }}
              >
                {/* Parallax image inner */}
                <div
                  ref={(el) => { imgInnerRefs.current[i] = el; }}
                  className="absolute inset-x-0"
                  style={{ top: "-7.5%", height: "115%" }}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ filter: "contrast(1.05) saturate(1.08)" }}
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
                  }}
                />
                {/* Copper hover bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-transform duration-300 origin-left"
                  style={{
                    height: 2,
                    background: "#B87333",
                    transform: "scaleX(0)",
                  }}
                  data-copper-bar
                />
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="font-labels text-[9px] text-white/40 tracking-[0.2em] uppercase mb-1.5">
                    {project.category} · {project.location}
                  </div>
                  <div
                    className="font-display font-bold text-white leading-tight"
                    style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.1rem)" }}
                  >
                    {project.title}
                  </div>
                  <div className="font-labels text-[9px] text-white/50 tracking-[0.12em] mt-1">
                    {project.spec}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:hidden">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 font-labels text-[10px] text-gray-400 tracking-[0.18em] uppercase border-b border-transparent hover:border-[#B87333] hover:text-[#B87333] transition-colors duration-200 group"
          >
            All Projects
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Section 7: Process Snapshot ─────────────────────────────────────────────
// Service-specific steps — horizontal timeline on desktop, vertical list on mobile

function ProcessSnapshot({ slug, title }: { slug: string; title: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => () => { try { ctxRef.current?.revert(); } catch {} }, []);

  useEffect(() => {
    if (!AnimationController.shouldAnimate()) return;

    const ctx = gsap.context(() => {
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 55%", scrub: 1 },
        });
      }

      // Per-step scrub reveal (Fix 15: each step reveals as user scrolls)
      const steps = sectionRef.current?.querySelectorAll<HTMLElement>(".process-step");
      if (steps?.length) {
        steps.forEach((step) => {
          gsap.fromTo(step, { opacity: 0, y: 28 }, {
            opacity: 1, y: 0, ease: "power2.out",
            scrollTrigger: { trigger: step, start: "top 82%", end: "top 50%", scrub: 1.2 },
          });
        });
      }

      // Connector line grows left-to-right on desktop
      const connector = sectionRef.current?.querySelector<HTMLElement>(".step-connector");
      if (connector) {
        gsap.fromTo(connector, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 60%", end: "bottom 60%", scrub: 1.5 },
        });
      }
    }, sectionRef);

    ctxRef.current = ctx;
    return () => { ctxRef.current = null; try { ctx.revert(); } catch {} };
  }, [slug]);

  const steps = SERVICE_PROCESS[slug] ?? SERVICE_PROCESS["adu"];

  return (
    <section
      ref={sectionRef}
      data-section="service-process-snapshot"
      className="relative overflow-hidden bg-white py-24 lg:py-32"
    >
      <PrecisionOverlay tone="light" opacity={0.08} />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={hairlineRef}
          className="mb-10"
          style={{ height: 1, background: "#B87333", opacity: 0.45, transformOrigin: "left", maxWidth: "60px" }}
        />

        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="font-labels text-[10px] text-gray-500 tracking-[0.22em] uppercase block mb-3">
              How It Works
            </span>
            <h2
              className="font-display font-bold text-black tracking-tight leading-[0.92]"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
            >
              {title}: start to finish.
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="hidden sm:inline-flex items-center gap-2 font-labels text-[10px] text-gray-500 tracking-[0.18em] uppercase border-b border-transparent hover:border-[#B87333] hover:text-[#B87333] transition-colors duration-200 group"
          >
            Full Process
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Desktop: horizontal steps with connector line */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Horizontal connector */}
            <div
              className="step-connector absolute top-[2.2rem] left-0 right-0 hidden md:block"
              style={{
                height: 1,
                background: "rgba(184,115,51,0.25)",
                transformOrigin: "left",
              }}
              aria-hidden="true"
            />
            <div className="grid grid-cols-4 gap-8 relative">
              {steps.map((step, i) => (
                <div key={step.num} className="process-step">
                  <div
                    className="font-numbers font-bold mb-5 relative inline-block"
                    style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "#B87333", lineHeight: 1 }}
                    aria-hidden="true"
                  >
                    {step.num}
                    {/* Node dot on connector */}
                    <span
                      className="absolute -bottom-[1.2rem] left-3 w-2 h-2 rounded-full"
                      style={{ background: i === 0 ? "#B87333" : "rgba(184,115,51,0.4)" }}
                      aria-hidden="true"
                    />
                  </div>
                  <h3
                    className="font-display font-bold text-black mb-3 tracking-tight"
                    style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical list */}
        <div className="md:hidden">
          <div className="relative">
            {/* Vertical connector */}
            <div
              className="absolute left-[0.9rem] top-8"
              style={{
                width: 1,
                bottom: "1.5rem",
                background: "linear-gradient(to bottom, rgba(184,115,51,0.5), rgba(184,115,51,0.06))",
              }}
              aria-hidden="true"
            />
            <div className="space-y-0">
              {steps.map((step) => (
                <div key={step.num} className="process-step flex items-start gap-5 py-8 border-b border-gray-100 last:border-0">
                  <span
                    className="font-numbers font-bold flex-shrink-0 relative z-10 bg-white pr-1"
                    style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)", color: "#B87333", lineHeight: 1 }}
                    aria-hidden="true"
                  >
                    {step.num}
                  </span>
                  <div>
                    <h3
                      className="font-display font-bold text-black mb-2 tracking-tight"
                      style={{ fontSize: "clamp(1rem, 2vw, 1.1rem)" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 8: Embedded Contact Form ────────────────────────────────────────
// Service-specific — pre-filled service_type, address field, copper focus

function ServiceContactFormSection({ service }: { service: ServiceData }) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => () => { try { ctxRef.current?.revert(); } catch {} }, []);

  useEffect(() => {
    if (!AnimationController.shouldAnimate()) return;
    const ctx = gsap.context(() => {
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 55%", scrub: 1 },
        });
      }
      const leftEls = leftRef.current?.querySelectorAll<HTMLElement>(".ctf-el");
      if (leftEls?.length) {
        gsap.fromTo(leftEls, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: leftRef.current, start: "top 75%", once: true },
        });
      }
      const rightEls = rightRef.current?.querySelectorAll<HTMLElement>(".ctf-right-el");
      if (rightEls?.length) {
        gsap.fromTo(rightEls, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.1, delay: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: rightRef.current, start: "top 75%", once: true },
        });
      }
    }, sectionRef);
    ctxRef.current = ctx;
    return () => { ctxRef.current = null; try { ctx.revert(); } catch {} };
  }, [service.slug]);

  return (
    <section
      ref={sectionRef}
      id="get-estimate"
      data-section="service-contact-form"
      className="bg-black py-24 lg:py-32"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={hairlineRef}
          className="mb-10"
          style={{ height: 1, background: "#B87333", opacity: 0.45, transformOrigin: "left", maxWidth: "60px" }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* ── Left: trust + contact info ────────────────────────────────── */}
          <div ref={leftRef}>
            <span className="ctf-el font-labels text-[10px] text-gray-500 tracking-[0.22em] uppercase block mb-4">
              Start Here
            </span>
            <h2
              className="ctf-el font-display font-bold text-white tracking-tight leading-[0.9] mb-8"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
            >
              Ready to move forward?
            </h2>
            <p className="ctf-el text-gray-400 leading-relaxed mb-10" style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)" }}>
              Fill out the form and Joe will review your{" "}
              {service.title.toLowerCase()} project personally. The estimate is
              free. Whether you know exactly what you need or you&apos;re still
              figuring it out — start here.
            </p>

            {/* Phone — primary CTA */}
            <div className="ctf-el mb-10">
              <div className="font-labels text-[9px] text-gray-500 tracking-[0.2em] uppercase mb-3">
                Prefer to Call?
              </div>
              <a
                href={SITE.phoneHref}
                className="inline-flex items-center gap-3 group"
                style={{ minHeight: 48 }}
                aria-label={`Call 828 Construction at ${SITE.phone}`}
              >
                <span
                  className="font-numbers font-bold text-white group-hover:text-[#B87333] transition-colors duration-200 leading-none"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                >
                  {SITE.phone}
                </span>
              </a>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                Joe answers personally. For urgent issues, call directly.
              </p>
            </div>

            {/* What happens after */}
            <div className="ctf-el">
              <div className="font-labels text-[9px] text-gray-500 tracking-[0.22em] uppercase mb-5">
                What Happens After You Send a Message
              </div>
              <div className="relative">
                <div
                  className="absolute left-4 top-6"
                  style={{
                    width: 1,
                    bottom: "1.5rem",
                    background: "linear-gradient(to bottom, rgba(184,115,51,0.55), rgba(184,115,51,0.06))",
                  }}
                  aria-hidden="true"
                />
                <div className="space-y-5">
                  {[
                    "Joe reviews your message personally.",
                    "You receive a response within 24 hours — often same day.",
                    "We schedule a brief call to understand your project.",
                    "If it&apos;s a fit, we arrange a site visit and provide a detailed estimate.",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <span
                        className="font-numbers font-bold leading-none flex-shrink-0 w-8 bg-black relative z-10"
                        style={{ color: "#B87333", fontSize: "clamp(1.1rem, 2vw, 1.3rem)", paddingRight: "0.2rem" }}
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p
                        className="text-gray-500 text-sm leading-relaxed pt-0.5"
                        dangerouslySetInnerHTML={{ __html: text }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: form ───────────────────────────────────────────────── */}
          <div ref={rightRef}>
            <div className="ctf-right-el font-labels text-[10px] text-gray-500 tracking-[0.22em] uppercase mb-8">
              {service.title} Inquiry
            </div>
            <div className="ctf-right-el">
              <ServicePageContactForm serviceTitle={service.title} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 9: Related Services ─────────────────────────────────────────────
// "Three services, one standard" footer strip

function RelatedServices({ slug }: { slug: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => () => { try { ctxRef.current?.revert(); } catch {} }, []);

  useEffect(() => {
    if (!AnimationController.shouldAnimate()) return;
    const ctx = gsap.context(() => {
      if (hairlineRef.current) {
        gsap.fromTo(hairlineRef.current, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 55%", scrub: 1 },
        });
      }
      const cards = sectionRef.current?.querySelectorAll<HTMLElement>(".related-card");
      if (cards?.length) {
        gsap.fromTo(cards, { opacity: 0, y: 28 }, {
          opacity: 1, y: 0, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%", end: "top 40%", scrub: 1.2 },
        });
      }
    }, sectionRef);
    ctxRef.current = ctx;
    return () => { ctxRef.current = null; try { ctx.revert(); } catch {} };
  }, [slug]);

  const others = SERVICES.filter((s) => s.slug !== slug);

  return (
    <section
      ref={sectionRef}
      data-section="service-related"
      className="py-20 lg:py-24"
      style={{ background: "#0a0a0a" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={hairlineRef}
          className="mb-10"
          style={{ height: 1, background: "#B87333", opacity: 0.35, transformOrigin: "left", maxWidth: "48px" }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Label */}
          <div className="flex-shrink-0">
            <span className="font-labels text-[9px] text-gray-500 tracking-[0.22em] uppercase block mb-2">
              Three Services, One Standard
            </span>
            <p className="font-display font-bold text-white" style={{ fontSize: "clamp(1rem, 2vw, 1.3rem)" }}>
              Also offering:
            </p>
          </div>

          {/* Service cards */}
          <div className="flex flex-col sm:flex-row gap-0 sm:gap-[1px] flex-1 max-w-2xl">
            {others.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="related-card group flex-1 border border-white/[0.06] p-7 hover:border-[#B87333]/40 transition-colors duration-300 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <span className="font-labels text-[9px] text-gray-500 tracking-[0.22em] uppercase">
                    {service.short}
                  </span>
                  <span
                    className="font-labels text-[9px] text-gray-600 tracking-[0.1em] transition-colors duration-200 group-hover:text-[#B87333]"
                  >
                    →
                  </span>
                </div>
                <h3
                  className="font-display font-bold text-white group-hover:text-[#B87333] transition-colors duration-200 tracking-tight"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.3rem)" }}
                >
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ServiceDetailContent(props: Props) {
  return (
    <>
      <DetailHero service={props.service} serviceImageSrc={props.serviceImageSrc} />
      <DetailStrip slug={props.service.slug} />
      <PinnedWhy />
      <DetailContent {...props} />
      <QualifierSection slug={props.service.slug} />
      <FeaturedWork slug={props.service.slug} />
      <ProcessSnapshot slug={props.service.slug} title={props.service.title} />
      <ServiceContactFormSection service={props.service} />
      <RelatedServices slug={props.service.slug} />
    </>
  );
}
