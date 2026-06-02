import { SectionHeading } from "./section-heading";

type QA = { q: string; a: React.ReactNode };

const faqs: QA[] = [
  {
    q: "Do I need to already be trading futures?",
    a: (
      <>
        No, but you should be on a sim before you join. Many members come from
        equities or options, run Spark on the NQ sim first, then fund.
      </>
    ),
  },
  {
    q: "What makes Project Spark different from a signals room?",
    a: (
      <>
        Signals alone do not teach the read. Project Spark combines live calls,
        the Spark Method, replays, and weekly review so you can understand the
        setup instead of copying it.
      </>
    ),
  },
  {
    q: "Monthly vs Lifetime: which should I pick?",
    a: (
      <>
        Monthly is the desk: live sessions, signals, and Discord. Lifetime adds
        the full vault, every replay, Sunday cohort review, and the scaling path.
      </>
    ),
  },
  {
    q: "Do I have to take the trades Sparkzy calls?",
    a: (
      <>
        No. Signals are setups, not orders. Sparkzy posts the level,
        invalidation, and target. You decide what fits your account and risk.
      </>
    ),
  },
  {
    q: "Is everything recorded?",
    a: (
      <>
        Yes. Live sessions land in the vault. Lectures and replays are streamed
        to verified members and watermarked to the Discord account.
      </>
    ),
  },
  {
    q: "What does the 1-on-1 tier include?",
    a: (
      <>
        Everything in Lifetime plus a weekly private call with Sparkzy, direct
        DM access, and a personal risk and scaling plan.
      </>
    ),
  },
  {
    q: "Do you guarantee results?",
    a: (
      <>
        No. Futures carry real risk. What is guaranteed is the structure:
        scheduled sessions, a real mentor, the curriculum, and a community that
        shows up.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative px-6 py-28 md:py-36">
      <div className="mx-auto max-w-[880px]">
        <SectionHeading
          number="07"
          kicker="FAQ"
          align="center"
          title={<>Questions before you join?</>}
          description={
            <>
              The short version: this is a live mentorship around one market,
              one method, and one mentor.
            </>
          }
        />

        <div className="mt-12 overflow-hidden rounded-3xl border border-border bg-white/[0.025]">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group/q border-b border-border px-5 py-5 last:border-b-0 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-accent">
                    0{i + 1}
                  </span>
                  <span className="font-display text-[19px] font-semibold leading-[1.32] text-foreground/92 transition-colors group-hover/q:text-foreground">
                    {f.q}
                  </span>
                </span>
                <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-white/[0.025] text-foreground/70 transition-all duration-300 group-open/q:border-accent group-open/q:bg-accent group-open/q:text-ink">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    className="h-3 w-3 transition-transform duration-300 group-open/q:rotate-45"
                    aria-hidden
                  >
                    <path d="M6 2v8M2 6h8" />
                  </svg>
                </span>
              </summary>
              <div className="mt-3 max-w-[64ch] pl-[38px] text-[14.5px] leading-[1.7] text-foreground/64">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
