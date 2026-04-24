"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Appointment = {
  id: string;
  status: string;
};

const updateStatus = async (id: string, status: string) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("demande_de_consultation")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error(error);
  } else {
    window.location.reload();
  }
};

export default function DoctorActions({
  appointment,
}: {
  appointment: Appointment;
}) {
  return (
    <div className="flex justify-end">
      <Select
        defaultValue={appointment.status}
        onValueChange={(value) => updateStatus(appointment.id, value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {/* Only allowed actions */}
          <SelectItem value="en cours">En cours</SelectItem>
          <SelectItem value="terminé">Terminé</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}