import AppointmentForm from "@/components/Forms/AppointmentForm";
import { requirePatient } from "@/lib/auth/requirePatient";

export const metadata = {
  title: "Demande de consultation - ProSanté",
  description: "Demande une consultation avec nos professionnels de santé",
};

export default async function PatientsPage() {
  await requirePatient();
  return (
    <main className="min-h-screen bg-white">
      <AppointmentForm />
    </main>
  );
}
