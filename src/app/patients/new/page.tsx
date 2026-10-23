import AppointmentForm from "@/components/Forms/AppointmentForm";

export const metadata = {
  title: "Nouvelle demande - ProSanté",
  description: "Demandez une consultation avec nos professionnels de santé.",
};

export default function NewAppointmentPage() {
  return <AppointmentForm />;
}
