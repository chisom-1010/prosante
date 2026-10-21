import { requireReceptionist } from "@/lib/auth/requireReceptionist";
import ReceptionistDashboard from "@/components/Dashboards/ReceptionistDashboard";

export const metadata = {
  title: "Tableau de Bord Receptioniste - ProSanté",
  description:
    "Votre tableau de bord de gestion des patients et des rendez-vous.",
};

export default async function StaffAppointmentsPage() {
  await requireReceptionist();
  return <ReceptionistDashboard />;
}
