import type { Metadata } from "next";

import { AppShell } from "@/components/shell/AppShell";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { requireReceptionist } from "@/lib/auth/requireReceptionist";
import { getDisplayUser } from "@/lib/auth/displayUser";

export const metadata: Metadata = {
  title: "ProSanté",
  description: "Gestion des rendez-vous ProSanté",
};

const nav = [{ title: "Rendez-vous", url: "/receptionists", icon: Calendar01Icon }];

const titles = [
  {
    url: "/receptionists",
    title: "Gestion des rendez-vous",
    subtitle: "Suivez et gérez les rendez-vous de la clinique.",
  },
];

export default async function ReceptionistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireReceptionist();
  const user = await getDisplayUser("receptionists");

  return (
    <AppShell caption="Espace réception" nav={nav} titles={titles} user={user}>
      {children}
    </AppShell>
  );
}
