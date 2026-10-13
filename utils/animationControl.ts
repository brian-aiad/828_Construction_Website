/**
 * AnimationController
 * Three-layer detection:
 *   1. Screen width < 1024 or height < 800 → compact layout (native scrolling)
 *   2. No fine primary pointer → natural flow (touch or keyboard-only)
 *   3. prefers-reduced-motion → user preference
 *
 * NOTE: We still avoid raw navigator.maxTouchPoints / ontouchstart. Some
 * Windows laptops report touch support while users operate them as desktop
 * machines. Pointer media queries are a better signal for tablet ergonomics.
 */
// Keep the compact-flow media query in app/globals.css in sync.
export const DESKTOP_MOTION_QUERY = "(min-width: 1024px) and (min-height: 800px) and (pointer: fine)";
export const COARSE_TABLET_QUERY = "(pointer: coarse)";

export class AnimationController {
  private static _instance: AnimationController | null = null;

  private _isMobile: boolean = false;
  private _prefersReducedMotion: boolean = false;
  private _desktopQuery: MediaQueryList | null = null;
  private _coarseTabletQuery: MediaQueryList | null = null;
  private _reducedMotionQuery: MediaQueryList | null = null;

  private constructor() {
    if (typeof window === "undefined") return;

    this._desktopQuery = window.matchMedia(DESKTOP_MOTION_QUERY);
    this._coarseTabletQuery = window.matchMedia(COARSE_TABLET_QUERY);
    this._reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this._syncFromMedia();

    this._desktopQuery.addEventListener("change", this._onMediaChange);
    this._coarseTabletQuery.addEventListener("change", this._onMediaChange);
    this._reducedMotionQuery.addEventListener("change", this._onMediaChange);
    window.addEventListener("resize", this._onResize.bind(this), { passive: true });
  }

  private _onMediaChange = () => {
    this._syncFromMedia();
  };

  private _syncFromMedia() {
    const isDesktopWidth = this._desktopQuery?.matches ?? (window.innerWidth >= 1024 && window.innerHeight >= 800);
    const isCoarseTablet = this._coarseTabletQuery?.matches ?? false;
    this._isMobile = !isDesktopWidth || isCoarseTablet;
    this._prefersReducedMotion = this._reducedMotionQuery?.matches ?? false;
  }

  private _onResize() {
    this._syncFromMedia();
  }

  private static getInstance(): AnimationController {
    if (!AnimationController._instance) {
      AnimationController._instance = new AnimationController();
    }
    return AnimationController._instance;
  }

  /** True when animations should run (desktop + no reduced-motion preference). */
  static shouldAnimate(): boolean {
    const inst = AnimationController.getInstance();
    return !inst._isMobile && !inst._prefersReducedMotion;
  }

  static getConfig() {
    const inst = AnimationController.getInstance();
    return {
      enabled: AnimationController.shouldAnimate(),
      isMobile: inst._isMobile,
      prefersReducedMotion: inst._prefersReducedMotion,
    };
  }
}
