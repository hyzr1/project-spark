import { auth } from "@/auth";
import {
  hasAcceptedNda,
  NDA_DOCUMENT_PATH,
  safeLectureCallback,
} from "@/lib/nda";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { acceptNda } from "./actions";
import styles from "./nda.module.css";

export const metadata = {
  title: "Member Agreement | Project Spark",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  callbackUrl?: string;
  error?: string;
}>;

export default async function NdaPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const callbackUrl = safeLectureCallback(params.callbackUrl ?? null);
  const session = await auth();

  if (!session) {
    redirect(
      `/lectures/sign-in?callbackUrl=${encodeURIComponent(
        `/lectures/nda?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      )}`,
    );
  }
  if (!session.accessGranted) redirect("/lectures/no-access");
  if (await hasAcceptedNda(session.discordId)) redirect(callbackUrl);

  const today = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date());

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.documentPanel}>
            <div className={styles.documentHeader}>
              <div>
                <p>Project Spark member agreement</p>
                <h1>Review before entering the vault.</h1>
              </div>
              <a
                href={NDA_DOCUMENT_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openDocument}
              >
                Open PDF
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 3h7v7M13 3 6 10M3 6v7h7" />
                </svg>
              </a>
            </div>

            <div className={styles.pdfFrame}>
              <iframe
                src={`${NDA_DOCUMENT_PATH}#toolbar=0&navpanes=0`}
                title="Project Spark Terms of Service, Confidentiality, and Intellectual Property Agreement"
              />
            </div>
          </section>

          <aside className={styles.acceptancePanel}>
            <div className={styles.status}>
              <span aria-hidden />
              Signature required
            </div>
            <h2>Accept the member agreement</h2>
            <p className={styles.intro}>
              Your electronic acceptance is tied to your verified Discord
              account before lecture access is unlocked.
            </p>

            <dl className={styles.identity}>
              <div>
                <dt>Discord member</dt>
                <dd>{session.user?.name ?? "Verified member"}</dd>
              </div>
              <div>
                <dt>Discord ID</dt>
                <dd>{session.discordId}</dd>
              </div>
              <div>
                <dt>Acceptance date</dt>
                <dd>{today}</dd>
              </div>
            </dl>

            {params.error && (
              <p className={styles.error} role="alert">
                {params.error}
              </p>
            )}

            <form action={acceptNda} className={styles.form}>
              <input type="hidden" name="callbackUrl" value={callbackUrl} />

              <label>
                <span>Full legal name</span>
                <input
                  type="text"
                  name="legalName"
                  autoComplete="name"
                  maxLength={120}
                  required
                />
              </label>

              <label>
                <span>Electronic signature</span>
                <input
                  type="text"
                  name="signature"
                  autoComplete="off"
                  maxLength={120}
                  placeholder="Type your full name"
                  required
                />
              </label>

              <label className={styles.confirmation}>
                <input type="checkbox" name="accepted" value="yes" required />
                <span>
                  I have read, understand, and agree to the Project Spark Terms
                  of Service, Confidentiality, and Intellectual Property
                  Agreement.
                </span>
              </label>

              <button type="submit">
                Accept and enter lectures
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </form>

            <p className={styles.finePrint}>
              By continuing, your typed signature and acceptance timestamp are
              recorded electronically.{" "}
              <Link href="/">Leave Project Spark</Link>
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
