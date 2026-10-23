import { NextResponse } from "next/server";
import { z } from "zod";
import { DoctorAppointmentEmail } from "@/emails/DoctorAppointmentEmail";
import { PatientAppointmentEmail } from "@/emails/PatientAppointmentEmail";
import { requireRole } from "@/lib/api/auth";
import { apiError, parseBody, route } from "@/lib/api/http";
import { sendMail } from "@/lib/api/mail";
import { ACTIVE_STATUSES, EDITABLE_STATUSES } from "@/lib/appointments";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  appointmentId: z.union([z.string().min(1), z.number()]),
  doctorId: z.union([z.string().min(1), z.number()]),
});

export const POST = route(async (req) => {
  const auth = await requireRole("receptionist", "admin");
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;
  const { appointmentId, doctorId } = body.data;

  const admin = createAdminClient();

  const { data: appointment, error: appointmentError } = await admin
    .from("demande_de_consultation")
    .select(
      `
      id,
      date_de_rendezvous,
      tranche_horaires,
      status,
      id_service_medical,
      patient:profiles!demande_de_consultation_id_patient_fkey (
        nom,
        prenom,
        email
      )
    `,
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (appointmentError) throw appointmentError;
  if (!appointment) return apiError("Rendez-vous introuvable.", 404);

  // PostgREST types a to-one embed as an array or an object depending on the
  // generated types, so accept both.
  const patient = Array.isArray(appointment.patient)
    ? appointment.patient[0]
    : appointment.patient;
  if (!patient) return apiError("Patient introuvable pour ce rendez-vous.", 400);

  const { data: doctor, error: doctorError } = await admin
    .from("doctors")
    .select("id, nom, prenom, email, service_id")
    .eq("id", doctorId)
    .maybeSingle();

  if (doctorError) throw doctorError;
  if (!doctor) return apiError("Médecin introuvable.", 404);

  if (!(EDITABLE_STATUSES as readonly string[]).includes(appointment.status)) {
    return apiError("Ce rendez-vous ne peut plus être assigné.", 409);
  }
  if (doctor.service_id !== appointment.id_service_medical) {
    return apiError("Ce médecin n'appartient pas au service demandé.", 409);
  }

  const { count: busy, error: conflictError } = await admin
    .from("demande_de_consultation")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctor.id)
    .eq("date_de_rendezvous", appointment.date_de_rendezvous)
    .eq("tranche_horaires", appointment.tranche_horaires)
    .in("status", [...ACTIVE_STATUSES])
    .neq("id", appointment.id);
  if (conflictError) throw conflictError;
  if (busy) return apiError("Ce médecin a déjà un rendez-vous sur ce créneau.", 409);

  // The assignment itself is done here, on the server, so the browser can no
  // longer decide on its own which doctor an appointment goes to.
  const { error: updateError } = await admin
    .from("demande_de_consultation")
    .update({ status: "accepté", doctor_id: doctor.id })
    .eq("id", appointment.id);

  if (updateError) {
    if (updateError.code === "23505" || updateError.code === "23514") {
      return apiError("Assignation impossible : créneau déjà pris ou statut invalide.", 409);
    }
    throw updateError;
  }

  // The assignment is saved; a failed email shouldn't undo it. Report it so
  // the UI can warn the receptionist.
  const [patientMailed, doctorMailed] = await Promise.all([
    sendMail({
      to: patient.email,
      subject: "Votre rendez-vous est confirmé",
      react: PatientAppointmentEmail({
        patientName: patient.prenom,
        doctorName: `${doctor.prenom} ${doctor.nom}`,
        date: appointment.date_de_rendezvous,
        time: appointment.tranche_horaires,
      }),
    }),
    sendMail({
      to: doctor.email,
      subject: "Nouveau patient assigné",
      react: DoctorAppointmentEmail({
        doctorName: doctor.nom,
        patientName: patient.prenom,
        date: appointment.date_de_rendezvous,
        time: appointment.tranche_horaires,
      }),
    }),
  ]);

  return NextResponse.json({
    success: true,
    emailsSent: patientMailed && doctorMailed,
  });
});
