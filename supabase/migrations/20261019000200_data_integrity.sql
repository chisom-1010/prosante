-- =============================================================================
-- DATA INTEGRITY (proposed - NOT yet applied to production)
--
-- Independent of the security migration; apply it second. Pre-checked against
-- production data on 2026-10-19: no duplicate doctor e-mails / auth ids, no
-- case-insensitive duplicate services, so the new constraints will apply.
--
--   * profiles.role default was the literal string 'patient' WITH quotes, which
--     violates the role CHECK, so any insert that omitted role failed.
--   * Deleting a doctor silently deleted all of their appointments
--     (ON DELETE CASCADE), and deleting a service cascaded to doctors and
--     appointments. Medical history should never disappear as a side effect.
--   * id_patient is NOT NULL but its FK was ON DELETE SET NULL (it could only
--     error); now an explicit RESTRICT.
--   * doctors had no UNIQUE e-mail / auth_user_id; the delete route looks
--     doctors up by e-mail.
--   * No indexes on foreign keys (used by every policy and dashboard query).
--   * updated_at was never maintained.
-- =============================================================================

begin;

alter table public.profiles alter column role set default 'patient';

-- Uniqueness
alter table public.doctors add constraint doctors_email_key unique (email);
alter table public.doctors add constraint doctors_auth_user_id_key unique (auth_user_id);
create unique index service_medical_type_lower_key
  on public.service_medical (lower(type_de_service));

-- Foreign keys: refuse destructive deletes instead of cascading them.
alter table public.demande_de_consultation
  drop constraint demande_de_consultation_doctor_id_fkey,
  add constraint demande_de_consultation_doctor_id_fkey
    foreign key (doctor_id) references public.doctors (id)
    on update cascade on delete restrict;

alter table public.demande_de_consultation
  drop constraint demande_de_consultation_id_patient_fkey,
  add constraint demande_de_consultation_id_patient_fkey
    foreign key (id_patient) references public.profiles (auth_user_id)
    on update cascade on delete restrict;

alter table public.demande_de_consultation
  drop constraint demande_de_consultation_id_service_medical_fkey,
  add constraint demande_de_consultation_id_service_medical_fkey
    foreign key (id_service_medical) references public.service_medical (id)
    on update cascade on delete restrict;

alter table public.doctors
  drop constraint doctors_service_id_fkey,
  add constraint doctors_service_id_fkey
    foreign key (service_id) references public.service_medical (id)
    on update cascade on delete restrict;

-- Indexes on foreign-key / lookup columns
create index demande_de_consultation_doctor_id_idx on public.demande_de_consultation (doctor_id);
create index demande_de_consultation_id_patient_idx on public.demande_de_consultation (id_patient);
create index demande_de_consultation_id_service_medical_idx on public.demande_de_consultation (id_service_medical);
create index demande_de_consultation_date_idx on public.demande_de_consultation (date_de_rendezvous);
create index doctors_service_id_idx on public.doctors (service_id);

-- Keep updated_at truthful
create or replace function public.set_updated_at()
 returns trigger
 language plpgsql
 set search_path = ''
as $$
begin
  new.updated_at := (now() at time zone 'utc');
  return new;
end;
$$;

create trigger demande_de_consultation_set_updated_at
  before update on public.demande_de_consultation
  for each row execute function public.set_updated_at();

-- Double-booking prevention lives in 20261019000300_appointment_rules.sql

commit;
