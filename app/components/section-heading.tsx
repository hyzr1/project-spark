type SectionHeadingProps = {
  number: string;
  kicker: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
};

export function SectionHeading({
  number,
  kicker,
  title,
  description,
  align = "left",
  id,
}: SectionHeadingProps) {
  const alignCls =
    align === "center"
      ? "mx-auto items-center text-center"
      : "items-start text-left";

  return (
    <div id={id} className={`flex max-w-[860px] flex-col gap-5 ${alignCls}`}>
      <div
        className={`inline-flex items-center gap-3 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          {number}
        </span>
        <span className="h-px w-10 bg-[linear-gradient(90deg,rgba(159,183,204,0.72),transparent)]" />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-foreground/58">
          {kicker}
        </span>
      </div>
      <h2 className="font-display text-balance text-[clamp(34px,4.7vw,64px)] font-bold leading-[0.98] text-foreground">
        {title}
      </h2>
      {description && (
        <p className="max-w-[620px] text-pretty text-[15px] leading-[1.7] text-foreground/64 sm:text-[16.5px]">
          {description}
        </p>
      )}
    </div>
  );
}
