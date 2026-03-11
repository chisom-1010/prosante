import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const APPOINTMENT_STATS = [
  {
    label: 'RENDEZ-VOUS ACCEPTÉS',
    value: '24',
  },
  {
    label: 'RENDEZ-VOUS EN ATTENTE',
    value: '12',
  },
];

const APPOINTMENTS = [
  {
    id: 'A1',
    patient: 'Jean Dupont',
    time: '12 Mar 2026, 09:00',
    status: 'pending',
  },
  {
    id: 'A2',
    patient: 'Marie Curie',
    time: '12 Mar 2026, 10:30',
    status: 'pending',
  },
  {
    id: 'A3',
    patient: 'Louis Pasteur',
    time: '12 Mar 2026, 11:00',
    status: 'accepted',
  },
];

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-6 px-6 md:px-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-widest">TABLEAU MÉDECIN</h1>
          <nav className="hidden md:flex gap-8">
            <Button variant="ghost" size="sm" className="text-xs font-semibold tracking-widest">
              RENDEZ-VOUS
            </Button>
            <Button variant="ghost" size="sm" className="text-xs font-semibold tracking-widest text-muted-foreground">
              PATIENTS
            </Button>
            <Button variant="ghost" size="sm" className="text-xs font-semibold tracking-widest text-muted-foreground">
              PARAMÈTRES
            </Button>
          </nav>
        </div>
        <Separator className="bg-border" />
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {APPOINTMENT_STATS.map((stat, index) => (
            <div key={index} className="flex items-start gap-4 border-l border-border pl-6 py-2">
              <div>
                <p className="text-xs font-semibold tracking-widest text-muted-foreground mb-2">
                  {stat.label}
                </p>
                <p className="text-6xl font-light">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-widest">RENDEZ-VOUS DISPONIBLES</h2>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              TOUT VOIR
            </p>
          </div>
          <Separator className="mb-8 bg-border" />

          <div className="space-y-6">
            {APPOINTMENTS.filter(a => a.status === 'pending').map((appt) => (
              <Card key={appt.id} className="border-border">
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-sm font-semibold">{appt.patient}</p>
                    <p className="text-xs text-muted-foreground">{appt.time}</p>
                  </div>
                  <Button variant="default" size="sm" className="tracking-widest">
                    ACCEPTER
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Accepted Appointments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-widest">RENDEZ-VOUS ACCEPTÉS</h2>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground">
              TOUT VOIR
            </p>
          </div>
          <Separator className="mb-8 bg-border" />

          <div className="space-y-6">
            {APPOINTMENTS.filter(a => a.status === 'accepted').map((appt) => (
              <Card key={appt.id} className="border-border">
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-sm font-semibold">{appt.patient}</p>
                    <p className="text-xs text-muted-foreground">{appt.time}</p>
                  </div>
                  <Button variant="outline" size="sm" className="tracking-widest">
                    DÉTAILS
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 md:px-12 text-center text-xs text-muted-foreground tracking-wider">
        © 2024 PROSANTÉ. TOUS DROITS RÉSERVÉS.
      </footer>
    </div>
  );
}
