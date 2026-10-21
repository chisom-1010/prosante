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
import { UserAdd01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const defaultFields = {
  name: "",
  firstName: "",
  email: "",
  password: "",
};

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [fields, setFields] = useState(defaultFields);
  const [showPassword, setShowPassword] = useState(false);
  //  const [repeatPassword, setRepeatPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    if (!fields.email || !fields.password || !fields.name || !fields.firstName) {
      toast.error("Veuillez remplir tous les champs.");
      setIsLoading(false);
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fields.email)) {
      toast.error("Veuillez entrer une adresse email valide.");
      setIsLoading(false);
      return;
    }
  
    if (fields.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      setIsLoading(false);
      return;
    }
  
    try {
      // ✅ SIGNUP
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: fields.email,
          password: fields.password,
          nom: fields.name,
          prenom: fields.firstName,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setError(data.error);
        return;
      }
  
      // ✅ LOGIN
      const supabase = createClient();
  
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: fields.email,
        password: fields.password,
      });
  
      if (loginError) {
        setError(loginError.message);
        return;
      }
  
      // ✅ GET USER
      const { data: userData } = await supabase.auth.getUser();
  
      if (!userData.user) {
        setError("Utilisateur introuvable");
        return;
      }
  
      // ✅ GET ROLE
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_user_id", userData.user.id)
        .single();
  
      if (profileError || !profile) {
        setError("Profil introuvable");
        return;
      }
  
      // ✅ ROLE-BASED REDIRECT
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/patients");
      }
  
    } catch (err) {
      setError("Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  return (
    <div
      className={cn("rounded-3xl border border-slate-200 bg-white p-8 shadow-sm", className)}
      {...props}
    >
      <form onSubmit={handleSignUp} noValidate>
        <FieldGroup className="gap-5">
          <div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50">
              <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="size-7 text-emerald-700" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Créer un compte</h1>
            <FieldDescription className="mt-2 text-base text-slate-500">
              Inscrivez-vous pour demander une consultation.
            </FieldDescription>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
          <Field className="space-y-2">
            <FieldLabel htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Nom
            </FieldLabel>
            <Input
              id="name"
              type="text"
              autoComplete="family-name"
              className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base"
              placeholder="Votre nom"
              onChange={(e) => {
                setFields({ ...fields, name: e.target.value });
              }}
            />
          </Field>
          <Field className="space-y-2">
            <FieldLabel htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Prénom
            </FieldLabel>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base"
              placeholder="Votre prénom"
              onChange={(e) => {
                setFields({ ...fields, firstName: e.target.value });
              }}
            />
          </Field>
          </div>
          <Field className="space-y-2">
            <FieldLabel htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Adresse e-mail
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base"
              placeholder="nom@exemple.fr"
              onChange={(e) => {
                setFields({ ...fields, email: e.target.value });
              }}
            />
          </Field>

          <Field className="space-y-2">
            <FieldLabel htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Mot de passe
            </FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base pr-12"
                placeholder="Au moins 8 caractères"
                onChange={(e) => {
                  setFields({ ...fields, password: e.target.value });
                }}
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
              {isLoading ? "Création du compte..." : "S'inscrire"}
            </Button>
          </Field>

          <div className="border-t border-slate-200 pt-5 text-center text-base text-slate-600">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="font-semibold text-emerald-700 hover:underline">
              Se connecter
            </Link>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
