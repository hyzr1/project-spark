type TickerItem = {
  label: string;
  value: string;
  unit?: string;
};

const items: TickerItem[] = [
  { label: "Live NQ", value: "ACTIVE" },
  { label: "Members", value: "128", unit: "/ 150" },
  { label: "Cohort", value: "03", unit: "2026" },
  { label: "Hours live", value: "1,420", unit: "h" },
  { label: "Sessions", value: "684" },
  { label: "Avg setup", value: "+5.5", unit: "R" },
  { label: "Win rate", value: "64", unit: "%" },
  { label: "Bias", value: "LONG" },
  { label: "Discord", value: "ONLINE" },
  { label: "Pre-open", value: "14:22" },
];

function Row({ items }: { items: TickerItem[] }) {
  return (
    <div className="flex shrink-0 items-center">
      {items.map((i, idx) => (
        <div
          key={`${i.label}-${idx}`}
          className="flex min-h-14 items-center gap-3 whitespace-nowrap border-r border-white/10 px-7"
        >
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {i.label}
          </span>
          <span className="font-mono text-[12px] font-bold tabular-nums text-accent">
            {i.value}
          </span>
          {i.unit && (
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
              {i.unit}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <section className="relative isolate border-y border-white/10 bg-[#050505]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(159,183,204,0.65),transparent)]" />
      <div className="ticker-mask overflow-hidden">
        <div className="ticker-track flex w-max items-center">
          <Row items={items} />
          <Row items={items} />
        </div>
      </div>
    </section>
  );
}
