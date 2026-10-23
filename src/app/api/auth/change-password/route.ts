import { NextResponse } from "next/server";
import { z } from "zod";
import { homePathFor, requireSession } from "@/lib/api/auth";
import { apiError, parseBody, route } from "@/lib/api/http";
import { createAdminClient } from "@/lib/supabase/admin";

// The old hardcoded temporary passwords were published in the repository, so
// they can never be chosen again.
const BANNED = new Set(["med-3014", "recep-1014"]);

const schema = z.object({
  // 72 bytes is bcrypt's limit; anything longer is silently truncated.
  password: z.string().min(8).max(72),
});

/**
 * Sets a new password for the signed-in user and clears the "must change
 * password" flags. Used by the forced first-login change and by the
 * forgot-password flow (whose e-mailed link signs the user in first).
 *
 * Done on the server on purpose: if the browser updated the password and then
 * asked us to clear the flag, someone could clear the flag without changing it.
 */
export const POST = route(async (req) => {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;
  const { password } = body.data;

  if (BANNED.has(password.toLowerCase())) {
    return apiError("Ce mot de passe n'est pas autorisé. Choisissez-en un autre.", 400);
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(auth.caller.userId, {
    password,
    // Both are cleared: user_metadata is the legacy location of the flag.
    app_metadata: { must_change_password: false },
    user_metadata: { must_change_password: false },
  });

  if (error) {
    if (error.code === "weak_password" || error.code === "same_password") {
      return apiError(error.message, 400);
    }
    console.error("[change-password] updateUserById failed:", error);
    return apiError("Impossible de modifier le mot de passe.", 500);
  }

  return NextResponse.json({
    success: true,
    redirectTo: homePathFor(auth.caller.roles),
  });
});
