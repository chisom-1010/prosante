// SIDEBAR
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { HugeiconsIcon } from "@hugeicons/react";

import {
  DashboardSquare01Icon,
  Menu01Icon,
  ChartHistogramIcon,
  Folder01Icon,
  MedicalMaskIcon,
  AddCircleIcon,
  HelpCircleIcon,
  Doctor01Icon,
  OfficeChairIcon,
  Setting06Icon,
  MoneyBag02Icon,
} from "@hugeicons/core-free-icons";

const data = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/admin",
      icon: DashboardSquare01Icon,
    },
    {
      title: "Patients",
      url: "/admin/Management/patients",
      icon: Menu01Icon,
    },
    {
      title: "Médecin",
      url: "/admin/Management/doctors",
      icon: Doctor01Icon,
    },
    {
      title: "Réceptionistes",
      url: "/admin/Management/receptionists",
      icon: OfficeChairIcon,
    },
  ],
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-slate-200 bg-[#f8fafc]"
      {...props}
    >
      {/* HEADER */}
      <SidebarHeader className="border-b border-slate-200 px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
            <HugeiconsIcon
              icon={MedicalMaskIcon}
              strokeWidth={2}
              className="h-7 w-7 text-emerald-700"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold leading-none text-emerald-700">
              ProSanté
            </h2>

            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Gestion Hospitalière
            </p>
          </div>
        </div>
        <Link href="/admin/quick_create">
        <button className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-700 cursor-pointer px-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow-md">
          <HugeiconsIcon icon={AddCircleIcon} strokeWidth={2} />
          Nouvel Admission
        </button>
          </Link>
      </SidebarHeader>

      {/* NAVIGATION */}
      <SidebarContent className="px-4 py-6">
        <div className="space-y-2">
          {data.navMain.map((item) => {
            const isActive = pathname === item.url;

            return (
              <Link
                key={item.title}
                href={item.url}
                className={`group relative flex h-14 items-center gap-4 rounded-2xl px-4 transition-all duration-200 ${
                  isActive
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                }`}
              >
                {/* ACTIVE INDICATOR */}
                {isActive && (
                  <div className="absolute right-0 top-3 h-8 w-1 rounded-l-full bg-emerald-700" />
                )}

                {/* ICON */}
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    strokeWidth={2}
                    className="h-5 w-5"
                  />
                </div>

                {/* TEXT */}
                <span
                  className={`text-[15px] font-medium ${
                    isActive ? "font-semibold" : ""
                  }`}
                >
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="border-t border-slate-200 p-4">
        <button className="mb-4 flex h-14 w-full items-center gap-4 rounded-2xl px-4 text-slate-600 transition-all hover:bg-white hover:text-slate-900 hover:shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <HugeiconsIcon
              icon={HelpCircleIcon}
              strokeWidth={2}
              className="h-5 w-5"
            />
          </div>

          <span className="text-[15px] font-medium">Support</span>
        </button>

        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}