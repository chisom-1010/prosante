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

export function ReceptionistForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [services, setServices] = useState<
    { id: string; type_de_service: string }[]
  >([]);
  const [selectedService, setSelectedService] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_services");
      if (!error && data) {
        setServices(data);
      }
    };
    fetchServices();
  }, []);
  const handleAddReceptionist = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom: name,
            prenom: firstName,
            role: "receptioniste",
          },
        },
      });
      if (error) throw error;
      router.push("/quick_create");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleAddReceptionist}>
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
            <h1 className="text-xl font-bold">Ajouter Une Réceptioniste</h1>
            <FieldDescription>
              <span className="text-sm text-muted-foreground">
                Veiullez remplir les champs pour ajouter une réceptioniste
              </span>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Nom</FieldLabel>
            <Input
              id="name"
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="le nom du réceptioniste"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="firstName">Prenom</FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="le prenom du réceptioniste"
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Mot de Passe</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="mot de passe"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <Button
              className="cursor-pointer hover:bg-emerald-800"
              type="submit"
            >
              Ajouter la réceptioniste
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
