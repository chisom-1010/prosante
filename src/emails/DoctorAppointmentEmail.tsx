import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface DoctorAppointmentEmailProps {
  doctorName?: string;
  patientName?: string;
  date?: string;
  time?: string;
}

export const DoctorAppointmentEmail = ({
  doctorName,
  patientName,
  date,
  time,
}: DoctorAppointmentEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Nouveau patient assigné</Preview>

      <Tailwind>
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="mx-auto max-w-[500px] bg-white border rounded-lg p-8">
            <Heading className="text-2xl font-bold text-center">
              Nouveau rendez-vous
            </Heading>

            <Text>Bonjour Dr. {doctorName},</Text>

            <Text>
              Un nouveau patient vous a été assigné.
            </Text>

            <Hr />

            <Text>
              <strong>Patient :</strong> {patientName}
            </Text>
            <Text>
              <strong>Date :</strong> {date}
            </Text>
            <Text>
              <strong>Heure :</strong> {time}
            </Text>

            <Hr />

            <Text>
              Veuillez consulter votre tableau de bord pour plus de détails.
            </Text>

            <div className="text-center my-6">
              <Button
                href="#"
                className="bg-emerald-600 text-white px-6 py-3 rounded-md text-sm font-semibold"
              >
                Voir le rendez-vous
              </Button>
            </div>

            <Text className="text-xs text-gray-500 text-center">
              ProSanté - Système médical
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DoctorAppointmentEmail