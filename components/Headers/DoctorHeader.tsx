"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

type DoctorProfile = {
  name: string;
  email: string;
};

export function DoctorHeader() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadDoctorProfile() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) return;

        const { data: profile, error: profileError } = await supabase
          .from("doctors")
          .select("nom, prenom, email")
          .eq("auth_user_id", authData.user.id)
          .single();

        setDoctor({
          name: `${profile?.nom ?? ""} ${profile?.prenom ?? ""}`,
          email: profile?.email ?? authData.user.email ?? "",
        });
      } catch (error) {
        console.error("Failed to load doctor profile:", error);
      }
    }

    loadDoctorProfile();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="border-b border-border px-6 py-6 md:px-12">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-widest">
            <Link href="/doctors">
              {doctor?.name ? `Bienvenue, Dr ${doctor.name}` : "Bienvenue"}
            </Link>
          </h1>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <nav className="hidden gap-2 md:flex">
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-sm font-semibold tracking-widest"
            >
              <Link href="/doctors/appointments">RENDEZ-VOUS</Link>
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="text-sm font-semibold tracking-widest"
            >
              <Link href="/doctors/change_password">
                CHANGER VOTRE MOT DE PASSE
              </Link>
            </Button>

            <Button
              type="button"
              variant="default"
              size="lg"
              className="text-xs font-semibold tracking-widest"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "DÉCONNEXION..." : "DÉCONNECTER"}
            </Button>
          </nav>
        </div>
      </div>

      <Separator className="bg-border" />
    </header>
  );
}
