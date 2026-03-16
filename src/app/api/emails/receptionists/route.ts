import ReceptionistAccountEmail from "@/emails/ReceptionistAccountEmail";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await resend.emails.send({
      from: "ProSanté <contact@prosantes.site>",
      to: [body.email],
      subject: "Votre compte réceptionniste ProSanté",
      react: ReceptionistAccountEmail({
        ReceptionistName: body.nom,
        ReceptionistEmail: body.email,
        password: "RECEP-1014",
        loginLink: "https://prosantes.site/auth/login",
      }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
