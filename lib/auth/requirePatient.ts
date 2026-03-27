import { createClient } from "@/lib/supabase/server";
import { forbidden } from "next/navigation";
import { unauthorized } from "next/navigation";

export async function requirePatient() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    unauthorized();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (profile?.role !== "patient") {
    forbidden();
  }

  return user;
}
