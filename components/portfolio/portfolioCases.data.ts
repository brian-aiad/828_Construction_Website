import { RESIDENCE_GALLERIES, ResidenceGallery } from "@/components/portfolio/residenceGalleries.data";
import { PROJECTS, Project } from "@/lib/constants";

// Curated editorial selects for the /portfolio case sections (Brian's
// 2026-07-13 revamp). Indices point into each residence's full photo set and
// were chosen from indexed contact sheets
// (.claude-work/research/portfolio-revamp/sheet-*.png) to avoid the
// near-duplicate walls the old uncurated grids produced. Gallery photos stay
// reachable through the per-case lightbox.

export type PortfolioCase = {
  project: Project;
  gallery: ResidenceGallery;
  lead: string;
  /** Art-directed real project photograph matched to the hero tile crop. */
  heroImage: string;
  /** Primary curated grid (chapter one for dual-scope projects) */
  grid: string[];
  /** Second chapter (El Sereno outdoor living) */
  gridB?: string[];
  chapterLabels?: [string, string];
  /** Traveling contact strip — decorative scrub layer, never content-critical */
  strip: string[];
};

const SELECTS: Record<
  string,
  { projectId: number; lead: number; grid: number[]; gridB?: number[]; chapterLabels?: [string, string]; strip: number[] }
> = {
  "cerritos-residence": {
    // 2026-07-13 critique pass: dropped the soft mirror-room wide (1) and the
    // second tulip vignette (14) — near-dupes read as filler at editorial size.
    projectId: 1,
    lead: 0,
    grid: [3, 9, 12, 22, 19],
    strip: [2, 21, 26],
  },
  "el-sereno-residence": {
    projectId: 2,
    lead: 4,
    grid: [0, 3, 13],
    gridB: [20, 28, 30],
    chapterLabels: ["The bath", "The hillside deck"],
    strip: [12, 15, 16],
  },
  "tustin-residence": {
    // Strip swapped off the soft herringbone/tub macro crops (7, 8) for the
    // sharp niche-shelf and tub-filler details (2026-07-13 critique pass).
    projectId: 3,
    lead: 0,
    grid: [3, 2, 12, 13, 15, 33],
    strip: [5, 6, 39],
  },
  "torrance-residence": {
    projectId: 5,
    lead: 0,
    grid: [1, 3],
    strip: [1, 2, 3],
  },
};

const HERO_IMAGES: Record<string, string> = {
  "cerritos-residence": "/images/projects/cerritos-residence/03-2077.jpg",
  "el-sereno-residence": "/images/projects/el-sereno-residence/home-preview-v2.jpg",
  "tustin-residence": "/images/projects/tustin-residence/17-2010.jpg",
  "torrance-residence": "/images/projects/torrance-residence/01-3143.webp",
};

export const PORTFOLIO_CASES: PortfolioCase[] = RESIDENCE_GALLERIES.map((gallery) => {
  const sel = SELECTS[gallery.id];
  const project = PROJECTS.find((p) => p.id === sel.projectId)!;
  return {
    project,
    gallery,
    lead: gallery.photos[sel.lead],
    heroImage: HERO_IMAGES[gallery.id],
    grid: sel.grid.map((i) => gallery.photos[i]),
    gridB: sel.gridB?.map((i) => gallery.photos[i]),
    chapterLabels: sel.chapterLabels,
    strip: sel.strip.map((i) => gallery.photos[i]),
  };
});

export const EXAMPLE_PROJECT = PROJECTS.find((p) => p.tempPhoto)!;
