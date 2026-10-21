import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import ChangePasswordForm from "@/components/Forms/ChangePasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Changer le mot de passe - ProSanté",
};

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <AuthShell>
      <ChangePasswordForm />
    </AuthShell>
  );
}
