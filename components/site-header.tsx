import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { HugeiconsIcon } from "@hugeicons/react";

import {
  Notification03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-24 shrink-0 items-center border-b border-slate-200 bg-[#f8fafc]/95 backdrop-blur">
      <div className="flex w-full items-center justify-between px-6 lg:px-10">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <SidebarTrigger className="text-slate-700 hover:bg-transparent cursor-pointer" />
          </div>

          <Separator
            orientation="vertical"
            className="hidden h-8 bg-slate-200 md:block"
          />

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Tableau de Bord
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Bienvenue dans l’interface d'administration ProSanté.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATIONS */}
          <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50">
            <HugeiconsIcon
              icon={Notification03Icon}
              strokeWidth={2}
              className="h-5 w-5 text-slate-700"
            />

            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-600" />
          </button>
        </div>
      </div>
    </header>
  );
}