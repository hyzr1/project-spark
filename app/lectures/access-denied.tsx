import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { signOutToHome } from "../lib/actions";

type Props = {
  reason: "not-in-guild" | "missing-role" | "discord-error";
};

const copy: Record<Props["reason"], { title: string; body: string }> = {
  "not-in-guild": {
    title: "You are not in the Project Spark server yet.",
    body: "Apply in the public Discord and we will set up your access role. If you have already been approved, give it a minute and try again.",
  },
  "missing-role": {
    title: "No access role on your account.",
    body: "We can see you in the Project Spark Discord, but you do not carry the access role yet. If you have just been approved, give it a minute. Otherwise reach out in support.",
  },
  "discord-error": {
    title: "Hit a Discord rate limit.",
    body: "Discord throttled the role check this time. Hit reload and your access should come right back. If it keeps happening, sign out and back in.",
  },
};

export function AccessDenied({ reason }: Props) {
  const c = copy[reason];
  return (
    <>
      <Header />
      <main className="relative flex flex-1 items-center justify-center px-6 py-32">
        <div className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-3xl border border-border bg-card/40 p-10 text-center">
          <div className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-warn anim-pulse-soft" />
            Access required
          </div>
          <h1 className="relative mt-6 font-display text-[44px] font-extrabold leading-[1.05] max-sm:text-[30px]">
            {c.title}
          </h1>
          <p className="relative mx-auto mt-5 max-w-[44ch] text-[15px] leading-[1.65] text-foreground/65">
            {c.body}
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://discord.gg/PD4UKbaem"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[14px] font-bold text-ink transition-all hover:bg-accent-soft hover:shadow-[0_0_0_5px_rgba(159,183,204,0.1)]"
            >
              Apply for access
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <a
              href="https://discord.gg/PD4UKbaem"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-5 py-3 text-[13.5px] text-foreground/85 transition-colors hover:border-accent hover:bg-card hover:text-accent"
            >
              Public Discord
            </a>
          </div>
          <form action={signOutToHome} className="relative mt-8">
            <button
              type="submit"
              className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-warn"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
