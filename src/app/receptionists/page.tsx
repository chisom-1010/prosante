import ReceptionistDashboard from "@/components/Dashboards/ReceptionistDashboard";

export const metadata = {
  title: "Tableau de Bord Receptioniste - ProSanté",
  description:
    "Votre tableau de bord de gestion des patients et des rendez-vous.",
};

export default function PatientsPage() {
  return (
    <main className="min-h-screen bg-white">
      <ReceptionistDashboard />
    </main>
  );
}
