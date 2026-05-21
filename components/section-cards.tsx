// SECTION CARDS
"use server";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Doctor01Icon,
  FirstAidKitIcon,
  PatientIcon,
  OfficeChairIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/server";

export async function SectionCards() {
  const supabase = await createClient();

  const { data } = await supabase.rpc("get_admin_stats");

  const stats = data?.[0];

  const cards = [
    {
      title: "NOMBRE DES MÉDECINS",
      value: stats?.total_doctors,
      subtitle: "Médecins actifs",
      icon: Doctor01Icon,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-700",
    },
    {
      title: "NOMBRE DE PATIENTS",
      value: stats?.total_patients,
      subtitle: "Patients suivis",
      icon: PatientIcon,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-700",
    },
    {
      title: "NOMBRE DE RENDEZ-VOUS",
      value: stats?.total_appointments,
      subtitle: "Rendez-vous demandés",
      icon: Calendar01Icon,
      iconBg: "bg-neutral-100",
      iconColor: "text-neutral-700",
    },
    {
      title: "NOMBRE DE SERVICES MÉDICAUX",
      value: stats?.total_services,
      subtitle: "Services disponibles",
      icon: FirstAidKitIcon,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-700",
    },
    {
      title: "NOMBRE DE RÉCEPTIONNISTES",
      value: stats?.total_receptionists,
      subtitle: "Réceptionnistes disponibles",
      icon: OfficeChairIcon,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`border border-slate-200 shadow-none rounded-2xl bg-white ${
            index === 4 ? "xl:col-span-1" : ""
          }`}
        >
          <CardContent className="flex h-full flex-col justify-between p-8">
            <div className="flex items-start justify-between">
              <div className="max-w-[140px]">
                <p className="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-4 text-5xl font-bold text-slate-900">
                  {card.value}
                </h2>
              </div>

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <HugeiconsIcon
                  icon={card.icon}
                  strokeWidth={2}
                  className={`h-8 w-8 ${card.iconColor}`}
                />
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200 pt-5">
              <p className="text-lg text-slate-700">{card.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}