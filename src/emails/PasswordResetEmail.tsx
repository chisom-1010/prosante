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

interface PasswordResetEmailProps {
  name?: string;
  resetLink?: string;
  /** "forgot": the person asked for it. "security": an administrator reset the account. */
  reason?: "forgot" | "security";
}

export const PasswordResetEmail = ({
  name,
  resetLink,
  reason = "forgot",
}: PasswordResetEmailProps) => {
  const previewText =
    reason === "security"
      ? "Choisissez un nouveau mot de passe pour votre compte ProSanté"
      : "Réinitialisation de votre mot de passe ProSanté";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>

      <Tailwind>
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="mx-auto max-w-[500px] bg-white border rounded-lg p-8">
            <Heading className="text-2xl font-bold text-center text-black">
              {reason === "security"
                ? "Choisissez un nouveau mot de passe"
                : "Réinitialisation du mot de passe"}
            </Heading>

            <Text className="text-[14px] text-black leading-[24px]">
              Bonjour{name ? ` ${name}` : ""},
            </Text>

            {reason === "security" ? (
              <Text className="text-[14px] text-black leading-[24px]">
                Pour des raisons de sécurité, le mot de passe de votre compte{" "}
                <strong>ProSanté</strong> a été réinitialisé par l&apos;administration.
                Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
              </Text>
            ) : (
              <Text className="text-[14px] text-black leading-[24px]">
                Nous avons reçu une demande de réinitialisation du mot de passe
                de votre compte <strong>ProSanté</strong>. Cliquez sur le bouton
                ci-dessous pour en choisir un nouveau.
              </Text>
            )}

            <div className="text-center my-6">
              <Button
                href={resetLink}
                className="bg-emerald-600 text-white px-6 py-3 rounded-md text-sm font-semibold"
              >
                Choisir un nouveau mot de passe
              </Button>
            </div>

            <Hr />

            <Text className="text-[13px] text-gray-600 leading-[22px]">
              Ce lien est valable une heure et ne peut être utilisé qu&apos;une
              seule fois. Si le bouton ne fonctionne pas, copiez cette adresse
              dans votre navigateur :
            </Text>
            <Text className="text-[12px] text-gray-500 break-all">
              {resetLink}
            </Text>

            <Text className="text-xs text-gray-500 text-center">
              Si vous n&apos;êtes pas à l&apos;origine de cette demande, vous
              pouvez ignorer cet email : votre mot de passe ne changera pas.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PasswordResetEmail;
