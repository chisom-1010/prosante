"use server";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

  console.log(stats);
  return (
    <div className="grid grid-cols-1 gap-4 px-5 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-1 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="font-medium">
            Nombres des Médecins
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.total_doctors}
          </CardTitle>
          <CardAction>
            <HugeiconsIcon icon={Doctor01Icon} size={100} strokeWidth={2} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Médecins actifs</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Nombre de patients</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.total_patients}
          </CardTitle>
          <CardAction>
            <HugeiconsIcon icon={PatientIcon} size={100} strokeWidth={2} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Patients</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Nombre de rendez-vous</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.total_appointments}
          </CardTitle>
          <CardAction>
            <HugeiconsIcon icon={Calendar01Icon} size={100} strokeWidth={2} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Rendez-vous demandés</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Nombre de services médicaux</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.total_services}
          </CardTitle>
          <CardAction>
            <HugeiconsIcon icon={FirstAidKitIcon} size={100} strokeWidth={2} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Services Médicaux Disponibles
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Nombre de réceptionnistes</CardDescription>
          <CardTitle className="text-3xl font-bold tabular-nums @[250px]/card:text-3xl">
            {stats?.total_receptionists}
          </CardTitle>
          <CardAction>
            <HugeiconsIcon icon={OfficeChairIcon} size={100} strokeWidth={2} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Réceptionistes Disponibles
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
