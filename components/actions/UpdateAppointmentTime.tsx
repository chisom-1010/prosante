export const updateAppointmentTime = async (
  appointmentId: string,
  value: string,
) => {
  await fetch("/api/assign_appointment", {
    method: "POST",
    body: JSON.stringify({
      appointmentId,
      tranche_horaires: value,
    }),
  });

  window.location.reload(); // later replace with state update
};
