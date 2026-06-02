import { Bolt } from "./bolt";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { text: "text-[15px]", bolt: "h-4 w-3" },
  md: { text: "text-[17px]", bolt: "h-5 w-[14px]" },
  lg: { text: "text-[22px]", bolt: "h-6 w-[18px]" },
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  const s = sizeMap[size];
  return (
    <a
      href="/"
      aria-label="Project Spark home"
      className={`group inline-flex items-center gap-2 ${className}`}
    >
      <span className="text-accent transition-transform group-hover:rotate-[8deg]">
        <Bolt className={s.bolt} />
      </span>
      <span
        className={`font-display font-semibold tracking-[-0.012em] text-foreground transition-colors group-hover:text-accent ${s.text}`}
      >
        Project Spark
      </span>
    </a>
  );
}
