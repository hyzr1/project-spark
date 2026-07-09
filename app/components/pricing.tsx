import { SectionHeading } from "./section-heading";

type Tier = {
  id: string;
  num: string;
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
};

const tiers: Tier[] = [
  {
    id: "monthly",
    num: "01",
    name: "Monthly",
    price: "$175",
    cadence: "/ mo - cancel anytime",
    blurb: "Try the desk with live sessions, signals, and the Discord.",
    cta: "Start monthly",
    features: [
      "8 live touchpoints / wk",
      "Daily NQ signals",
      "Active Discord community",
      "Cancel any time",
    ],
  },
  {
    id: "lifetime",
    num: "02",
    name: "Lifetime",
    price: "$600",
    cadence: "one-time",
    blurb: "The full Spark Method vault, every replay, and Sunday cohort calls.",
    cta: "Get lifetime",
    highlight: true,
    badge: "Best value",
    features: [
      "Everything in Monthly",
      "Full Spark Method module",
      "Lifetime replay vault",
      "Sunday cohort review",
      "Prop-firm scaling pathway",
    ],
  },
  {
    id: "private",
    num: "03",
    name: "1-on-1",
    price: "$1,500",
    cadence: "one-time - application",
    blurb: "Lifetime plus a weekly private call and direct DM line with Sparkzy.",
    cta: "Apply 1-on-1",
    features: [
      "Everything in Lifetime",
      "Weekly 1-on-1 call",
      "Direct DM access",
      "Personal risk plan",
      "Priority funded placement",
    ],
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-2.5 w-2.5"
      aria-hidden
    >
      <path d="M2.5 6.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="relative px-6 py-28 md:py-36">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          number="06"
          kicker="Pricing"
          align="center"
          title={
            <>
              Pick your
              <br />
              seat at the desk.
            </>
          }
          description={
            <>
              Start with live access, unlock the full vault, or work directly
              with Sparkzy one-on-one. The paths are simple on purpose.
            </>
          }
        />

        <div className="mt-14 grid gap-4">
          {tiers.map((t) => (
            <article
              key={t.id}
              className={`relative overflow-hidden rounded-[28px] border transition-colors ${
                t.highlight
                  ? "border-accent/55 bg-accent/[0.055] shadow-[0_36px_120px_-70px_rgba(125,183,232,0.55)]"
                  : "border-border bg-white/[0.025] hover:border-border-strong hover:bg-white/[0.035]"
              }`}
            >
              <div className="grid gap-7 p-6 md:grid-cols-[0.9fr_0.75fr_1.25fr] md:items-center md:p-8">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Tier {t.num}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-[31px] font-bold text-foreground">
                      {t.name}
                    </h3>
                    {t.badge && (
                      <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-accent">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 max-w-[34ch] text-[13.5px] leading-[1.6] text-foreground/64">
                    {t.blurb}
                  </p>
                </div>

                <div className="border-y border-border py-5 md:border-x md:border-y-0 md:px-7 md:py-0">
                  <div className={`font-display text-[48px] font-bold leading-none tabular-nums ${t.highlight ? "text-accent" : "text-foreground"}`}>
                    {t.price}
                  </div>
                  <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
                    {t.cadence}
                  </div>
                </div>

                <div>
                  <ul className="grid gap-2">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-foreground/82">
                        <span className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${t.highlight ? "bg-accent text-ink" : "border border-border text-accent"}`}>
                          <CheckIcon />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://discord.gg/projectspark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[13.5px] font-bold transition-all ${
                      t.highlight
                        ? "btn-shimmer bg-accent text-ink hover:-translate-y-0.5 hover:bg-accent-soft"
                        : "border border-border-strong bg-white/[0.025] text-foreground hover:border-accent/60 hover:text-accent"
                    }`}
                  >
                    {t.cta}
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
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-[680px] text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
          All prices USD - risk disclosure applies - education only - not financial advice
        </p>
      </div>
    </section>
  );
}
