import { createClient } from "@/lib/supabase/server";

/** Name + e-mail to show in a dashboard sidebar. Never throws. */
export async function getDisplayUser(table: "profiles" | "doctors" | "receptionists" = "profiles") {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { name: "", email: "" };

    const { data } = await supabase
      .from(table)
      .select("nom, prenom, email")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const name = [data?.prenom, data?.nom].filter(Boolean).join(" ");
    return { name, email: data?.email ?? user.email ?? "" };
  } catch {
    return { name: "", email: "" };
  }
}
