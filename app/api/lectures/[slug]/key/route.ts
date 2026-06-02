import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getLecture } from "@/lib/lectures";
import { lectureKey } from "@/lib/vault";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Returns the raw 16-byte AES-128 key for an HLS lecture, but ONLY to a
 * Discord-authenticated user with the Project Spark access role. The key is
 * read from the LECTURE_KEYS env var (Vercel project settings) — it never
 * lives in the source repo or the GitHub vault.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lecture = getLecture(slug);
  if (!lecture) return new NextResponse("not found", { status: 404 });

  const referer = req.headers.get("referer") ?? "";
  const host = req.headers.get("host") ?? "";
  if (
    referer &&
    !referer.startsWith(`https://${host}`) &&
    !referer.startsWith(`http://${host}`)
  ) {
    return new NextResponse("forbidden", { status: 403 });
  }

  let session: import("next-auth").Session | null = null;
  try {
    session = await auth();
  } catch {
    return new NextResponse("unauthorized", { status: 401 });
  }
  if (!session) return new NextResponse("unauthorized", { status: 401 });
  if (!session.accessGranted) return new NextResponse("forbidden", { status: 403 });

  const key = lectureKey(lecture.slug);
  if (!key) {
    return new NextResponse("key not configured", { status: 503 });
  }

  const body = new ArrayBuffer(key.length);
  new Uint8Array(body).set(key);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(key.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
