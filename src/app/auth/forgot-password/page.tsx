import ForgotPasswordForm from "@/components/Forms/ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublié - ProSanté",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
