import { NextResponse } from "next/server";
import { z } from "zod";
import DoctorAccountEmail from "@/emails/DoctorAccountEmail";
import { requireRole } from "@/lib/api/auth";
import { apiError, parseBody, route } from "@/lib/api/http";
import { sendMail, siteUrl } from "@/lib/api/mail";
import { generateTempPassword } from "@/lib/api/password";
import { createStaffAccount, removeStaffAccount } from "@/lib/api/staff";

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  nom: z.string().trim().min(1).max(100),
  prenom: z.string().trim().min(1).max(100),
  service_id: z.union([z.string().min(1), z.number()]),
});

export const POST = route(async (req) => {
  const auth = await requireRole("admin");
  if (!auth.ok) return auth.response;

  const body = await parseBody(req, schema);
  if (!body.ok) return body.response;
  const { email, nom, prenom, service_id } = body.data;

  const password = generateTempPassword();

  const created = await createStaffAccount({
    table: "doctors",
    email,
    password,
    row: { nom, prenom, service_id },
  });
  if (!created.ok) return apiError(created.error, created.status);

  // The temporary password only ever exists in this request and in the email.
  const sent = await sendMail({
    to: email,
    subject: "Votre compte médecin ProSanté",
    react: DoctorAccountEmail({
      doctorName: nom,
      doctorEmail: email,
      password,
      loginLink: `${siteUrl()}/auth/login`,
    }),
  });

  if (!sent) {
    // Nobody knows the password, so keep the system consistent: undo and retry.
    await removeStaffAccount("doctors", created.userId);
    return apiError(
      "Le compte a été annulé car l'email d'invitation n'a pas pu être envoyé. Réessayez.",
      502,
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
});
