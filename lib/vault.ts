/**
 * Encrypted lecture vault — backed by a GitHub repo's Releases.
 *
 * Why this stack (and why API not direct URLs):
 *   - GitHub release downloads are unlimited and free.
 *   - Encrypted .ts segments are useless without the AES key, which lives
 *     in a Vercel env var (LECTURE_KEYS) and never on GitHub.
 *   - We fetch via the GitHub *API* (`/repos/.../releases/assets/{id}` +
 *     `Accept: application/octet-stream`) instead of the public
 *     `/releases/download/<tag>/<name>` URL — the latter 404s sporadically
 *     on fresh uploads and during CDN propagation. The API path is
 *     deterministic.
 *
 * Required env:
 *   GITHUB_VAULT_REPO   e.g. "yourname/sparkzy-vault"
 *   LECTURE_KEYS        JSON like {"spark-1.0":"<32 hex chars>"}
 *
 * Optional env (highly recommended for prod):
 *   GITHUB_VAULT_TOKEN  PAT with `public_repo` (or `repo` if the vault is
 *                       private). Bumps rate limit from 60/hr to 5000/hr.
 */

const API_BASE = "https://api.github.com";
const ASSET_TTL_MS = 60 * 60 * 1000;

type AssetMap = Map<string, number>;
const assetCache = new Map<string, { map: AssetMap; ts: number }>();

export function vaultConfigured(): boolean {
  return Boolean(process.env.GITHUB_VAULT_REPO && process.env.LECTURE_KEYS);
}

function repo(): string {
  const r = process.env.GITHUB_VAULT_REPO;
  if (!r) throw new Error("GITHUB_VAULT_REPO not set");
  return r;
}

function ghHeaders(extra?: HeadersInit): HeadersInit {
  const h: Record<string, string> = {
    "User-Agent": "spark-vault",
    "X-GitHub-Api-Version": "2022-11-28",
    ...((extra as Record<string, string>) ?? {}),
  };
  const token = process.env.GITHUB_VAULT_TOKEN;
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function getAssetMap(tag: string): Promise<AssetMap> {
  const cached = assetCache.get(tag);
  if (cached && Date.now() - cached.ts < ASSET_TTL_MS) return cached.map;

  const url = `${API_BASE}/repos/${repo()}/releases/tags/${encodeURIComponent(tag)}`;
  const res = await fetch(url, {
    headers: ghHeaders({ Accept: "application/vnd.github+json" }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `vault list ${res.status} ${res.statusText} (${url}) — set GITHUB_VAULT_TOKEN if you're rate-limited`,
    );
  }
  const data = (await res.json()) as { assets?: { id: number; name: string }[] };
  const map: AssetMap = new Map(
    (data.assets ?? []).map((a) => [a.name, a.id]),
  );
  assetCache.set(tag, { map, ts: Date.now() });
  return map;
}

async function fetchAsset(tag: string, name: string): Promise<Response> {
  const map = await getAssetMap(tag);
  const id = map.get(name);
  if (id === undefined) {
    throw new Error(`vault asset ${name} not found in tag ${tag}`);
  }
  const url = `${API_BASE}/repos/${repo()}/releases/assets/${id}`;
  const res = await fetch(url, {
    headers: ghHeaders({ Accept: "application/octet-stream" }),
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`vault asset ${tag}/${name} → ${res.status}`);
  }
  return res;
}

export async function fetchManifest(tag: string): Promise<string> {
  const res = await fetchAsset(tag, "playlist.m3u8");
  return await res.text();
}

export async function fetchSegmentResponse(
  tag: string,
  name: string,
): Promise<Response> {
  return fetchAsset(tag, name);
}

export function lectureKey(slug: string): Buffer | null {
  const raw = process.env.LECTURE_KEYS;
  if (!raw) return null;
  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const hex = parsed[slug];
  if (!hex || !/^[0-9a-f]{32}$/i.test(hex)) return null;
  return Buffer.from(hex, "hex");
}
