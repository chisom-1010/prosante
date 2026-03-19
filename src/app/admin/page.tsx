import AdminDashboard from "@/components/Dashboards/AdminDashboard";
import { requireAdmin } from "@/lib/auth/requireAdmin";


export const metadata = {
  title: "Admin Dashboard - ProSanté",
  description: "Admin dashboard for system management",
};

export default async function AdminPage() {
  await requireAdmin();
  
  return <AdminDashboard />;
}

