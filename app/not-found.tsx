import Link from "next/link";
import { SITE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <section
      className="min-h-svh bg-black flex items-center justify-center px-6"
      aria-labelledby="not-found-title"
    >
      <div className="text-center max-w-xl">

        {/* Ghost "828" — 4% opacity watermark */}
        <div
          className="font-numbers font-bold text-white leading-none select-none"
          style={{ fontSize: "clamp(8rem, 25vw, 18rem)", opacity: 0.04, marginBottom: "-0.12em" }}
          aria-hidden="true"
        >
          828
        </div>

        {/* Copper hairline */}
        <div
          style={{ height: 1, background: "#B87333", opacity: 0.45, margin: "0 auto 2.5rem", width: "clamp(3rem, 10vw, 6rem)" }}
          aria-hidden="true"
        />

        <p className="font-labels text-[9px] text-gray-500 tracking-[0.3em] uppercase mb-4">
          Error 404
        </p>

        <h1
          id="not-found-title"
          className="font-display font-bold text-white tracking-tight leading-tight mb-4"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
        >
          Page Not Built
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-sm mx-auto font-body">
          This page doesn&apos;t exist. Let&apos;s get you back to where the
          work happens.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="btn-shine bg-white text-black px-8 py-3.5 font-labels text-[10px] tracking-[0.18em] uppercase hover:bg-gray-100 transition-colors duration-200"
          >
            Back to Home →
          </Link>
          <Link
            href="/contact"
            className="border border-gray-800 text-gray-400 px-8 py-3.5 font-labels text-[10px] tracking-[0.18em] uppercase hover:border-gray-600 hover:text-gray-200 transition-colors duration-200"
          >
            Contact Us
          </Link>
        </div>

        <p className="mt-12 font-labels text-[8px] text-gray-800 tracking-[0.2em] uppercase">
          CA License #{SITE.license} · {SITE.address.city}, {SITE.address.state}
        </p>
      </div>
    </section>
  );
}
