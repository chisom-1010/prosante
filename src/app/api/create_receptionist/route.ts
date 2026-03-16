import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Create Auth user
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: body.email,
      password: "RECEP-1014",
      email_confirm: true,
      user_metadata: {
        must_change_password: true,
      },
    });

  if (authError) {
    return Response.json({ error: authError.message }, { status: 400 });
  }

  // Insert receptionist
  const { error: receptionistError } = await supabase.from("receptionists").insert({
    email: body.email,
    nom: body.nom,
    prenom: body.prenom,
    auth_user_id: authUser.user.id,
  });

  if (receptionistError) {
    return Response.json({ error: receptionistError.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
