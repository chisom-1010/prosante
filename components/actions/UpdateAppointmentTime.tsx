import { toast } from "sonner";

export const updateAppointmentTime = async (
  appointmentId: string,
  value: string,
) => {
  const res = await fetch("/api/update_appointment_time", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appointmentId,
      tranche_horaires: value,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    toast.error(data?.error ?? "Impossible de modifier l'horaire.");
    return;
  }

  const data = await res.json().catch(() => null);
  if (data?.emailsSent === false) {
    toast.warning("Horaire modifié, mais les e-mails n'ont pas pu être envoyés.");
    await new Promise((r) => setTimeout(r, 2500)); // let the toast be read before reload
  }

  window.location.reload(); // later replace with state update
};
