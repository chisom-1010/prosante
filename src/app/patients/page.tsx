import Link from "next/link";
import {
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  TaskDone01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { AppointmentList } from "@/components/patient/AppointmentList";
import { StatCard } from "@/components/shell/StatCard";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { requirePatient } from "@/lib/auth/requirePatient";
import { formatDate, getMyAppointments, todayISO } from "@/lib/patient/appointments";

export const metadata = {
  title: "Tableau de bord - ProSanté",
  description: "Vos rendez-vous et demandes de consultation.",
};

export default async function PatientDashboardPage() {
  const user = await requirePatient();
  const all = await getMyAppointments(user.id);

  const today = todayISO();
  const live = ["en attente", "accepté", "en cours", "reporté"];
  const upcoming = all
    .filter((a) => live.includes(a.status) && a.date_de_rendezvous >= today)
    .sort((a, b) => (a.date_de_rendezvous + a.tranche_horaires).localeCompare(b.date_de_rendezvous + b.tranche_horaires));
  const next = upcoming.find((a) => a.status === "accepté") ?? upcoming[0];

  const count = (...s: string[]) => all.filter((a) => s.includes(a.status)).length;

  return (
    <div className="flex flex-col gap-6 py-2 md:gap-8">
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Demandes" value={all.length} subtitle="Au total" icon={Calendar01Icon} iconBg="bg-neutral-100" iconColor="text-neutral-700" />
        <StatCard title="En attente" value={count("en attente", "reporté")} subtitle="À confirmer par l'équipe" icon={Clock01Icon} iconBg="bg-amber-50" iconColor="text-amber-700" />
        <StatCard title="Confirmés" value={count("accepté", "en cours")} subtitle="Médecin assigné" icon={CheckmarkCircle02Icon} />
        <StatCard title="Terminés" value={count("fini")} subtitle="Consultations passées" icon={TaskDone01Icon} iconBg="bg-cyan-50" iconColor="text-cyan-700" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 xl:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prochain rendez-vous</p>

          {next ? (
            <div className="mt-5 space-y-3">
              <p className="text-2xl font-bold capitalize text-slate-900">{formatDate(next.date_de_rendezvous)}</p>
              <p className="text-lg text-slate-700">{next.tranche_horaires}</p>
              <p className="text-sm text-slate-500">
                {[next.service, next.doctor ?? "Médecin à confirmer"].filter(Boolean).join(" · ")}
              </p>
              <StatusBadge status={next.status} />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p className="text-base text-slate-600">Aucun rendez-vous à venir.</p>
              <Link
                href="/patients/new"
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-700 px-5 font-semibold text-white transition hover:bg-emerald-800"
              >
                Faire une demande
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5" />
              </Link>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">Dernières demandes</h2>
            <Link href="/patients/appointments" className="text-sm font-semibold text-emerald-700 hover:underline">
              Tout voir
            </Link>
          </div>
          <AppointmentList
            items={all.slice(0, 4)}
            empty={<p className="p-8 text-base text-slate-600">Vous n&apos;avez encore fait aucune demande.</p>}
          />
        </div>
      </section>
    </div>
  );
}
