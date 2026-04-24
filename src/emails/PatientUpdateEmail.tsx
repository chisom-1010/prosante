// PatientUpdateAppointmentEmail.tsx

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface Props {
  patientName: string;
  doctorName?: string;
  date: string;
  time: string;
}

export const PatientUpdateAppointmentEmail = ({
  patientName,
  doctorName,
  date,
  time,
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>Mise à jour de votre rendez-vous</Preview>
      <Tailwind>
        <Body className="bg-gray-50 py-10">
          <Container className="max-w-[500px] bg-white p-6 rounded-lg">
            <Heading>Mise à jour du rendez-vous</Heading>

            <Text>Bonjour {patientName},</Text>

            <Text>
              Votre rendez-vous a été mis à jour par la réception.
            </Text>

            {doctorName && (
              <Text>
                <strong>Médecin :</strong> Dr. {doctorName}
              </Text>
            )}

            <Text>
              <strong>Date :</strong> {date}
            </Text>

            <Text>
              <strong>Heure :</strong> {time}
            </Text>

            <Text>Merci pour votre confiance.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};