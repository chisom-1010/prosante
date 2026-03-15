import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const body = await req.json()

  const supabase = await createClient();

  // Create Auth user
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: body.email,
      password: "MED-3014", // default password
      email_confirm: true
    })

  if (authError) {
    return Response.json({ error: authError.message }, { status: 400 })
  }

  // Insert doctor record
  const { error: doctorError } = await supabase
    .from("doctors")
    .insert({
      email: body.email,
      nom: body.nom,
      prenom: body.prenom,
      service_id: body.service_id,
      auth_user_id: authUser.user.id
    })

  if (doctorError) {
    return Response.json({ error: doctorError.message }, { status: 400 })
  }

  return Response.json({ success: true })
}