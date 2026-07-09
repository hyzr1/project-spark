import { Header } from "../../components/header";
import { Footer } from "../../components/footer";

export const metadata = {
  title: "No access | Project Spark",
  robots: { index: false, follow: false },
};

export default function NoAccessPage() {
  return (
    <>
      <Header />
      <main className="relative flex flex-1 items-center justify-center px-6 py-32">
        <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-3xl border border-border bg-card/40 p-10 text-center">
          <div className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-warn anim-pulse-soft" />
            No Project Spark membership detected
          </div>
          <h1 className="relative mt-6 font-display text-[40px] font-extrabold leading-[1.1] max-sm:text-[30px]">
            You do not have access yet.
          </h1>
          <p className="relative mx-auto mt-5 max-w-[46ch] text-[14.5px] leading-[1.65] text-foreground/65">
            Your Discord account is not in the Project Spark private server with
            the access role. The vault is gated to active members only. Apply in
            the public Discord and we will set up your access.
          </p>

          <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="https://discord.gg/projectspark"
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
              href="https://discord.gg/projectspark"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-5 py-3 text-[13.5px] text-foreground/85 transition-colors hover:border-accent hover:bg-card hover:text-accent"
            >
              Public Discord
            </a>
          </div>

          <p className="relative mt-7 text-[12px] text-muted">
            Already a member?{" "}
            <a
              href="https://discord.gg/projectspark"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/85 underline underline-offset-4 hover:text-accent"
            >
              Ping support in the public Discord
            </a>{" "}
            and we will get the role on you.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
