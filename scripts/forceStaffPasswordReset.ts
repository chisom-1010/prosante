/**
 * Rotates the password of every doctor and receptionist.
 *
 * Why: staff accounts used to be created with the public default passwords
 * "MED-3014" / "RECEP-1014" (visible in this repo). Anyone could log in as them.
 *
 * What it does per account: sets a random password nobody knows, flags the
 * account as "must change password", and e-mails a one-time link so the person
 * can choose a new one.
 *
 * Usage (needs .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * RESEND_API_KEY, NEXT_PUBLIC_SITE_URL):
 *   bun scripts/forceStaffPasswordReset.ts              # dry run, changes nothing
 *   bun scripts/forceStaffPasswordReset.ts --apply      # do it and send e-mails
 *   bun scripts/forceStaffPasswordReset.ts --apply --no-email
 */
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

import { PasswordResetEmail } from "../src/emails/PasswordResetEmail";
import { generateTempPassword } from "../lib/api/password";
import { sendMail, siteUrl } from "../lib/api/mail";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const apply = process.argv.includes("--apply");
const sendEmails = !process.argv.includes("--no-email");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Staff = {
  auth_user_id: string | null;
  email: string;
  nom: string | null;
  prenom: string | null;
};

async function main() {
  console.log(apply ? "MODE: APPLY" : "MODE: dry run (add --apply to change anything)");

  const [doctors, receptionists] = await Promise.all([
    admin.from("doctors").select("auth_user_id, email, nom, prenom"),
    admin.from("receptionists").select("auth_user_id, email, nom, prenom"),
  ]);
  if (doctors.error) throw doctors.error;
  if (receptionists.error) throw receptionists.error;

  const staff: Staff[] = [...(doctors.data ?? []), ...(receptionists.data ?? [])];
  console.log(`${staff.length} staff account(s) found.\n`);

  let done = 0;
  let failed = 0;

  for (const person of staff) {
    if (!person.auth_user_id) {
      console.log(`- ${person.email}: no auth user, skipped`);
      continue;
    }
    if (!apply) {
      console.log(`- ${person.email}: would reset`);
      continue;
    }

    try {
      const { error } = await admin.auth.admin.updateUserById(person.auth_user_id, {
        password: generateTempPassword(20),
        app_metadata: { must_change_password: true },
        user_metadata: { must_change_password: true },
      });
      if (error) throw error;

      let mailed = "e-mail skipped";
      if (sendEmails) {
        const { data, error: linkError } = await admin.auth.admin.generateLink({
          type: "recovery",
          email: person.email,
        });
        if (linkError || !data.properties?.hashed_token) {
          throw linkError ?? new Error("no recovery token");
        }
        const resetLink = `${siteUrl()}/auth/reset-password?token_hash=${encodeURIComponent(
          data.properties.hashed_token,
        )}`;
        const ok = await sendMail({
          to: person.email,
          subject: "Action requise : choisissez un nouveau mot de passe",
          react: PasswordResetEmail({
            name: person.prenom ?? undefined,
            resetLink,
            reason: "security",
          }),
        });
        mailed = ok ? "e-mailed" : "E-MAIL FAILED (use 'Mot de passe oublié')";
      }

      done++;
      console.log(`- ${person.email}: reset, ${mailed}`);
    } catch (err) {
      failed++;
      console.error(`- ${person.email}: FAILED`, err instanceof Error ? err.message : err);
    }
  }

  if (apply) console.log(`\nDone: ${done} reset, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
