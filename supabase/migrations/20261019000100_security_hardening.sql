-- =============================================================================
-- SECURITY HARDENING (proposed - NOT yet applied to production)
--
-- Closes the holes found in the 2026-10-19 audit:
--   1. Anyone, even signed-out, could UPDATE any appointment
--      (policy "receptionist can update horaires": USING true, TO public).
--   2. Any signed-in user could set their own profiles.role = 'admin'
--      (UPDATE/INSERT policies on profiles with no column restriction), which
--      also defeats the role checks in the Next.js API routes.
--   3. SECURITY DEFINER RPCs callable by anonymous visitors returned patient
--      names and e-mails, doctor/receptionist e-mails and every appointment
--      (get_patients_dashboard, get_receptionist_dashboard, get_doctors, ...).
--   4. Wrong-column admin policies (profiles.id = auth.uid()) that never match.
--   5. anon/authenticated held every table privilege (incl. TRUNCATE).
--
-- Browser writes still supported after this migration (everything else goes
-- through the server routes, which use the service role):
--   * patient  : INSERT own appointment
--   * doctor / receptionist : UPDATE appointment status (and notes)
--   * admin    : INSERT / UPDATE medical services
--
-- Apply to a scratch project first - see supabase/README.md.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Role helpers. SECURITY DEFINER so they can read profiles/doctors/
--    receptionists without recursing into those tables' own RLS.
--    search_path is pinned and every reference is schema-qualified.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
 returns boolean
 language sql
 stable security definer
 set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.auth_user_id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function public.is_receptionist()
 returns boolean
 language sql
 stable security definer
 set search_path = ''
as $$
  select exists (
    select 1 from public.receptionists r
    where r.auth_user_id = (select auth.uid())
  );
$$;

create or replace function public.current_doctor_id()
 returns uuid
 language sql
 stable security definer
 set search_path = ''
as $$
  select d.id from public.doctors d
  where d.auth_user_id = (select auth.uid())
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- 2. Replace every policy. Nothing is granted to anonymous visitors.
-- ---------------------------------------------------------------------------

-- profiles: a user may READ their own row; only an admin may read all rows.
-- There is deliberately NO insert/update/delete policy for ordinary users:
-- profiles are written by the server (service role) only, so the role column
-- can no longer be self-edited.
drop policy if exists "Admins full access" on public.profiles;
drop policy if exists "Users own profile" on public.profiles;
drop policy if exists "Users cannot delete profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth_user_id = (select auth.uid()));

create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (public.is_admin());

-- demande_de_consultation
drop policy if exists "Admin full access appointments" on public.demande_de_consultation;
drop policy if exists "Receptionists full access" on public.demande_de_consultation;
drop policy if exists "Patients can create consultation requests" on public.demande_de_consultation;
drop policy if exists "Patients create appointment" on public.demande_de_consultation;
drop policy if exists "Doctor can view own appointments" on public.demande_de_consultation;
drop policy if exists "Doctor can update own appointments" on public.demande_de_consultation;
drop policy if exists "Doctor update status only" on public.demande_de_consultation;
drop policy if exists "receptionist can update horaires" on public.demande_de_consultation;
drop policy if exists "receptionists can update appointments" on public.demande_de_consultation;

create policy appts_admin_select on public.demande_de_consultation
  for select to authenticated
  using (public.is_admin());

create policy appts_receptionist_select on public.demande_de_consultation
  for select to authenticated
  using (public.is_receptionist());

create policy appts_receptionist_update on public.demande_de_consultation
  for update to authenticated
  using (public.is_receptionist())
  with check (public.is_receptionist());

create policy appts_doctor_select on public.demande_de_consultation
  for select to authenticated
  using (doctor_id = public.current_doctor_id());

create policy appts_doctor_update on public.demande_de_consultation
  for update to authenticated
  using (doctor_id = public.current_doctor_id())
  with check (doctor_id = public.current_doctor_id());

-- A patient can create a request for themselves only, unassigned (the
-- set_default_status trigger already forces status = 'en attente').
create policy appts_patient_insert on public.demande_de_consultation
  for insert to authenticated
  with check (
    id_patient = (select auth.uid())
    and doctor_id is null
    and public.get_profile_role() = 'patient'
  );

create policy appts_patient_select on public.demande_de_consultation
  for select to authenticated
  using (id_patient = (select auth.uid()));

-- doctors / receptionists: read-only from the browser. Creating and deleting
-- staff goes through the admin-only API routes (service role).
drop policy if exists "Admin can insert doctors" on public.doctors;
drop policy if exists "Admin can view doctors" on public.doctors;
drop policy if exists "Doctor can view own record" on public.doctors;
drop policy if exists "receptionist can view doctors" on public.doctors;

create policy doctors_select_own on public.doctors
  for select to authenticated
  using (auth_user_id = (select auth.uid()));

create policy doctors_select_staff on public.doctors
  for select to authenticated
  using (public.is_admin() or public.is_receptionist());

drop policy if exists "Admin manage receptionists" on public.receptionists;
drop policy if exists "Receptionist can view own profile" on public.receptionists;
drop policy if exists "Doctor update appointment status" on public.receptionists;
drop policy if exists "Receptionist can update own profile" on public.receptionists;

create policy receptionists_select_own on public.receptionists
  for select to authenticated
  using (auth_user_id = (select auth.uid()));

create policy receptionists_select_admin on public.receptionists
  for select to authenticated
  using (public.is_admin());

-- service_medical: everyone signed in can read; only admins can add/edit.
drop policy if exists "admin can insert services" on public.service_medical;
drop policy if exists "authenticated users can read services" on public.service_medical;
drop policy if exists "admin can UPDATE services" on public.service_medical;

create policy services_select on public.service_medical
  for select to authenticated
  using (true);

create policy services_admin_insert on public.service_medical
  for insert to authenticated
  with check (public.is_admin());

create policy services_admin_update on public.service_medical
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Table privileges: least privilege. RLS is no longer the only barrier.
--    (service_role is unaffected and is what the server routes use.)
-- ---------------------------------------------------------------------------

revoke all on public.service_medical, public.profiles, public.doctors,
              public.receptionists, public.demande_de_consultation
  from anon;

revoke all on public.service_medical, public.profiles, public.doctors,
              public.receptionists, public.demande_de_consultation
  from authenticated;

grant select on public.profiles, public.doctors, public.receptionists to authenticated;
grant select, insert, update on public.service_medical to authenticated;
grant select, insert on public.demande_de_consultation to authenticated;
-- Browser updates are limited to these columns. Reassigning a doctor, moving
-- the date/time or touching the patient is done server-side only.
grant update (status, notes, updated_at) on public.demande_de_consultation to authenticated;

-- ---------------------------------------------------------------------------
-- 4. RPC functions: role checks inside, qualified names, pinned search_path.
--    A caller without the right role now gets zero rows instead of the data.
-- ---------------------------------------------------------------------------

create or replace function public.get_profile_role()
 returns text
 language sql
 stable security definer
 set search_path = ''
as $$
  select role from public.profiles where auth_user_id = (select auth.uid());
$$;

create or replace function public.get_services()
 returns table(id uuid, type_de_service text)
 language sql
 stable security definer
 set search_path = ''
as $$
  select s.id, s.type_de_service from public.service_medical s order by s.type_de_service;
$$;

create or replace function public.get_admin_stats()
 returns table(total_patients bigint, total_doctors bigint, total_receptionists bigint, total_services bigint, total_appointments bigint)
 language sql
 stable security definer
 set search_path = ''
as $$
  select
    (select count(*) from public.profiles where role = 'patient'),
    (select count(*) from public.doctors),
    (select count(*) from public.receptionists),
    (select count(*) from public.service_medical),
    (select count(*) from public.demande_de_consultation)
  where public.is_admin();
$$;

create or replace function public.get_doctors()
 returns table(nom text, prenom text, email text, service text)
 language sql
 stable security definer
 set search_path = ''
as $$
  select d.nom, d.prenom, d.email, s.type_de_service
  from public.doctors d
  join public.service_medical s on d.service_id = s.id
  where public.is_admin() or public.is_receptionist();
$$;

create or replace function public.get_doctors_dashboard()
 returns table(doctor_name text, doctor_email text, service text, appointments_count bigint)
 language sql
 stable security definer
 set search_path = ''
as $$
  select
    d.prenom || ' ' || d.nom as doctor_name,
    d.email,
    s.type_de_service as service,
    count(a.id) as appointments_count
  from public.doctors d
  left join public.service_medical s on d.service_id = s.id
  left join public.demande_de_consultation a on a.doctor_id = d.id
  where public.is_admin()
  group by d.id, d.prenom, d.nom, d.email, s.type_de_service
  order by appointments_count desc;
$$;

-- Also fixes a join bug: appointments.id_patient references profiles.auth_user_id,
-- but the old body joined it to profiles.id, so every patient showed 0 appointments.
create or replace function public.get_patients_dashboard()
 returns table(patient_name text, patient_email text, appointments_count bigint)
 language sql
 stable security definer
 set search_path = ''
as $$
  select
    d.nom || ' ' || d.prenom as patient_name,
    d.email as patient_email,
    count(a.id)::int as appointments_count
  from public.profiles d
  left join public.demande_de_consultation a on a.id_patient = d.auth_user_id
  where d.role = 'patient' and public.is_admin()
  group by d.id, d.prenom, d.nom, d.email
  order by appointments_count desc;
$$;

create or replace function public.get_receptionists_dashboard()
 returns table(receptionist_id uuid, receptionist_name text, receptionist_email text)
 language sql
 stable security definer
 set search_path = ''
as $$
  select r.id as receptionist_id, r.nom || ' ' || r.prenom as receptionist_name, r.email as receptionist_email
  from public.receptionists r
  where public.is_admin();
$$;

create or replace function public.get_receptionist_dashboard()
 returns table(id uuid, patient_name text, date_de_rendezvous date, tranche_horaires text, status text, id_service_medical uuid, service text)
 language sql
 stable security definer
 set search_path = ''
as $$
  select
    d.id,
    p.nom || ' ' || p.prenom as patient_name,
    d.date_de_rendezvous,
    d.tranche_horaires,
    d.status,
    d.id_service_medical,
    s.type_de_service as service
  from public.demande_de_consultation d
  join public.profiles p on p.auth_user_id = d.id_patient
  left join public.service_medical s on d.id_service_medical = s.id
  where public.is_receptionist() or public.is_admin()
  order by d.date_de_rendezvous desc;
$$;

create or replace function public.get_receptionist_profile()
 returns table(id uuid, nom text, prenom text, email text)
 language sql
 stable security definer
 set search_path = ''
as $$
  select r.id, r.nom, r.prenom, r.email
  from public.receptionists r
  where r.auth_user_id = (select auth.uid());
$$;

-- Also fixes a typo: the old body counted status 'reporte' (no accent), which
-- never exists, so "postponed" was always 0.
create or replace function public.get_receptionist_stats()
 returns table(pending integer, cancelled integer, postponed integer, accepted integer, in_progress integer, done integer)
 language sql
 stable security definer
 set search_path = ''
as $$
  select
    count(*) filter (where status = 'en attente')::int as pending,
    count(*) filter (where status = 'annulé')::int as cancelled,
    count(*) filter (where status = 'reporté')::int as postponed,
    count(*) filter (where status = 'accepté')::int as accepted,
    count(*) filter (where status = 'en cours')::int as in_progress,
    count(*) filter (where status = 'fini')::int as done
  from public.demande_de_consultation
  -- HAVING (not WHERE): an aggregate without GROUP BY always yields one row, so a
  -- WHERE would hand unauthorized callers a row of zeros; HAVING yields no row.
  having public.is_receptionist() or public.is_admin();
$$;

create or replace function public.get_doctor_dashboard()
 returns table(id uuid, status text, patient_name text, appointment_date text, tranche_horaires text)
 language sql
 stable security definer
 set search_path = ''
as $$
  select
    d.id,
    d.status,
    p.prenom || ' ' || p.nom as patient_name,
    d.date_de_rendezvous,
    d.tranche_horaires
  from public.demande_de_consultation d
  left join public.doctors doc on doc.id = d.doctor_id
  left join public.profiles p on p.auth_user_id = d.id_patient
  where doc.auth_user_id = (select auth.uid());
$$;

create or replace function public.get_doctor_stats()
 returns table(pending integer, accepted integer, postponed integer, cancelled integer, in_progress integer, done integer)
 language sql
 stable security definer
 set search_path = ''
as $$
  select
    count(*) filter (where d.status = 'en attente')::int as pending,
    count(*) filter (where d.status = 'accepté')::int as accepted,
    count(*) filter (where d.status = 'reporté')::int as postponed,
    count(*) filter (where d.status = 'annulé')::int as cancelled,
    count(*) filter (where d.status = 'en cours')::int as in_progress,
    count(*) filter (where d.status = 'fini')::int as done
  from public.demande_de_consultation d
  join public.doctors doc on doc.id = d.doctor_id
  where doc.auth_user_id = (select auth.uid());
$$;

create or replace function public.prevent_duplicate_service()
 returns trigger
 language plpgsql
 set search_path = ''
as $$
begin
  if exists (
    select 1 from public.service_medical
    where lower(type_de_service) = lower(new.type_de_service)
  ) then
    raise exception 'Service already exists';
  end if;
  return new;
end;
$$;

alter function public.get_user_role() set search_path = '';
alter function public.set_default_status() set search_path = '';

-- Unused, and its WHERE clause (doctor_id = auth.uid()) can never match. The app
-- updates statuses directly under RLS, so remove the dead SECURITY DEFINER door.
drop function if exists public.update_appointment_status(uuid, text);

-- ---------------------------------------------------------------------------
-- 5. Function execute rights: nobody anonymous, signed-in users only.
--    (RLS policies call is_admin() etc. as the querying user, so authenticated
--    must keep EXECUTE on them.)
-- ---------------------------------------------------------------------------

revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;

-- New functions/tables created by this role from now on are not exposed to anon.
alter default privileges in schema public revoke execute on functions from public, anon;
alter default privileges in schema public revoke all on tables from anon;

commit;
