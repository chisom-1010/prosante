import { StatusBadge } from "@/components/shell/StatusBadge";
import { CancelAppointmentButton } from "@/components/patient/CancelAppointmentButton";
import { formatDate, type PatientAppointment } from "@/lib/patient/appointments";

const CANCELLABLE = ["en attente", "accepté", "reporté"];

export function AppointmentList({ items, empty }: { items: PatientAppointment[]; empty: React.ReactNode }) {
  if (items.length === 0) return <>{empty}</>;

  return (
    <ul className="divide-y divide-slate-200">
      {items.map((a) => (
        <li key={a.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-lg font-semibold capitalize text-slate-900">{formatDate(a.date_de_rendezvous)}</p>
            <p className="text-sm text-slate-600">
              {a.tranche_horaires}
              {a.service ? ` · ${a.service}` : ""}
            </p>
            <p className="text-sm text-slate-500">
              {a.doctor ?? "Médecin à confirmer par notre équipe"}
            </p>
            {a.notes && <p className="line-clamp-2 pt-1 text-sm italic text-slate-500">« {a.notes} »</p>}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <StatusBadge status={a.status} />
            {CANCELLABLE.includes(a.status) && <CancelAppointmentButton id={a.id} />}
          </div>
        </li>
      ))}
    </ul>
  );
}
