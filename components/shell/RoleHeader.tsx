"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export type PageTitle = { url: string; title: string; subtitle: string };

/** Same header as the admin one; the title follows the current page. */
export function RoleHeader({ titles }: { titles: PageTitle[] }) {
  const pathname = usePathname();
  const current =
    [...titles]
      .sort((a, b) => b.url.length - a.url.length)
      .find((t) => pathname === t.url || pathname.startsWith(t.url + "/")) ?? titles[0];

  return (
    <header className="sticky top-0 z-40 flex h-24 shrink-0 items-center border-b border-slate-200 bg-[#f8fafc]/95 backdrop-blur">
      <div className="flex w-full items-center gap-4 px-6 lg:px-10">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <SidebarTrigger className="cursor-pointer text-slate-700 hover:bg-transparent" />
        </div>
        <Separator orientation="vertical" className="hidden h-8 bg-slate-200 md:block" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{current.title}</h1>
          <p className="mt-1 hidden truncate text-sm text-slate-500 sm:block">{current.subtitle}</p>
        </div>
      </div>
    </header>
  );
}
