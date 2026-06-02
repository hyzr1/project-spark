import { SectionHeading } from "./section-heading";

type Schedule = {
  day: string;
  time: string;
  what: string;
  kind: "open" | "mid" | "close" | "lect" | "rev";
};

const week: Schedule[] = [
  { day: "Mon", time: "08:45 EST", what: "Pre-open weekly bias", kind: "open" },
  { day: "Mon", time: "09:30 EST", what: "Live NQ open narrated", kind: "open" },
  { day: "Tue", time: "09:30 EST", what: "Live NQ open narrated", kind: "open" },
  { day: "Wed", time: "12:30 EST", what: "Mid-session debrief", kind: "mid" },
  { day: "Wed", time: "20:00 EST", what: "Lecture drop: Spark Method", kind: "lect" },
  { day: "Thu", time: "09:30 EST", what: "Live NQ open narrated", kind: "open" },
  { day: "Fri", time: "15:50 EST", what: "Close debrief weekly recap", kind: "close" },
  { day: "Sun", time: "11:00 EST", what: "Cohort review and journals", kind: "rev" },
];

const kindStyle: Record<Schedule["kind"], { dot: string; label: string }> = {
  open: { dot: "bg-live", label: "Open" },
  mid: { dot: "bg-accent", label: "Mid" },
  close: { dot: "bg-warn", label: "Close" },
  lect: { dot: "bg-accent-soft", label: "Lect" },
  rev: { dot: "bg-foreground", label: "Review" },
};

export function Desk() {
  return (
    <section id="live" className="relative px-6 py-28 md:py-36">
      <div className="mx-auto max-w-[1240px]">
        <SectionHeading
          number="05"
          kicker="Live desk"
          title={
            <>
              The week has
              <br />
              a real schedule.
            </>
          }
          description={
            <>
              Opens, debriefs, lecture drops, and Sunday review are scheduled
              before the week starts, so members always know where the work is.
            </>
          }
        />

        <div className="mt-14 overflow-hidden rounded-[32px] border border-border bg-[#050505] shadow-[0_32px_120px_-60px_rgba(125,183,232,0.32)]">
          <div className="flex items-center justify-between border-b border-border bg-white/[0.025] px-5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-warn" />
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="h-2 w-2 rounded-full bg-live" />
              <span className="ml-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-foreground/55">
                spark.week-current
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-accent">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-live anim-pulse-soft" />
              Session 684
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_390px]">
            <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
                  Last 5 sessions
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-foreground/70">
                  Avg R +5.5 | WR 64% | Bias long
                </span>
              </div>
              <svg viewBox="0 0 720 210" className="h-[260px] w-full max-lg:h-[210px]">
                <defs>
                  <linearGradient id="desk-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9fb7cc" stopOpacity="0.34" />
                    <stop offset="100%" stopColor="#9fb7cc" stopOpacity="0" />
                  </linearGradient>
                  <pattern id="desk-grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="720" height="210" fill="url(#desk-grid)" />
                <path d="M0 150 L44 138 L88 145 L132 104 L176 112 L220 74 L264 88 L308 132 L352 48 L396 63 L440 34 L484 98 L528 44 L572 80 L616 25 L660 48 L720 38 L720 210 L0 210 Z" fill="url(#desk-fill)" />
                <path d="M0 150 L44 138 L88 145 L132 104 L176 112 L220 74 L264 88 L308 132 L352 48 L396 63 L440 34 L484 98 L528 44 L572 80 L616 25 L660 48 L720 38" fill="none" stroke="#9fb7cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="anim-draw" style={{ ["--draw-len" as string]: "1400" }} />
                <line x1="308" y1="132" x2="308" y2="0" stroke="#4ade80" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.65" />
                <circle cx="308" cy="132" r="4" fill="#4ade80" />
                <line x1="660" y1="48" x2="660" y2="0" stroke="#9fb7cc" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.7" />
                <circle cx="660" cy="48" r="4" fill="#9fb7cc" />
              </svg>
            </div>

            <div>
              <div className="grid grid-cols-[58px_108px_1fr_auto] items-center gap-3 border-b border-border bg-white/[0.025] px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                <span>Day</span>
                <span>Time</span>
                <span>Event</span>
                <span>Type</span>
              </div>
              {week.map((row, i) => {
                const k = kindStyle[row.kind];
                return (
                  <div
                    key={`${row.day}-${i}`}
                    className="grid grid-cols-[58px_108px_1fr_auto] items-center gap-3 border-b border-border/70 px-4 py-3 transition-colors hover:bg-white/[0.025] last:border-b-0"
                  >
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/82">
                      {row.day}
                    </span>
                    <span className="font-mono text-[11px] text-foreground/68 tabular-nums">
                      {row.time}
                    </span>
                    <span className="text-[13px] text-foreground/82">{row.what}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.025] px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-foreground/78">
                      <span className={`h-1.5 w-1.5 rounded-full ${k.dot}`} />
                      {k.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
