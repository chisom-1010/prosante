"use client";

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
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const defaultFields = {
  email: "",
  password: "",
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [fields, setFields] = useState(defaultFields);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!fields.email || !fields.password) {
      toast.error("Veuillez remplir tous les champs.", {
        position: "top-center",
      });
      return;
    }

    if (
      !(
        fields.email.includes("@gmail.com") ||
        fields.email.includes("@yahoo.com")
      )
    ) {
      toast.error("Veuillez entrer une adresse email valide.", {
        position: "top-center",
      });
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fields.email,
        password: fields.password,
      });

      if (error) throw error;

      // get user id
      const userId = data.user.id;

      // 1️⃣ check profiles (admin / patient)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        return;
      }

      if (profile?.role === "patient") {
        router.push("/patients");
        return;
      }

      // 2️⃣ check doctors table
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("auth_user_id", userId)
        .single();

      if (doctor) {
        router.push("/doctors");
        return;
      }

      // 3️⃣ check receptionists table
      const { data: receptionist } = await supabase
        .from("receptionists")
        .select("id")
        .eq("auth_user_id", userId)
        .single();

      if (receptionist) {
        router.push("/receptionists");
        return;
      }

      // fallback
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-8 text-base", className)} {...props}>
      <form onSubmit={handleLogin}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-3 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-10 items-center justify-center rounded-md">
                <HugeiconsIcon
                  icon={CommandIcon}
                  strokeWidth={2}
                  className="size-7"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-bold md:text-3xl">
              Bienvenue à ProSanté
            </h1>
            <FieldDescription className="text-sm md:text-base">
              <a href="#">Mot de Passe Oublié?</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email" className="text-base md:text-lg">
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              className="h-12 text-base md:h-14 md:text-lg"
              placeholder="m@example.com"
              onChange={(e) => {
                setFields({ ...fields, email: e.target.value });
              }}
              // required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password" className="text-base md:text-lg">
              Mot de Passe
            </FieldLabel>
            <Input
              id="password"
              type="password"
              className="h-12 text-base md:h-14 md:text-lg"
              placeholder="mot de passe"
              onChange={(e) => {
                setFields({ ...fields, password: e.target.value });
              }}
              // required
            />
          </Field>
          <Field>
            <Button
              className="h-12 w-full cursor-pointer text-base font-semibold hover:bg-emerald-800 md:h-14 md:text-lg"
              type="submit"
            >
              Se Connecter
            </Button>
          </Field>
          <FieldSeparator></FieldSeparator>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center text-sm md:text-base">
        <a href="#">Terme de Service</a> et <a href="#">Politique Privé</a>.
      </FieldDescription>
    </div>
  );
}
