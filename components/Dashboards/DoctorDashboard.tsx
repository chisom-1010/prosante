"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type Appointment = {
  id: string | number;
  status: string;
  patient_name: string;
  appointment_date: string;
  tranche_horaires: string;
};

type DoctorStats = {
  accepted: number;
};

export default function DoctorDashboard() {
  const supabase = useMemo(() => createClient(), []);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DoctorStats>({
    accepted: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: appts }, { data: stat }] = await Promise.all([
        supabase.rpc("get_doctor_dashboard"),
        supabase.rpc("get_doctor_stats"),
      ]);

      if (appts) {
        setAppointments(appts as Appointment[]);
      }

      if (stat && stat.length > 0) {
        setStats({
          accepted: (stat[0] as DoctorStats).accepted,
        });
      }
    };

    fetchData();
  }, [supabase]);

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "en attente",
  );

  const acceptedAppointments = appointments.filter(
    (appointment) => appointment.status === "accepté",
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 md:p-12">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="border-l pl-6">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              RENDEZ-VOUS ACCEPTÉS
            </p>
            <p className="text-6xl font-light">{stats.accepted}</p>
          </div>
        </div>

        <div className="mb-12">
          <div className="mb-6 flex justify-between">
            <h2 className="text-xl font-bold tracking-widest">
              RENDEZ-VOUS DISPONIBLES
            </h2>
            <Link
              href="/doctors/appointments"
              className="text-xs text-muted-foreground hover:underline"
            >
              TOUT VOIR
            </Link>
          </div>

          <Separator className="mb-8" />

          <div className="space-y-6">
            {pendingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="flex justify-between py-6">
                  <div>
                    <p className="text-sm font-semibold">
                      {appointment.patient_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.appointment_date} •{" "}
                      {appointment.tranche_horaires}
                    </p>
                  </div>

                  <Button size="sm">ACCEPTER</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold tracking-widest">
            RENDEZ-VOUS ACCEPTÉS
          </h2>

          <Separator className="mb-8" />

          <div className="space-y-6">
            {acceptedAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="flex justify-between py-6">
                  <div>
                    <p className="text-sm font-semibold">
                      {appointment.patient_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appointment.appointment_date} •{" "}
                      {appointment.tranche_horaires}
                    </p>
                  </div>

                  <Button variant="outline" size="sm">
                    DÉTAILS
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
