import { Header } from "../components/header";
import { Footer } from "../components/footer";

export function ConfigMissing() {
  return (
    <>
      <Header />
      <main className="relative flex flex-1 items-center justify-center px-6 py-32">
        <div className="mx-auto w-full max-w-[680px] rounded-3xl border border-border bg-card/40 p-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-warn anim-pulse-soft" />
            Setup required
          </div>
          <h1 className="mt-6 font-display text-[32px] font-extrabold leading-[1.1]">
            Discord gating is not configured yet.
          </h1>
          <p className="mx-auto mt-5 max-w-[52ch] text-[14.5px] leading-[1.65] text-foreground/65">
            Set <code className="font-mono text-accent">DISCORD_GUILD_ID</code>{" "}
            and <code className="font-mono text-accent">DISCORD_ACCESS_ROLE_ID</code>{" "}
            in your environment, plus the OAuth credentials. See{" "}
            <code className="font-mono text-accent">.env.local.example</code> at
            the project root.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
