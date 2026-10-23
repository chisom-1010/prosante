"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TIME_SLOTS } from "@/lib/appointments";
import { createClient } from "@/lib/supabase/client";

type Service = { id: string; type_de_service: string };

/** yyyy-mm-dd in the user's own timezone (toISOString would shift the day for some offsets). */
const toLocalISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-600";
const fieldClass = "h-12 rounded-xl border-slate-200 bg-white text-base shadow-none";

export default function AppointmentForm() {
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [sexe, setSexe] = useState("");
  const [age, setAge] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_services").then(({ data }) => {
      if (data) setServices(data as Service[]);
    });

    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p) setFullName(`${p.firstName ?? ""} ${p.username ?? ""}`.trim());
      })
      .catch(() => {});
  }, []);

  const serviceName = services.find((s) => s.id === department)?.type_de_service;

  const validate = (): string | null => {
    if (!department) return "Veuillez sélectionner un service.";
    if (!sexe) return "Veuillez indiquer votre sexe.";
    const n = Number(age);
    if (!Number.isInteger(n) || n < 1 || n > 120) return "Veuillez entrer un âge valide (1 à 120).";
    if (!date) return "Veuillez choisir une date.";
    if (!slot) return "Veuillez choisir un créneau horaire.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const problem = validate();
    if (problem) {
      toast.error(problem);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { error } = await supabase.from("demande_de_consultation").insert({
        id_patient: user.id,
        id_service_medical: department,
        date_de_rendezvous: toLocalISODate(date!),
        tranche_horaires: slot,
        status: "en attente",
        sexe,
        age: Number(age),
        notes: notes.trim() || null,
      });

      if (error) {
        toast.error(
          error.code === "23514" ? error.message : "Impossible d'envoyer la demande. Réessayez.",
        );
        return;
      }

      toast.success("Demande envoyée. Notre équipe vous contactera pour la confirmer.");
      router.push("/patients/appointments");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 py-2 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} noValidate className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4 rounded-xl border-l-4 border-emerald-700 bg-emerald-50 px-5 py-4">
          <HugeiconsIcon icon={Alert01Icon} className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <p className="text-sm text-emerald-900">
            Ce formulaire est une <strong>demande</strong> : un membre de notre équipe la confirmera et vous
            assignera un médecin.
          </p>
        </div>

        <div className="space-y-2">
          <Label className={labelClass}>Service médical</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className={`w-full h-12! ${fieldClass}`} aria-label="Service médical">
              <SelectValue placeholder="Sélectionner…" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-base">
                  {s.type_de_service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className={labelClass}>Sexe</Label>
            <Select value={sexe} onValueChange={setSexe}>
              <SelectTrigger className={`w-full h-12! ${fieldClass}`} aria-label="Sexe">
                <SelectValue placeholder="Sélectionner…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homme">Homme</SelectItem>
                <SelectItem value="femme">Femme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="age" className={labelClass}>
              Âge
            </Label>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              placeholder="28"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className={labelClass}>Date du rendez-vous</Label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 md:p-5">
            <Calendar
              mode="single"
              locale={fr}
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              className="mx-auto w-full max-w-md bg-transparent"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className={labelClass}>Créneau horaire</Label>
          <ToggleGroup
            type="single"
            value={slot}
            onValueChange={(v) => v && setSlot(v)}
            className="flex flex-wrap justify-start gap-3"
          >
            {TIME_SLOTS.map((s) => (
              <ToggleGroupItem
                key={s}
                value={s}
                variant="outline"
                className="h-11 rounded-full! border-slate-200 px-5 text-sm font-semibold text-slate-700 data-[state=on]:border-emerald-700 data-[state=on]:bg-emerald-700 data-[state=on]:text-white"
              >
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="mr-2 size-4"
                />
                Déconnecter-vous
              </Button>
            </div>

            {/* FORM */}
            <form onSubmit={handleNewAppointment} className="space-y-10">
              {/* SELECTS */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-sm font-bold uppercase tracking-wider text-[#1f2f46]">
                    Sélectionner le Département
                  </Label>

                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        department: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-14 rounded-xl border-[#d8dee8] bg-white text-base shadow-none">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>

                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem
                          key={service.id}
                          value={service.id}
                          className="text-base"
                        >
                          {service.type_de_service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold uppercase tracking-wider text-[#1f2f46]">
                    Sexe
                  </Label>

                  <Select
                    value={formData.sexe.toLowerCase().trim()}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        sexe: value,
                      })
                    }
                  >
                    <SelectTrigger className="h-14 rounded-xl border-[#d8dee8] bg-white text-base shadow-none">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="homme">Homme</SelectItem>

                      <SelectItem value="femme">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CALENDAR */}
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-[#1f2f46]">
                  Date de Rendez-vous
                </Label>

                <div className="rounded-2xl border border-[#e3e8ef] bg-[#fbfcfd] p-5">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(selectedDate) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: selectedDate,
                      }))
                    }
                    disabled={(d) =>
                      d < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* TIME SLOTS */}
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-wider text-[#1f2f46]">
                  Tranches Horaires
                </Label>

                <ToggleGroup
                  type="single"
                  value={formData.selectedSlot}
                  onValueChange={(value) => {
                    if (value)
                      setFormData({
                        ...formData,
                        selectedSlot: value,
                      });
                  }}
                  className="flex flex-wrap justify-start gap-3"
                >
                  {TIME_SLOTS.map((slot) => (
                    <ToggleGroupItem
                      key={slot}
                      value={slot}
                      className="h-12 rounded-4xl border border-[#d9dee7] px-6 text-sm font-semibold text-[#1f2f46] data-[state=on]:border-[#0b7a75] data-[state=on]:bg-[#0b7a75] data-[state=on]:text-white"
                      variant="default"
                    >
                      {slot}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* PATIENT INFOS */}
              <div className="grid gap-6 md:grid-cols-[1fr_180px]">
                <div className="space-y-3">
                  <Label className="text-sm font-bold uppercase tracking-wider text-[#1f2f46]">
                    Votre Nom Complet
                  </Label>

                  <Input
                    value={`${formData.patientName} ${formData.patientLastName}`}
                    disabled
                    className="h-14 rounded-xl border-[#d8dee8] bg-[#f8fafc] text-base"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold uppercase tracking-wider text-[#1f2f46]">
                    Âge
                  </Label>

                  <Input
                    placeholder="28"
                    value={formData.age}
                    type="number"
                    min="0"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        age:
                          e.target.value === ""
                            ? 0
                            : Number(e.target.value),
                      })
                    }
                    className="h-14 rounded-xl border-[#d8dee8] bg-white text-base"
                  />
                </div>
              </div>

              {/* NOTES */}
              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-[#1f2f46]">
                  Décrivez votre Problème
                </Label>

        <div className="space-y-2">
          <Label htmlFor="notes" className={labelClass}>
            Décrivez votre problème <span className="font-normal normal-case text-slate-400">(facultatif)</span>
          </Label>
          <textarea
            id="notes"
            maxLength={1000}
            placeholder="Ex : douleur, fièvre, consultation générale…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-14 w-full rounded-2xl bg-emerald-700 text-base font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          {submitting ? "Envoi en cours…" : "Envoyer la demande"}
          {!submitting && <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-5" />}
        </Button>
      </form>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-28">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Récapitulatif</p>
        <dl className="mt-5 space-y-4 text-sm">
          <Row label="Patient" value={fullName} />
          <Row label="Service" value={serviceName} />
          <Row
            label="Date"
            value={date?.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          />
          <Row label="Créneau" value={slot} />
        </dl>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-1 text-base capitalize ${value ? "font-semibold text-slate-900" : "text-slate-400"}`}>
        {value || "—"}
      </dd>
    </div>
  );
}
