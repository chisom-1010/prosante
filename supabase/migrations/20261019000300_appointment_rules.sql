-- =============================================================================
-- Appointment business rules, enforced in the database so no client can skip them.
-- Mirrors lib/appointments.ts - keep both in sync.
-- =============================================================================

begin;

-- One patient per doctor per slot while the appointment is live.
create unique index if not exists demande_de_consultation_no_double_booking
  on public.demande_de_consultation (doctor_id, date_de_rendezvous, tranche_horaires)
  where doctor_id is not null and status in ('accepté', 'en cours');

-- Status transitions + "a doctor is required" ----------------------------------
create or replace function public.enforce_appointment_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Maintenance done as the database owner is not restricted.
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if new.status is distinct from old.status then
    if not (
      (old.status = 'en attente' and new.status in ('accepté', 'reporté', 'annulé')) or
      (old.status = 'accepté'    and new.status in ('en cours', 'fini', 'reporté', 'annulé')) or
      (old.status = 'en cours'   and new.status in ('fini', 'reporté', 'annulé')) or
      (old.status = 'reporté'    and new.status in ('accepté', 'annulé'))
    ) then
      raise exception 'Transition de statut interdite : % -> %', old.status, new.status
        using errcode = '23514';
    end if;
  end if;

  if (new.status is distinct from old.status or new.doctor_id is distinct from old.doctor_id)
     and new.status in ('accepté', 'en cours', 'fini')
     and new.doctor_id is null then
    raise exception 'Un médecin doit être assigné pour le statut %', new.status
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_appointment_transition on public.demande_de_consultation;
create trigger trg_appointment_transition
  before update on public.demande_de_consultation
  for each row execute function public.enforce_appointment_transition();

-- No booking in the past -------------------------------------------------------
create or replace function public.reject_past_appointment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  if new.date_de_rendezvous < current_date then
    raise exception 'La date du rendez-vous ne peut pas être dans le passé.'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_appointment_not_past on public.demande_de_consultation;
create trigger trg_appointment_not_past
  before insert on public.demande_de_consultation
  for each row execute function public.reject_past_appointment();

commit;
