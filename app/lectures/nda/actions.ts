"use server";

import { auth } from "@/auth";
import {
  recordNdaAcceptance,
  safeLectureCallback,
} from "@/lib/nda";
import { redirect } from "next/navigation";

function errorRedirect(message: string, callbackUrl: string): never {
  const params = new URLSearchParams({
    error: message,
    callbackUrl,
  });
  redirect(`/lectures/nda?${params.toString()}`);
}

export async function acceptNda(formData: FormData) {
  const callbackUrl = safeLectureCallback(formData.get("callbackUrl"));
  const legalName = String(formData.get("legalName") ?? "").trim();
  const signature = String(formData.get("signature") ?? "").trim();
  const accepted = formData.get("accepted") === "yes";

  const session = await auth();
  if (!session) {
    redirect(
      `/lectures/sign-in?callbackUrl=${encodeURIComponent(
        `/lectures/nda?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      )}`,
    );
  }
  if (!session.accessGranted) redirect("/lectures/no-access");
  if (!session.discordId) {
    errorRedirect("Discord identity could not be verified.", callbackUrl);
  }
  if (legalName.length < 2 || legalName.length > 120) {
    errorRedirect("Enter your full legal name.", callbackUrl);
  }
  if (signature.length < 2 || signature.length > 120) {
    errorRedirect("Type your full name as your electronic signature.", callbackUrl);
  }
  if (!accepted) {
    errorRedirect("You must confirm that you read and accept the agreement.", callbackUrl);
  }

  await recordNdaAcceptance({
    discordId: session.discordId,
    legalName,
    signature,
  });
  redirect(callbackUrl);
}
