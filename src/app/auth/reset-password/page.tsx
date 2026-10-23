import AuthShell from "@/components/auth/AuthShell";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/Forms/ResetPasswordForm";

export const metadata = { title: "Nouveau mot de passe - ProSanté" };

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
