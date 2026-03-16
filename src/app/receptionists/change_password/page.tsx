import UpdatePasswordForm from "@/components/Forms/ReceptionistChangePassword";

export const metadata = {
  title: "Tableau de Bord Receptioniste - ProSanté",
  description: "Changez votre mot de passe pour sécuriser votre compte.",
};

export default function PatientsPage() {
  return (
    <main className="min-h-screen bg-white">
      <UpdatePasswordForm />
    </main>
  );
}
