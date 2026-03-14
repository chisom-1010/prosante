"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ServiceForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [service, setService] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_profile_role");
      if (!error) setUserRole(data);
    }
    fetchRole();
  }, []);

  // Later, before rendering the form, check the role
  // if (userRole === null) {
  //   return <p>Chargement...</p>
  // }

  // if (userRole !== "admin") {
  //   return <p>Accès non autorisé. Vous devez être administrateur.</p>
  // }

  const handleNewService = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check if a service with the same name already exists
      const { data: existing, error: checkError } = await supabase
        .from("service_medical")
        .select("id")
        .eq("type_de_service", service)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        // Service already exists – show a friendly error
        setError("Ce service existe déjà.");
        setIsLoading(false);
        return;
      }

      // 2. If not, insert the new service
      const { error: insertError } = await supabase
        .from("service_medical")
        .insert({ type_de_service: service });

      if (insertError) throw insertError;

      // Clear input and redirect on success
      setService("");
      router.push("/quick_create");
    } catch (error: unknown) {
      // Handle any other errors (network, permission, etc.)
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleNewService}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <HugeiconsIcon
                  icon={CommandIcon}
                  strokeWidth={2}
                  className="size-6"
                />
              </div>
              <span className="sr-only">ProSanté</span>
            </Link>
            <h1 className="text-xl font-bold">Créer un nouveau service</h1>
            <FieldDescription>
              <span className="text-sm text-muted-foreground">
                Veuillez enter le nom du service pour continuer
              </span>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="service">Type de service</FieldLabel>
            <Input
              id="service"
              type="text"
              onChange={(e) => setService(e.target.value)}
              placeholder="veuillez entrer le service"
              required
            />
          </Field>
          <Field>
            <Button
              disabled={isLoading}
              className="cursor-pointer hover:bg-emerald-800"
              type="submit"
            >
              {isLoading ? "Ajout en cours..." : "Ajouter Le Service"}
            </Button>
          </Field>
          <FieldSeparator></FieldSeparator>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        <a href="#">Terme de Service</a> et <a href="#">Politique Privé</a>.
      </FieldDescription>
    </div>
  );
}
