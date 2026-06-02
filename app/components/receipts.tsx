import { SectionHeading } from "./section-heading";

type Receipt = {
  symbol: string;
  side: "LONG" | "SHORT" | "DAY";
  pnl: string;
  date: string;
  ticks?: string;
};

const all: Receipt[] = [
  { symbol: "NQ", side: "LONG", pnl: "+$18,450", date: "Mar 12", ticks: "+372 t" },
  { symbol: "NQ", side: "SHORT", pnl: "+$11,200", date: "Mar 14", ticks: "+224 t" },
  { symbol: "Day", side: "DAY", pnl: "+$24,615", date: "Mar 18" },
  { symbol: "NQ", side: "LONG", pnl: "+$7,890", date: "Mar 19", ticks: "+158 t" },
  { symbol: "ES", side: "LONG", pnl: "+$4,320", date: "Mar 21", ticks: "+108 t" },
  { symbol: "NQ", side: "SHORT", pnl: "+$15,775", date: "Mar 24", ticks: "+316 t" },
  { symbol: "Day", side: "DAY", pnl: "+$31,040", date: "Mar 26" },
  { symbol: "NQ", side: "LONG", pnl: "+$9,500", date: "Mar 28", ticks: "+190 t" },
  { symbol: "NQ", side: "LONG", pnl: "+$22,100", date: "Apr 02", ticks: "+442 t" },
  { symbol: "Day", side: "DAY", pnl: "+$12,460", date: "Apr 04" },
  { symbol: "NQ", side: "SHORT", pnl: "+$6,250", date: "Apr 08", ticks: "+125 t" },
  { symbol: "NQ", side: "LONG", pnl: "+$28,975", date: "Apr 11", ticks: "+579 t" },
];

const summary = [
  { k: "Total P&L", v: "+$113,795" },
  { k: "Win rate", v: "60%" },
  { k: "Biggest trade", v: "900 pts" },
  { k: "Avg / day", v: "+$6,229" },
];

function Card({ r }: { r: Receipt }) {
  const isShort = r.side === "SHORT";
  const isDay = r.side === "DAY";
  return (
    <figure className="relative w-[260px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur transition-transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/70">
          {r.symbol}
        </span>
        <span
          className={`font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] ${
            isShort ? "text-warn" : isDay ? "text-accent" : "text-live"
          }`}
        >
          {r.side}
        </span>
      </div>
      <div className="mt-5 font-display text-[31px] font-bold leading-none text-white tabular-nums">
        {r.pnl}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span>{r.date} 2026</span>
        <span>{r.ticks ?? "Daily net"}</span>
      </div>
    </figure>
  );
}

export function Receipts() {
  return (
    <section id="receipts" className="relative overflow-hidden py-28 md:py-36">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <SectionHeading
          number="02"
          kicker="Receipts"
          title={
            <>
              Proof that
              <br />
              moves fast.
            </>
          }
          description={
            <>
              Mentor-run fills from the current Project Spark cycle. The point
              is not the screenshot. It is seeing the read explained before,
              during, and after the trade.
            </>
          }
        />

        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-border bg-white/[0.025] md:grid-cols-4">
          {summary.map((s, i) => (
            <div
              key={s.k}
              className={`px-5 py-5 ${i > 0 ? "border-l border-border" : ""}`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {s.k}
              </div>
              <div className="mt-2 font-display text-[25px] font-bold text-foreground tabular-nums">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ticker-mask mt-14 overflow-hidden">
        <div className="marquee-left flex w-max items-center gap-5">
          {[...all, ...all].map((r, i) => (
            <Card key={`${r.symbol}-${r.date}-${i}`} r={r} />
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-6">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
          Past results are not a guarantee - futures trading carries substantial risk
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 backdrop-blur">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-live anim-pulse-soft" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-foreground/78">
            Last 60 days
          </span>
        </div>
      </div>
    </section>
  );
}
