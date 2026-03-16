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
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      console.log(data.user);
    };
    getCurrentUser();
  }, []);

  const handleAddReceptionist = async (e: React.SubmitEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const res = await fetch("/api/create_receptionist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        nom: name,
        prenom: firstName,
      }),
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
    } else {
      router.push("/admin/Management/receptionists");
    }

    setIsLoading(false);
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
            <h1 className="text-xl font-bold">Ajouter Un Réceptioniste</h1>
            <FieldDescription>
              <span className="text-sm text-muted-foreground">
                Veiullez remplir les champs pour ajouter un réceptioniste
              </span>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Nom</FieldLabel>
            <Input
              id="name"
              type="text"
              onChange={(e) => setName(e.target.value)}
              placeholder="veuillez entrer votre nom"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="firstName">Prenom</FieldLabel>
            <Input
              id="firstName"
              type="text"
              placeholder="veuillez entrer votre prénom"
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
            <Button
              className="cursor-pointer hover:bg-emerald-800"
              type="submit"
              onClick={async () => {
                await fetch(`/api/emails/receptionists`, {
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
              Ajouter l&apos;agent de reception
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
