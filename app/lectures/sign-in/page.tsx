import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import styles from "./sign-in.module.css";

export const metadata = {
  title: "Sign in | Project Spark",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ reason?: string; callbackUrl?: string }>;

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const session = await auth();
  if (session?.accessGranted) redirect("/lectures");
  if (session && !session.accessGranted) redirect("/lectures/no-access");

  const params = (await searchParams) ?? {};
  const tampered = params.reason === "tamper";
  const retry = params.reason === "retry";

  async function discordSignIn() {
    "use server";
    await signIn("discord", { redirectTo: "/lectures" });
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.frame}>
          {(tampered || retry) && (
            <div className={tampered ? styles.alertWarn : styles.alertInfo} role="status">
              <span className={styles.alertDot} aria-hidden />
              <div>
                <strong>
                  {tampered
                    ? "Session ended for player tampering"
                    : "Discord was busy - try again"}
                </strong>
                <p>
                  {tampered
                    ? "Your last lecture session was stopped after a protected player change, tab switch, or focus loss. Sign in again to continue."
                    : "The role check was rate-limited on the last attempt. Give it a moment, then continue with Discord again."}
                </p>
              </div>
            </div>
          )}

          <section className={styles.surface} aria-labelledby="signin-title">
            <div className={styles.copy}>
              <p className={styles.eyebrow}>Project Spark lectures</p>
              <h1 id="signin-title">Members sign in with Discord.</h1>
              <p className={styles.lede}>
                One click verifies your role in the private Project Spark server
                and opens the lecture vault. No password is collected here.
              </p>

              <dl className={styles.accessList}>
                <div>
                  <dt>Verification</dt>
                  <dd>Live Discord role check on sign-in</dd>
                </div>
                <div>
                  <dt>Playback</dt>
                  <dd>AES-128 encrypted lecture streaming</dd>
                </div>
                <div>
                  <dt>Privacy</dt>
                  <dd>Membership status only, no Discord password</dd>
                </div>
              </dl>
            </div>

            <div className={styles.action}>
              <div className={styles.badge}>
                <span className={styles.liveDot} aria-hidden />
                Members-only gate
              </div>

              <form action={discordSignIn} className={styles.form}>
                <button type="submit" className={`${styles.discordButton} discord-glow-button`}>
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                    className={styles.discordIcon}
                  >
                    <path d="M13.55 3.5A12.5 12.5 0 0 0 10.4 2.5l-.16.32a11.4 11.4 0 0 0-3.16 0L6.92 2.5a12.5 12.5 0 0 0-3.16 1c-2 2.97-2.54 5.85-2.27 8.69A12.6 12.6 0 0 0 5.3 14l.78-1.06a8.1 8.1 0 0 1-1.27-.62l.31-.24c2.45 1.13 5.1 1.13 7.55 0l.32.24c-.4.24-.83.45-1.28.62L12.49 14a12.6 12.6 0 0 0 3.81-1.81c.32-3.3-.55-6.16-2.75-8.69ZM6.34 10.46c-.75 0-1.37-.69-1.37-1.53 0-.85.6-1.54 1.37-1.54.78 0 1.39.7 1.37 1.54 0 .84-.6 1.53-1.37 1.53Zm5 0c-.75 0-1.37-.69-1.37-1.53 0-.85.6-1.54 1.37-1.54.78 0 1.39.7 1.37 1.54 0 .84-.6 1.53-1.37 1.53Z" />
                  </svg>
                  <span>Continue with Discord</span>
                </button>
              </form>

              <p className={styles.helper}>
                After Discord approves the role check, you will be sent straight
                to lectures.
              </p>

              <div className={styles.separator} aria-hidden />

              <p className={styles.membership}>
                Need access?{" "}
                <a
                  href="https://discord.gg/PD4UKbaem"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply in the public Discord
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
