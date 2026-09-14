import type { Metadata } from "next";
import HeroV2 from "@/components/home/HeroV2";
import EditorialFlow from "@/components/home/EditorialFlow";
import ServicesPreviewV2 from "@/components/home/ServicesPreviewV2";
import HomeVisionSequence from "@/components/home/HomeVisionSequence";
import AboutPreview from "@/components/home/AboutPreview";
import DockedCTA from "@/components/home/DockedCTA";
import SplashScreen from "@/components/home/SplashScreen";
import JsonLd from "@/components/shared/JsonLd";
import { SITE } from "@/lib/constants";
import { BUSINESS_ID, SEARCH_ROBOTS, WEBSITE_ID } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "828 Construction | ADU, Remediation & Consulting - Torrance, CA",
  },
  description:
    "828 Construction brings 20+ years of building science expertise to Torrance and South Bay. Specializing in ADU construction, remediation, and consulting. CA License #1141119.",
  alternates: {
    canonical: SITE.url,
  },
  robots: SEARCH_ROBOTS,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE.url}/`,
      name: SITE.name,
      alternateName: ["828", "828constructions.com"],
      publisher: { "@id": BUSINESS_ID },
    },
    {
      "@type": "GeneralContractor",
      "@id": BUSINESS_ID,
      name: SITE.name,
      url: SITE.url,
      image: {
        "@type": "ImageObject",
        url: `${SITE.url}/images/generated/home-hero-bluehour-adu-v2.webp`,
        width: 1535,
        height: 1024,
      },
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/android-chrome-828-v2-512x512.png?v=20260907`,
        width: 512,
        height: 512,
      },
      description: SITE.description,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.state,
        postalCode: SITE.address.zip,
        addressCountry: "US",
      },
      telephone: "+12138282388",
      priceRange: "$$$",
      areaServed: SITE.serviceArea,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+12138282388",
        contactType: "project inquiries",
        url: `${SITE.url}/contact`,
      },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "License",
        identifier: SITE.license,
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Construction services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "ADU Construction",
              url: `${SITE.url}/services/adu`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Remediation",
              url: `${SITE.url}/services/remediation`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Construction Consulting",
              url: `${SITE.url}/services/consulting`,
            },
          },
        ],
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <JsonLd data={jsonLd} />
      <HeroV2 />
      <EditorialFlow>
        <ServicesPreviewV2 />
        <HomeVisionSequence part="intro" />
        <HomeVisionSequence part="process" />
        <AboutPreview />
      </EditorialFlow>
      <DockedCTA />
    </>
  );
}
