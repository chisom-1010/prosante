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
import { CommandIcon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
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
      className={cn("flex max-w-7xl flex-col gap-10 text-base", className)}
      {...props}
    >
      <form onSubmit={handleSignUp}>
        <FieldGroup>
          <div className="flex flex-col items-center justify-start gap-3 text-center">
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
              <span className="text-sm font-medium">ProSanté</span>
            </Link>
            <FieldDescription>
              <span className="text-2xl md:text-3xl text-center font-bold md:text-center sm:justify-center">
                Créez un compte pour continuer
              </span>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name" className="text-base md:text-lg">
              Nom
            </FieldLabel>
            <Input
              id="name"
              type="text"
              className="h-12 text-base md:h-14 md:text-lg"
              onChange={(e) => {
                setFields({ ...fields, name: e.target.value });
              }}
              placeholder="veuillez entrer votre nom"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="firstName" className="text-base md:text-lg">
              Prenom
            </FieldLabel>
            <Input
              id="firstName"
              type="text"
              className="h-12 text-base md:h-14 md:text-lg"
              placeholder="veuillez entrer votre prénom"
              onChange={(e) => {
                setFields({ ...fields, firstName: e.target.value });
              }}
            />
          </Field>
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
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password" className="text-base md:text-lg">
              Mot de Passe
            </FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-12 pr-12 text-base md:h-14 md:text-lg"
                placeholder="mot de passe"
                onChange={(e) => {
                  setFields({ ...fields, password: e.target.value });
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground md:right-4"
              >
                {showPassword ? (
                  <HugeiconsIcon icon={ViewIcon} />
                ) : (
                  <HugeiconsIcon icon={ViewOffIcon} />
                )}
              </button>
            </div>
          </Field>
          <Field>
            <Button
              className="h-12 w-full cursor-pointer text-base font-semibold hover:bg-emerald-800 md:h-14 md:text-lg"
              type="submit"
            >
              S&apos;inscrire
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
