"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

interface FormData {
  department: string;
  selectedSlot: string;
  patientName: string;
  patientLastName: string;
  patientId: string;
  notes: string;
  sexe: string;
  age: number;
  date: Date | undefined;
}

const TIME_SLOTS = [
  "08h00 - 09h00",
  "09h00 - 10h00",
  "10h00 - 11h00",
  "11h00 - 12h00",
  "14h00 - 15h00",
  "15h00 - 16h00",
  "16h00 - 17h00",
];

export default function AppointmentForm() {
  const [formData, setFormData] = useState<FormData>({
    department: "",
    selectedSlot: "",
    patientName: "",
    patientLastName: "",
    patientId: "",
    notes: "",
    sexe: "",
    age: 0,
    date: undefined,
  });

  const [date, setDate] = useState<Date | undefined>(new Date());

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [services, setServices] = useState<
    { id: string; type_de_service: string }[]
  >([]);

  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/auth/login");
  };

  useEffect(() => {
    async function fetchUsername() {
      try {
        const response = await fetch("/api/user/profile");

        if (response.ok) {
          const data = await response.json();

          setFormData((prev) => ({
            ...prev,
            patientName: data.username || "",
            patientLastName: data.firstName || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch username:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchUsername();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      const supabase = createClient();

      const { data } = await supabase.rpc("get_services");

      if (data) setServices(data);
    };

    fetchServices();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.department)
      toast.error("Veuillez sélectionner un département.", {
        position: "top-center",
      });

    if (!formData.selectedSlot)
      toast.error("Choisir une tranche horaire", {
        position: "top-center",
      });

    if (!formData.date)
      toast.error("Veuillez choisir une date", {
        position: "top-center",
      });

    if (!formData.sexe)
      toast.error("Veuillez sélectionner votre sexe.", {
        position: "top-center",
      });

    if (formData.age < 0)
      toast.error("Veuillez entrer un âge valide.", {
        position: "top-center",
      });

    if (!formData)
      toast.error("Veuillez remplir tous les champs.", {
        position: "top-center",
      });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0 && date;
  };

  const handleNewAppointment = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("demande_de_consultation").insert({
      id_patient: userData.user?.id,
      tranche_horaires: formData.selectedSlot,
      date_de_rendezvous: formData.date?.toISOString(),
      id_service_medical: formData.department,
      status: "en attente",
      notes: formData.notes,
      sexe: formData.sexe,
      age: formData.age,
    });

    if (error) {
      console.error(error);
    } else {
      router.push("/patients/appointments");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16">
          <button
            onClick={() => window.history.back()}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2.5 transition hover:bg-emerald-100 cursor-pointer border border-slate-200 border-2px"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="h-4 w-4 text-emerald-700"
              />

          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
             Retour
        </span>
       </button>
</div>
        {/* HEADER */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black tracking-tight text-[#112031] md:text-6xl">
            Demander une Consultation
          </h1>

          <p className="mt-4 text-xl italic text-[#7b8794]">
            Prenez rendez-vous avec nos spécialistes en quelques clics.
          </p>
        </div>

        {/* ALERT */}
        <div className="mb-8 flex items-start gap-4 rounded-xl border-l-4 border-[#0b7a75] bg-[#e8f6f4] px-6 py-5">
          <HugeiconsIcon
            icon={Alert01Icon}
            className="mt-1 size-5 text-[#0b7a75]"
          />

          <div>
            <p className="text-sm font-black uppercase tracking-wider text-[#0b4d4a]">
              Avis de Santé
            </p>

            <p className="mt-1 text-base text-[#0c6b67]">
              Ce formulaire est une demande uniquement. Un membre de notre
              équipe vous contactera pour confirmer l&apos;horaire définitif.
            </p>
          </div>
        </div>

        {/* CARD */}
        <Card className="overflow-hidden rounded-[28px] border-none bg-white shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
          <CardContent className="p-8 md:p-12">
            {/* TOP BAR */}
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {!isLoadingProfile && formData.patientName && (
                <div>
                  <p className="text-lg font-semibold text-[#112031]">
                    Bonjour, {formData.patientName}
                  </p>

                  <p className="text-sm text-[#7b8794]">
                    Services aux patients
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={logout}
                className="h-11 rounded-xl border-[#d9dee7] px-5 text-sm font-semibold text-[#112031] hover:bg-[#f5f7fb]"
              >
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
                      className="h-12 rounded-full border border-[#d9dee7] px-6 text-sm font-semibold text-[#1f2f46] data-[state=on]:border-[#0b7a75] data-[state=on]:bg-[#0b7a75] data-[state=on]:text-white"
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

                <textarea
                  placeholder="Ex: douleur, fièvre, consultation générale..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value,
                    })
                  }
                  className="min-h-[140px] w-full rounded-2xl border border-[#d8dee8] bg-white px-5 py-4 text-base outline-none transition focus:border-[#0b7a75]"
                />
              </div>

              {/* SUBMIT */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-16 w-full rounded-2xl bg-[#0b7a75] text-lg font-bold text-white shadow-lg shadow-[#0b7a75]/20 transition hover:bg-[#09645f]"
              >
                {isLoading ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    Envoyer la demande
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="ml-3 size-5"
                    />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FOOTER */}
        <p className="mt-10 text-center text-sm text-[#98a2b3]">
          © 2024 Clinical Prestige — Services aux patients.
        </p>
      </div>
    </div>
  );
}