import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const { email, password, nom, prenom } = await req.json();

  // Create Auth user
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nom,
        prenom,
        role: "patient",
      },
    });

  if (authError || !authUser?.user) {
    return new Response(
      JSON.stringify({ error: authError?.message || "Auth failed" }),
      { status: 400 }
    );
  }

  // Insert profile
  const { error: profileError } = await supabase.from("profiles").insert({
    email,
    nom,
    prenom,
    role: "patient",
    auth_user_id: authUser.user.id,
  });

  if (profileError) {
    // rollback auth user
    await supabase.auth.admin.deleteUser(authUser.user.id);

    return new Response(
      JSON.stringify({ error: profileError.message }),
      { status: 400 }
    );
  }

  return new Response("User created", { status: 200 });
}
