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

interface ReceptionistAccountEmailProps {
  ReceptionistName?: string;
  ReceptionistEmail?: string;
  password?: string;
  loginLink?: string;
}

export const ReceptionistAccountEmail = ({
  ReceptionistName,
  ReceptionistEmail,
  password,
  loginLink,
}: ReceptionistAccountEmailProps) => {
  const previewText = "Votre compte réceptionniste ProSanté a été créé";

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
              Bonjour {ReceptionistName},
            </Text>

            <Text className="text-[14px] text-black leading-[24px]">
              Votre compte réceptionniste a été créé par l&apos;administration de
              <strong> ProSanté</strong>.
            </Text>

            <Text className="text-[14px] text-black leading-[24px]">
              Vous pouvez maintenant vous connecter avec les informations
              suivantes :
            </Text>

            <Hr />

            <Text className="text-[14px]">
              <strong>Email :</strong> {ReceptionistEmail}
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

export default ReceptionistAccountEmail;