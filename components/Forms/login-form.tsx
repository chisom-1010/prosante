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
  ArrowLeft01Icon,
  CommandIcon,
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
      console.log("USER ID:", userId);

      // PROFILE
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_user_id", userId)
        .maybeSingle();

      console.log("PROFILE:", profile);

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

      console.log("DOCTOR:", doctor);

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

      console.log("RECEPTIONIST:", receptionist);

      if (receptionist) {
        router.push("/receptionists");
        return;
      }

      console.log("FALLBACK TRIGGERED");
      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        // "  px-0 py-0 md:px-8",
        className
      )}
      {...props}
    >
      <div className="absolute left-6 top-6 bg-[#f5f7fc]">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-11 rounded-xl cursor-pointer border-[#48628c] px-5 text-[#48628c] hover:bg-[#eef2fb] xs:display-none"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 size-4" />
          Retour
        </Button>
      </div>

      {/* Center Card */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-[480px] rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm md:px-12">
          <form onSubmit={handleLogin}>
            <FieldGroup className="space-y-6">
              {/* Header */}
              <div className="space-y-3 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-[#f5f7fc]">
                  <HugeiconsIcon
                    icon={CommandIcon}
                    strokeWidth={2}
                    className="size-7 text-[#48628c]"
                  />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-[#48628c]">
                    Connexion à ProSanté
                  </h1>

                  <FieldDescription className="mt-2 text-base text-gray-500">
                    Accédez à votre espace patient sécurisé.
                  </FieldDescription>
                </div>
              </div>

              {/* Email */}
              <Field className="space-y-2">
                <FieldLabel
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-800"
                >
                  Adresse e-mail
                </FieldLabel>

                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.fr"
                  value={fields.email}
                  onChange={(e) => {
                    setFields({ ...fields, email: e.target.value });
                  }}
                  className="h-14 rounded-md border border-gray-300 bg-[#f9fafc] px-4 text-base focus-visible:ring-2 focus-visible:ring-[#48628c]"
                />
              </Field>

              {/* Password */}
              <Field className="space-y-2">
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Mot de passe
                  </FieldLabel>

                  <Link
                    href="#"
                    className="text-sm font-medium text-[#0c6b67] hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={fields.password}
                    onChange={(e) => {
                      setFields({
                        ...fields,
                        password: e.target.value,
                      });
                    }}
                    className="h-14 rounded-md border border-gray-300 bg-[#f9fafc] px-4 pr-12 text-base focus-visible:ring-2 focus-visible:ring-[#48628c]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <HugeiconsIcon icon={ViewIcon} className="size-5" />
                    ) : (
                      <HugeiconsIcon icon={ViewOffIcon} className="size-5" />
                    )}
                  </button>
                </div>
              </Field>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-14 w-full rounded-md bg-[#0c6b67] text-base font-semibold text-white hover:bg-[#095954]"
                >
                  {isLoading ? "Connexion..." : "Se Connecter"}
                </Button>
              </Field>

              {/* Register */}
              <div className="pt-2 text-center text-base text-gray-600">
                Nouveau patient ?{" "}
                <Link
                  href="#"
                  className="font-semibold text-[#0c6b67] hover:underline"
                >
                  Créer un compte
                </Link>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}