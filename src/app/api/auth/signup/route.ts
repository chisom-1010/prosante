import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, parseBody, route } from "@/lib/api/http";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  // 72 bytes is bcrypt's limit; anything longer is silently truncated.
  password: z.string().min(8).max(72),
  nom: z.string().trim().min(1).max(100),
  prenom: z.string().trim().min(1).max(100),
});

// Public endpoint: patients sign themselves up. The role is fixed here and is
// never read from the request body.
export const POST = route(async (req) => {
  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;
  const { email, password, nom, prenom } = body.data;

  const admin = createAdminClient();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
      user_metadata: { nom, prenom, role: "patient" },
    },
  );

  if (authError || !authUser?.user) {
    if (authError?.code === "email_exists") {
      return apiError("Un compte existe déjà avec cet email.", 409);
    }
    console.error("[signup] createUser failed:", authError);
    return apiError("Impossible de créer le compte.", 400);
  }

  const { error: profileError } = await admin.from("profiles").insert({
    email,
    nom,
    prenom,
    role: "patient",
    auth_user_id: authUser.user.id,
  });

  if (profileError) {
    console.error("[signup] profile insert failed:", profileError);
    await admin.auth.admin.deleteUser(authUser.user.id);
    return apiError("Impossible d'enregistrer le profil.", 400);
  }

  // JSON on success too: the sign-up form calls res.json() before it checks
  // res.ok, which the old plain-text "User created" response broke.
  return NextResponse.json({ success: true }, { status: 201 });
});
