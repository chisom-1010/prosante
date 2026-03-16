import DoctorDashboard from "@/components/Dashboards/DoctorDashboard";

export const metadata = {
  title: "Tableau de Bord Docteur - ProSanté",
  description:
    "Votre tableau de bord de gestion des patients et des rendez-vous.",
};

export default function PatientsPage() {
  return (
    <main className="min-h-screen bg-white">
      <DoctorDashboard />
    </main>
  );
}
