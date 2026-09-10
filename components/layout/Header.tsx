"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, SERVICES, SITE } from "@/lib/constants";

type HeaderSurface = "dark-transparent" | "dark-solid" | "light-solid";

function sectionHasMedia(el: Element) {
  return (
    el.matches("[data-header-transparent], [data-header-media]") ||
    el.closest("img, picture, video, canvas, [data-header-media]") !== null
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [surface, setSurface] = useState<HeaderSurface>("dark-transparent");
  const [lightInk, setLightInk] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lightInkRef = useRef(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const torTimeRef = useRef<HTMLSpanElement>(null);
  const mobileModalRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const desktopServicesButtonRef = useRef<HTMLAnchorElement>(null);
  const desktopServicesMenuRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HeaderSurface>("dark-transparent");
  const pathname = usePathname();

  useEffect(() => {
    let raf = 0;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    // The header follows the surface currently passing beneath it. Photo/hero
    // sections stay transparent at any scroll depth; black and cream sections
    // become solid as soon as they cover the bar.
    const readSurface = (): HeaderSurface => {
      const headerHeight = window.matchMedia("(min-width: 1024px)").matches ? 52 : 48;
      const y = Math.min(window.innerHeight - 1, headerHeight - 6);
      const footerSurface = document.querySelector<HTMLElement>("[data-footer-surface]");
      if (footerSurface) {
        const footerRect = footerSurface.getBoundingClientRect();
        if (footerRect.top <= headerHeight + 1 && footerRect.bottom > 0) return "dark-solid";
      }
      const readAtPoint = (x: number): HeaderSurface | null => {
        const stack = document.elementsFromPoint(x, y);
        for (const el of stack) {
          if (el.closest("header")) continue;
          if (el.closest("[data-stack-surface][data-stack-covered]")) continue;

          const transparent = el.closest("[data-header-transparent]");
          if (transparent) return "dark-transparent";

          const light = el.closest("[data-header-light]");
          if (light) return "light-solid";

          const dark = el.closest("[data-header-dark]");
          if (dark) {
            return sectionHasMedia(dark) ? "dark-transparent" : "dark-solid";
          }
        }
        return null;
      };

      const centerSurface = readAtPoint(window.innerWidth * 0.5);
      if (centerSurface) return centerSurface;

      return window.scrollY < 32 ? "dark-transparent" : "dark-solid";
    };

    const checkZone = () => {
      const next = readSurface();
      if (surfaceRef.current === next) return;
      surfaceRef.current = next;
      setSurface(next);
    };

    const syncHeader = () => {
      raf = 0;
      const currentY = window.scrollY;
      if (progressRef.current) {
        const doc = document.documentElement;
        const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
        progressRef.current.style.transform = `scaleX(${Math.min(currentY / max, 1).toFixed(4)})`;
      }
      checkZone();
    };

    const scheduleSync = () => {
      if (raf) return;
      raf = requestAnimationFrame(syncHeader);
    };

    const scheduleSettledSyncs = () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(scheduleSync, 220);
    };

    const onScroll = () => {
      scheduleSync();
      scheduleSettledSyncs();
    };

    syncHeader();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });
    const mutationObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(scheduleSync)
        : null;
    mutationObserver?.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-stack-covered"],
      subtree: true,
    });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleSync);
      mutationObserver?.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMobileOpen(false);
      setMobileServicesOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeMobileMenu = () => {
      if (!desktop.matches) return;
      setMobileOpen(false);
      setMobileServicesOpen(false);
    };
    desktop.addEventListener("change", closeMobileMenu);
    return () => desktop.removeEventListener("change", closeMobileMenu);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const background = [
      document.querySelector<HTMLElement>(".skip-link"),
      document.querySelector<HTMLElement>("#main-content"),
      document.querySelector<HTMLElement>("[data-footer-surface]"),
    ].filter((element): element is HTMLElement => Boolean(element));
    const previous = background.map((element) => element.inert);
    background.forEach((element) => {
      element.inert = true;
    });

    return () => {
      background.forEach((element, index) => {
        element.inert = previous[index];
      });
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const menu = mobileMenuRef.current;
    const modal = mobileModalRef.current;
    const toggle = mobileMenuButtonRef.current;
    if (!menu || !modal || !toggle) return;

    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const frame = requestAnimationFrame(() => {
      menu.querySelector<HTMLElement>(focusableSelector)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        setMobileServicesOpen(false);
        requestAnimationFrame(() => toggle.focus());
        return;
      }

      if (event.key !== "Tab") return;
      const focusables = Array.from(
        modal.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeIndex = focusables.indexOf(
        document.activeElement as HTMLElement
      );
      const next = event.shiftKey
        ? activeIndex <= 0
          ? last
          : focusables[activeIndex - 1]
        : activeIndex < 0 || activeIndex === focusables.length - 1
          ? first
          : focusables[activeIndex + 1];
      event.preventDefault();
      next.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  // Keep the live clock out of React's render path while the page is scrolling.
  useEffect(() => {
    const update = () => {
      if (!torTimeRef.current) return;
      const time = new Date().toLocaleTimeString("en-US", {
          timeZone: "America/Los_Angeles",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });
      torTimeRef.current.textContent = `Torrance · ${time}`;
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const isServicesActive =
    pathname === "/services" || pathname.startsWith("/services/");

  // Light header mode — whenever a light-marked surface is under the bar, and
  // never while the (black) mobile menu overlay is open.
  const light = surface === "light-solid" && !mobileOpen;
  const transparent = surface === "dark-transparent" && !mobileOpen;

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const commitInk = (next: boolean) => {
      if (lightInkRef.current === next) return;
      lightInkRef.current = next;
      setLightInk(next);
    };
    if (reducedMotion) {
      frame = requestAnimationFrame(() => commitInk(light));
      return () => cancelAnimationFrame(frame);
    }

    const samplePaintedSurface = () => {
      const header = headerRef.current;
      if (!header) return;
      const channels = getComputedStyle(header).backgroundColor.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return;
      const [red, green, blue] = channels.map(Number);
      const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      commitInk(luminance >= 116);
    };
    samplePaintedSurface();
    const sampleTimer = setInterval(samplePaintedSurface, 48);
    const stopTimer = setTimeout(() => {
      clearInterval(sampleTimer);
      commitInk(light);
    }, 680);
    return () => {
      clearInterval(sampleTimer);
      clearTimeout(stopTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [light]);

  // Media headers retain the scene beneath them. A restrained blur softens the
  // editorial rail at the top edge without turning the bar into a black slab.
  const backgroundAlpha = mobileOpen ? 0.96 : light ? 0.88 : transparent ? 0.3 : 0.74;
  const borderAlpha = transparent ? 0.1 : 0.12;
  const progressOpacity = transparent ? 0.78 : 0.95;
  const inkBase = lightInk ? "text-black/60 hover:text-black" : "text-white/60 hover:text-white";
  const inkActive = lightInk ? "text-black" : "text-white";

  return (
    <div
      ref={mobileModalRef}
      role={mobileOpen ? "dialog" : undefined}
      aria-modal={mobileOpen ? "true" : undefined}
      aria-label={mobileOpen ? "Site navigation" : undefined}
      className={mobileOpen ? "fixed inset-0 z-[80]" : undefined}
    >
      <motion.header
        ref={headerRef}
        data-header-surface={surface}
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          transform: "translateY(0)",
          backgroundColor: light
            ? `rgba(247,247,243,${backgroundAlpha})`
            : `rgba(5,5,5,${backgroundAlpha})`,
          borderBottom: `1px solid ${
            light
              ? `rgba(0,0,0,${borderAlpha})`
              : `rgba(255,255,255,${borderAlpha})`
          }`,
          backdropFilter: "blur(16px) saturate(1.1)",
          WebkitBackdropFilter: "blur(16px) saturate(1.1)",
          boxShadow: light
            ? "0 8px 26px rgba(24,24,20,0.035)"
            : "0 8px 28px rgba(0,0,0,0.12)",
        }}
        className="fixed top-0 left-0 right-0 z-[80] transition-[background-color,border-color] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0"
      >
        <div className="w-full px-4 lg:px-8 2xl:px-10">
          <div
            className="flex h-12 items-center justify-between lg:h-[52px] lg:grid lg:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] lg:gap-10"
          >
            {/* Clean digital wordmark based on the owner's shirt reference. It
                is inverted on light sections so one transparent asset works
                on every surface. */}
            <Link
              href="/"
              aria-label="828CONSTRUCTION"
              className="flex min-h-11 shrink-0 items-center"
              onClick={() => {
                if (pathname === "/") window.scrollTo(0, 0);
              }}
            >
              <Image
                src="/images/logo/828construction-reference-clean-v3-white.png"
                alt=""
                width={4980}
                height={800}
                priority
                className="h-[25px] w-auto min-[390px]:h-[26px] sm:h-7 lg:h-[29px]"
                style={{
                  filter: lightInk ? "invert(1)" : "none",
                  transition: "filter 520ms cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Primary navigation" className="hidden lg:flex items-center justify-center gap-8">
              {NAV_LINKS.map((link) => {
                if (link.href === "/services") {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => setServicesOpen(true)}
                      onMouseLeave={() => setServicesOpen(false)}
                      onFocusCapture={() => setServicesOpen(true)}
                      onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) {
                          setServicesOpen(false);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setServicesOpen(true);
                          requestAnimationFrame(() => {
                            desktopServicesMenuRef.current
                              ?.querySelector<HTMLAnchorElement>("a[href]")
                              ?.focus();
                          });
                        } else if (event.key === "Escape") {
                          event.preventDefault();
                          desktopServicesButtonRef.current?.focus();
                          requestAnimationFrame(() => setServicesOpen(false));
                        }
                      }}
                    >
                      {/* Trigger */}
                      <Link
                        ref={desktopServicesButtonRef}
                        href="/services"
                        aria-haspopup="true"
                        aria-expanded={servicesOpen}
                        aria-controls="desktop-services-menu"
                        aria-current={isServicesActive ? "page" : undefined}
                        className={`relative flex min-h-11 items-center gap-1.5 font-labels text-[10px] uppercase tracking-[0.18em] transition-colors duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 ${
                          isServicesActive ? inkActive : inkBase
                        }`}
                      >
                        {link.label}
                        <span
                          className={`absolute -bottom-1 left-0 right-0 h-px transition-transform duration-300 origin-left ${
                            isServicesActive
                              ? "bg-[var(--color-accent)] scale-x-100"
                              : `${lightInk ? "bg-black" : "bg-white"} origin-left transition-transform duration-300 ${servicesOpen ? "scale-x-100" : "scale-x-0"}`
                          }`}
                        />
                      </Link>

                      {/* Dropdown panel — pt-2 gives visual gap without breaking hover area */}
                      <div
                        ref={desktopServicesMenuRef}
                        id="desktop-services-menu"
                        className={`absolute top-full left-0 pt-2 w-52 transition-[opacity,visibility] duration-200 ${
                          servicesOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
                        }`}
                        style={{ zIndex: 60 }}
                      >
                      <div className="bg-black border border-white/10">
                        {/* Maroon top accent */}
                        <div style={{ height: 1, background: "var(--color-accent)", opacity: 0.6 }} />

                        {/* Vertical service list — each service on its own line */}
                        <div className="py-1">
                          {SERVICES.map((service, idx) => (
                            <div key={service.slug}>
                              <Link
                                href={`/services/${service.slug}`}
                                prefetch={false}
                                aria-current={pathname === `/services/${service.slug}` ? "page" : undefined}
                                className="group/item flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors duration-150"
                              >
                                <div>
                                  <span
                                    className={`font-display font-bold block leading-tight mb-0.5 transition-colors duration-150 ${
                                      pathname === `/services/${service.slug}`
                                        ? "text-white"
                                        : "text-white/75 group-hover/item:text-white"
                                    }`}
                                    style={{ fontSize: "0.78rem" }}
                                  >
                                    {service.title}
                                  </span>
                                  <span className="font-labels text-[8px] text-gray-400 tracking-[0.14em] uppercase">
                                    {service.short}
                                  </span>
                                </div>
                                {pathname === `/services/${service.slug}` && (
                                  <span
                                    className="w-1.5 h-1.5 flex-shrink-0 rounded-full"
                                    style={{ background: "var(--color-accent)" }}
                                    aria-hidden="true"
                                  />
                                )}
                              </Link>
                              {idx < SERVICES.length - 1 && (
                                <div
                                  className="mx-4"
                                  style={{ height: 1, background: "var(--color-accent)", opacity: 0.12 }}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-white/[0.06]">
                          <Link
                            href="/services"
                            prefetch={false}
                            className="font-labels text-[8px] text-gray-300 tracking-[0.15em] uppercase hover:text-white transition-colors"
                          >
                            All Services Overview →
                          </Link>
                        </div>
                      </div>{/* end bg-black inner card */}
                      </div>{/* end positioning wrapper */}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`group relative inline-flex min-h-11 items-center font-labels text-[10px] uppercase tracking-[0.18em] transition-colors duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 ${
                      pathname === link.href ? inkActive : inkBase
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-1 left-0 right-0 h-px transition-transform duration-300 origin-left ${
                        pathname === link.href
                          ? "bg-[var(--color-accent)] scale-x-100"
                          : `${lightInk ? "bg-black" : "bg-white"} scale-x-0 group-hover:scale-x-100`
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right side: location + timestamp */}
            <div className="hidden lg:flex items-center justify-end">
              <span
                ref={torTimeRef}
                suppressHydrationWarning
                className={`font-labels text-[9px] tracking-[0.14em] uppercase whitespace-nowrap transition-colors duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 ${
                  lightInk ? "text-black/60" : "text-white/50"
                }`}
              >
                Torrance
              </span>
            </div>

            {/* Mobile: phone + hamburger */}
            <div className="flex lg:hidden items-center gap-2 min-[390px]:gap-3 sm:gap-5">
              <a
                href={SITE.phoneHref}
                className={`hidden min-[390px]:inline-flex min-h-11 items-center font-numbers text-[11px] transition-colors duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 sm:text-xs ${
                  lightInk ? "text-black/55 hover:text-black" : "text-gray-400 hover:text-white"
                }`}
              >
                {SITE.phone}
              </a>
              <button
                ref={mobileMenuButtonRef}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-11 w-11 flex-col items-center justify-center gap-[5px]"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-site-menu"
              >
                <span
                  className={`block h-px w-6 origin-center transition-[background-color,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 ${lightInk ? "bg-black" : "bg-white"} ${
                    mobileOpen ? "rotate-45 translate-y-[6px]" : ""
                  }`}
                />
                <span
                  className={`block h-px w-6 transition-[background-color,opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 ${lightInk ? "bg-black" : "bg-white"} ${
                    mobileOpen ? "opacity-0 scale-x-0" : ""
                  }`}
                />
                <span
                  className={`block h-px w-6 origin-center transition-[background-color,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 ${lightInk ? "bg-black" : "bg-white"} ${
                    mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Maroon page-progress hairline — lives on the header's bottom edge
            (replaces the detached #scroll-progress top bar) so it hides and
            reveals together with the bar. Driven direct-to-style on scroll. */}
        <div
          ref={progressRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--color-accent)] transition-[opacity,box-shadow] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0"
          style={{
            transform: "scaleX(0)",
            opacity: progressOpacity,
            boxShadow: transparent
              ? "0 0 14px rgba(135,39,32,0.5)"
              : "0 0 8px rgba(99,26,22,0.32)",
            willChange: "transform",
          }}
        />
      </motion.header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-site-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-black flex flex-col pt-20 px-6 pb-10 overflow-y-auto"
          >
            <nav aria-label="Mobile navigation" className="flex-1 flex flex-col justify-center space-y-1">
              {NAV_LINKS.map((link, i) => {
                if (link.href === "/services") {
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.05 + i * 0.06,
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {/* Services accordion */}
                      <button
                        onClick={() =>
                          setMobileServicesOpen(!mobileServicesOpen)
                        }
                        aria-expanded={mobileServicesOpen}
                        aria-controls="mobile-services-submenu"
                        className={`w-full flex items-center justify-between py-4 border-b font-display font-bold text-3xl tracking-tight transition-colors duration-200 ${
                          isServicesActive
                            ? "text-white border-gray-700"
                            : "text-gray-400 border-gray-800 hover:text-white hover:border-gray-600"
                        }`}
                      >
                        <span>{link.label}</span>
                        <span
                          aria-hidden="true"
                          className={`font-labels text-[9px] tracking-[0.2em] uppercase transition-colors duration-200 ${
                            mobileServicesOpen
                              ? "text-[var(--color-accent-light)]"
                              : "text-gray-400"
                          }`}
                        >
                          {mobileServicesOpen ? "–" : "+"}
                        </span>
                      </button>

                      {/* Sub-items */}
                      <AnimatePresence>
                        {mobileServicesOpen && (
                          <motion.div
                            id="mobile-services-submenu"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 py-2 space-y-0 border-b border-gray-900">
                              {/* Services overview */}
                              <Link
                                href="/services"
                                prefetch={false}
                                aria-current={pathname === "/services" ? "page" : undefined}
                                className="relative flex items-center justify-between py-3 border-b border-white/[0.04] before:absolute before:inset-x-0 before:-top-0.5 before:bottom-0 before:content-['']"
                              >
                                <span className="font-labels text-[11px] text-gray-300 tracking-[0.18em] uppercase">
                                  All Services
                                </span>
                                <span className="font-labels text-[9px] text-gray-300 tracking-[0.1em] uppercase">
                                  →
                                </span>
                              </Link>
                              {SERVICES.map((service) => (
                                <Link
                                  key={service.slug}
                                  href={`/services/${service.slug}`}
                                  prefetch={false}
                                  aria-current={pathname === `/services/${service.slug}` ? "page" : undefined}
                                  className={`flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0 transition-colors duration-150 ${
                                    pathname === `/services/${service.slug}`
                                      ? "text-[var(--color-accent-light)]"
                                      : "text-gray-300 hover:text-white"
                                  }`}
                                >
                                  <span className="font-display font-bold text-lg tracking-tight">
                                    {service.title}
                                  </span>
                                  <span className="font-labels text-[8px] text-gray-300 tracking-[0.15em] uppercase">
                                    {service.short}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 + i * 0.06,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      prefetch={false}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={`block py-4 border-b font-display font-bold text-3xl tracking-tight transition-colors duration-200 ${
                        pathname === link.href
                          ? "text-white border-gray-700"
                          : "text-gray-400 border-gray-800 hover:text-white hover:border-gray-600"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 space-y-4"
            >
              <a
                href={SITE.phoneHref}
                className="btn-shine block text-center bg-white text-black px-6 py-4 font-labels text-[11px] tracking-[0.18em] uppercase"
              >
                Book Call
              </a>
              <a
                href={SITE.phoneHref}
                className="block text-center border border-gray-700 text-white px-6 py-4 font-labels text-[11px] tracking-[0.18em] uppercase font-numbers"
              >
                {SITE.phone}
              </a>
              <p className="text-center font-labels text-[9px] text-white/50 tracking-[0.18em] uppercase mt-4">
                CA License #{SITE.license}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
