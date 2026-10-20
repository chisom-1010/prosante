/**
 * Business rules for appointments, shared by the API routes and the UI.
 * The same rules are enforced in the database by
 * supabase/migrations/20261019000300_appointment_rules.sql - keep them in sync.
 */

export const TIME_SLOTS = [
  "08h00 - 09h00",
  "09h00 - 10h00",
  "10h00 - 11h00",
  "11h00 - 12h00",
  "14h00 - 15h00",
  "15h00 - 16h00",
  "16h00 - 17h00",
] as const;

export const STATUSES = [
  "en attente",
  "accepté",
  "en cours",
  "reporté",
  "annulé",
  "fini",
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  "en attente": "En attente",
  accepté: "Accepté",
  "en cours": "En cours",
  reporté: "Reporté",
  annulé: "Annulé",
  fini: "Terminé",
};

/** Which status an appointment may move to from each status. */
export const STATUS_TRANSITIONS: Record<Status, readonly Status[]> = {
  "en attente": ["accepté", "reporté", "annulé"],
  accepté: ["en cours", "fini", "reporté", "annulé"],
  "en cours": ["fini", "reporté", "annulé"],
  reporté: ["accepté", "annulé"],
  annulé: [],
  fini: [],
};

/** A doctor is busy during these statuses (one patient per doctor per slot). */
export const ACTIVE_STATUSES: readonly Status[] = ["accepté", "en cours"];

/** Statuses that need a doctor to be assigned. */
export const NEEDS_DOCTOR: readonly Status[] = ["accepté", "en cours", "fini"];

/** Statuses from which the appointment can still be (re)assigned or rescheduled. */
export const EDITABLE_STATUSES: readonly Status[] = [
  "en attente",
  "accepté",
  "reporté",
];

export function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: string, to: string): boolean {
  if (!isStatus(from) || !isStatus(to)) return false;
  return STATUS_TRANSITIONS[from].includes(to);
}

/** The statuses to offer in a dropdown: the current one plus what it can become. */
export function statusOptions(current: string, only?: readonly Status[]) {
  const next = isStatus(current) ? STATUS_TRANSITIONS[current] : [];
  const allowed = only ? next.filter((s) => only.includes(s)) : next;
  return [...(isStatus(current) ? [current] : []), ...allowed];
}
