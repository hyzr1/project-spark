type BoltProps = {
  className?: string;
  glow?: boolean;
};

/**
 * The Project Spark bolt — a stylized lightning glyph. SVG, accepts
 * `currentColor` so it can be re-tinted per surface.
 */
export function Bolt({ className = "h-5 w-5", glow = false }: BoltProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      fill="currentColor"
      className={`${className} ${glow ? "anim-glow-pulse" : ""}`}
      aria-hidden
    >
      <path d="M14.5 0L0 18h8L6 32 24 13h-8L18 0z" />
    </svg>
  );
}
