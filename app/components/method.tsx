import type { CSSProperties } from "react";
import { MethodParallax } from "./method-parallax";

type Step = {
  num: string;
  title: string;
  body: string;
  metric: string;
  label: string;
};

const steps: Step[] = [
  {
    num: "01",
    title: "Build the morning map",
    body: "Previous session levels, macro context, and the open are compressed into one clean thesis before a trade is even considered.",
    metric: "20m",
    label: "Prep window",
  },
  {
    num: "02",
    title: "Wait for the sweep",
    body: "Sparkzy teaches the exact moments that matter: where liquidity gets taken, where buyers or sellers respond, and where the trade is invalid.",
    metric: "NQ",
    label: "Single focus",
  },
  {
    num: "03",
    title: "Execute the plan",
    body: "Entry, stop, sizing, and trim rules are known before the candle prints. The desk is built to remove mid-trade improvising.",
    metric: "+5.5R",
    label: "Avg setup",
  },
  {
    num: "04",
    title: "Replay it while it is fresh",
    body: "Every live session turns into annotated review, so the reason behind the trade survives longer than the screenshot.",
    metric: "684",
    label: "Sessions",
  },
];

const rails = ["Bias", "Sweep", "Trigger", "Risk", "Replay"];

export function Method() {
  return (
    <section id="method" className="relative px-6 py-28 md:py-36 lg:py-24">
      <MethodParallax />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_78%,transparent)]" />

      <div className="mx-auto grid max-w-[1240px] gap-10 lg:min-h-[360svh] lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <aside className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.025] p-5 shadow-[0_30px_120px_-70px_rgba(255,255,255,0.35)] backdrop-blur-xl lg:sticky lg:top-24 lg:h-[calc(100svh-8rem)] lg:self-start lg:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(132deg,rgba(159,183,204,0.1),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_45%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-live anim-pulse-live" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/58">
                  Spark method
                </span>
              </div>

              <h2 className="mt-6 max-w-[10ch] font-display text-[clamp(42px,4.6vw,66px)] font-medium leading-[0.92] tracking-[-0.03em] text-white">
                One read.
                <span className="block text-white/45">Run daily.</span>
              </h2>

              <p className="mt-5 max-w-[46ch] text-[14.5px] leading-[1.65] text-white/55">
                This is the part that sticks while the steps move: a repeatable
                desk rhythm for finding the NQ open, managing risk, and turning
                every session into review.
              </p>
            </div>

            <div className="relative min-h-[280px] overflow-hidden rounded-lg border border-white/10 bg-black/35 p-4 lg:min-h-[220px] lg:p-3">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(159,183,204,0.065)_1px,transparent_1px),linear-gradient(90deg,rgba(159,183,204,0.065)_1px,transparent_1px)] bg-[size:34px_34px] opacity-45" />
              <svg
                className="absolute inset-0 h-full w-full opacity-70"
                viewBox="0 0 420 310"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  className="anim-draw"
                  style={{ "--draw-len": 900, animationDelay: "120ms" } as CSSProperties}
                  d="M18 244 C82 206 112 118 186 142 C250 166 236 226 306 188 C352 164 366 94 410 104"
                  fill="none"
                  stroke="rgba(255,255,255,0.44)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M102 204 L178 142 L250 166 L306 188 L372 112"
                  fill="none"
                  stroke="rgba(159,183,204,0.5)"
                  strokeDasharray="5 7"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="relative grid h-full content-between gap-5">
                <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/42">
                  <span>Live playbook</span>
                  <span className="text-accent">NQ 09:30</span>
                </div>

                <div className="mt-10 grid gap-2 lg:mt-3 lg:gap-1.5">
                  {rails.map((rail, index) => (
                    <div
                      key={rail}
                      data-method-rail
                      className="group flex items-center justify-between rounded border border-white/10 bg-white/[0.035] px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/[0.06] data-[active]:border-accent/35 data-[active]:bg-accent/[0.07] lg:py-1.5"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/58">
                        {String(index + 1).padStart(2, "0")} / {rail}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-accent opacity-60 transition-transform group-hover:scale-150" />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/42">
                  <span>Invalidation marked</span>
                  <span className="text-live">Risk clean</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <ol className="grid gap-5 lg:pb-[72svh] lg:pt-[30svh]">
          {steps.map((step) => (
            <li key={step.num} className="lg:flex lg:min-h-[82svh] lg:items-center">
              <article
                data-method-card
                className="group relative w-full rounded-lg border border-white/10 bg-white/[0.025] p-5 backdrop-blur transition-[border-color,background-color,box-shadow] duration-300 hover:border-white/22 hover:bg-white/[0.045] md:p-7"
              >
                <div className="pointer-events-none absolute inset-0 rounded-lg bg-[linear-gradient(135deg,rgba(159,183,204,0.13),transparent_36%,rgba(255,255,255,0.04))] opacity-[var(--method-card-glow,0)] transition-opacity" />
                <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                    {step.num}
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[28px] font-semibold leading-none text-white tabular-nums">
                      {step.metric}
                    </div>
                    <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/36">
                      {step.label}
                    </div>
                  </div>
                </div>

                <h3 className="mt-9 max-w-[13ch] font-display text-[clamp(30px,4vw,56px)] font-medium leading-[0.94] tracking-[-0.025em] text-white">
                  {step.title}
                </h3>
                <p className="mt-5 max-w-[58ch] text-[15px] leading-[1.75] text-white/56">
                  {step.body}
                </p>

                <div className="mt-8 h-px overflow-hidden bg-white/10">
                  <span className="block h-full w-1/3 bg-[linear-gradient(90deg,transparent,rgba(199,228,255,0.72),transparent)] transition-transform duration-500 group-hover:translate-x-[210%]" />
                </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
