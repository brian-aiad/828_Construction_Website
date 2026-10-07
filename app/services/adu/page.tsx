import { ADU_FAQS } from "@/lib/service-faqs";
import type { Metadata } from "next";
import { SITE } from "@/lib/constants";
import JsonLd from "@/components/shared/JsonLd";
import AduServiceContent from "@/components/services/adu/AduServiceContent";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  businessProviderJsonLd,
  SEARCH_ROBOTS,
  socialMetadata,
} from "@/lib/seo";

const title = "ADU Builder Torrance | Accessory Dwelling Units";
const description =
  "Expert ADU construction in Torrance and South Bay. Design, permits, and full builds for accessory dwelling units. 20+ years experience. CA License #1141119. Free consultation.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "ADU builder Torrance",
    "accessory dwelling unit Torrance",
    "granny flat construction South Bay",
    "ADU permits Torrance CA",
    "backyard ADU Torrance",
    "garage conversion ADU",
    "junior ADU California",
  ],
  alternates: { canonical: `${SITE.url}/services/adu` },
  robots: SEARCH_ROBOTS,
  ...socialMetadata({
    title,
    description,
    path: "/services/adu",
    image: "/images/generated/adu-hero-exterior-v4.webp",
    imageAlt: "Completed South Bay accessory dwelling unit",
  }),
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE.url}/services/adu#service`,
  name: "ADU Construction - Torrance, CA",
  serviceType: "Accessory Dwelling Unit construction",
  description:
    "Accessory Dwelling Unit construction in Torrance and South Bay. Design coordination, permits, and full builds.",
  provider: businessProviderJsonLd(),
  areaServed: SITE.serviceArea,
  url: `${SITE.url}/services/adu`,
  mainEntityOfPage: `${SITE.url}/services/adu`,
  image: `${SITE.url}/images/generated/adu-hero-exterior-v4.webp`,
};

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", path: "" },
  { name: "Services", path: "/services" },
  { name: "ADU Construction", path: "/services/adu" },
]);

export default function AduPage() {
  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={faqJsonLd(ADU_FAQS)} />
      <JsonLd data={breadcrumbs} />
      <AduServiceContent />
    </>
  );
}
