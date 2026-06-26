import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";

export const NDA_VERSION =
  "2026-05-25-e159296fd4ffe76bffaa925d5983323e3d3fb9a1e2756522324664704d00de46";
export const NDA_DOCUMENT_PATH =
  "/legal/project-spark-agreement-2026-05-25.pdf";

const NDA_COOKIE = "project-spark-nda";
const NDA_MAX_AGE = 60 * 60 * 24 * 365;

type NdaAcceptance = {
  version: string;
  discordId: string;
  legalName: string;
  signature: string;
  acceptedAt: string;
};

function encryptionKey(): Buffer | null {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  return secret ? createHash("sha256").update(secret).digest() : null;
}

function encryptAcceptance(payload: NdaAcceptance): string {
  const key = encryptionKey();
  if (!key) throw new Error("AUTH_SECRET is required to record NDA acceptance");

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);

  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function decryptAcceptance(value: string): NdaAcceptance | null {
  const key = encryptionKey();
  if (!key) return null;

  const [format, ivValue, tagValue, ciphertextValue] = value.split(".");
  if (
    format !== "v1" ||
    !ivValue ||
    !tagValue ||
    !ciphertextValue
  ) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final(),
    ]);
    return JSON.parse(plaintext.toString("utf8")) as NdaAcceptance;
  } catch {
    return null;
  }
}

export async function hasAcceptedNda(
  discordId: string | undefined,
): Promise<boolean> {
  if (!discordId) return false;

  const value = (await cookies()).get(NDA_COOKIE)?.value;
  if (!value) return false;

  const acceptance = decryptAcceptance(value);
  return Boolean(
    acceptance &&
      acceptance.version === NDA_VERSION &&
      acceptance.discordId === discordId,
  );
}

export async function recordNdaAcceptance({
  discordId,
  legalName,
  signature,
}: {
  discordId: string;
  legalName: string;
  signature: string;
}): Promise<void> {
  const acceptedAt = new Date().toISOString();
  const payload: NdaAcceptance = {
    version: NDA_VERSION,
    discordId,
    legalName,
    signature,
    acceptedAt,
  };

  (await cookies()).set(NDA_COOKIE, encryptAcceptance(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: NDA_MAX_AGE,
  });

  console.info("[nda] acceptance recorded", {
    discordId,
    version: NDA_VERSION,
    acceptedAt,
    signerHash: createHash("sha256")
      .update(`${legalName}\n${signature}`)
      .digest("hex"),
  });
}

export function safeLectureCallback(value: FormDataEntryValue | string | null) {
  const callback = typeof value === "string" ? value : "";
  return callback === "/lectures" ||
    (callback.startsWith("/lectures/") &&
      !callback.startsWith("/lectures/nda") &&
      !callback.startsWith("/lectures/sign-in"))
    ? callback
    : "/lectures";
}
