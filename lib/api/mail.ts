import type { ReactNode } from "react";
import { Resend } from "resend";

const FROM = "ProSanté <contact@prosantes.site>";

/** Public base URL of the site, used for links inside emails. */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://prosantes.site").replace(
    /\/$/,
    "",
  );
}

/**
 * Sends an email through Resend. Returns true on success, false on any
 * failure (the error is logged). Never throws, so callers decide what a
 * failed email means for their operation.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  react: ReactNode;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[mail] RESEND_API_KEY is not set");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      react: opts.react,
    });

    if (error) {
      console.error("[mail] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mail] send failed:", err);
    return false;
  }
}
