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

interface PatientAppointmentEmailProps {
  patientName?: string;
  doctorName?: string;
  date?: string;
  time?: string;
}

export const PatientAppointmentEmail = ({
  patientName,
  doctorName,
  date,
  time,
}: PatientAppointmentEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Votre rendez-vous est confirmé</Preview>

      <Tailwind>
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="mx-auto max-w-[500px] bg-white border rounded-lg p-8">
            <Heading className="text-2xl font-bold text-center">
              Rendez-vous confirmé
            </Heading>

            <Text>Bonjour {patientName},</Text>

            <Text>
              Votre rendez-vous a été confirmé et assigné au médecin suivant :
            </Text>

            <Hr />

            <Text>
              <strong>Médecin :</strong> Dr. {doctorName}
            </Text>
            <Text>
              <strong>Date :</strong> {date}
            </Text>
            <Text>
              <strong>Heure :</strong> {time}
            </Text>

            <Hr />

            <Text>
              Merci de vous présenter à l&apos;heure prévue.
            </Text>

            <div className="text-center my-6">
              <Button
                href="#"
                className="bg-emerald-600 text-white px-6 py-3 rounded-md text-sm font-semibold"
              >
                Voir mon rendez-vous
              </Button>
            </div>

            <Text className="text-xs text-gray-500 text-center">
              ProSanté - Votre santé, notre priorité
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PatientAppointmentEmail;