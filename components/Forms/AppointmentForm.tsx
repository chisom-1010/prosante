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
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface FormData {
  department: string;
  practitioner: string;
  selectedDate: string;
  selectedSlot: string;
  patientName: string;
  patientLastName: string;
  patientId: string;
}

const DEPARTMENTS = [
  "Cardiologie",
  "Dermatologie",
  "Gastroentérologie",
  "Neurologie",
];

const PRACTITIONERS = [
  "Pas de Préference",
  "Dr. Martin",
  "Dr. Dubois",
  "Dr. Laurent",
];

const AVAILABILITY_DATES = [
  { short: "JUN 12", full: "Disponible" },
  { short: "MAR 13", full: "Disponible" },
  { short: "MAR 14", full: "Sélectionné" },
  { short: "JEU 15", full: "Disponible" },
  { short: "VEN 16", full: "Complet" },
  { short: "SAM 17", full: "Disponible" },
  { short: "DIM 18", full: "Disponible" },
];

const TIME_SLOTS = ["09:00 - 12:00", "12:00 - 16:00", "16:00 - 20:00"];

const HEALTH_ADVICE = {
  title: "AVIS DE SANTÉ",
  content:
    "\"Le minimalisme témoigne de l'excellence clinique d'une précision absolue\"",
  description:
    "Ce formulaire est une demande de rendez-vous de consultation uniquement. La planification finale sera confirmée par des communications sécurisées dans les 24 heures.",
  urgency:
    "En cas d'urgence vitale, veuillez contourner ce portail et vous rendre directement à notre aile d'intervention d'urgence ou contacter immédiatement les services d'urgence locaux.",
  location: {
    title: "EMPLACEMENT INSTITUTIONNEL",
    address: "Secteur 7G, Central Plaza\nLe Grand District",
  },
};

export default function AppointmentForm() {
  const [formData, setFormData] = useState<FormData>({
    department: "",
    practitioner: "",
    selectedDate: "MAR 14",
    selectedSlot: "",
    patientName: "",
    patientLastName: "",
    patientId: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [services, setServices] = useState<
    { id: string; type_de_service: string }[]
  >([]);
  const [selectedService, setSelectedService] = useState("");
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Fetch the username from your API when the component mounts
  useEffect(() => {
    async function fetchUsername() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          // Pre-fill the patient name with the username (if the field is still empty)
          setFormData((prev) => ({
            ...prev,
            patientName: data.username || "",
            patientLastName: data.firstName || "",
          }));
        }
        // If the response is not OK (e.g., 401 Unauthorized), we simply do nothing
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
      const { data, error } = await supabase.rpc("get_services");
      if (!error && data) {
        setServices(data);
      }
    };
    fetchServices();
  }, []);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.practitioner)
      newErrors.practitioner = "Practitioner is required";
    if (!formData.patientName) newErrors.patientName = "Saisie requise";
    if (!formData.patientId) newErrors.patientId = "Saisie requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNewAppointment = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("demande_de_consultation")
      .insert({
        id_patient: formData.patientId,
        nom_patient: formData.patientName,
        prenom_patient: formData.patientLastName,
        id_praticien: formData.practitioner,
        id_service: formData.department,
      });
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Handle form submission
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
              <p className="text-xl font-medium text-muted-foreground tracking-wide">
                Bienvenue, {formData.patientName} ! SERVICES AUX PATIENTS - 2024
                <Button className="ml-10 cursor-pointer" onClick={logout}>
                  Déconnecter-vous
                </Button>
              </p>
            )}
            <h1 className="text-5xl md:text-6xl italic font-light">
              Demander une
              <br />
              Consultation
            </h1>
            <Separator className="mt-6 h-0.5" />
          </div>

          {/* Form */}
          <form onSubmit={handleNewAppointment} className="space-y-8">
            {/* Department Selection */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-bold tracking-widest text-foreground">
                  SÉLECTIONNER LE DÉPARTEMENT
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger className="border-0 border-b rounded-none focus:ring-0">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-xs text-red-500">{errors.department}</p>
                )}
              </div>

              {/* Practitioner Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-bold tracking-widest text-foreground">
                  PRATICIEN PRÉFÉRÉ
                </Label>
                <Select
                  value={formData.practitioner}
                  onValueChange={(value) =>
                    setFormData({ ...formData, practitioner: value })
                  }
                >
                  <SelectTrigger className="border-0 border-b rounded-none focus:ring-0">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRACTITIONERS.map((prac) => (
                      <SelectItem key={prac} value={prac}>
                        {prac}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.practitioner && (
                  <p className="text-xs text-red-500">{errors.practitioner}</p>
                )}
              </div>
            </div>

            {/* Availability Section */}
            <div className="space-y-4">
              <Label className="text-xs font-bold tracking-widest text-foreground">
                DISPONIBILITÉS
              </Label>

              {/* Date Selection */}
              <div className="space-y-2">
                <ToggleGroup
                  type="single"
                  value={formData.selectedDate}
                  onValueChange={(value) => {
                    if (value)
                      setFormData({ ...formData, selectedDate: value });
                  }}
                  className="justify-start gap-2"
                >
                  {AVAILABILITY_DATES.map((date) => (
                    <ToggleGroupItem
                      key={date.short}
                      value={date.short}
                      className="border border-input rounded px-3 py-2 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      disabled={date.full === "Complet"}
                    >
                      <span className="block text-xs">{date.short}</span>
                      <span className="block text-xs font-light">
                        {date.full === "Sélectionné"
                          ? "Sélectionné"
                          : date.full}
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Time Slots */}
              <div className="space-y-3 pt-4">
                <Label className="text-xs font-medium text-muted-foreground tracking-widest">
                  TRANCHES HORAIRES
                </Label>
                <ToggleGroup
                  type="single"
                  value={formData.selectedSlot}
                  onValueChange={(value) => {
                    if (value)
                      setFormData({ ...formData, selectedSlot: value });
                  }}
                  className="justify-start gap-2"
                >
                  {TIME_SLOTS.map((slot) => (
                    <ToggleGroupItem
                      key={slot}
                      value={slot}
                      className="border border-input rounded px-4 py-2 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {slot}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-6">
              {/* Full Name - now pre-filled from API */}
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-widest text-foreground">
                  NOM COMPLET DU PATIENT
                </Label>
                <Input
                  type="text"
                  placeholder="Saisie requise"
                  className="border-0 border-b border-input rounded-none focus-visible:ring-0"
                  value={
                    formData.patientName && formData.patientLastName
                      ? `${formData.patientName} ${formData.patientLastName}`
                      : formData.patientName
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  disabled={isLoadingProfile} // Optionally disable while loading
                />
                {errors.patientName && (
                  <p className="text-xs text-red-500">{errors.patientName}</p>
                )}
              </div>

              {/* Patient ID */}
              <div className="space-y-2">
                <Label className="text-xs font-bold tracking-widest text-foreground">
                  ID PATIENT / NUMÉRO DE SÉCURITÉ SOCIALE
                </Label>
                <Input
                  type="text"
                  placeholder="Saisie requise"
                  className="border-0 border-b border-input rounded-none focus-visible:ring-0"
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                />
                {errors.patientId && (
                  <p className="text-xs text-red-500">{errors.patientId}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-6 text-lg font-semibold tracking-widest"
            >
              ENVOYER LA DEMANDE →
            </Button>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1 space-y-8">
        {/* Health Advice Card */}
        <Card className="bg-primary text-primary-foreground border-0">
          <CardHeader className="space-y-4">
            <CardTitle className="text-xs font-bold tracking-widest">
              {HEALTH_ADVICE.title}
            </CardTitle>
            <p className="text-sm italic font-light">{HEALTH_ADVICE.content}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs leading-relaxed">
              {HEALTH_ADVICE.description}
            </p>
            <p className="text-xs leading-relaxed">{HEALTH_ADVICE.urgency}</p>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card className="bg-white border border-input">
          <CardHeader>
            <CardTitle className="text-xs font-bold tracking-widest">
              {HEALTH_ADVICE.location.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted aspect-square rounded flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-sm font-medium">Map Preview</p>
              </div>
            </div>
            <div className="text-xs whitespace-pre-line font-light">
              {HEALTH_ADVICE.location.address}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
