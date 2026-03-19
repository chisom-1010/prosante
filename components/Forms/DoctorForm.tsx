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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function DoctorForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [services, setServices] = useState<
    { id: string; type_de_service: string }[]
  >([]);
  const [selectedService, setSelectedService] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_services");
      if (data) {
        setServices(data);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      console.log(data.user);
    };
    getCurrentUser();
  }, []);

  const handleAddDoctor = async (e: React.SubmitEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const res = await fetch("/api/create_doctor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        nom: name,
        prenom: firstName,
        service_id: selectedService,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
    } else {
      router.push("/admin/Management/doctors");
    }

    setIsLoading(false);
  };

  return (
    <div
      className={cn(
        "flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-0",
        className,
      )}
      {...props}
    >
      <form onSubmit={handleAddDoctor}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-16 items-center justify-center rounded-md sm:size-20 lg:size-24">
                <HugeiconsIcon
                  icon={CommandIcon}
                  strokeWidth={2}
                  className="size-16 sm:size-20 lg:size-24"
                />
              </div>
              <span className="text-base sm:text-lg">ProSanté</span>
            </Link>
            <h1 className="text-2xl font-medium sm:text-3xl lg:text-4xl">
              Ajouter Un Médecin
            </h1>
            <FieldDescription>
              <span className="text-base text-muted-foreground sm:text-lg lg:text-xl">
                Veiullez remplir les champs pour ajouter un médecin
              </span>
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel
              htmlFor="name"
              className="items-center justify-center pb-2 text-base font-medium sm:text-lg"
            >
              Nom
            </FieldLabel>
            <Input
              id="name"
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="veuillez entrer votre nom"
              className="h-12 text-base font-medium sm:h-14 sm:text-lg lg:text-xl"
              required
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor="firstName"
              className="items-center justify-center pb-2 text-base font-medium sm:text-lg"
            >
              Prenom
            </FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="veuillez entrer votre prénom"
              onChange={(e) => setFirstName(e.target.value)}
              className="h-12 text-base font-medium sm:h-14 sm:text-lg lg:text-xl"
              required
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor="email"
              className="items-center justify-center pb-2 text-base font-medium sm:text-lg"
            >
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base font-medium sm:h-14 sm:text-lg lg:text-xl"
              required
            />
          </Field>

          <Field>
            <FieldLabel
              htmlFor="service"
              className="items-center justify-center pb-2 text-base font-medium sm:text-lg"
            >
              Service Médical
            </FieldLabel>
            <select
              id="service"
              className="h-12 w-full rounded-md border px-3 text-base font-medium sm:h-14 sm:text-lg lg:text-xl"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              required
            >
              <option value="">Choisir un service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.type_de_service}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <Button
              className="h-12 cursor-pointer text-base hover:bg-emerald-800 sm:h-14 sm:text-lg lg:text-lg"
              type="submit"
              disabled={isLoading}
              onClick={async () => {
                await fetch(`/api/emails/doctors`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: email,
                    nom: name,
                  }),
                });
              }}
            >
              {isLoading ? "Ajout en cours..." : "Ajouter le médecin"}
            </Button>
          </Field>

          <FieldSeparator></FieldSeparator>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center text-sm sm:text-base">
        <a href="#">Terme de Service</a> et <a href="#">Politique Privé</a>.
      </FieldDescription>
    </div>
  );
}
