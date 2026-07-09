import { signIn } from "@/auth";
import { SignalField } from "./signal-field";

async function discordSignIn() {
  "use server";
  await signIn("discord", { redirectTo: "/lectures" });
}

const modules = [
  { label: "Module active", value: "Open Drive", accent: "text-live" },
  { label: "Module beta", value: "Flow Map", accent: "text-[#7dd3fc]" },
  { label: "Module pending", value: "Risk Replay", accent: "text-accent" },
];

const floating = [
  { label: "Pre-open bias", pos: "left-[7%] top-[31%] hidden xl:flex", delay: "180ms" },
  { label: "Liquidity sweep", pos: "left-[12%] top-[52%] hidden lg:flex", delay: "260ms" },
  { label: "Trade execution", pos: "right-[10%] top-[28%] hidden xl:flex", delay: "420ms" },
  { label: "Trailing stop set", pos: "right-[13%] bottom-[28%] hidden lg:flex", delay: "500ms" },
];

const words = ["Perfect", "trading", "NQ", "with", "Sparkzy"];

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden bg-[#050505] px-6 pb-10 pt-28 sm:min-h-[90svh] md:pt-32"
    >
      <div className="absolute inset-0 -z-30 bg-[linear-gradient(180deg,#050505_0%,#020202_64%,#000_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-20 h-44 bg-gradient-to-b from-black via-black/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-20 h-48 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <SignalField />

      {floating.map((item) => (
        <div
          key={item.label}
          className={`anim-drift-up pointer-events-none absolute z-0 items-center gap-2 rounded-full border border-white/8 bg-white/[0.035] px-4 py-2 text-[12px] font-semibold text-white/32 shadow-[0_20px_70px_-38px_rgba(255,255,255,0.55)] backdrop-blur-xl ${item.pos}`}
          style={{ animationDelay: item.delay }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
          {item.label}
        </div>
      ))}

      <div className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-col items-center text-center">
        <div
          className="anim-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 backdrop-blur-xl"
          style={{ animationDelay: "140ms" }}
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-live anim-pulse-live" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/62">
            Private NQ desk - cohort seats open
          </span>
        </div>

        <h1 className="mt-8 max-w-[900px] text-balance font-display text-[clamp(46px,7.2vw,96px)] font-medium leading-[0.95] tracking-[-0.035em] text-white">
          {words.map((word, index) => (
            <span
              key={word}
              className={`anim-word inline-block ${
                index > 1
                  ? "text-[#8bd7ff] [text-shadow:0_0_34px_rgba(125,211,252,0.3)]"
                  : ""
              }`}
              style={{ animationDelay: `${260 + index * 70}ms` }}
            >
              {word}
              {index < words.length - 1 ? "\u00a0" : ""}
            </span>
          ))}
        </h1>

        <p
          className="anim-rise mt-6 max-w-[610px] text-pretty text-[15.5px] leading-[1.75] text-white/56 md:text-[17px]"
          style={{ animationDelay: "760ms" }}
        >
          Project Spark turns Sparkzy&apos;s live NQ process into a private
          desk: pre-open bias, execution standards, replay notes, and the vault
          that keeps the read sharp after the bell.
        </p>

        <div
          className="anim-rise mt-8 flex w-full max-w-[430px] flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row"
          style={{ animationDelay: "920ms" }}
        >
          <a
            href="https://discord.gg/projectspark"
            target="_blank"
            rel="noopener noreferrer"
            className="group btn-shimmer inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[14px] font-bold text-black shadow-[0_24px_80px_-34px_rgba(255,255,255,0.95)] transition-all hover:-translate-y-0.5 hover:bg-accent"
          >
            Join the desk
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
          <form action={discordSignIn}>
            <button
              type="submit"
              className="discord-glow-button group inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-white/14 bg-white/[0.035] px-5 text-[14px] font-semibold text-white/80 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/[0.075] hover:text-white sm:w-auto"
            >
              <span>Sign in with Discord</span>
              <span className="inline-flex rounded-full border border-[#5865F2]/35 bg-[#5865F2]/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#adb4ff]">
                Live
              </span>
            </button>
          </form>
        </div>

        <div
          className="anim-rise mt-12 grid w-full max-w-[650px] gap-3 sm:grid-cols-3"
          style={{ animationDelay: "1100ms" }}
        >
          {modules.map((module) => (
            <div
              key={module.value}
              className="group rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/22 hover:bg-white/[0.055]"
            >
              <div className={`font-mono text-[9.5px] uppercase tracking-[0.18em] ${module.accent}`}>
                {module.label}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[13px] font-semibold text-white/78">
                <span>{module.value}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60 transition-transform group-hover:scale-150" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
