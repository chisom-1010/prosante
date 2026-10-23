import { after, NextResponse } from "next/server";
import { z } from "zod";
import { PasswordResetEmail } from "@/emails/PasswordResetEmail";
import { apiError, parseBody, route } from "@/lib/api/http";
import { sendMail, siteUrl } from "@/lib/api/mail";
import { clientIp, rateLimit } from "@/lib/api/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

const WINDOW = 15 * 60 * 1000;

/**
 * Public endpoint: e-mails a one-time password reset link.
 *
 * It always answers the same way whether or not the address has an account (so
 * it can't be used to find out who is registered), and the real work runs after
 * the response is sent so the response time doesn't give it away either.
 */
export const POST = route(async (req) => {
  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;
  const { email } = body.data;

  if (!rateLimit(`forgot:ip:${clientIp(req)}`, 10, WINDOW) || !rateLimit(`forgot:email:${email}`, 3, WINDOW)) {
    return apiError("Trop de demandes. Réessayez dans quelques minutes.", 429);
  }

  after(async () => {
    try {
      const admin = createAdminClient();
      const { data, error } = await admin.auth.admin.generateLink({
        type: "recovery",
        email,
      });

      // Unknown address: do nothing, silently.
      if (error || !data?.properties?.hashed_token) return;

      // The link carries the token, but the page only consumes it when the user
      // submits the form, so mail scanners that pre-open links can't burn it.
      const resetLink = `${siteUrl()}/auth/reset-password?token_hash=${encodeURIComponent(
        data.properties.hashed_token,
      )}`;

      const name = data.user?.user_metadata?.prenom as string | undefined;
      await sendMail({
        to: email,
        subject: "Réinitialisation de votre mot de passe ProSanté",
        react: PasswordResetEmail({ name, resetLink }),
      });
    } catch (err) {
      console.error("[forgot-password] failed:", err);
    }
  });

  return NextResponse.json({ success: true });
});
