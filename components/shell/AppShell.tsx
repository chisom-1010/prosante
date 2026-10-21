import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RoleHeader, type PageTitle } from "@/components/shell/RoleHeader";
import { RoleSidebar, type NavItem } from "@/components/shell/RoleSidebar";

type Props = {
  caption: string;
  nav: NavItem[];
  titles: PageTitle[];
  cta?: { label: string; href: string };
  user: { name: string; email: string };
  children: React.ReactNode;
};

/**
 * Dashboard frame shared by patient, doctor and receptionist spaces.
 * It does not render <html>/<body>: the root layout already does.
 */
export function AppShell({ children, titles, ...sidebar }: Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <RoleSidebar {...sidebar} />
      <SidebarInset className="bg-[#f8fafc]">
        <RoleHeader titles={titles} />
        <TooltipProvider>
          <main className="flex flex-1 flex-col p-4 md:p-6 lg:px-10">{children}</main>
        </TooltipProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
