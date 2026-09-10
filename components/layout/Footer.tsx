import Image from "next/image";
import Link from "next/link";
import { SITE, SERVICES } from "@/lib/constants";
import BrandMarqueeBottom from "@/components/footer/BrandMarqueeBottom";
import { ACTIVE_SOCIAL_LINKS } from "@/components/footer/SocialIcons";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

const FOOTER_LINKS = [
  ...NAV_LINKS,
  ...SERVICES.map((service) => ({
    href: `/services/${service.slug}`,
    label: service.title,
  })),
];

const labelClass = "font-labels text-[10px] uppercase tracking-[0.22em]";
// Joe (IMG_1127, 2026-07-09): footers must read as ONE black zone — no cream
// panels breaking the surface on the way up. All panel surfaces stay black.
// Packed nav column (~28px vertical pitch): the ::before extends the tap area
// to fill the row gap — max reach without overlapping the neighbour's target or
// changing any visual (44px would require respacing the column, which is not
// allowed here). Clears the WCAG 2.5.8 AA 24px floor.
const panelLinkClass =
  "group relative w-fit font-labels text-[11px] uppercase leading-[1.1] tracking-[0.16em] text-black/70 transition-colors before:absolute before:inset-x-0 before:-inset-y-[7px] before:content-[''] hover:text-black";

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function Underline() {
  return (
    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--color-accent)] transition-transform duration-300 group-hover:scale-x-100" />
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const formattedPhone = formatPhone(SITE.phone);
  const streetLine = SITE.address.street.replace(" STE", ", STE");

  return (
    <footer className="relative flex flex-col overflow-hidden border-t border-white/16 bg-black text-white before:absolute before:inset-x-0 before:top-0 before:z-20 before:h-px before:origin-left before:bg-[var(--color-accent)]/70 before:content-[''] min-[1180px]:h-[calc(100svh-52px)]" data-section="footer" data-header-dark="">
      <section className="flex flex-col justify-end bg-black px-6 pb-12 pt-16 md:px-8 md:pb-14 md:pt-20 min-[1180px]:h-[clamp(15rem,30svh,20rem)] min-[1180px]:shrink-0 min-[1180px]:justify-center min-[1180px]:!px-0 min-[1180px]:pb-[clamp(1.25rem,2vh,2rem)] min-[1180px]:pt-[clamp(1.25rem,2vh,2rem)]" data-footer-section="top-band">
        <div className="grid w-full gap-8 min-[1180px]:grid-cols-[2fr_1fr_1fr] min-[1180px]:items-end">
          <div data-motion-reveal="left" className="min-[1180px]:pl-[clamp(1rem,1.15vw,1.5rem)] min-[1180px]:pr-[clamp(1rem,1.4vw,2rem)]">
            <h2 className="max-w-[10ch] font-display text-[clamp(2.55rem,10.5vw,3.45rem)] font-normal leading-[1.02] tracking-[0] text-white md:text-[3.65rem] min-[1180px]:max-w-[12ch] min-[1180px]:text-[clamp(2.9rem,3.25vw,4rem)]">
              Quality is the strategy.
            </h2>

            {ACTIVE_SOCIAL_LINKS.length > 0 && (
              <ul className="-ml-2 mt-8 flex items-center gap-5 min-[1180px]:mt-8 min-[1180px]:gap-5" aria-label="Social links">
                {ACTIVE_SOCIAL_LINKS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex h-10 w-10 items-center justify-center text-white/42 transition-colors before:absolute before:-inset-0.5 before:content-[''] hover:text-white/72"
                    >
                      <span className="h-6 w-6">{social.icon}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="min-[1180px]:col-span-2 min-[1180px]:-translate-y-[clamp(2.2rem,4.6vh,3.4rem)] min-[1180px]:pl-0 min-[1180px]:pr-[clamp(1rem,1.4vw,2rem)]">
            <div data-motion-reveal="right" data-motion-delay="0.08">
            <a
              href={SITE.phoneHref}
              className="relative block font-display text-[clamp(2.1rem,9vw,3rem)] font-normal leading-[1.02] tracking-[0] text-white/58 transition-colors before:absolute before:inset-x-0 before:-top-[11px] before:-bottom-[4px] before:content-[''] hover:text-white/82 md:text-[3.2rem] min-[1180px]:text-[clamp(2.75rem,3.25vw,4rem)] min-[1180px]:before:hidden"
            >
              {formattedPhone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              data-footer-email=""
              className="relative mt-4 block max-w-full break-all font-display text-[clamp(1.05rem,4vw,1.65rem)] font-normal leading-[1.12] tracking-[0] text-white/58 transition-colors before:absolute before:inset-x-0 before:-top-[4px] before:-bottom-[21px] before:content-[''] hover:text-white/82 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70 sm:break-normal md:text-[2rem] min-[1180px]:mt-4 min-[1180px]:max-w-[min(44rem,100%)] min-[1180px]:whitespace-nowrap min-[1180px]:text-[clamp(1.45rem,2vw,2.45rem)] min-[1180px]:before:hidden"
            >
              {SITE.email}
            </a>
            </div>
          </div>
        </div>
      </section>

      <section className="relative grid grid-cols-1 overflow-hidden min-[1180px]:min-h-0 min-[1180px]:flex-1 min-[1180px]:grid-cols-[2fr_1fr_1fr]" data-footer-section="panels">
        <a
          href={SITE.phoneHref}
          data-motion-reveal="left"
          className="group relative min-h-[18rem] overflow-hidden bg-black text-white md:min-h-[26rem] min-[1180px]:h-full min-[1180px]:min-h-0"
        >
          <Image
            src="/images/generated/footer-consultation-cta.webp"
            alt="Builder-client consultation reviewing residential construction plans"
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
            style={{ filter: "contrast(1.04) saturate(0.96) brightness(0.92)" }}
          />
          <div className="absolute inset-0 bg-black/18" aria-hidden="true" />
          <div className="absolute left-0 right-0 top-[52%] z-10 px-7 md:px-9 min-[1180px]:px-[clamp(3rem,4.2vw,5.4rem)]">
            <span className="block max-w-[32rem] border-b border-white/58 pb-2.5 font-display text-[clamp(2.45rem,7vw,4.8rem)] font-normal leading-none tracking-[0] text-white min-[1180px]:text-[clamp(1.35rem,1.65vw,1.8rem)]">
              Book a Call
              <span className="ml-3" aria-hidden="true">→</span>
            </span>
          </div>
        </a>

        {/* Brian 2026-07-13 (two passes): the info boxes carry two tones —
            charcoal nav box + warm bone serving box ("lighter", after the
            deep-maroon try read too red). Black -> charcoal -> bone steps
            keep the footer in the site's ink/cream family. */}
        <div data-motion-reveal="up" data-motion-delay="0.06" className="relative z-20 flex flex-col border-t border-black/8 bg-[#ECEBE7] px-6 py-8 text-[#141414] md:px-9 md:py-10 min-[1180px]:h-full min-[1180px]:min-h-0 min-[1180px]:justify-center min-[1180px]:border-l min-[1180px]:border-t-0 min-[1180px]:px-[clamp(3rem,4vw,4.9rem)] min-[1180px]:py-[3rem]">
          <nav aria-label="Footer navigation" className="mt-0 grid grid-cols-2 gap-x-8 gap-y-4 min-[1180px]:flex min-[1180px]:flex-col min-[1180px]:gap-[0.78rem]">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} prefetch={false} className={panelLinkClass}>
                {link.label}
                <Underline />
              </Link>
            ))}
          </nav>

          <div className="mt-8 min-[1180px]:mt-14">
            <p className="font-labels text-[10px] uppercase leading-[1.25] tracking-[0.18em] text-black/58">
              &copy; {year} 828 Construction
            </p>
            <p className="mt-2 max-w-sm text-[13px] leading-[1.25] text-black/58">
              All rights reserved.
            </p>
          </div>
        </div>

        <div data-motion-reveal="right" data-motion-delay="0.12" className="relative z-20 flex h-full min-h-0 flex-col overflow-hidden border-t border-black/8 bg-white px-6 pb-10 pt-9 text-[#141414] md:px-9 md:py-10 min-[1180px]:justify-start min-[1180px]:border-l min-[1180px]:border-t-0 min-[1180px]:px-[clamp(3rem,4.4vw,5.4rem)] min-[1180px]:pb-[clamp(8rem,13vh,10rem)] min-[1180px]:pt-[clamp(1.75rem,4vh,3.25rem)]">
          <div className="relative z-40 grid gap-7 md:grid-cols-2 min-[1180px]:block">
          <div>
            <p className={`${labelClass} text-black/58`}>Serving</p>
            <h3 className="mt-5 font-display text-[clamp(1.6rem,5.5vw,2.2rem)] font-medium leading-tight tracking-[0] text-[#141414] min-[1180px]:mt-3 min-[1180px]:text-[clamp(1.45rem,1.45vw,1.85rem)]">
              Torrance, CA
            </h3>
            <address className="mt-5 not-italic text-[15px] leading-[1.45] text-black/78 min-[1180px]:mt-3 min-[1180px]:text-[14px] min-[1180px]:leading-[1.35]">
              {streetLine}
              <br />
              {SITE.address.city}, {SITE.address.state} {SITE.address.zip}
            </address>
          </div>

          <div className="min-[1180px]:mt-6">
            <p className={`${labelClass} text-black/58`}>Service Area</p>
            <p className="mt-5 max-w-md text-[15px] leading-[1.5] text-black/72 min-[1180px]:mt-3 min-[1180px]:text-[13px] min-[1180px]:leading-[1.35]">
              {SITE.serviceArea.join(" / ")}
            </p>
          </div>
          </div>

          <div className="relative z-40 mt-7 min-[1180px]:mt-5">
            <p className="inline-flex bg-white/92 border border-[var(--color-accent)]/55 px-5 py-3 font-labels text-[10px] uppercase tracking-[0.17em] text-black/68">
              CA License #{SITE.license}
            </p>
          </div>

          <div
            aria-hidden="true"
            className="relative z-10 -mx-6 mt-8 overflow-hidden md:-mx-9 min-[1180px]:hidden"
          >
            <BrandMarqueeBottom
              giant
              color="rgb(12, 12, 12)"
              fontSize="clamp(2.25rem, 11vw, 3.75rem)"
              itemClassName="text-[#0c0c0c]"
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[1.15rem] z-10 hidden overflow-hidden min-[1180px]:block"
          >
            <BrandMarqueeBottom
              giant
              color="rgb(12, 12, 12)"
              fontSize="clamp(2.45rem, 3.2vw, 4rem)"
              itemClassName="text-[#0c0c0c]"
            />
          </div>
        </div>

        {/* NS-reference wordmark: lives INSIDE the white serving box only,
            fully visible with a little bottom padding (Brian round 2). */}
      </section>
    </footer>
  );
}
