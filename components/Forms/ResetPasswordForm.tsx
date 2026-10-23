"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import PasswordSetForm from "@/components/Forms/PasswordSetForm";

/** Landing page of the e-mailed reset link. The one-time token is only used on submit. */
export default function ResetPasswordForm() {
  const router = useRouter();
  const tokenHash = useSearchParams().get("token_hash");

  if (!tokenHash) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm" role="alert">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lien invalide</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Ce lien a expiré</h1>
        <p className="mt-3 text-base text-slate-600">
          Ce lien de réinitialisation est incomplet ou a expiré.
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-700 px-6 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  const handleSubmit = async (password: string) => {
    const supabase = createClient();

    // Exchanging the token signs the user in, which lets the server route
    // below know whose password to change.
    const { error: otpError } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash: tokenHash,
    });
    if (otpError) {
      return "Ce lien est invalide ou a expiré. Demandez-en un nouveau.";
    }

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return data?.error ?? "Impossible de modifier le mot de passe.";
    }

    // Make them sign in with the new password.
    await supabase.auth.signOut();
    toast.success("Mot de passe mis à jour. Vous pouvez vous connecter.");
    router.replace("/auth/login");
    return null;
  };

  return (
    <PasswordSetForm
      title="Nouveau mot de passe"
      description="Choisissez un nouveau mot de passe pour votre compte ProSanté."
      submitLabel="Réinitialiser le mot de passe"
      onSubmit={handleSubmit}
    />
  );
}
