import { createClient } from "@/lib/supabase/client";
import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { z } from "zod";

const appointmentSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  patient_name: z.string(),
  date_de_rendezvous: z.string(),
  tranche_horaires: z.string(),
  id_service_medical: z.string(),
});

const doctorSchema = z.object({
  id: z.string().uuid(),
  nom: z.string(),
  prenom: z.string(),
});

type Doctor = z.infer<typeof doctorSchema>;

const updateStatus = async (id: string, status: string) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("demande_de_consultation")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(error);
  } else {
    // optional: refresh data
    window.location.reload();
  }
};

type Appointment = z.infer<typeof appointmentSchema>;

export default function AppointmentActions({
  appointment,
}: {
  appointment: Appointment;
}) {
  const supabase = createClient();

  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = React.useState("");
  const [loadingDoctors, setLoadingDoctors] = React.useState(false);
  const [assigning, setAssigning] = React.useState(false);

  const isPending = appointment.status === "en attente";

  const loadDoctors = async () => {
    setLoadingDoctors(true);

    const { data, error } = await supabase
      .from("doctors")
      .select("id, nom, prenom")
      .eq("service_id", appointment.id_service_medical);

    if (!error && data) setDoctors(data);

    setLoadingDoctors(false);
  };

  const handleAssign = async () => {
    if (!selectedDoctor) return;

    setAssigning(true);

    const { error } = await supabase
      .from("demande_de_consultation")
      .update({
        status: "accepté",
        doctor_id: selectedDoctor,
      })
      .eq("id", appointment.id);

    if (!error) {
      await fetch("/api/assign_appointment", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: appointment.id,
          doctorId: selectedDoctor,
        }),
      });

       window.location.reload();
    }

    setAssigning(false);
  };
  return (
    <div className="flex justify-end gap-4">
      {/* Doctor selector */}
      <Select
        value={selectedDoctor}
        onOpenChange={(open) => {
          if (open && doctors.length === 0) loadDoctors();
        }}
        onValueChange={setSelectedDoctor}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Choisir médecin" />
        </SelectTrigger>
        <SelectContent>
          {loadingDoctors ? (
            <SelectItem value="loading" disabled>
              Chargement...
            </SelectItem>
          ) : doctors.length === 0 ? (
            <SelectItem value="none" disabled>
              Aucun médecin
            </SelectItem>
          ) : (
            doctors.map((doc) => (
              <SelectItem key={doc.id} value={doc.id}>
                Dr. {doc.prenom} {doc.nom}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Assign button */}
      <Button
        size="sm"
        disabled={!selectedDoctor || assigning}
        onClick={handleAssign}
      >
        {assigning ? "..." : "ASSIGNER"}
      </Button>

      {/* Status changer */}
      <Select
        defaultValue={appointment.status}
        onValueChange={(value) => updateStatus(appointment.id, value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="accepté">Accepté</SelectItem>
          <SelectItem value="reporté">Reporté</SelectItem>
          <SelectItem value="annulé">Annulé</SelectItem>
          <SelectItem value="en cours">En cours</SelectItem>
          <SelectItem value="terminé">Terminé</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
