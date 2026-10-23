"use client";

import { createClient } from "@/lib/supabase/client";
import { STATUS_LABELS, statusOptions, type Status } from "@/lib/appointments";
import { toast } from "sonner";
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
    toast.error(
      error.code === "23514"
        ? error.message
        : "Impossible de modifier le statut.",
    );
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
          {statusOptions(appointment.status, ["en cours", "fini"]).map(
            (s: Status) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}