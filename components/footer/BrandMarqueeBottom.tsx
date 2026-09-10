const REPETITIONS = 6;

type BrandMarqueeBottomProps = {
  className?: string;
  itemClassName?: string;
  compact?: boolean;
  panel?: boolean;
  giant?: boolean;
  fontSize?: string;
  text?: string;
  color?: string;
};

export default function BrandMarqueeBottom({
  className = "",
  itemClassName = "",
  compact = false,
  panel = false,
  giant = false,
  fontSize: fontSizeOverride,
  text = "828 CONSTRUCTION",
  color = "rgba(255, 255, 255, 0.28)",
}: BrandMarqueeBottomProps) {
  // giant: the footer wordmark lane.
  const heightClass = giant
    ? "h-[clamp(2.7rem,4.05vw,4.75rem)]"
    : panel
      ? "h-12 lg:h-[4.3rem]"
      : compact
        ? "h-12"
        : "h-[clamp(4.4rem,9vw,8.4rem)]";
  const fontSize = fontSizeOverride ?? (giant
    ? "clamp(2.9rem, 5.4vw, 5.2rem)"
    : panel
      ? "clamp(2.55rem, 4.25vw, 3.45rem)"
      : compact
        ? "clamp(1.25rem, 2.2vw, 2.35rem)"
        : "clamp(1.9rem, 3.6vw, 3.75rem)");
  // panel: tight tail — "CONSTRUCTION" runs into the next "828" so the loop
  // reads as one continuous train (Brian, 2026-07-13).
  const paddingClass = panel || giant ? "pr-4" : compact ? "pr-10" : "pr-16";

  return (
    <div
      aria-hidden="true"
      className={`brand-marquee-bottom relative w-full overflow-hidden ${heightClass} ${className}`}
    >
      <div
        className="animate-brand-marquee absolute left-0 top-0 flex h-full w-max items-center whitespace-nowrap will-change-transform"
      >
        {Array.from({ length: REPETITIONS }).map((_, i) => (
          <span
            key={i}
            className={`inline-flex items-center font-display font-bold uppercase ${paddingClass} ${itemClassName}`}
            style={{
              fontSize,
              color,
              letterSpacing: 0,
              lineHeight: 1,
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
