import { LoginForm } from "@/components/Forms/login-form";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminLoginPage() {
  await requireAdmin();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-5xl">
        <LoginForm />
      </div>
    </div>
  );
}
