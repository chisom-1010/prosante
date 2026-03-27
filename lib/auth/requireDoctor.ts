import { createClient } from "@/lib/supabase/server";
import { forbidden } from "next/navigation";
import { unauthorized } from "next/navigation";

export async function requireDoctor() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    unauthorized();
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (doctor?.id == null) {
    forbidden();
  }

  return user;
}
