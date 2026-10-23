import { isStatus, STATUS_LABELS } from "@/lib/appointments";

const STYLES: Record<string, string> = {
  "en attente": "bg-amber-50 text-amber-700 ring-amber-200",
  accepté: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "en cours": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  reporté: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  annulé: "bg-red-50 text-red-700 ring-red-200",
  fini: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${
        STYLES[status] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {isStatus(status) ? STATUS_LABELS[status] : status}
    </span>
  );
}
