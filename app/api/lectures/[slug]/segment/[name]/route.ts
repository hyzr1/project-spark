import { NextRequest, NextResponse } from "next/server";
import { getLecture } from "@/lib/lectures";
import { fetchSegmentResponse, vaultConfigured } from "@/lib/vault";

export const revalidate = 31536000;
export const runtime = "nodejs";

const SEGMENT_RE = /^seg-\d{1,8}\.ts$/i;

/**
 * CDN-cacheable segment proxy.
 *
 * Why no auth check here: segments are AES-128 encrypted ciphertext. They're
 * useless without the key, and the key is gated behind a Discord-role check
 * on /api/lectures/<slug>/key. Anyone who fetches a segment URL gets bytes
 * they can't decrypt. The encryption IS the gate.
 *
 * Why we buffer instead of stream: Vercel's CDN won't cache a streaming
 * response (no known body length up front, no way to store it). We pull the
 * full ~5 MB segment into memory, return it as a single Buffer, and the CDN
 * happily caches it for a year.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; name: string }> },
) {
  const { slug, name } = await params;
  const lecture = getLecture(slug);
  if (!lecture) return new NextResponse("not found", { status: 404 });
  if (process.env.LECTURES_DISABLED === "1")
    return new NextResponse("lectures temporarily disabled", { status: 503 });
  if (!vaultConfigured()) return new NextResponse("vault not configured", { status: 503 });
  if (!SEGMENT_RE.test(name)) return new NextResponse("bad request", { status: 400 });

  let upstream: Response;
  try {
    upstream = await fetchSegmentResponse(lecture.dir, name);
  } catch (err) {
    console.error("[segment] vault fetch failed:", err);
    return new NextResponse("vault read error", { status: 502 });
  }

  let bytes: ArrayBuffer;
  try {
    bytes = await upstream.arrayBuffer();
  } catch (err) {
    console.error("[segment] vault read body failed:", err);
    return new NextResponse("vault read error", { status: 502 });
  }

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "video/mp2t",
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, s-maxage=31536000, immutable",
      "Vercel-CDN-Cache-Control": "public, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
