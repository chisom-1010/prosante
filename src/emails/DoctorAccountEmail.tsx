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

interface DoctorAccountEmailProps {
  doctorName?: string;
  doctorEmail?: string;
  password?: string;
  loginLink?: string;
}

export const DoctorAccountEmail = ({
  doctorName,
  doctorEmail,
  password,
  loginLink,
}: DoctorAccountEmailProps) => {
  const previewText = "Votre compte médecin ProSanté a été créé";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Tailwind>
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="mx-auto max-w-[500px] bg-white border rounded-lg p-8">

            <Heading className="text-2xl font-bold text-center text-black">
              Bienvenue sur ProSanté
            </Heading>

            <Text className="text-[14px] text-black leading-[24px]">
              Bonjour Dr. {doctorName},
            </Text>

            <Text className="text-[14px] text-black leading-[24px]">
              Votre compte médecin a été créé par l&apos;administration de
              <strong> ProSanté</strong>.
            </Text>

            <Text className="text-[14px] text-black leading-[24px]">
              Vous pouvez maintenant vous connecter avec les informations
              suivantes :
            </Text>

            <Hr />

            <Text className="text-[14px]">
              <strong>Email :</strong> {doctorEmail}
            </Text>

            <Text className="text-[14px]">
              <strong>Mot de passe temporaire :</strong> {password}
            </Text>

            <Hr />

            <Text className="text-[14px]">
              Nous vous recommandons de changer votre mot de passe après votre
              première connexion.
            </Text>

            <div className="text-center my-6">
              <Button
                href={loginLink}
                className="bg-emerald-600 text-white px-6 py-3 rounded-md text-sm font-semibold"
              >
                Se connecter à ProSanté
              </Button>
            </div>

            <Text className="text-xs text-gray-500 text-center">
              Si vous n&apos;attendiez pas cet email, vous pouvez l&apos;ignorer.
            </Text>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default DoctorAccountEmail;