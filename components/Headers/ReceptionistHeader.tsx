"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { LogoutCircle01Icon, CirclePasswordIcon } from "@hugeicons/core-free-icons";


import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

type ReceptionistProfile = {
  name: string;
  email: string;
};

export function ReceptionistHeader() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [receptionist, setReceptionist] = useState<ReceptionistProfile | null>(
    null,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadReceptionistProfile() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) return;

        const { data: profile, error: profileError } = await supabase
          .from("receptionists")
          .select("nom, prenom, email")
          .eq("auth_user_id", authData.user.id)
          .single();

        setReceptionist({
          name: `${profile?.nom ?? ""} ${profile?.prenom ?? ""}`,
          email: profile?.email ?? authData.user.email ?? "",
        });
      } catch (error) {
        console.error("Failed to load receptionist profile:", error);
      }
    }

    loadReceptionistProfile();
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
    <div className="border-b border-border px-6 py-6 md:px-12 bg-[#f5f7fc] ">
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-widest">
            <Link href="/receptionists">
              {receptionist?.name
                ? `Bienvenue, ${receptionist.name}`
                : "Bienvenue"}
            </Link>
          </h1>
          <p className="mt-2 text-2xl text-[#4c5565]">
              Voici le récapitulatif des activités des médecins et leurs patients.
            </p>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <nav className="hidden gap-2 md:flex">
            <Button
              variant="destructive"
              size="lg"
              className="h-14 rounded-xl border-[#aab5c7] px-8 text-base tracking-widest hover:text-primary"
            >
              <HugeiconsIcon
                icon={CirclePasswordIcon}
                size={24}
                color="currentColor"
                strokeWidth={2}
                />
              <Link href="/receptionists/change_password">
                CHANGER VOTRE MOT DE PASSE
              </Link>
            </Button>

            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-14 rounded-xl border-[#aab5c7] px-8 text-base cursor-pointer hover:bg-primary hover:text-secondary"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
               <HugeiconsIcon
                icon={LogoutCircle01Icon}
                size={24}
                color="currentColor"
                strokeWidth={2}
              />
              {isLoggingOut ? "DÉCONNEXION..." : "DÉCONNECTER"}
            </Button>
          </nav>
        </div>
      </div>

      <Separator className="bg-border" />
    </div>
  );
}
