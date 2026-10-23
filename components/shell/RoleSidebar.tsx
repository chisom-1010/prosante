"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  AddCircleIcon,
  CirclePasswordIcon,
  Logout01Icon,
  MedicalMaskIcon,
} from "@hugeicons/core-free-icons";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export type NavItem = { title: string; url: string; icon: IconSvgElement };

type Props = {
  /** Small caption under the logo, e.g. "Espace patient". */
  caption: string;
  nav: NavItem[];
  cta?: { label: string; href: string };
  user: { name: string; email: string };
};

/** Same look as the admin sidebar, driven by props so every role can reuse it. */
export function RoleSidebar({ caption, nav, cta, user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const logout = async () => {
    setLeaving(true);
    await createClient().auth.signOut();
    router.replace("/auth/login");
    router.refresh();
  };

  // The most specific match wins, so "/patients" isn't lit up on "/patients/new".
  const activeUrl = [...nav]
    .sort((a, b) => b.url.length - a.url.length)
    .find((n) => pathname === n.url || pathname.startsWith(n.url + "/"))?.url;

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-slate-200 bg-[#f8fafc]">
      <SidebarHeader className="border-b border-slate-200 px-6 py-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
            <HugeiconsIcon icon={MedicalMaskIcon} strokeWidth={2} className="h-7 w-7 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-none text-emerald-700">ProSanté</h2>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">{caption}</p>
          </div>
        </Link>

        {cta && (
          <Link
            href={cta.href}
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-700 px-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow-md"
          >
            <HugeiconsIcon icon={AddCircleIcon} strokeWidth={2} />
            {cta.label}
          </Link>
        )}
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <nav className="space-y-2">
          {nav.map((item) => {
            const isActive = item.url === activeUrl;
            return (
              <Link
                key={item.url}
                href={item.url}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex h-14 items-center gap-4 rounded-2xl px-4 transition-all duration-200 ${
                  isActive
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                }`}
              >
                {isActive && <div className="absolute right-0 top-3 h-8 w-1 rounded-l-full bg-emerald-700" />}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  <HugeiconsIcon icon={item.icon} strokeWidth={2} className="h-5 w-5" />
                </div>
                <span className={`text-[15px] font-medium ${isActive ? "font-semibold" : ""}`}>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="space-y-1 border-t border-slate-200 p-4">
        <Link
          href="/auth/change-password"
          className="flex h-12 items-center gap-4 rounded-2xl px-4 text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            <HugeiconsIcon icon={CirclePasswordIcon} strokeWidth={2} className="h-5 w-5" />
          </div>
          <span className="text-[15px] font-medium">Mot de passe</span>
        </Link>

        <button
          type="button"
          onClick={logout}
          disabled={leaving}
          className="flex h-12 w-full items-center gap-4 rounded-2xl px-4 text-slate-600 transition-all hover:bg-white hover:text-red-600 hover:shadow-sm disabled:opacity-60"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="h-5 w-5" />
          </div>
          <span className="text-[15px] font-medium">{leaving ? "Déconnexion..." : "Se déconnecter"}</span>
        </button>

        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <Avatar className="h-12 w-12 rounded-xl">
            <AvatarFallback className="rounded-xl bg-emerald-100 font-bold text-emerald-700">
              {(user.name || user.email).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name || "Mon compte"}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
