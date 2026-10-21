import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  MedicalMaskIcon,
  Shield01Icon,
  Time04Icon,
} from "@hugeicons/core-free-icons";

const benefits = [
  { icon: Calendar03Icon, text: "Demandez une consultation en quelques clics" },
  { icon: Time04Icon, text: "Suivez l'état de vos rendez-vous" },
  { icon: Shield01Icon, text: "Vos informations restent confidentielles" },
];

/** Split layout shared by every authentication page. */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-[#f8fafc] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/5"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-white/5"
        />

        <Link href="/" className="relative flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-white">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <HugeiconsIcon icon={MedicalMaskIcon} strokeWidth={2} className="size-7" />
          </div>
          <span className="text-3xl font-bold">ProSanté</span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Votre santé, simplifiée
          </p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">
            Prenez soin de vous, sans attendre.
          </h2>
          <ul className="mt-10 space-y-5">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-center gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <HugeiconsIcon icon={b.icon} strokeWidth={2} className="size-5" />
                </span>
                <span className="text-base text-emerald-50">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-sm text-emerald-200">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
          Clinique ProSanté
        </p>
      </aside>

      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-700"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
            Retour à l&apos;accueil
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="ProSanté">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50">
              <HugeiconsIcon icon={MedicalMaskIcon} strokeWidth={2} className="size-5 text-emerald-700" />
            </span>
            <span className="text-xl font-bold text-emerald-700">ProSanté</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
