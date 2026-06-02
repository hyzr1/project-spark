import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Client-callable session kill switch.
 *
 * Used by:
 *  - TamperSentry beacon (instant kick on focus loss / DOM tamper / etc.)
 *
 * Behaviour:
 *   1. Logs the kill reason (and current Discord identity if still resolvable).
 *   2. Returns 204 with Set-Cookie headers that wipe every NextAuth cookie the
 *      server might have set.
 */
export async function POST(req: NextRequest) {
  let body: { reason?: string } = {};
  try {
    body = (await req.json()) as { reason?: string };
  } catch {
    /* sendBeacon may not deliver JSON cleanly — that's fine */
  }

  let session: import("next-auth").Session | null = null;
  try {
    session = await auth();
  } catch {
    /* session might already be torn down */
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  // eslint-disable-next-line no-console
  console.warn("[spark:kill-session]", {
    ts: new Date().toISOString(),
    reason: body.reason ?? null,
    discordId: session?.discordId ?? null,
    user: session?.user?.name ?? null,
    ip,
    referer: req.headers.get("referer"),
  });

  const response = new NextResponse(null, { status: 204 });

  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.pkce.code_verifier",
    "__Secure-authjs.pkce.code_verifier",
    "authjs.state",
    "__Secure-authjs.state",
    "authjs.nonce",
    "__Secure-authjs.nonce",
  ];
  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
