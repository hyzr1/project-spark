/**
 * Lecture registry for Project Spark. Maps URL slugs to on-disk encrypted
 * HLS bundles. Adding a lecture = drop encrypted segments under
 * private/lectures/<dir>/ and add an entry here.
 */
export type Lecture = {
  slug: string;
  dir: string;
  code: string;
  title: string;
  duration: string;
  tag: "Core" | "Method" | "Mindset" | "Risk" | "Scaling";
  summary: string;
};

export const LECTURES: Lecture[] = [
  {
    slug: "spark-1.0",
    dir: "spark-1.0",
    code: "SM-01",
    title: "Spark Method 1.0 — Foundation",
    duration: "11 min",
    tag: "Core",
    summary:
      "The very first Project Spark lecture. Sparkzy walks the framework from zero — what we trade, when we trade, and the single read that fires every entry.",
  },
  {
    slug: "spark-2.0",
    dir: "spark-2.0",
    code: "SM-02",
    title: "Spark Method 2.0 — Reads & invalidation",
    duration: "18 min",
    tag: "Core",
    summary:
      "How Sparkzy reads order-flow build-up at the open. When the tape carries enough conviction to enter, when it's still flat, and where the trade stops being a Spark setup.",
  },
  {
    slug: "bias-1.0",
    dir: "bias-1.0",
    code: "SM-03",
    title: "Session bias 1.0 — The pre-open read",
    duration: "14 min",
    tag: "Method",
    summary:
      "How the previous session sets up the current one. The bias framework Sparkzy uses to arrive at the open with a directional hypothesis before the bell.",
  },
  {
    slug: "entry-1.0",
    dir: "entry-1.0",
    code: "SM-04",
    title: "Entries 1.0 — Trigger & sizing",
    duration: "17 min",
    tag: "Method",
    summary:
      "Trigger candle, entry placement, stop logic, and how to size the position to your account's R. The mechanics of pulling the trigger without flinching.",
  },
  {
    slug: "smt-1.0",
    dir: "smt-1.0",
    code: "SM-05",
    title: "SMT confirmation × session bias",
    duration: "16 min",
    tag: "Method",
    summary:
      "Pairing the session bias read with SMT divergence between correlated assets — locating the trade location, timing the entry, and defining the kill.",
  },
];

export function getLecture(slug: string): Lecture | undefined {
  return LECTURES.find((l) => l.slug === slug);
}
