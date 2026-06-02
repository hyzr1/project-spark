import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { checkAccess } from "@/lib/discord";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    discordId?: string;
    discordAvatar?: string | null;
    /**
     * Whether the user still has the Project Spark access role.
     * Gated pages and APIs must check this, not only session presence.
     */
    accessGranted?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken?: string;
    discordId?: string;
    discordUsername?: string;
    discordAvatar?: string | null;
    accessGranted?: boolean;
    accessCheckedAt?: number;
  }
}

const ACCESS_RECHECK_MS = 5 * 60 * 1000;
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

type DiscordProfile = {
  id?: string;
  username?: string;
  global_name?: string;
  avatar?: string | null;
};

/**
 * Auth.js (NextAuth v5) - Discord OAuth gated by the Project Spark access
 * role. The first check happens on sign-in while the Discord token is fresh;
 * active sessions are then re-checked on a short JWT-side interval.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [
    Discord({
      authorization: {
        params: { scope: "identify guilds.members.read", prompt: "consent" },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "discord") return false;
      if (!account.access_token) return false;

      const access = await checkAccess(account.access_token);

      if (access.ok) return true;

      if (access.reason === "missing-role" || access.reason === "not-in-guild") {
        return "/lectures/no-access";
      }
      void profile;
      return "/lectures/sign-in?reason=retry";
    },

    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token as string;
        token.accessGranted = true;
        token.accessCheckedAt = Date.now();
      }
      if (account?.providerAccountId) {
        token.discordId = account.providerAccountId;
      }
      if (profile) {
        const p = profile as DiscordProfile;
        token.discordUsername = p.global_name || p.username || token.discordUsername;
        token.discordAvatar = p.avatar ?? null;
      }

      try {
        const hasIdentity = Boolean(token.accessToken) || Boolean(token.discordId);
        if (hasIdentity) {
          const lastChecked = token.accessCheckedAt ?? 0;
          const stale = Date.now() - lastChecked > ACCESS_RECHECK_MS;

          if (stale) {
            if (!token.accessToken) {
              token.accessGranted = false;
              token.accessCheckedAt = Date.now();
            } else {
              const check = await checkAccess(token.accessToken);
              if (check.ok) {
                token.accessGranted = true;
                token.accessCheckedAt = Date.now();
              } else if (check.reason === "missing-role" || check.reason === "not-in-guild") {
                token.accessGranted = false;
                token.accessCheckedAt = Date.now();
              }
            }
          }
        }
      } catch (err) {
        console.error("[auth] access recheck failed:", err);
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.discordId = token.discordId;
      session.discordAvatar = token.discordAvatar ?? null;
      session.accessGranted = token.accessGranted === true;
      if (session.user && token.discordUsername) {
        session.user.name = token.discordUsername;
      }
      return session;
    },
  },
  pages: {
    signIn: "/lectures/sign-in",
  },
});
