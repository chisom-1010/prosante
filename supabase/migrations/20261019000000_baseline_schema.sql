-- =============================================================================
-- BASELINE: snapshot of the production ProSante database, taken 2026-10-19.
--
-- This reproduces the schema exactly as it was found, INCLUDING its problems
-- (see 20261019000100_security_hardening.sql and 20261019000200_data_integrity.sql
-- for the fixes). It exists so the database can be rebuilt from the repo, and so
-- later migrations have a known starting point.
--
-- DO NOT RUN THIS AGAINST PRODUCTION: it is already applied there. Mark it as
-- applied instead (see supabase/README.md).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.service_medical (
  type_de_service text not null,
  id uuid not null default gen_random_uuid(),
  constraint service_medical_pkey primary key (id),
  constraint service_medical_type_key unique (type_de_service)
);

create table public.profiles (
  id uuid not null default gen_random_uuid(),
  nom text,
  prenom text,
  email character varying not null,
  created_at timestamptz not null default now(),
  -- NOTE: this default is the literal string  'patient'::text  (quotes included),
  -- which violates users_role_check. Found as-is in production; fixed later.
  role text default '''patient''::text',
  auth_user_id uuid,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint unique_auth_user unique (auth_user_id),
  constraint users_role_check check (
    role = any (array['admin'::text, 'patient'::text, 'medécin'::text, 'receptioniste'::text])
  ),
  constraint profiles_auth_user_id_fkey foreign key (auth_user_id)
    references auth.users (id) on update cascade on delete cascade
);

create table public.doctors (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom character varying not null,
  prenom character varying not null,
  email character varying not null,
  service_id uuid not null default gen_random_uuid(),
  auth_user_id uuid,
  constraint doctors_pkey primary key (id),
  constraint doctors_auth_user_id_fkey foreign key (auth_user_id)
    references auth.users (id) on update cascade on delete cascade,
  constraint doctors_service_id_fkey foreign key (service_id)
    references public.service_medical (id) on update cascade on delete cascade
);

create table public.receptionists (
  id uuid not null default gen_random_uuid(),
  nom character varying not null,
  prenom character varying not null,
  email character varying not null,
  created_at timestamptz not null default now(),
  auth_user_id uuid not null,
  constraint receptionists_pkey primary key (id),
  constraint receptionists_email_key unique (email),
  constraint unique_receptionist_user unique (auth_user_id),
  constraint receptionists_auth_user_id_fkey foreign key (auth_user_id)
    references auth.users (id) on update cascade on delete cascade
);

create table public.demande_de_consultation (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  id_patient uuid not null default gen_random_uuid(),
  tranche_horaires text not null default ''::text,
  date_de_rendezvous date not null,
  id_service_medical uuid not null default gen_random_uuid(),
  sexe text not null,
  status text not null,
  doctor_id uuid,
  notes text,
  updated_at timestamp without time zone,
  age smallint not null,
  constraint demande_de_consultation_pkey primary key (id),
  constraint demande_de_consultation_age_check check (age > 0),
  constraint demande_de_consultation_sexe_check check (
    sexe = any (array['homme'::text, 'femme'::text])
  ),
  constraint demande_de_consultation_status_check check (
    status = any (array['en cours'::text, 'accepté'::text, 'reporté'::text,
                        'annulé'::text, 'fini'::text, 'en attente'::text])
  ),
  constraint demande_de_consultation_tranche_horaires_check check (
    tranche_horaires = any (array['08h00 - 09h00'::text, '09h00 - 10h00'::text,
                                  '10h00 - 11h00'::text, '11h00 - 12h00'::text,
                                  '14h00 - 15h00'::text, '15h00 - 16h00'::text,
                                  '16h00 - 17h00'::text])
  ),
  constraint demande_de_consultation_doctor_id_fkey foreign key (doctor_id)
    references public.doctors (id) on update cascade on delete cascade,
  constraint demande_de_consultation_id_patient_fkey foreign key (id_patient)
    references public.profiles (auth_user_id) on update cascade on delete set null,
  constraint demande_de_consultation_id_service_medical_fkey foreign key (id_service_medical)
    references public.service_medical (id) on update cascade on delete cascade
);

-- ---------------------------------------------------------------------------
-- Functions (bodies copied verbatim from production)
-- ---------------------------------------------------------------------------

create or replace function public.get_profile_role()
 returns text
 language sql
 stable security definer
as $function$SELECT role
  FROM profiles
  WHERE auth_user_id = auth.uid();$function$;

create or replace function public.get_user_role()
 returns text
 language sql
 stable
as $function$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role';
$function$;

create or replace function public.set_default_status()
 returns trigger
 language plpgsql
as $function$
BEGIN
  NEW.status := 'en attente';
  RETURN NEW;
END;
$function$;

create or replace function public.prevent_duplicate_service()
 returns trigger
 language plpgsql
as $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM service_medical
    WHERE lower(type_de_service) = lower(NEW.type_de_service)
  ) THEN
    RAISE EXCEPTION 'Service already exists';
  END IF;

  RETURN NEW;
END;
$function$;

create or replace function public.get_services()
 returns table(id uuid, type_de_service text)
 language sql
 security definer
as $function$
  SELECT id, type_de_service FROM service_medical ORDER BY type_de_service;
$function$;

create or replace function public.get_admin_stats()
 returns table(total_patients bigint, total_doctors bigint, total_receptionists bigint, total_services bigint, total_appointments bigint)
 language sql
 security definer
as $function$SELECT
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'patient'),
    (SELECT COUNT(*) FROM public.doctors),
    (SELECT COUNT(*) FROM public.receptionists),
    (SELECT COUNT(*) FROM public.service_medical),
    (SELECT COUNT(*) FROM public.demande_de_consultation);$function$;

create or replace function public.get_doctors()
 returns table(nom text, prenom text, email text, service text)
 language sql
 security definer
as $function$
  SELECT
    d.nom,
    d.prenom,
    d.email,
    s.type_de_service
  FROM doctors d
  JOIN service_medical s
  ON d.service_id = s.id;
$function$;

create or replace function public.get_doctors_dashboard()
 returns table(doctor_name text, doctor_email text, service text, appointments_count bigint)
 language sql
 security definer
as $function$
  SELECT
    d.prenom || ' ' || d.nom AS doctor_name,
    d.email,
    s.type_de_service AS service,
    COUNT(a.id) AS appointments_count
  FROM public.doctors d
  LEFT JOIN public.service_medical s
    ON d.service_id = s.id
  LEFT JOIN public.demande_de_consultation a
    ON a.doctor_id = d.id
  GROUP BY d.id, d.prenom, d.nom, d.email, s.type_de_service
  ORDER BY appointments_count DESC;
$function$;

create or replace function public.get_patients_dashboard()
 returns table(patient_name text, patient_email text, appointments_count bigint)
 language sql
 security definer
as $function$
  SELECT
    d.nom || ' ' || d.prenom AS patient_name,
    d.email AS patient_email,
    COUNT(a.id)::int AS appointments_count
  FROM public.profiles d
  LEFT JOIN public.demande_de_consultation a
    ON a.id_patient = d.id
  WHERE d.role = 'patient'
  GROUP BY d.id, d.prenom, d.nom, d.email
  ORDER BY appointments_count DESC;
$function$;

create or replace function public.get_receptionists_dashboard()
 returns table(receptionist_id uuid, receptionist_name text, receptionist_email text)
 language sql
 security definer
 set search_path to 'public'
as $function$
  SELECT
    r.id AS receptionist_id,
    r.nom || ' ' || r.prenom AS receptionist_name,
    r.email AS receptionist_email
  FROM public.receptionists r;
$function$;

create or replace function public.get_receptionist_dashboard()
 returns table(id uuid, patient_name text, date_de_rendezvous date, tranche_horaires text, status text, id_service_medical uuid, service text)
 language sql
 security definer
as $function$
  select
    d.id,
    p.nom || ' ' || p.prenom as patient_name,
    d.date_de_rendezvous,
    d.tranche_horaires,
    d.status,
    d.id_service_medical,
    s.type_de_service AS service
  from demande_de_consultation d
  join profiles p on p.auth_user_id = d.id_patient
  LEFT JOIN service_medical s ON d.id_service_medical = s.id
  order by d.date_de_rendezvous desc;
$function$;

create or replace function public.get_receptionist_profile()
 returns table(id uuid, nom text, prenom text, email text)
 language sql
 security definer
as $function$
  SELECT
    r.id,
    r.nom,
    r.prenom,
    r.email
  FROM public.receptionists r
  WHERE r.auth_user_id = auth.uid();
$function$;

create or replace function public.get_receptionist_stats()
 returns table(pending integer, cancelled integer, postponed integer, accepted integer, in_progress integer, done integer)
 language sql
 security definer
as $function$
  select
    count(*) filter (where status = 'en attente') as pending,
    count(*) filter (where status = 'annulé') as cancelled,
    count(*) filter (where status = 'reporte') as postponed,
    count(*) filter (where status = 'accepté') as accepted,
    count(*) filter (where status = 'en cours') as in_progress,
    count(*) filter (where status = 'fini') as done

  from demande_de_consultation;
$function$;

create or replace function public.get_doctor_dashboard()
 returns table(id uuid, status text, patient_name text, appointment_date text, tranche_horaires text)
 language sql
 security definer
as $function$
select
  d.id,
  d.status,
  p.prenom || ' ' || p.nom as patient_name,
  d.date_de_rendezvous,
  d.tranche_horaires
from demande_de_consultation d
left join doctors doc on doc.id = d.doctor_id
left join profiles p on p.auth_user_id = d.id_patient
where doc.auth_user_id = auth.uid();
$function$;

create or replace function public.get_doctor_stats()
 returns table(pending integer, accepted integer, postponed integer, cancelled integer, in_progress integer, done integer)
 language sql
 security definer
as $function$
SELECT
  COUNT(*) FILTER (WHERE d.status = 'en attente') AS pending,
  COUNT(*) FILTER (WHERE d.status = 'accepté') AS accepted,
  COUNT(*) FILTER (WHERE d.status = 'reporté') AS postponed,
  COUNT(*) FILTER (WHERE d.status = 'annulé') AS cancelled,
  COUNT(*) FILTER (WHERE d.status = 'en cours') AS in_progress,
  COUNT(*) FILTER (WHERE d.status = 'fini') AS done
FROM demande_de_consultation d
JOIN doctors doc ON doc.id = d.doctor_id
WHERE doc.auth_user_id = auth.uid();
$function$;

-- Found in production but unused by the app; its WHERE clause compares
-- doctor_id (a doctors.id) with auth.uid(), so it never matches anything.
create or replace function public.update_appointment_status(appointment_id uuid, new_status text)
 returns void
 language plpgsql
 security definer
as $function$
BEGIN
  UPDATE public.demande_de_consultation
  SET status = new_status
  WHERE id = appointment_id
  AND doctor_id = auth.uid();
END;
$function$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger default_appointment_status
  before insert on public.demande_de_consultation
  for each row execute function public.set_default_status();

-- ---------------------------------------------------------------------------
-- Table privileges (Supabase grants these to anon/authenticated by default;
-- written out here so the starting point is explicit)
-- ---------------------------------------------------------------------------

grant all on public.service_medical, public.profiles, public.doctors,
             public.receptionists, public.demande_de_consultation
  to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.service_medical enable row level security;
alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.receptionists enable row level security;
alter table public.demande_de_consultation enable row level security;

-- demande_de_consultation
create policy "Admin full access appointments" on public.demande_de_consultation
  as permissive for all to authenticated
  using (get_profile_role() = 'admin'::text)
  with check (get_profile_role() = 'admin'::text);

create policy "Receptionists full access" on public.demande_de_consultation
  as permissive for all to public
  using (exists (select 1 from receptionists where receptionists.auth_user_id = auth.uid()));

create policy "Patients can create consultation requests" on public.demande_de_consultation
  as permissive for insert to authenticated
  with check (get_profile_role() = 'patient'::text);

create policy "Patients create appointment" on public.demande_de_consultation
  as permissive for insert to public
  with check (auth.uid() = id_patient);

create policy "Doctor can view own appointments" on public.demande_de_consultation
  as permissive for select to public
  using (doctor_id in (select doctors.id from doctors where doctors.auth_user_id = auth.uid()));

create policy "Doctor can update own appointments" on public.demande_de_consultation
  as permissive for update to public
  using (doctor_id in (select doctors.id from doctors where doctors.auth_user_id = auth.uid()));

create policy "Doctor update status only" on public.demande_de_consultation
  as permissive for update to public
  using (doctor_id in (select doctors.id from doctors where doctors.auth_user_id = auth.uid()))
  with check (doctor_id in (select doctors.id from doctors where doctors.auth_user_id = auth.uid()));

-- !! lets ANY caller, including anonymous ones, update ANY appointment.
create policy "receptionist can update horaires" on public.demande_de_consultation
  as permissive for update to public
  using (true)
  with check (true);

create policy "receptionists can update appointments" on public.demande_de_consultation
  as permissive for update to public
  using (exists (select 1 from receptionists where receptionists.auth_user_id = auth.uid()));

-- doctors
create policy "Admin can insert doctors" on public.doctors
  as permissive for insert to authenticated
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'::text));

create policy "Admin can view doctors" on public.doctors
  as permissive for select to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'::text));

create policy "Doctor can view own record" on public.doctors
  as permissive for select to authenticated
  using (auth_user_id = auth.uid());

create policy "receptionist can view doctors" on public.doctors
  as permissive for select to authenticated
  using (exists (select 1 from receptionists r where r.auth_user_id = auth.uid()));

-- profiles
create policy "Admins full access" on public.profiles
  as permissive for all to public
  using (get_profile_role() = 'admin'::text);

-- !! lets a user rewrite their own row, including the `role` column.
create policy "Users own profile" on public.profiles
  as permissive for all to public
  using (auth.uid() = auth_user_id);

create policy "Users cannot delete profiles" on public.profiles
  as permissive for delete to public
  using (false);

-- !! lets any signed-in user create their own profile with role = 'admin'.
create policy "Users can insert their own profile" on public.profiles
  as permissive for insert to public
  with check (auth.uid() = auth_user_id);

create policy "Users can read own profile" on public.profiles
  as permissive for select to public
  using (auth.uid() = auth_user_id);

create policy "Users can view their own profile" on public.profiles
  as permissive for select to public
  using (auth.uid() = auth_user_id);

create policy "Users can update their own profile" on public.profiles
  as permissive for update to public
  using (auth.uid() = auth_user_id);

-- receptionists
create policy "Admin manage receptionists" on public.receptionists
  as permissive for all to authenticated
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'::text))
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'::text));

create policy "Receptionist can view own profile" on public.receptionists
  as permissive for select to authenticated
  using (auth_user_id = auth.uid());

create policy "Doctor update appointment status" on public.receptionists
  as permissive for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Receptionist can update own profile" on public.receptionists
  as permissive for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- service_medical
create policy "admin can insert services" on public.service_medical
  as permissive for insert to authenticated
  with check (get_profile_role() = 'admin'::text);

create policy "authenticated users can read services" on public.service_medical
  as permissive for select to authenticated
  using (true);

create policy "admin can UPDATE services" on public.service_medical
  as permissive for update to authenticated
  with check (get_profile_role() = 'admin'::text);
