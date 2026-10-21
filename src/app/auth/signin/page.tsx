import AuthShell from "@/components/auth/AuthShell";
import { SigninForm } from "@/components/Forms/signin-form";

export const metadata = { title: "Créer un compte - ProSanté" };

export default function SigninPage() {
  return (
    <AuthShell>
      <SigninForm />
    </AuthShell>
  );
}
