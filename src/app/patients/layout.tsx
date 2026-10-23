import type { Metadata } from "next";
import {
  Calendar01Icon,
  DashboardSquare01Icon,
  AddCircleIcon,
} from "@hugeicons/core-free-icons";

import { AppShell } from "@/components/shell/AppShell";
import { getDisplayUser } from "@/lib/auth/displayUser";
import { requirePatient } from "@/lib/auth/requirePatient";

export const metadata: Metadata = {
  title: "Espace patient - ProSanté",
  description: "Suivez et demandez vos consultations.",
};

const nav = [
  { title: "Tableau de bord", url: "/patients", icon: DashboardSquare01Icon },
  { title: "Mes rendez-vous", url: "/patients/appointments", icon: Calendar01Icon },
  { title: "Nouvelle demande", url: "/patients/new", icon: AddCircleIcon },
];

const titles = [
  { url: "/patients", title: "Tableau de bord", subtitle: "Vos rendez-vous et demandes en un coup d'œil." },
  { url: "/patients/appointments", title: "Mes rendez-vous", subtitle: "L'historique et le suivi de toutes vos demandes." },
  { url: "/patients/new", title: "Nouvelle demande", subtitle: "Choisissez un service, une date et un créneau." },
];

export default async function PatientsLayout({ children }: { children: React.ReactNode }) {
  await requirePatient();
  const user = await getDisplayUser("profiles");

  return (
    <AppShell
      caption="Espace patient"
      nav={nav}
      titles={titles}
      cta={{ label: "Nouvelle demande", href: "/patients/new" }}
      user={user}
    >
      {children}
    </AppShell>
  );
}
