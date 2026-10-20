"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import PasswordSetForm from "@/components/Forms/PasswordSetForm";

/** Forced on first login (and reachable by any signed-in user) to replace a temporary password. */
export default function ChangePasswordForm() {
  const router = useRouter();

  const handleSubmit = async (password: string) => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return data?.error ?? "Impossible de modifier le mot de passe.";
    }

    // Get a fresh session token so it no longer carries the "must change" flag.
    await createClient().auth.refreshSession();

    toast.success("Mot de passe mis à jour.");
    router.replace(data?.redirectTo ?? "/");
    router.refresh();
    return null;
  };

  return (
    <PasswordSetForm
      title="Choisissez votre mot de passe"
      description="Pour sécuriser votre compte, remplacez le mot de passe temporaire par un mot de passe que vous seul connaissez."
      submitLabel="Enregistrer le mot de passe"
      onSubmit={handleSubmit}
    />
  );
}
