/**
 * Lecture registry for Project Spark. Each entry maps a public slug to an
 * encrypted HLS release in the private Sparkzy vault.
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
    slug: "ote-entries",
    dir: "ote-entries",
    code: "SM-01",
    title: "OTE + Entries",
    duration: "11 min",
    tag: "Method",
    summary:
      "A focused walkthrough of optimal trade entry structure, entry confirmation, execution timing, and the invalidation that keeps each setup controlled.",
  },
  {
    slug: "stdv-full-guide",
    dir: "stdv-full-guide",
    code: "SM-02",
    title: "Stdv Full Guide",
    duration: "30 min",
    tag: "Method",
    summary:
      "How to perfectly use stdv to catch continuations and reversals.",
  },
];

export function getLecture(slug: string): Lecture | undefined {
  return LECTURES.find((lecture) => lecture.slug === slug);
}
