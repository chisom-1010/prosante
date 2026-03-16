import UpdatePasswordForm from "@/components/Forms/DoctorpasswordChange";

export const metadata = {
  title: "Tableau de Bord Docteur - ProSanté",
  description: "Changez votre mot de passe pour sécuriser votre compte.",
};

export default function PatientsPage() {
  return (
    <main className="min-h-screen bg-white">
      <UpdatePasswordForm />
    </main>
  );
}
