import { auth } from "@/auth";
import { LECTURES } from "@/lib/lectures";
import { hasAcceptedNda } from "@/lib/nda";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { signOutToHome } from "../lib/actions";
import { ConfigMissing } from "./config-missing";
import styles from "./lectures.module.css";

export const metadata = {
  title: "Lectures | Project Spark",
  description:
    "Project Spark members vault, the Spark Method, daily debriefs, and the rest of the curriculum.",
  robots: { index: false, follow: false },
};

export default async function LecturesPage() {
  if (!process.env.AUTH_SECRET || !process.env.AUTH_DISCORD_ID) {
    return <ConfigMissing />;
  }

  let session: import("next-auth").Session | null = null;
  try {
    session = await auth();
  } catch {
    return <ConfigMissing />;
  }

  if (!session) redirect("/lectures/sign-in");
  if (!session.accessGranted) redirect("/lectures/no-access");
  if (!(await hasAcceptedNda(session.discordId))) {
    redirect("/lectures/nda?callbackUrl=%2Flectures");
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.hero} aria-labelledby="lectures-title">
            <div>
              <div className={styles.kicker}>
                <span className={styles.livePulse} aria-hidden />
                Members vault
              </div>
              <h1 id="lectures-title">Lectures</h1>
              <p>
                Spark Method vault, daily debriefs, and the supporting risk and
                mindset modules. Streaming-only content is encrypted,
                Discord-gated, and watermarked to your account.
              </p>
            </div>
          </section>

          <section className={styles.vault} aria-label="Available lectures">
            <div className={styles.vaultHeader}>
              <div>
                <strong>{LECTURES.length}</strong>{" "}
                {LECTURES.length === 1 ? "lecture" : "lectures"} available
              </div>
              <span>
                <span className={styles.livePulse} aria-hidden />
                Members vault live
              </span>
            </div>

            <ul className={styles.lectureList}>
              {LECTURES.map((lecture) => (
                <li key={lecture.slug}>
                  <Link href={`/lectures/${lecture.slug}`} className={styles.lectureRow}>
                    <span className={styles.code}>{lecture.code}</span>
                    <span className={styles.title}>{lecture.title}</span>
                    <span className={styles.status}>{lecture.tag}</span>
                    <span className={styles.duration}>{lecture.duration}</span>
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.sessionPanel} aria-label="Current session">
            <div>
              <span>Signed in as</span>
              <strong>
                {session.user?.name ?? "Discord member"}{" "}
                <em>access role verified</em>
              </strong>
            </div>
            <form action={signOutToHome}>
              <button type="submit">Sign out</button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
