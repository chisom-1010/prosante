import type { Metadata } from "next";

import { AppShell } from "@/components/shell/AppShell";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { requireDoctor } from "@/lib/auth/requireDoctor";
import { getDisplayUser } from "@/lib/auth/displayUser";

export const metadata: Metadata = {
  title: "ProSanté",
  description: "Gestion des rendez-vous ProSanté",
};

const nav = [{ title: "Rendez-vous", url: "/doctors", icon: Calendar01Icon }];

const titles = [
  {
    url: "/doctors",
    title: "Gestion des rendez-vous",
    subtitle: "Suivez et gérez les rendez-vous de la clinique.",
  },
];

export default async function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireDoctor();
  const user = await getDisplayUser("doctors");

  return (
    <AppShell caption="Espace médecin" nav={nav} titles={titles} user={user}>
      {children}
    </AppShell>
  );
}
