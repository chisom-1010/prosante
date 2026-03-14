import DoctorsList from '@/components/List/DoctorsList';

export const metadata = {
  title: 'Admin Dashboard - ProSanté',
  description: 'Admin dashboard for system management',
};

export default function AdminPage() {
  return <DoctorsList />;
}
