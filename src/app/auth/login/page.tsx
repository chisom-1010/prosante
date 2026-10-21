import AuthShell from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/Forms/login-form";

export const metadata = { title: "Connexion - ProSanté" };

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
