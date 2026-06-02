import { SectionHeading } from "./section-heading";

const stats = [
  { v: "3 yrs", l: "Full-time" },
  { v: "6x", l: "Funded firms" },
  { v: "1,420h", l: "Live on tape" },
  { v: "35", l: "Members coached" },
];

const credits = [
  "Author of the Spark Method",
  "Funded across Apex, MFFU, Topstep, Lucid",
  "Hosts the NQ open and close debriefs",
  "Runs every Sunday cohort review call",
];

export function Mentor() {
  return (
    <section id="mentor" className="relative px-6 py-28 md:py-36">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative min-h-[540px] overflow-hidden rounded-lg border border-border bg-white/[0.025]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(159,183,204,0.13),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.055),rgba(0,0,0,0.88))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(159,183,204,0.065)_1px,transparent_1px),linear-gradient(90deg,rgba(159,183,204,0.065)_1px,transparent_1px)] bg-[size:42px_42px] opacity-50" />
          <svg
            className="absolute inset-0 h-full w-full opacity-55"
            viewBox="0 0 620 540"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              className="anim-draw"
              d="M-20 402 C112 330 148 176 292 236 C390 278 388 364 502 286 C570 240 592 164 660 182"
              fill="none"
              stroke="rgba(255,255,255,0.34)"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M118 380 L292 236 L392 272 L502 286 L590 186"
              fill="none"
              stroke="rgba(159,183,204,0.48)"
              strokeDasharray="6 8"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="absolute right-6 top-24 hidden w-[220px] rounded-lg border border-white/10 bg-black/32 p-4 backdrop-blur-xl sm:block">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/42">
              Desk signal
            </div>
            <div className="mt-3 font-display text-[34px] font-semibold leading-none text-white">
              +5.5R
            </div>
            <div className="mt-2 text-[12px] leading-relaxed text-white/46">
              Average setup reviewed inside the cohort.
            </div>
          </div>

          <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-3 py-1.5 backdrop-blur-xl">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-live anim-pulse-soft" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/78">
              Live at the open
            </span>
          </div>
          <div className="absolute bottom-7 left-7 right-7">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-accent">
              Lead mentor
            </div>
            <div className="mt-2 font-display text-[clamp(48px,7vw,86px)] font-semibold leading-[0.88] text-white">
              Sparkzy
            </div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/52">
              @sparkzy - cohort 03 - 2026
            </div>
          </div>
        </div>

        <div>
          <SectionHeading
            number="04"
            kicker="Mentor"
            title={
              <>
                One operator.
                <br />
                No handoff.
              </>
            }
            description={
              <>
                Project Spark is run by Sparkzy directly. The same trader who
                teaches the framework is the one calling the open, reviewing
                journals, and answering in the Discord.
              </>
            }
          />

          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border">
            {stats.map((s) => (
              <div key={s.l} className="bg-background px-5 py-5">
                <div className="font-display text-[30px] font-bold text-accent">
                  {s.v}
                </div>
                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <ul className="mt-8 grid gap-3 border-t border-border pt-6">
            {credits.map((c) => (
              <li key={c} className="flex items-start gap-3 text-[14.5px] text-foreground/82">
                <span className="mt-2 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{c}</span>
              </li>
            ))}
          </ul>

          <a
            href="https://www.tiktok.com/@sparkzy.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.035] px-5 py-3 text-[14px] font-semibold text-foreground/88 transition-colors hover:border-accent/50 hover:text-accent"
          >
            Follow Sparkzy on TikTok
            <span className="font-mono text-[11px] text-muted transition-colors group-hover:text-accent">
              @sparkzy.fr
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
