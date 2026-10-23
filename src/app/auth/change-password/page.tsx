import { redirect } from "next/navigation";
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
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
