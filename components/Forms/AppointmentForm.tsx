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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

  const [date, setDate] = useState<Date | undefined>(new Date()); // ✅ NEW
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

  // ✅ Fetch profile
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

  // ✅ Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_services");
      if (data) setServices(data);
    };
    fetchServices();
  }, []);

  // ✅ Validation updated
  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.department) toast.error("Veuillez sélectionner un département.", { position: "top-center" });
    if (!formData.selectedSlot) toast.error("Choisir une tranche horaire", { position: "top-center" });
    if (!formData.date) toast.error("Veuillez choisir une date", { position: "top-center" });
    if (!formData.sexe) toast.error("Veuillez sélectionner votre sexe.", { position: "top-center" });
    if (formData.age < 0) toast.error("Veuillez entrer un âge valide.", { position: "top-center" });
    if (!formData) toast.error("Veuillez remplir tous les champs.", { position: "top-center" });
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && date;
  };

  // ✅ UPDATED SUBMIT
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
      router.push("/patients/appointments"); // ✅ better UX
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-12">
      {/* Main Form Section */}
      <div className="lg:col-span-2">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            {!isLoadingProfile && formData.patientName && (
              <p className="text-xl font-medium text-foreground tracking-wide">
                BIENVENUE, {formData.patientName} ! SERVICES AUX PATIENTS - 2024
                <Button
                  className="ml-75 cursor-pointer text-md p-5"
                  onClick={logout}
                >
                  Déconnecter-vous
                </Button>
              </p>
            )}
            <h1 className="text-5xl md:text-6xl italic font-light mt-10">
              Demander une Consultation
            </h1>
            <Separator className="mt-6 h-0.5" />
          </div>

          {/* Form */}
          <form onSubmit={handleNewAppointment} className="space-y-8">
            {/* Department Selection */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xl font-bold tracking-widest">
                  SÉLECTIONNER LE DÉPARTEMENT
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger className="w-md text-md border-0 border-b rounded-none">
                    <SelectValue placeholder="Selectioner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem
                        key={service.id}
                        value={service.id}
                        className="text-md"
                      >
                        {service.type_de_service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xl font-bold tracking-widest">
                  SEXE
                </Label>
                <Select
                  value={formData.sexe}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sexe: value })
                  }
                >
                  <SelectTrigger className="border-0 border-b rounded-none focus:ring-0 text-md">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homme" className="text-md">
                      Homme
                    </SelectItem>
                    <SelectItem value="femme" className="text-md">
                      Femme
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-xl font-bold tracking-widest">
                  DATE DE RENDEZ-VOUS
                </Label>

                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="w-md border"
                />
              </div>
              <div />
            </div>

            {/* Time Slots */}
            <div className="space-y-3 pt-4">
              <Label className="text-xl font-medium tracking-widest">
                TRANCHES HORAIRES
              </Label>
              <ToggleGroup
                type="single"
                value={formData.selectedSlot}
                onValueChange={(value) => {
                  if (value) setFormData({ ...formData, selectedSlot: value });
                }}
                className="justify-start gap-2"
              >
                {TIME_SLOTS.map((slot) => (
                  <ToggleGroupItem
                    key={slot}
                    value={slot}
                    className="text-md border data-[state=on]:bg-primary data-[state=on]:text-white"
                    variant="default"
                  >
                    {slot}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-8 text-center space-x-3 space-y-6">
                <Label className="text-xl font-bold tracking-widest">
                  VOTRE NOM COMPLET
                </Label>
                <Input
                  value={`${formData.patientName} ${formData.patientLastName}`}
                  disabled
                  className="border-0 border-b border-input rounded-none focus-visible:ring-0 h-14 text-base w-96"
                />
                <Label className="text-xl font-bold tracking-widest">AGE</Label>
                <Input
                  placeholder="votre age ici"
                  value={formData.age}
                  type="number"
                  min="0"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                  className="border-0 border-b border-input rounded-none focus-visible:ring-0 h-14 text-base w-36"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xl font-bold tracking-widest">
                  DÉCRIVEZ VOTRE PROBLÈME
                </Label>
                <Input
                  placeholder="Ex: douleur, fièvre, consultation générale..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="border-0 border-b border-input rounded-none focus-visible:ring-0 h-14 text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg font-semibold tracking-widest cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "ENVOYER LA DEMANDE →"}
            </Button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-8">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold">AVIS DE SANTÉ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl">Ce formulaire est une demande uniquement.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
