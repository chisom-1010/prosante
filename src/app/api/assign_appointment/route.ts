import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { PatientAppointmentEmail } from "@/emails/PatientAppointmentEmail";
import { DoctorAppointmentEmail } from "@/emails/DoctorAppointmentEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

type AppointmentWithPatient = {
  id: string;
  date_de_rendezvous: string;
  tranche_horaires: string;
  patient: {
    nom: string;
    prenom: string;
    email: string;
  };
};

export async function POST(req: Request) {
  try {
    const { appointmentId, doctorId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // ✅ Fetch appointment + patient
    const { data } = await supabase
      .from("demande_de_consultation")
      .select(
        `
        id,
        date_de_rendezvous,
        tranche_horaires,
        patient:profiles!demande_de_consultation_id_patient_fkey (
          nom,
          prenom,
          email
        )
      `,
      )
      .eq("id", appointmentId)
      .single();

    const rawPatient = data?.patient;

    const patient = Array.isArray(rawPatient) ? rawPatient[0] : rawPatient;

    if (!data || !patient) {
      return NextResponse.json(
        { error: "Missing patient data" },
        { status: 400 },
      );
    }

    const appointment: AppointmentWithPatient = {
      id: data.id,
      date_de_rendezvous: data.date_de_rendezvous,
      tranche_horaires: data.tranche_horaires,
      patient: {
        nom: patient.nom,
        prenom: patient.prenom,
        email: patient.email,
      },
    };
    // ✅ Fetch doctor
    const { data: doctor } = await supabase
      .from("doctors")
      .select("id, nom, prenom, email")
      .eq("id", doctorId)
      .single();

    if (!appointment || !doctor) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // =========================
    // 📩 EMAIL TO PATIENT
    // =========================
    await resend.emails.send({
      from: "Prosanté <contact@prosantes.site>",
      to: appointment.patient.email,
      subject: "Votre rendez-vous est confirmé",
      react: PatientAppointmentEmail({
        patientName: appointment.patient.prenom,
        doctorName: `${doctor.prenom} ${doctor.nom}`,
        date: appointment.date_de_rendezvous,
        time: appointment.tranche_horaires,
      }),
    });
    // =========================
    // 📩 EMAIL TO DOCTOR
    // =========================
    await resend.emails.send({
      from: "Prosanté <contact@prosantes.site>",
      to: doctor.email,
      subject: "Nouveau patient assigné",
      react: DoctorAppointmentEmail({
        doctorName: doctor.nom,
        patientName: appointment.patient.prenom,
        date: appointment.date_de_rendezvous,
        time: appointment.tranche_horaires,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
