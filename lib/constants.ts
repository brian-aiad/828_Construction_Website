export const SITE = {
  name: "828 Construction",
  tagline: "Built with Intent. Not by Accident.",
  description:
    "20+ years of building science expertise. Specializing in ADU construction, remediation, and consulting in Torrance and South Bay, CA.",
  phone: "213-828-2388",
  phoneHref: "tel:+12138282388",
  email: "828constructionca@gmail.com",
  address: {
    street: "21223 Hawthorne Boulevard STE B 1087",
    city: "Torrance",
    state: "CA",
    zip: "90503",
    full: "21223 Hawthorne Blvd STE B 1087, Torrance, CA 90503",
  },
  license: "1141119",
  url: "https://828constructions.com",
  serviceArea: [
    "Torrance",
    "Redondo Beach",
    "Manhattan Beach",
    "Hermosa Beach",
    "Lomita",
    "Carson",
    "El Segundo",
    "Hawthorne",
  ],
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
];

export const PROCESS_STEPS_V2 = [
  { number: "01", title: "Initial Contact", subtitle: "Pre-construction" },
  { number: "02", title: "Site Visit", subtitle: "Design & Planning" },
  { number: "03", title: "Permit & Approval", subtitle: "Code Compliance" },
  { number: "04", title: "Construction", subtitle: "Full Build Execution" },
  { number: "05", title: "Post-Construction", subtitle: "Project Completion" },
];

export const SERVICES = [
  {
    slug: "adu",
    title: "ADU Construction",
    short: "Accessory Dwelling Units",
    description:
      "Accessory Dwelling Units designed for functionality, efficiency, and long-term value. Whether you're expanding your property or creating additional living space, each project is built with precision and purpose.",
    details: [
      "Detached and attached ADUs",
      "Garage conversions",
      "Junior ADUs (JADUs)",
      "Permit expediting",
      "Design coordination",
      "Full-build general contracting",
    ],
  },
  {
    slug: "remediation",
    title: "Remediation",
    short: "Structural & Environmental",
    description:
      "Specialized solutions for complex construction issues. From structural concerns to environmental damage, we approach every project with a deep understanding of building science to restore and strengthen your property.",
    details: [
      "Structural remediation",
      "Water damage repair",
      "Foundation issues",
      "Construction defect correction",
      "Post-disaster recovery",
      "Building envelope failures",
    ],
  },
  {
    slug: "consulting",
    title: "Consulting",
    short: "Expert Advisory Services",
    description:
      "Professional construction consulting for homeowners and investors who want clarity before committing. We help you understand your project, avoid costly mistakes, and move forward with confidence.",
    details: [
      "Pre-construction analysis",
      "Project feasibility studies",
      "Contractor vetting",
      "Construction defect review",
      "Owner's representation",
      "Code compliance review",
    ],
  },
];

// ── V2 brand constants ────────────────────────────────────────────────────
// Joe has been doing construction since 2004 — this is experience, not founding year.
// 828 Construction (the company) is newer. Never frame 2004 as "Est." or "Founded."
export const EXPERIENCE_SINCE = 2004;

export const SERVICE_AREAS = [
  "Torrance",
  "Redondo Beach",
  "Manhattan Beach",
  "Hermosa Beach",
  "El Segundo",
  "Carson",
  "Lomita",
  "Palos Verdes",
  "Rolling Hills",
  "San Pedro",
  "Wilmington",
  "Long Beach",
];

// ── Accent tokens ─────────────────────────────────────────────────────────
export const ACCENTS = {
  maroon: {
    DEFAULT: '#631A16',
    light: '#872720',
    dark: '#3F0F0C',
  },
  copper: {
    DEFAULT: '#631A16',
    light: '#872720',
    dark: '#3F0F0C',
  },
} as const;

export const ACCENT_PRIMARY = ACCENTS.maroon.DEFAULT;

// ── Project types ─────────────────────────────────────────────────────────
export type ProjectCategory = "Bath Remodel" | "ADU Construction" | "Remediation" | "Consulting";

export interface Project {
  id: number;
  title: string;
  category: ProjectCategory;
  location: string;
  spec: string;
  description: string;
  /** Path relative to /public — show designed plate if file missing */
  image: string;
  /** Optional additional images for lightbox */
  images?: string[];
  featured?: boolean;
  /** True when the project has an image strong enough for the portfolio hero grid */
  heroReady?: boolean;
  /** Lower values appear earlier in the portfolio hero grid */
  portfolioRank?: number;
  /** True if image is a temporary stock photo pending replacement */
  tempPhoto?: boolean;
}

// Portfolio catalog policy (Brian, 2026-07-13): only the three photographed
// residences plus ONE clearly-labeled in-progress example. Fabricated one-off
// "projects" (garage conversion, detached ADU, outdoor living, stock bath
// sets) are deleted — real work only. Full residence photo sets live in
// components/portfolio/residenceGalleries.data.ts (auto-generated).
const PROJECT_GALLERIES = {
  redondoBeachResidence: [
    "/images/projects/adu-exterior-new.jpg",
    "/images/projects/adu-interior-living.jpg",
    "/images/projects/kitchen-dark.jpg",
  ],
} as const;

const PROJECT_MAIN_IMAGES = {
  cerritosResidence: "/images/projects/cerritos-residence/01-2176.jpg",
  elSerenoResidence: "/images/projects/el-sereno-residence/06-2203.jpg",
  tustinResidence: "/images/projects/tustin-residence/01-1883.jpg",
  redondoBeachResidence: "/images/projects/adu-exterior-new.jpg",
} as const;

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Cerritos Bath Remodel",
    category: "Bath Remodel",
    location: "Cerritos, CA",
    spec: "Glass shower enclosure · Dark feature tile · Dual marble vanity · Rain + hand shower",
    description:
      "Full master bath remodel in Cerritos: frameless sliding glass shower enclosure, dark vertical tile feature wall, recessed shower niches, dual-sink marble vanity with Pfister brushed-nickel faucets, and LED backlit mirror. Gallery runs from wide room overviews down to millimeter-level fixture details.",
    image: PROJECT_MAIN_IMAGES.cerritosResidence,
    featured: true,
    heroReady: true,
    portfolioRank: 1,
  },
  {
    id: 2,
    title: "El Sereno Bath & Deck",
    category: "Bath Remodel",
    location: "El Sereno, CA",
    spec: "Geometric star tile · Matte black fixtures · Round wood mirror · Hillside deck + custom stairs",
    description:
      "Two-scope project: a compact bath rebuilt around geometric star-pattern tile, matte black fixtures, a round wood-framed mirror, and warm sconce lighting — plus a hillside outdoor-living rebuild with herringbone wood decking, custom stair runs, and a planted dining terrace under the trees.",
    image: PROJECT_MAIN_IMAGES.elSerenoResidence,
    featured: true,
    heroReady: true,
    portfolioRank: 2,
  },
  {
    id: 3,
    title: "Tustin Bath Refresh",
    category: "Bath Remodel",
    location: "Tustin, CA",
    spec: "Tub/shower surround · Blue herringbone niche · Barn-door hardware · Wood bath tray",
    description:
      "Tustin bathroom remodel across two spaces: light blue soaking tub with ribbed white tile surround and custom blue herringbone-tile recessed niche, plus a second room with white square soaking tub, lit alcove, and wall-mount fixtures. Barn-door sliding hardware throughout. Gallery covers wide room views, fixture details, and material close-ups.",
    image: PROJECT_MAIN_IMAGES.tustinResidence,
    featured: true,
    heroReady: true,
    portfolioRank: 3,
  },
  {
    id: 4,
    title: "Redondo Beach Residence",
    category: "ADU Construction",
    location: "Redondo Beach, CA",
    spec: "Detached ADU · Full-build scope · In progress",
    description:
      "Detached ADU currently in build in Redondo Beach — permitted, framed, and moving through finish work. Full photo documentation follows completion; the frames here are representative placeholders.",
    image: PROJECT_MAIN_IMAGES.redondoBeachResidence,
    images: [PROJECT_MAIN_IMAGES.redondoBeachResidence, ...PROJECT_GALLERIES.redondoBeachResidence.slice(1)],
    portfolioRank: 4,
    tempPhoto: true,
  },
];

export const PROCESS_STEPS = [
  {
    number: "01",
    title: "Consultation",
    description:
      "We start by listening. A thorough consultation to understand your goals, constraints, and vision before any work begins.",
  },
  {
    number: "02",
    title: "Planning",
    description:
      "Detailed planning using 20+ years of building science knowledge. Every decision is intentional — no guesswork, no surprises.",
  },
  {
    number: "03",
    title: "Execution",
    description:
      "Precise, quality-focused execution. We build with durability in mind, not just aesthetics.",
  },
  {
    number: "04",
    title: "Completion",
    description:
      "Thorough walkthrough, full documentation, and continued support. We don't disappear after handoff.",
  },
];
