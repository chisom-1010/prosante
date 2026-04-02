import { createClient } from "@supabase/supabase-js";

export async function DELETE(req: Request) {
  const body = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Delete Auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(body.email);

  if (authError) {
    return Response.json({ error: authError.message }, { status: 400 });
  }

  // Delete doctor
  const { error: doctorError } = await supabase.from("doctors").delete().eq("email", body.email);

  if (doctorError) {
    return Response.json({ error: doctorError.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
