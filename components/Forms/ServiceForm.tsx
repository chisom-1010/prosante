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
import { toast } from "sonner";

export function ServiceForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [service, setService] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleNewService = async (e: React.SubmitEvent) => {
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
        toast.error("Ce service existe déjà.", { position: "top-center" });
        setIsLoading(false);
        return;
      }
      
      if (!service.trim()) {
        toast.error("Veuillez entrer un nom de service.", { position: "top-center" });
        setIsLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("service_medical")
        .insert({ type_de_service: service });

      if (insertError) throw insertError;

      // Clear input and redirect on success
      setService("");
      router.push("/quick_create");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "An error occurred",
        { position: "top-center" },
      );
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
              <div className="flex size-24 items-center justify-center rounded-md">
                <HugeiconsIcon
                  icon={CommandIcon}
                  strokeWidth={2}
                  className="size-24"
                />
              </div>
              <span className="lg">ProSanté</span>
            </Link>
            <h1 className="text-4xl font-medium">Créer un nouveau service</h1>
            <FieldDescription>
              <span className="text-xl text-muted-foreground sm:text-center">
                Entrez le nom du service pour continuer
              </span>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel
              htmlFor="service"
              className="items-center justify-center text-lg font-medium pb-2"
            >
              Type de service
            </FieldLabel>
            <Input
              id="service"
              type="text"
              onChange={(e) => setService(e.target.value)}
              placeholder="veuillez entrer le service"
              className="items-center justify-center text-xl font-medium pb-2 h-14"
            />
          </Field>
          <Field>
            <Button
              disabled={isLoading}
              className="cursor-pointer hover:bg-emerald-800 h-12 text-lg"  
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
