import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api/auth";
import { apiError, parseBody, route } from "@/lib/api/http";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().trim().pipe(z.email()),
});

export const DELETE = route(async (req) => {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;

  const admin = createAdminClient();

  const { data: doctor, error: lookupError } = await admin
    .from("doctors")
    .select("id, auth_user_id")
    .eq("email", body.data.email)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (!doctor) return apiError("Médecin introuvable.", 404);

  // Row first: if appointments still reference this doctor the delete is
  // refused and the login account is left untouched.
  const { error: rowError } = await admin
    .from("doctors")
    .delete()
    .eq("id", doctor.id);

  if (rowError) {
    console.error("[delete_doctor] row delete failed:", rowError);
    return apiError(
      "Impossible de supprimer ce médecin (des rendez-vous lui sont peut-être associés).",
      409,
    );
  }

  // deleteUser takes the auth user's id, not an email.
  if (doctor.auth_user_id) {
    const { error: authError } = await admin.auth.admin.deleteUser(
      doctor.auth_user_id,
    );
    if (authError) {
      console.error("[delete_doctor] auth delete failed:", authError);
      return apiError(
        "Le médecin a été supprimé, mais son compte de connexion n'a pas pu l'être.",
        500,
      );
    }
  }

  return NextResponse.json({ success: true });
});
