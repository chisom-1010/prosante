"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Two-step button: first click asks for confirmation, second one cancels. */
export function CancelAppointmentButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/cancel_appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Impossible d'annuler ce rendez-vous.");
        return;
      }
      toast.success("Rendez-vous annulé.");
      router.refresh();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        className="rounded-xl border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Annuler
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Confirmer l'annulation">
      <Button size="sm" disabled={busy} onClick={cancel} className="rounded-xl bg-red-600 hover:bg-red-700">
        {busy ? "..." : "Confirmer"}
      </Button>
      <Button size="sm" variant="ghost" disabled={busy} onClick={() => setConfirming(false)} className="rounded-xl">
        Garder
      </Button>
    </div>
  );
}
