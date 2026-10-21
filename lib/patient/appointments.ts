import { createAdminClient } from "@/lib/supabase/admin";

export type PatientAppointment = {
  id: string;
  date_de_rendezvous: string; // YYYY-MM-DD
  tranche_horaires: string;
  status: string;
  notes: string | null;
  service: string | null;
  doctor: string | null;
};

type Row = {
  id: string;
  date_de_rendezvous: string;
  tranche_horaires: string;
  status: string;
  notes: string | null;
  service: { type_de_service: string } | { type_de_service: string }[] | null;
  doctor: { nom: string; prenom: string } | { nom: string; prenom: string }[] | null;
};

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

/**
 * The signed-in patient's own appointments. Runs with the service client so the
 * doctor's name can be joined (patients cannot read the doctors table), and is
 * strictly filtered on the user id the caller already authenticated.
 */
export async function getMyAppointments(userId: string): Promise<PatientAppointment[]> {
  const { data, error } = await createAdminClient()
    .from("demande_de_consultation")
    .select(
      `id, date_de_rendezvous, tranche_horaires, status, notes,
       service:service_medical!demande_de_consultation_id_service_medical_fkey (type_de_service),
       doctor:doctors!demande_de_consultation_doctor_id_fkey (nom, prenom)`,
    )
    .eq("id_patient", userId)
    .order("date_de_rendezvous", { ascending: false })
    .order("tranche_horaires", { ascending: false })
    .returns<Row[]>();

  if (error) throw error;

  return (data ?? []).map((r) => {
    const doctor = one(r.doctor);
    return {
      id: r.id,
      date_de_rendezvous: r.date_de_rendezvous,
      tranche_horaires: r.tranche_horaires,
      status: r.status,
      notes: r.notes,
      service: one(r.service)?.type_de_service ?? null,
      doctor: doctor ? `Dr ${doctor.prenom} ${doctor.nom}` : null,
    };
  });
}

/** "2026-11-03" -> "mardi 3 novembre 2026" (no timezone drift: the value is a plain date). */
export function formatDate(date: string, withWeekday = true) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: withWeekday ? "long" : undefined,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
