/**
 * Server-side helper: given a Discord access token (from the user's OAuth
 * session), check whether they are a member of the Project Spark private
 * guild AND carry the configured "access" role.
 *
 * Adds a short-TTL in-memory cache + 1 retry on rate-limit so quick
 * navigation between /lectures and /lectures/<slug> doesn't trip Discord's
 * 5-req-per-5-sec ceiling on /users/@me/guilds/.../member.
 */
export type DiscordIdentity = {
  id: string;
  username: string;
  globalName?: string;
  avatar?: string;
};

export type AccessCheck =
  | {
      ok: true;
      reason: "has-role" | "cached";
      roles: string[];
      user: DiscordIdentity;
    }
  | {
      ok: false;
      reason: "not-in-guild" | "missing-role" | "discord-error" | "missing-config";
      status?: number;
      roles?: string[];
    };

type CacheEntry = { value: AccessCheck; ts: number };
const TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();
type AccessSuccess = Extract<AccessCheck, { ok: true }>;

function getCached(key: string): AccessCheck | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key: string, value: AccessCheck) {
  cache.set(key, { value, ts: Date.now() });
}

function cachedAccess(value: AccessCheck | null): AccessSuccess | null {
  if (!value?.ok) return null;
  return {
    ok: true,
    reason: "cached",
    roles: value.roles,
    user: value.user,
  };
}

async function fetchMember(accessToken: string, guildId: string): Promise<Response> {
  return fetch(
    `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
}

export async function checkAccess(accessToken: string | undefined): Promise<AccessCheck> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_ACCESS_ROLE_ID;

  if (!guildId || !roleId) return { ok: false, reason: "missing-config" };
  if (!accessToken) return { ok: false, reason: "discord-error", status: 401 };

  const cacheKey = accessToken;
  const cached = getCached(cacheKey);
  const cachedSuccess = cachedAccess(cached);
  if (cachedSuccess) {
    return cachedSuccess;
  }

  let res: Response;
  try {
    res = await fetchMember(accessToken, guildId);
  } catch {
    if (cachedSuccess) return cachedSuccess;
    return { ok: false, reason: "discord-error" };
  }

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
    await new Promise((r) => setTimeout(r, Math.min(2000, retryAfter * 1000)));
    try {
      res = await fetchMember(accessToken, guildId);
    } catch {
      if (cachedSuccess) return cachedSuccess;
      return { ok: false, reason: "discord-error", status: 429 };
    }
    if (res.status === 429) {
      if (cachedSuccess) return cachedSuccess;
      return { ok: false, reason: "discord-error", status: 429 };
    }
  }

  if (res.status === 404 || res.status === 401) {
    const result: AccessCheck = { ok: false, reason: "not-in-guild", status: res.status };
    setCached(cacheKey, result);
    return result;
  }
  if (!res.ok) {
    if (cachedSuccess) return cachedSuccess;
    return { ok: false, reason: "discord-error", status: res.status };
  }

  const member = (await res.json()) as {
    roles?: string[];
    user?: { id: string; username: string; global_name?: string; avatar?: string };
    nick?: string | null;
  };
  const roles = member.roles ?? [];
  const user: DiscordIdentity = {
    id: member.user?.id ?? "",
    username: member.nick || member.user?.global_name || member.user?.username || "member",
    globalName: member.user?.global_name,
    avatar: member.user?.avatar,
  };

  if (!roles.includes(roleId)) {
    const result: AccessCheck = { ok: false, reason: "missing-role", roles };
    setCached(cacheKey, result);
    return result;
  }

  const result: AccessCheck = { ok: true, reason: "has-role", roles, user };
  setCached(cacheKey, result);
  return result;
}
