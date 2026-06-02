import { Logo } from "./logo";

const navItems = [
  { label: "Method", href: "/#method" },
  { label: "Curriculum", href: "/#curriculum" },
  { label: "Sparkzy", href: "/#mentor" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Lectures", href: "/lectures" },
  { label: "FAQ", href: "/#faq" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="absolute inset-0 -z-10 bg-black/45 backdrop-blur-2xl backdrop-saturate-150 [mask-image:linear-gradient(to_bottom,black_74%,transparent)]" />

      <nav className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 py-4 md:py-5">
        <Logo />

        <ul className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.025] px-1.5 py-1.5 backdrop-blur-xl md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="inline-flex rounded-full px-3.5 py-1.5 text-[13px] text-white/56 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-5">
          <a
            href="/lectures"
            className="hidden text-[13px] font-semibold text-white/58 transition-colors hover:text-white sm:inline-flex"
          >
            Members
          </a>
          <a
            href="https://discord.gg/PD4UKbaem"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-black transition-all hover:-translate-y-0.5 hover:bg-accent"
          >
            <span>Apply</span>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
}
