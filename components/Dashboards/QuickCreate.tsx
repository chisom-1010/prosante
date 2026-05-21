"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MedicalMaskIcon,
  FirstAidKitIcon,
  Doctor01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const QUICK_CREATE_OPTIONS = [
  {
    title: "Service Médical",
    description:
      "Définissez un nouveau département, ses spécialités cliniques et sa capacité d'accueil pour optimiser le flux.",
    icon: FirstAidKitIcon,
    url: "/admin/quick_create/service_medical",
  },
  {
    title: "Réceptionniste",
    description:
      "Créez un profil pour le personnel d'accueil. Gérez les droits d'accès et la planification stratégique.",
    icon: MedicalMaskIcon,
    url: "/admin/quick_create/receptionist",
  },
  {
    title: "Médecin",
    description:
      "Inscrivez un nouveau praticien et configurez son calendrier de consultations hautement personnalisé.",
    icon: Doctor01Icon,
    url: "/admin/quick_create/doctors",
  },
];

export default function QuickCreate() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] px-6 py-10 md:px-10 rounded-lg">
      <main className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-16">
          <button
            onClick={() => window.history.back()}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2.5 transition hover:bg-emerald-100 cursor-pointer border border-slate-200 border-2px"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="h-4 w-4 text-emerald-700"
              />

          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
             Retour
        </span>
       </button>

  <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 md:text-7xl">
    Création Rapide
  </h1>

  <p className="mt-6 max-w-3xl text-xl leading-10 text-slate-600">
    Optimisez votre établissement en quelques clics. Configurez les
    piliers de votre service de santé avec une précision clinique.
  </p>
</div>

        {/* CARDS */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {QUICK_CREATE_OPTIONS.map((option, index) => (
            <Card
              key={index}
              className="rounded-[2rem] border-0 bg-white shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="flex h-full flex-col p-8">
                {/* ICON */}
                <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <HugeiconsIcon
                    icon={option.icon}
                    strokeWidth={2}
                    className="h-8 w-8 text-emerald-700"
                  />
                </div>

                {/* TITLE */}
                <h2 className="mb-5 text-4xl font-semibold tracking-tight text-slate-950">
                  {option.title}
                </h2>

                {/* DESCRIPTION */}
                <p className="mb-10 flex-1 text-lg leading-9 text-slate-600">
                  {option.description}
                </p>

                {/* BUTTON */}
                <Button
                  asChild
                  className="h-16 rounded-2xl bg-teal-700 px-8 text-base font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-800"
                >
                  <a
                    href={option.url}
                    className="flex items-center justify-between"
                  >
                    Ajouter

                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2.5}
                      className="h-5 w-5"
                    />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div className="relative mt-20 overflow-hidden rounded-[2.5rem] bg-[#1d314d] px-8 py-12 md:px-14 md:py-16">
          {/* subtle background circles */}
          <div className="absolute right-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-cyan-400/10" />

          <div className="absolute right-24 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full border border-cyan-400/10" />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-4xl font-semibold text-white">
                Gestion Complète du Personnel
              </h3>

              <p className="mt-4 text-lg leading-9 text-slate-300">
                Accédez à l'annuaire complet pour gérer les permissions et les
                plannings de l'ensemble de votre équipe.
              </p>
            </div>

            <Button
              variant="outline"
              className="h-16 rounded-2xl border border-slate-500 bg-white/5 px-10 text-sm font-bold uppercase tracking-[0.25em] text-white backdrop-blur-sm hover:bg-white/10"
              asChild
            >
              <a href="/admin/Management/doctors">
                Voir tout le personnel
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}