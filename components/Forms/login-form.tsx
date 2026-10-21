"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAccountIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
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
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fields.email || !fields.password) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fields.email)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fields.email,
        password: fields.password,
      });

      if (error) throw error;

      const userId = data.user.id;

      // Staff start with a temporary password and must replace it first.
      if (
        data.user.app_metadata?.must_change_password === true ||
        data.user.user_metadata?.must_change_password === true
      ) {
        router.push("/auth/change-password");
        return;
      }

      // PROFILE
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (profile) {
        const role = profile.role?.toLowerCase();

        if (role === "admin") {
          router.push("/admin");
          return;
        }

        if (role === "patient") {
          router.push("/patients");
          return;
        }
      }

      // DOCTOR
      const { data: doctor } = await supabase
        .from("doctors")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (doctor) {
        router.push("/doctors");
        return;
      }

      // RECEPTIONIST
      const { data: receptionist } = await supabase
        .from("receptionists")
        .select("id")
        .eq("auth_user_id", userId)
        .maybeSingle();

      if (receptionist) {
        router.push("/receptionists");
        return;
      }

      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("rounded-3xl border border-slate-200 bg-white p-8 shadow-sm", className)}
      {...props}
    >
      <form onSubmit={handleLogin} noValidate>
        <FieldGroup className="space-y-6">
          <div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50">
              <HugeiconsIcon icon={UserAccountIcon} strokeWidth={2} className="size-7 text-emerald-700" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Connexion</h1>
            <FieldDescription className="mt-2 text-base text-slate-500">
              Accédez à votre espace ProSanté sécurisé.
            </FieldDescription>
          </div>

          <Field className="space-y-2">
            <FieldLabel htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Adresse e-mail
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nom@exemple.fr"
              value={fields.email}
              onChange={(e) => {
                setFields({ ...fields, email: e.target.value });
              }}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base"
            />
          </Field>

          <Field className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Mot de passe
              </FieldLabel>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-emerald-700 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={fields.password}
                onChange={(e) => {
                  setFields({ ...fields, password: e.target.value });
                }}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base pr-12"
              />
              <button
                type="button"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
              >
                <HugeiconsIcon icon={showPassword ? ViewIcon : ViewOffIcon} className="size-5" />
              </button>
            </div>
          </Field>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Field>
            <Button type="submit" disabled={isLoading} className="h-12 w-full cursor-pointer rounded-2xl bg-emerald-700 text-base font-semibold text-white hover:bg-emerald-800">
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </Field>

          <div className="border-t border-slate-200 pt-5 text-center text-base text-slate-600">
            Nouveau patient ?{" "}
            <Link href="/auth/signin" className="font-semibold text-emerald-700 hover:underline">
              Créer un compte
            </Link>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
