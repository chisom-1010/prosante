import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error("❌ NEXT_PUBLIC_SUPABASE_URL is missing");
if (!serviceKey) throw new Error("❌ SUPABASE_SERVICE_ROLE_KEY is missing");

const supabase = createClient(supabaseUrl, serviceKey);


async function seedAdmin() {
  const email = "admin@prosantes.site";
  const password = process.env.ADMIN_PASSWORD!;

  // 🔒 0. Check if admin already exists
  const { data: existingAdmin } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1);

  if (existingAdmin && existingAdmin.length > 0) {
    console.log("⚠️ Admin already exists. Skipping...");
    return;
  }

  // 1. Create auth user
  const { data: authUser, error: userError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (userError || !authUser?.user) {
    console.error("❌ Error creating user:", userError?.message);
    return;
  }

  const user = authUser.user;

  // 2. Insert into profiles table
  const { error: profileError } = await supabase.from("profiles").insert({
    auth_user_id: user.id,
    email,
    role: "admin",
  });

  if (profileError) {
    console.error("❌ Error creating profile:", profileError.message);
    return;
  }

  console.log("✅ Admin created successfully");
}

seedAdmin().catch(console.error);
