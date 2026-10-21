"use client";

import Link from "next/link";
import { useState } from "react";

import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => null);
        setError(
          res.status === 400
            ? "Veuillez entrer une adresse e-mail valide."
            : (data?.error ?? "Une erreur est survenue. Réessayez."),
        );
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50">
          <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-7 text-emerald-700" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">Mot de passe oublié</h1>
        <p className="mt-2 text-base text-slate-500">
          Entrez votre adresse e-mail : nous vous enverrons un lien pour
          choisir un nouveau mot de passe.
        </p>
      </div>

      {sent ? (
        <div className="space-y-5" role="status">
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-base text-emerald-900">
            Si un compte existe pour <strong>{email}</strong>, un e-mail vient
            de lui être envoyé. Pensez à vérifier vos courriers indésirables.
          </p>
          <Link href="/auth/login" className="font-semibold text-emerald-700 hover:underline">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Adresse e-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nom@exemple.fr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl bg-emerald-700 text-base font-semibold hover:bg-emerald-800">
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Button>

            <Link href="/auth/login" className="text-center text-sm font-medium text-emerald-700 hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
