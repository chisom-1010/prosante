"use client";

import { useState } from "react";
import {
  CirclePasswordIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = Omit<React.ComponentPropsWithoutRef<"div">, "onSubmit"> & {
  title: string;
  description: string;
  submitLabel: string;
  /** Resolve with an error message to show, or null when it worked. */
  onSubmit: (password: string) => Promise<string | null>;
};

/** Two-field "choose a new password" card shared by the change and reset flows. */
export default function PasswordSetForm({
  title,
  description,
  submitLabel,
  onSubmit,
  className,
  children,
  ...props
}: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      setError(await onSubmit(password));
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white p-8 shadow-sm", className)} {...props}>
      <div className="mb-8">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50">
          <HugeiconsIcon icon={CirclePasswordIcon} strokeWidth={2} className="size-7 text-emerald-700" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-base text-slate-500">{description}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Nouveau mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 pr-12 text-base"
              />
              <button
                type="button"
                aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-emerald-700"
              >
                <HugeiconsIcon icon={show ? ViewIcon : ViewOffIcon} className="size-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">Au moins 8 caractères.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Confirmer le mot de passe
            </Label>
            <Input
              id="confirm"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 text-base"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl bg-emerald-700 text-base font-semibold hover:bg-emerald-800">
            {loading ? "Enregistrement..." : submitLabel}
          </Button>

          {children}
        </div>
      </form>
    </div>
  );
}
