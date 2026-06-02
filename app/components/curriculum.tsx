import { SectionHeading } from "./section-heading";

type Module = {
  num: string;
  title: string;
  lessons: number;
  hours: string;
  status: "core" | "live" | "rolling" | "locked";
  summary: string;
};

const chapters: Module[] = [
  {
    num: "00",
    title: "The Spark Method",
    lessons: 32,
    hours: "12h+",
    status: "core",
    summary:
      "The proprietary read framework Sparkzy built across years of live NQ trading.",
  },
  {
    num: "01",
    title: "Risk and sizing",
    lessons: 7,
    hours: "2h 50m",
    status: "live",
    summary:
      "Sizing as a function of conviction, daily loss limits, and hot-streak ramp rules.",
  },
  {
    num: "02",
    title: "Trader mindset",
    lessons: 10,
    hours: "3h 40m",
    status: "live",
    summary:
      "Tilt detection, revenge-trade circuit breakers, and how to stay flat after a stop.",
  },
  {
    num: "03",
    title: "Prop-firm pathway",
    lessons: 9,
    hours: "3h 20m",
    status: "rolling",
    summary:
      "Eval providers, sizing across accounts, payout cadence, and account rotation.",
  },
  {
    num: "04",
    title: "Macro tape",
    lessons: 6,
    hours: "2h 35m",
    status: "rolling",
    summary:
      "Reading the macro bias before the bell so the open starts with a hypothesis.",
  },
  {
    num: "05",
    title: "Journal and review",
    lessons: 5,
    hours: "1h 55m",
    status: "locked",
    summary:
      "The Sunday review template: what to log, what to ignore, and what to flag.",
  },
];

function StatusBadge({ status }: { status: Module["status"] }) {
  const label = {
    core: "Core",
    live: "Live",
    rolling: "Rolling",
    locked: "Members",
  }[status];

  const tone = {
    core: "bg-accent text-ink border-accent",
    live: "bg-live/10 text-live border-live/30",
    rolling: "bg-accent/10 text-accent border-accent/30",
    locked: "bg-white/[0.03] text-muted border-border",
  }[status];

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] ${tone}`}>
      {label}
    </span>
  );
}

export function Curriculum() {
  return (
    <section id="curriculum" className="relative px-6 py-28 md:py-36">
      <div className="mx-auto max-w-[1180px]">
        <SectionHeading
          number="03"
          kicker="Curriculum"
          title={
            <>
              A vault that
              <br />
              matches the desk.
            </>
          }
          description={
            <>
              The modules are built around the live process. Watch the concept,
              see it called in session, then review the replay with the same
              language.
            </>
          }
        />

        <div className="mt-14 overflow-hidden rounded-3xl border border-border bg-white/[0.025]">
          {chapters.map((c, i) => {
            const featured = c.status === "core";
            return (
              <article
                key={c.num}
                className={`grid gap-5 px-5 py-6 transition-colors md:grid-cols-[86px_minmax(0,1fr)_auto] md:items-center md:px-7 ${
                  i > 0 ? "border-t border-border" : ""
                } ${featured ? "bg-accent/[0.045]" : "hover:bg-white/[0.025]"}`}
              >
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Ch
                  </div>
                  <div className={`font-display text-[40px] font-bold leading-none tabular-nums ${featured ? "text-accent" : "text-foreground/82"}`}>
                    {c.num}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h3 className="font-display text-[24px] font-bold leading-tight text-foreground md:text-[28px]">
                      {c.title}
                    </h3>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
                      {c.lessons} lessons - {c.hours}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[68ch] text-[14px] leading-[1.65] text-foreground/63">
                    {c.summary}
                  </p>
                </div>

                <div className="md:justify-self-end">
                  <StatusBadge status={c.status} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
