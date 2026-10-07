import { MetadataRoute } from "next";
import { SITE, SERVICES } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  // Update this only when public page content or search metadata changes.
  // Build time is not a truthful `lastmod` signal for crawlers.
  const lastModified = new Date("2026-10-07T00:00:00-07:00");

  return [
    {
      url: base,
      lastModified,
    },
    {
      url: `${base}/about`,
      lastModified,
    },
    {
      url: `${base}/services`,
      lastModified,
    },
    ...SERVICES.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified,
    })),
    {
      url: `${base}/portfolio`,
      lastModified,
    },
    {
      url: `${base}/contact`,
      lastModified,
    },
  ];
}
