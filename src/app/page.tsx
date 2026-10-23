import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Doctor01Icon,
  FirstAidKitIcon,
  Hospital01Icon,
  MedicalMaskIcon,
  Notification03Icon,
  Shield01Icon,
  Time04Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";

export const metadata = {
  title: "ProSanté - Prenez rendez-vous avec votre clinique",
  description:
    "Demandez une consultation en ligne, choisissez votre créneau et suivez vos rendez-vous avec ProSanté.",
};

const navigation = [
  { label: "Services", href: "#services" },
  { label: "Comment ça marche", href: "#etapes" },
  { label: "Pourquoi ProSanté", href: "#avantages" },
];

const services: { title: string; text: string; icon: IconSvgElement; tint: string }[] = [
  {
    title: "Consultations spécialisées",
    text: "Choisissez le service médical qui correspond à votre besoin et décrivez votre problème en quelques mots.",
    icon: FirstAidKitIcon,
    tint: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Des médecins à votre écoute",
    text: "Votre demande est étudiée par notre équipe, puis confiée à un médecin du service concerné.",
    icon: Doctor01Icon,
    tint: "bg-indigo-50 text-indigo-700",
  },
  {
    title: "Accueil et suivi",
    text: "Nos réceptionnistes confirment votre créneau et vous tiennent informé de chaque changement.",
    icon: Hospital01Icon,
    tint: "bg-cyan-50 text-cyan-700",
  },
];

const steps: { title: string; text: string; icon: IconSvgElement }[] = [
  {
    title: "Créez votre compte",
    text: "Inscrivez-vous gratuitement avec votre adresse e-mail.",
    icon: UserAdd01Icon,
  },
  {
    title: "Choisissez un créneau",
    text: "Sélectionnez le service, la date et la tranche horaire qui vous conviennent.",
    icon: Calendar03Icon,
  },
  {
    title: "Soyez confirmé",
    text: "Vous recevez un e-mail dès qu'un médecin est assigné à votre rendez-vous.",
    icon: CheckmarkCircle02Icon,
  },
];

const benefits: { title: string; text: string; icon: IconSvgElement }[] = [
  {
    title: "Simple et rapide",
    text: "Une demande de consultation se remplit en moins de deux minutes.",
    icon: Time04Icon,
  },
  {
    title: "Toujours informé",
    text: "Des e-mails vous préviennent quand votre rendez-vous est confirmé ou modifié.",
    icon: Notification03Icon,
  },
  {
    title: "Données protégées",
    text: "Votre compte est sécurisé et vos informations ne sont visibles que par l'équipe qui vous soigne.",
    icon: Shield01Icon,
  },
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

export default function HomePage() {
  return (
    <div className="min-h-svh bg-[#f8fafc] text-slate-900">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#f8fafc]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className={`flex items-center gap-3 rounded-lg ${focusRing}`}>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50">
              <HugeiconsIcon icon={MedicalMaskIcon} strokeWidth={2} className="size-6 text-emerald-700" />
            </span>
            <span className="text-2xl font-bold text-emerald-700">ProSanté</span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-md text-sm font-medium text-slate-600 transition hover:text-slate-900 ${focusRing}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/login"
              className={`rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white sm:px-4 ${focusRing}`}
            >
              Se connecter
            </Link>
            <Link
              href="/auth/login"
              className={`hidden h-11 items-center rounded-2xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:inline-flex ${focusRing}`}
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </header>

      <main id="contenu">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-emerald-100/70 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
                Rendez-vous en ligne
              </p>
              <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Votre consultation,
                <span className="text-emerald-700"> sans file d&apos;attente.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Choisissez un service, une date et un créneau. Notre équipe confirme votre
                rendez-vous et vous tient informé à chaque étape.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/signin"
                  className={`inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-8 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 hover:shadow-md ${focusRing}`}
                >
                  Créer mon compte
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className={`inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-base font-semibold text-slate-800 transition hover:bg-slate-50 ${focusRing}`}
                >
                  J&apos;ai déjà un compte
                </Link>
              </div>
            </div>

            {/* Illustrative card (no real data) */}
            <div aria-hidden className="relative mx-auto w-full max-w-md">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Demande de consultation
                  </p>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200">
                    En attente
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { icon: FirstAidKitIcon, label: "Service", value: "Médecine générale" },
                    { icon: Calendar03Icon, label: "Date", value: "À choisir" },
                    { icon: Time04Icon, label: "Créneau", value: "08h00 - 09h00" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50">
                        <HugeiconsIcon icon={row.icon} strokeWidth={2} className="size-5 text-emerald-700" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.label}</p>
                        <p className="font-semibold text-slate-900">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-emerald-700 font-semibold text-white">
                  Envoyer la demande
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="scroll-mt-24 border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <SectionTitle eyebrow="Nos services" title="Une prise en charge pensée pour vous" />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {services.map((s) => (
                <article key={s.title} className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-8">
                  <span className={`flex size-14 items-center justify-center rounded-xl ${s.tint}`}>
                    <HugeiconsIcon icon={s.icon} strokeWidth={2} className="size-7" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* STEPS */}
        <section id="etapes" className="scroll-mt-24">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <SectionTitle eyebrow="Comment ça marche" title="Trois étapes, et c'est réglé" />
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-8">
                  <span className="absolute right-6 top-6 text-5xl font-bold text-slate-100" aria-hidden>
                    {i + 1}
                  </span>
                  <span className="flex size-14 items-center justify-center rounded-xl bg-emerald-50">
                    <HugeiconsIcon icon={s.icon} strokeWidth={2} className="size-7 text-emerald-700" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold">
                    <span className="sr-only">Étape {i + 1} : </span>
                    {s.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* WHY */}
        <section id="avantages" className="scroll-mt-24 border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <SectionTitle eyebrow="Pourquoi ProSanté" title="Moins d'attente, plus de sérénité" />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="flex gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <HugeiconsIcon icon={b.icon} strokeWidth={2} className="size-6 text-emerald-700" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{b.title}</h3>
                    <p className="mt-2 leading-relaxed text-slate-600">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-20 sm:px-8">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 px-8 py-14 text-center text-white sm:px-16">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/5" />
            <h2 className="relative text-3xl font-bold sm:text-4xl">Prêt à prendre rendez-vous ?</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-emerald-100">
              Créez votre compte en une minute et envoyez votre première demande de consultation.
            </p>
            <Link
              href="/auth/signin"
              className="relative mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-8 text-base font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Créer mon compte
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:px-8">
          <p className="flex items-center gap-2 font-semibold text-emerald-700">
            <HugeiconsIcon icon={MedicalMaskIcon} strokeWidth={2} className="size-5" />
            ProSanté
          </p>
          <p>© {new Date().getFullYear()} ProSanté. Tous droits réservés.</p>
          <nav aria-label="Pied de page" className="flex gap-6">
            <Link href="/auth/login" className="hover:text-slate-900">Connexion</Link>
            <Link href="/auth/signin" className="hover:text-slate-900">Inscription</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
