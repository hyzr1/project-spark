import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLecture } from "@/lib/lectures";
import { fetchManifest, vaultConfigured } from "@/lib/vault";
import { hasAcceptedNda } from "@/lib/nda";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lecture = getLecture(slug);
  if (!lecture) return new NextResponse("not found", { status: 404 });
  if (process.env.LECTURES_DISABLED === "1")
    return new NextResponse("lectures temporarily disabled", { status: 503 });
  if (!vaultConfigured()) return new NextResponse("vault not configured", { status: 503 });

  let session: import("next-auth").Session | null = null;
  try {
    session = await auth();
  } catch {
    return new NextResponse("unauthorized", { status: 401 });
  }
  if (!session) return new NextResponse("unauthorized", { status: 401 });
  if (!session.accessGranted) return new NextResponse("forbidden", { status: 403 });
  if (!(await hasAcceptedNda(session.discordId))) {
    return new NextResponse("member agreement required", {
      status: 403,
      headers: { "X-NDA-Required": "1" },
    });
  }

  let text: string;
  try {
    text = await fetchManifest(lecture.dir);
  } catch (err) {
    console.error("[manifest] vault fetch failed:", err);
    return new NextResponse("vault read error", { status: 502 });
  }

  const rewritten = text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (/^seg-\d+\.ts$/i.test(trimmed)) {
        return `segment/${trimmed}`;
      }
      return line;
    })
    .join("\n");

  return new NextResponse(rewritten, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": "private, max-age=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "X-Lecture": lecture.slug,
    },
  });
}
