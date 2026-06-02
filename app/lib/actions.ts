"use server";

import { signOut } from "@/auth";

/**
 * Server action: full sign-out that clears the NextAuth session cookies and
 * sends the user back to the homepage. Combined with `prompt=consent` on the
 * Discord provider, every subsequent sign-in goes through the full OAuth
 * round-trip — no silent re-auth.
 */
export async function signOutToHome() {
  await signOut({ redirectTo: "/" });
}
