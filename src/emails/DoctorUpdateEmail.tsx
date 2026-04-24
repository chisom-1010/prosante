// DoctorUpdateAppointmentEmail.tsx

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
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
}

export const DoctorUpdateAppointmentEmail = ({
  doctorName,
  patientName,
  date,
  time,
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>Mise à jour d’un rendez-vous</Preview>
      <Tailwind>
        <Body className="bg-gray-50 py-10">
          <Container className="max-w-[500px] bg-white p-6 rounded-lg">
            <Heading>Rendez-vous modifié</Heading>

            <Text>Dr. {doctorName},</Text>

            <Text>
              Un rendez-vous vous concernant a été mis à jour.
            </Text>

            <Text>
              <strong>Patient :</strong> {patientName}
            </Text>

            <Text>
              <strong>Date :</strong> {date}
            </Text>

            <Text>
              <strong>Heure :</strong> {time}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};