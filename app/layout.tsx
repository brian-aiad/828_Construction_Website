import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Mono, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FooterRevealWrapper from "@/components/layout/FooterRevealWrapper";
import GrainOverlay from "@/components/system/GrainOverlay";
import VerticalBrandMark from "@/components/system/VerticalBrandMark";
import LenisProvider from "@/components/providers/LenisProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";
import { SITE } from "@/lib/constants";
import ScrollRestorationReset from "@/components/system/ScrollRestorationReset";
import SectionRevealController from "@/components/system/SectionRevealController";
import MotionPreferences from "@/components/providers/MotionPreferences";
import RouteTransitionCurtain from "@/components/system/RouteTransitionCurtain";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "828 Construction | Quality Building Solutions - Torrance, CA",
    template: "%s | 828 Construction",
  },
  description: SITE.description,
  keywords: [
    "construction Torrance CA",
    "ADU builder Torrance",
    "remediation contractor Torrance",
    "construction consulting South Bay",
    "general contractor Torrance",
    "building science expert California",
    "accessory dwelling unit Torrance",
  ],
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: "828 Construction — Built with Intent. Not by Accident.",
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [
      {
        url: "/images/generated/home-hero-bluehour-adu-v2.webp",
        width: 1535,
        height: 1024,
        alt: "Modern South Bay ADU built by 828 Construction",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "828 Construction — Built with Intent. Not by Accident.",
    description: SITE.description,
    images: ["/images/generated/home-hero-bluehour-adu-v2.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/android-chrome-828-v2-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-828-v2.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceMono.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black font-body">
        <Script id="scroll-restoration-reset" strategy="beforeInteractive">
          {"try{history.scrollRestoration='manual'}catch(e){};window.scrollTo(0,0);"}
        </Script>
        <MotionPreferences>
        <RouteTransitionCurtain />
        <ScrollRestorationReset />
        {/* Skip to main content — keyboard accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <GrainOverlay />
        {/* Page progress lives on the Header's bottom edge (2026-07-09);
            no separate right-edge bar — the styled scrollbar is the only
            element on that edge. */}
        <VerticalBrandMark />
        {/* Custom cursor — hidden on touch devices via CSS */}
        <CustomCursor />
        <LenisProvider>
          <SectionRevealController />
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <FooterRevealWrapper>
            <Footer />
          </FooterRevealWrapper>
        </LenisProvider>
        {process.env.VERCEL && <Analytics />}
        <GoogleAnalytics />
        </MotionPreferences>
      </body>
    </html>
  );
}
