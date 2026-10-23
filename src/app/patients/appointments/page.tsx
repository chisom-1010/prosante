import Link from "next/link";

import { AppointmentList } from "@/components/patient/AppointmentList";
import { STATUSES, STATUS_LABELS, isStatus } from "@/lib/appointments";
import { requirePatient } from "@/lib/auth/requirePatient";
import { getMyAppointments } from "@/lib/patient/appointments";

export const metadata = {
  title: "Mes rendez-vous - ProSanté",
};

export default async function PatientAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requirePatient();
  const { status } = await searchParams;
  const filter = status && isStatus(status) ? status : null;

  const all = await getMyAppointments(user.id);
  const items = filter ? all.filter((a) => a.status === filter) : all;

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active
        ? "border-emerald-700 bg-emerald-700 text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
    }`;

  return (
    <div className="flex flex-col gap-6 py-2">
      <nav aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
        <Link href="/patients/appointments" className={chip(!filter)}>
          Tous ({all.length})
        </Link>
        {STATUSES.map((s) => {
          const n = all.filter((a) => a.status === s).length;
          if (n === 0 && filter !== s) return null;
          return (
            <Link key={s} href={`/patients/appointments?status=${encodeURIComponent(s)}`} className={chip(filter === s)}>
              {STATUS_LABELS[s]} ({n})
            </Link>
          );
        })}
      </nav>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <AppointmentList
          items={items}
          empty={
            <div className="space-y-4 p-10 text-center">
              <p className="text-base text-slate-600">
                {filter ? "Aucun rendez-vous avec ce statut." : "Vous n'avez encore fait aucune demande."}
              </p>
              <Link
                href="/patients/new"
                className="inline-flex h-12 items-center rounded-2xl bg-emerald-700 px-5 font-semibold text-white transition hover:bg-emerald-800"
              >
                Nouvelle demande
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}
