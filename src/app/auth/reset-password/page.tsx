import { Suspense } from "react";
import ResetPasswordForm from "@/components/Forms/ResetPasswordForm";

export const metadata = {
  title: "Nouveau mot de passe - ProSanté",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
