import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLecture, LECTURES } from "@/lib/lectures";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { HlsPlayer } from "../../components/hls-player";
import { TamperSentry } from "../../components/tamper-sentry";
import { Bolt } from "../../components/bolt";
import { ConfigMissing } from "../config-missing";
import { signOutToHome } from "../../lib/actions";

type RouteParams = { slug: string };

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const lecture = getLecture(slug);
  if (!lecture) return { title: "Lecture not found | Project Spark" };
  return {
    title: `${lecture.title} | Project Spark`,
    description: lecture.summary,
    robots: { index: false, follow: false },
  };
}

export default async function LectureDetail({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const lecture = getLecture(slug);
  if (!lecture) notFound();

  if (!process.env.AUTH_SECRET || !process.env.AUTH_DISCORD_ID) {
    return <ConfigMissing />;
  }

  let session: import("next-auth").Session | null = null;
  try {
    session = await auth();
  } catch {
    return <ConfigMissing />;
  }
  if (!session) redirect(`/lectures/sign-in?callbackUrl=/lectures/${lecture.slug}`);
  if (!session.accessGranted) redirect("/lectures/no-access");

  if (process.env.LECTURES_DISABLED === "1") {
    return (
      <>
        <TamperSentry />
        <Header />
        <main className="relative flex flex-1 items-center justify-center px-6 py-32">
          <div className="mx-auto w-full max-w-[560px] rounded-3xl border border-border bg-card/40 p-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-warn/40 bg-warn/10 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-warn">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-warn anim-pulse-soft" />
              Lectures temporarily offline
            </div>
            <h1 className="mt-6 font-display text-[28px] font-extrabold leading-[1.1]">
              The vault is paused for the night.
            </h1>
            <p className="mx-auto mt-5 max-w-[44ch] text-[14px] leading-[1.65] text-foreground/65">
              Lectures are temporarily disabled while we cycle the streaming
              budget. Live sessions and the Discord community are unaffected.
              Back shortly.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const username = session.user?.name || "member";
  const discordId = session.discordId || "unlinked";
  const watermark = `${username} | ${discordId}`;
  const avatarUrl = session.discordAvatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${session.discordAvatar}.png?size=64`
    : null;

  const others = LECTURES.filter((l) => l.slug !== lecture.slug);

  return (
    <>
      <TamperSentry />
      <Header />
      <main className="relative flex-1 overflow-x-hidden px-6 pt-52 pb-24">
        <div className="mx-auto w-full max-w-[1180px]">
          <Link
            href="/lectures"
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="h-3 w-3 transition-transform group-hover:-translate-x-0.5">
              <path d="M13 8H3M7 12l-4-4 4-4" />
            </svg>
            All lectures
          </Link>

          <div className="mt-6 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                <span className="inline-flex h-1 w-1 rounded-full bg-accent" />
                {lecture.tag} | {lecture.code}
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
                {lecture.duration}
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-live/30 bg-live/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-live">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-live anim-pulse-soft" />
                AES-128 | access verified
              </span>
            </div>

            <h1 className="font-display text-balance text-[52px] font-extrabold leading-[1.04] max-md:text-[42px] max-sm:text-[32px]">
              {lecture.title}
            </h1>
            <p className="max-w-[68ch] text-pretty text-[15px] leading-[1.65] text-foreground/65">
              {lecture.summary}
            </p>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <div className="min-w-0">
              <HlsPlayer
                src={`/api/lectures/${lecture.slug}/manifest.m3u8`}
                watermark={watermark}
              />

              <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="rounded-2xl border border-border bg-card/30 p-4">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/85">
                    <Bolt className="h-3 w-2 text-accent" />
                    Watermarked to @{username} | AES-128 over HLS
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-[1.55] text-foreground/55">
                    Switching tabs ends your session. Downloads and devtools shortcuts are blocked
                    while the player has focus. Any leaked recording is traceable back to this account.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card/30 p-4 lg:min-w-[220px]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/85">
                    Shortcuts
                  </div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px] tabular-nums">
                    <Kbd>Space</Kbd><span className="text-foreground/55">Play / pause</span>
                    <Kbd>Left Right</Kbd><span className="text-foreground/55">Seek 5s</span>
                    <Kbd>J L</Kbd><span className="text-foreground/55">Seek 10s</span>
                    <Kbd>Up Down</Kbd><span className="text-foreground/55">Volume</span>
                    <Kbd>M</Kbd><span className="text-foreground/55">Mute</span>
                    <Kbd>F</Kbd><span className="text-foreground/55">Fullscreen</span>
                  </dl>
                </div>
              </div>
            </div>

            <aside className="min-w-0">
              <div className="sticky top-24 flex flex-col gap-6">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/40 p-4">
                  <span className="relative inline-flex h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border-strong bg-background/70">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="" width={88} height={88} className="h-full w-full object-cover" unoptimized />
                    ) : (
                      <span className="m-auto font-display text-[14px] tracking-[0.08em] text-foreground/85">
                        {username.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-live anim-pulse-soft" />
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        Access verified
                      </span>
                    </div>
                    <div className="mt-1 truncate text-[14px] font-semibold text-foreground/90">
                      {username}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[10px] text-muted">
                      {discordId}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
                      <Bolt className="h-3 w-2 text-accent" />
                      Up next in the vault
                    </div>
                    <Link
                      href="/lectures"
                      className="group inline-flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-foreground/70 transition-colors hover:text-accent"
                    >
                      All
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </Link>
                  </div>

                  {others.length === 0 ? (
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/30 p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-accent">
                          <span className="inline-flex h-1 w-1 rounded-full bg-accent anim-pulse-soft" />
                          Vault filling
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          More soon
                        </span>
                      </div>

                      <div className="mt-4 font-display text-[18px] font-extrabold leading-[1.2]">
                        More lectures land weekly.
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.55] text-foreground/60">
                        New Spark Method modules and daily debriefs drop on a
                        rolling schedule. Announced in the private channel.
                      </p>

                      <a
                        href="https://discord.gg/PD4UKbaem"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-[12.5px] text-foreground/85 transition-colors hover:border-accent hover:bg-card hover:text-accent"
                      >
                        Get notified in Discord
                      </a>
                    </div>
                  ) : (
                    others.map((l) => (
                      <Link
                        key={l.slug}
                        href={`/lectures/${l.slug}`}
                        className="group flex flex-col gap-2 rounded-2xl border border-border bg-card/30 p-4 transition-colors hover:border-accent/40 hover:bg-card/60"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                            {l.code}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/55">
                            {l.duration}
                          </span>
                        </div>
                        <span className="font-display text-[16px] font-extrabold leading-[1.2] group-hover:text-accent">
                          {l.title}
                        </span>
                      </Link>
                    ))
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-border px-1 pt-5">
                  <Link
                    href="/lectures"
                    className="group inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80 transition-colors hover:text-foreground"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="h-3 w-3 transition-transform group-hover:-translate-x-0.5">
                      <path d="M13 8H3M7 12l-4-4 4-4" />
                    </svg>
                    All lectures
                  </Link>
                  <form action={signOutToHome}>
                    <button
                      type="submit"
                      className="group inline-flex items-center gap-1.5 text-[12.5px] text-foreground/55 transition-colors hover:text-warn"
                    >
                      Sign out
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                        <path d="M10 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1" />
                        <path d="M7 8h7M11 5l3 3-3 3" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center rounded-md border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground/85">
      {children}
    </kbd>
  );
}
