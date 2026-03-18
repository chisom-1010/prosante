import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // 1. Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch the username from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("nom, prenom, email")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 3. Return the username
  return NextResponse.json({
    username: profile.nom,
    firstName: profile.prenom,
    email: profile.email,
  });
}
