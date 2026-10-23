import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/Forms/ForgotPasswordForm";

export const metadata = { title: "Mot de passe oublié - ProSanté" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
