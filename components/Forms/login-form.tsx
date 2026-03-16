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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
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
              <span className="sr-only">Acme Inc.</span>
            </Link>
            <h1 className="text-xl font-bold">Bienvenue à ProSanté</h1>
            <FieldDescription>
              <a href="#">Mot de Passe Oublié?</a>
            </FieldDescription>
          </div>
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
              Se Connecter
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
