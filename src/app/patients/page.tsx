import AppointmentForm from '@/components/Forms/AppointmentForm';

export const metadata = {
  title: 'Appointment Request - ProSanté',
  description: 'Request a consultation with our healthcare professionals',
};

export default function PatientsPage() {
  return (
    <main className="min-h-screen bg-white">
      <AppointmentForm />
    </main>
  );
}
