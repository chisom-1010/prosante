import { createClient } from "@/lib/supabase/server";
import { forbidden } from "next/navigation";
import { unauthorized } from "next/navigation";

export async function requireReceptionist() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    unauthorized();
  }

  const { data: receptionist } = await supabase
    .from("receptionists")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (receptionist?.id == null) {
    forbidden();
  }

  return user;
}
