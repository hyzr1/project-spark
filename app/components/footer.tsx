import { Logo } from "./logo";

const links = [
  { label: "Method", href: "/#method" },
  { label: "Curriculum", href: "/#curriculum" },
  { label: "Sparkzy", href: "/#mentor" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Lectures", href: "/lectures" },
  { label: "FAQ", href: "/#faq" },
  {
    label: "Discord",
    href: "https://discord.gg/projectspark",
    external: true,
  },
];

const social = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@sparkzy.fr",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.49a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.42z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/sparkzy.fr/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-3.5 w-3.5" aria-hidden>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border px-6 pt-14 pb-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-col items-start gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[42ch]">
            <Logo />
            <p className="mt-4 text-[13px] leading-[1.6] text-foreground/55">
              A private NQ futures mentorship led by Sparkzy. Live sessions,
              the Spark Method curriculum, and a small cohort.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 backdrop-blur">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-live anim-pulse-soft" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/72">
                Live - pre-open in 14:22
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-6 md:items-end">
            <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
              {links.map((l) => {
                const external = "external" in l && l.external;
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="text-[13px] text-foreground/65 transition-colors hover:text-accent"
                  >
                    {l.label}
                  </a>
                );
              })}
            </nav>

            <div className="flex gap-2">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white/[0.03] text-foreground/75 transition-colors hover:border-accent hover:bg-accent hover:text-ink"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 md:flex-row md:items-center">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
            2026 Project Spark - All rights reserved
          </div>
          <div className="max-w-[60ch] font-mono text-[9.5px] leading-[1.7] uppercase tracking-[0.14em] text-muted/70">
            Futures trading involves substantial risk of loss. Past performance
            is not indicative of future results. Project Spark is an
            educational program, not financial advice.
          </div>
        </div>
      </div>
    </footer>
  );
}
