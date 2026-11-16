import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import JsonLd from "@/components/shared/JsonLd";
import PortfolioContent from "@/components/portfolio/PortfolioContent";
import { breadcrumbJsonLd, SEARCH_ROBOTS, socialMetadata } from "@/lib/seo";

const title = "Portfolio | Our Work in Torrance & South Bay";
const description =
  "828 Construction's portfolio of photographed residences and construction work in Torrance and Southern California.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE.url}/portfolio` },
  robots: SEARCH_ROBOTS,
  ...socialMetadata({
    title,
    description,
    path: "/portfolio",
    image: "/images/projects/torrance-residence/01-3143.webp",
    imageAlt: "Torrance Residence exterior by 828 Construction",
  }),
};

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "" },
  { name: "Portfolio", path: "/portfolio" },
]);

export default function PortfolioPage() {
  return (
    <>
      <JsonLd data={breadcrumbs} />
      <PortfolioContent />
    </>
  );
}
