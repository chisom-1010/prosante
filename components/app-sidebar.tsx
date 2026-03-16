"use client";

import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Menu01Icon,
  ChartHistogramIcon,
  Folder01Icon,
  CommandIcon,
} from "@hugeicons/core-free-icons";

const data = {
  user: {
    name: "Administrateur",
    email: "admin@email.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Tableau de Bord",
      url: "/admin",
      icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
    },
    {
      title: "Patients",
      url: "/admin/Management/patients",
      icon: <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />,
    },
    {
      title: "Médécin",
      url: "/admin/Management/doctors",
      icon: <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} />,
    },
    {
      title: "Réceptioniste",
      url: "/admin/Management/receptionists",
      icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/admin">
                <HugeiconsIcon
                  icon={CommandIcon}
                  strokeWidth={2}
                  className="size-5!"
                />
                <span className="text-base font-semibold">Prosanté</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
