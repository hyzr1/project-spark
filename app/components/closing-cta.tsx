import { SignalField } from "./signal-field";

export function ClosingCTA() {
  return (
    <section
      id="apply"
      className="relative isolate overflow-hidden border-y border-border px-6 py-28 md:py-40"
    >
      <SignalField />
      <div className="absolute inset-0 bg-black/62" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black via-black/76 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/76 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(159,183,204,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(159,183,204,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_76%,transparent)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(159,183,204,0.65),transparent)]" />

      <div className="relative mx-auto flex max-w-[820px] flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.035] px-3 py-1.5 backdrop-blur">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent anim-pulse-soft" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-foreground/78">
            Monthly - lifetime - 1-on-1
          </span>
        </div>

        <h2 className="mt-7 max-w-[18ch] text-balance font-display text-[clamp(44px,7vw,92px)] font-bold leading-[0.9]">
          Show up
          <br />
          tomorrow.
        </h2>

        <p className="mt-6 max-w-[520px] text-[15.5px] leading-[1.7] text-foreground/68 sm:text-[17px]">
          Apply for the public Discord, get your access role, and join the next
          pre-open with Sparkzy.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="https://discord.gg/projectspark"
            target="_blank"
            rel="noopener noreferrer"
            className="group btn-shimmer inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-7 text-[14px] font-bold text-ink shadow-[0_18px_60px_-24px_rgba(125,183,232,0.75)] transition-all hover:-translate-y-0.5 hover:bg-accent-soft"
          >
            Apply for access
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
          <a
            href="/lectures"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-white/[0.035] px-6 text-[14px] font-semibold text-foreground/90 backdrop-blur transition-colors hover:border-accent/60 hover:text-accent"
          >
            Member lectures
          </a>
        </div>

        <p className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">
          One mentor - eight live moments / week - NQ futures
        </p>
      </div>
    </section>
  );
}
