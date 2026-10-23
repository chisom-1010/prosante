import { NextResponse } from "next/server";
import { z } from "zod";
import { DoctorUpdateAppointmentEmail } from "@/emails/DoctorUpdateEmail";
import { PatientUpdateAppointmentEmail } from "@/emails/PatientUpdateEmail";
import { requireRole } from "@/lib/api/auth";
import { apiError, parseBody, route } from "@/lib/api/http";
import { sendMail } from "@/lib/api/mail";
import { ACTIVE_STATUSES, EDITABLE_STATUSES, TIME_SLOTS } from "@/lib/appointments";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  appointmentId: z.union([z.string().min(1), z.number()]),
  tranche_horaires: z.enum(TIME_SLOTS),
});

export const POST = route(async (req) => {
  const auth = await requireRole("receptionist", "admin");
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;
  const { appointmentId, tranche_horaires } = body.data;

  const admin = createAdminClient();

  const { data: appointment, error: readError } = await admin
    .from("demande_de_consultation")
    .select(
      `id, status, doctor_id, date_de_rendezvous,
       patient:profiles!demande_de_consultation_id_patient_fkey (nom, prenom, email),
       doctor:doctors!demande_de_consultation_doctor_id_fkey (nom, prenom, email)`,
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (readError) throw readError;
  if (!appointment) return apiError("Rendez-vous introuvable.", 404);

  if (!(EDITABLE_STATUSES as readonly string[]).includes(appointment.status)) {
    return apiError("Ce rendez-vous ne peut plus être modifié.", 409);
  }

  // The doctor must be free in the new slot.
  if (
    appointment.doctor_id &&
    (ACTIVE_STATUSES as readonly string[]).includes(appointment.status)
  ) {
    const { count, error: conflictError } = await admin
      .from("demande_de_consultation")
      .select("id", { count: "exact", head: true })
      .eq("doctor_id", appointment.doctor_id)
      .eq("date_de_rendezvous", appointment.date_de_rendezvous)
      .eq("tranche_horaires", tranche_horaires)
      .in("status", [...ACTIVE_STATUSES])
      .neq("id", appointment.id);
    if (conflictError) throw conflictError;
    if (count) return apiError("Le médecin a déjà un rendez-vous sur ce créneau.", 409);
  }

  const { error: updateError } = await admin
    .from("demande_de_consultation")
    .update({ tranche_horaires })
    .eq("id", appointment.id);

  if (updateError) {
    // 23505 = double booking caught by the unique index (race), 23514 = rule trigger
    if (updateError.code === "23505") {
      return apiError("Le médecin a déjà un rendez-vous sur ce créneau.", 409);
    }
    throw updateError;
  }

  const one = <T,>(v: T | T[] | null) => (Array.isArray(v) ? v[0] : v);
  const patient = one(appointment.patient);
  const doctor = one(appointment.doctor);

  const sends: Promise<boolean>[] = [];
  if (patient?.email) {
    sends.push(
      sendMail({
        to: patient.email,
        subject: "Votre rendez-vous a été modifié",
        react: PatientUpdateAppointmentEmail({
          patientName: patient.prenom,
          doctorName: doctor ? `${doctor.prenom} ${doctor.nom}` : undefined,
          date: appointment.date_de_rendezvous,
          time: tranche_horaires,
        }),
      }),
    );
  }
  if (doctor?.email) {
    sends.push(
      sendMail({
        to: doctor.email,
        subject: "Un rendez-vous a été modifié",
        react: DoctorUpdateAppointmentEmail({
          doctorName: doctor.nom,
          patientName: patient?.prenom ?? "",
          date: appointment.date_de_rendezvous,
          time: tranche_horaires,
        }),
      }),
    );
  }
  const emailsSent = (await Promise.all(sends)).every(Boolean);

  return NextResponse.json({ success: true, emailsSent });
});
