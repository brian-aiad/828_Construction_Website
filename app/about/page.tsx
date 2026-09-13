import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import JsonLd from "@/components/shared/JsonLd";
import AboutContent from "@/components/about/AboutContent";
import { breadcrumbJsonLd, SEARCH_ROBOTS, socialMetadata } from "@/lib/seo";

const title = "About - Building Science & Craft";
const description =
  "Meet 828 Construction. Hands-on residential construction experience serving Torrance and South Bay, CA. CA License #1141119.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE.url}/about` },
  robots: SEARCH_ROBOTS,
  ...socialMetadata({
    title,
    description,
    path: "/about",
    image: "/images/generated/about-hero-craft-v7.webp",
    imageAlt: "Architectural illustration of warm oak joinery and a California residential interior",
  }),
};

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "" },
  { name: "About", path: "/about" },
]);

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbs} />
      <AboutContent />
    </>
  );
}
