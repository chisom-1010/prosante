# Supabase database

The ProSanté database used to exist only in the Supabase dashboard. These files put it under version control.

| File | What it is | Safe to run on production? |
|---|---|---|
| `20261019000000_baseline_schema.sql` | Exact snapshot of production as found on 2026-10-19, flaws included | **No: already applied.** Mark it as applied (below). |
| `20261019000100_security_hardening.sql` | Closes the RLS / RPC holes from the audit | After testing on a scratch project |
| `20261019000200_data_integrity.sql` | Constraints, safer foreign keys, indexes, `updated_at` | After testing; independent of the file above |
| `20261019000300_appointment_rules.sql` | One patient per doctor per slot, allowed status transitions, doctor required once accepted, no past bookings | After the two above; mirrors `lib/appointments.ts` |

## What the audit found (2026-10-19)

1. **`profiles` could be edited by its owner, including `role`.** Any signed-in user could make themselves `admin`, which also defeats the role checks in the Next.js API routes (they read `profiles.role`).
2. **Anonymous callers could run `SECURITY DEFINER` RPCs.** `get_patients_dashboard`, `get_receptionist_dashboard`, `get_doctors`, `get_doctors_dashboard` and `get_receptionists_dashboard` returned patient names and e-mails, staff e-mails and every appointment to anyone holding the public anon key.
3. **`demande_de_consultation` had an `UPDATE ... USING (true)` policy for everyone.** A targeted update is blocked in practice because SELECT policies still apply, but an unfiltered `UPDATE` hits every row.
4. **Admin policies compared `profiles.id` with `auth.uid()`.** Those are different ids, so they never matched.
5. **`anon` and `authenticated` held every privilege on every table** (including `TRUNCATE`); RLS was the only barrier.
6. **Deleting a doctor cascaded to all of their appointments**, and deleting a service cascaded to doctors and appointments.
7. Smaller bugs: `profiles.role` default was the literal string `'patient'` with quotes; `get_receptionist_stats` counted `'reporte'` (no accent) so "postponed" was always 0; `get_patients_dashboard` joined on the wrong column so every patient showed 0 appointments; `update_appointment_status` could never match anything.

Dashboard-only settings (cannot be set from SQL): **leaked-password protection** (Auth → Passwords; may need a paid plan) and whether **public sign-up / e-mail confirmation** is enabled (Auth → Providers → Email). Patients should only be created through `/api/auth/signup`.

## How to apply safely

The migrations were tested against an in-memory Postgres with stubbed Supabase roles (61 checks: the holes are reproducible on the baseline, closed afterwards, and the patient / doctor / receptionist / admin flows still work). That is not the same as testing against your real app, so do this before touching production:

1. **Scratch project.** Create a second free Supabase project, apply all three files in order (SQL editor, or `supabase db push`), point a preview deploy at it, and click through: patient books → receptionist assigns and changes the time slot → doctor changes status → admin lists staff and adds a service.
2. **Back up production** (Dashboard → Database → Backups, or `supabase db dump`).
3. **Link and mark the baseline as applied** (it is already live):
   ```bash
   supabase init            # creates config.toml; leaves migrations/ alone
   supabase link --project-ref dfhiokalntekaqtxihal
   supabase migration repair --status applied 20261019000000
   ```
4. **Apply the security file first**, then the integrity file:
   ```bash
   supabase db push
   ```
5. **Re-run the security advisor** (Dashboard → Advisors) and confirm the `anon_security_definer_function_executable` warnings are gone.

## After the security migration, the browser can only

- **patient:** insert an appointment for themselves (unassigned)
- **doctor / receptionist:** update an appointment's `status` and `notes`
- **admin:** insert and update medical services
- **everyone signed in:** read their own profile / staff row and the list of services

Everything else (creating or deleting staff, assigning a doctor, changing a time slot, sign-up) goes through the API routes, which use the service role and check the caller's role first.

## Rolling back

Each migration runs in one transaction, so a failure leaves nothing half-applied. To undo a migration that did apply, restore the backup from step 2; the policies and functions it replaced are preserved verbatim in the baseline file.

## Known follow-ups (not in these migrations)

- Appointment status transitions are not enforced (a doctor can set any valid status).
- Double booking, invalid status changes and past bookings are now blocked by `20261019000300_appointment_rules.sql`.
- No audit trail of who changed what. Worth adding for medical data.
- Staff accounts cannot be deactivated, only deleted (and deleting a doctor with history is now refused). Add an `active` flag if clinics need to offboard doctors.
- `/patients/appointments` is redirected to after booking but the page does not exist yet.
