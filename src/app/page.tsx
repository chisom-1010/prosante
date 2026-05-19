import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { HugeiconsIcon } from "@hugeicons/react";

import {
  ArrowRight01Icon,
  Calendar03Icon,
  Doctor01Icon,
  FirstAidKitIcon,
  LibraryIcon,
  Share08Icon,
  Globe02Icon,
  Shield01Icon,
  CaduceusIcon,
  Hospital01Icon,
} from "@hugeicons/core-free-icons";

const services = [
  {
    title: "Consultation Spécialisée",
    description:
      "Des soins personnalisés menés par des experts médicaux reconnus mondialement.",
    icon: FirstAidKitIcon,
  },
  {
    title: "Chirurgie de Précision",
    description:
      "Des interventions assistées par des technologies avancées et une expertise clinique de pointe.",
    icon: Doctor01Icon,
  },
  {
    title: "Recherche Clinique",
    description:
      "Une innovation médicale continue pour transformer durablement les standards de santé.",
    icon: LibraryIcon,
  },
];

const stats = [
  {
    value: "12k+",
    label: "Patients accompagnés",
  },
  {
    value: "99%",
    label: "Précision clinique",
  },
  {
    value: "24/7",
    label: "Urgences médicales",
  },
];

const navigation = ["Accueil", "Services", "Médecins", "Recherche", "Contact"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            className="font-serif text-2xl font-semibold tracking-tight text-[#0b1c30]"
          >
            ProSanté
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-[#3e4948] transition-colors hover:text-[#006767]"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden border-[#d3e4fe] bg-white text-[#0b1c30] hover:bg-[#eff4ff] md:flex"
              asChild
            >
              <Link href="/auth/login">Connexion</Link>
            </Button>

            <Button
              asChild
              className="h-11 bg-[#006767] px-5 text-white hover:bg-[#005555]"
            >
              <Link href="/auth/signin">Prendre rendez-vous</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,106,106,0.10),transparent_30%)]" />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 py-20 md:px-10 lg:grid-cols-2 lg:py-28">
          {/* LEFT */}
          <div className="space-y-8">
            <Badge className="rounded-full border-0 bg-[#dff7f7] px-4 py-2 text-[#006767] hover:bg-[#dff7f7]">
              Excellence Médicale Accréditée
            </Badge>

            <div className="space-y-6">
              <h1 className="font-serif text-5xl leading-tight tracking-[-0.04em] text-[#0b1c30] sm:text-6xl lg:text-7xl">
                L’Excellence Clinique au Service de Votre Santé
              </h1>

              <p className="max-w-xl text-lg leading-8 text-[#4b5563]">
                Une médecine de précision pensée autour de l’humain, combinant
                expertise médicale, innovation technologique et accompagnement
                personnalisé.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 bg-[#006767] px-6 text-white hover:bg-[#005555]"
              >
                <Link href="/auth/signin">
                  Prendre rendez-vous
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="ml-2 size-4"
                  />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12 border-[#c7d2fe] bg-white px-6 hover:bg-[#eff4ff]"
              >
                Découvrir nos services
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-[#E2E8F0]">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  className="size-4 text-[#006767]"
                />
                <span className="text-sm font-medium">Sécurité certifiée</span>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-[#E2E8F0]">
                <HugeiconsIcon
                  icon={Hospital01Icon}
                  className="size-4 text-[#006767]"
                />
                <span className="text-sm font-medium">Centres modernes</span>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-[#E2E8F0]">
                <HugeiconsIcon
                  icon={CaduceusIcon}
                  className="size-4 text-[#006767]"
                />
                <span className="text-sm font-medium">Diagnostic avancé</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_20px_60px_rgba(26,54,93,0.08)]">
              <Image
                src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1200&auto=format&fit=crop"
                alt="Medical Team"
                width={1200}
                height={1400}
                className="h-[620px] w-full object-cover"
              />
            </div>

            <Card className="absolute -bottom-6 -left-6 border-0 bg-white shadow-2xl">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dff7f7]">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      className="size-5 text-[#006767]"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-[#6b7280]">Disponibilité</p>

                    <p className="font-semibold text-[#0b1c30]">
                      Rendez-vous sous 24h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#dbe4f0] bg-[#eaf2ff]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 md:grid-cols-3 md:px-10">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-3 text-center">
              <h2 className="text-5xl font-semibold tracking-tight text-[#0b1c30]">
                {stat.value}
              </h2>

              <p className="text-sm font-medium uppercase tracking-[0.08em] text-[#5f6b7a]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-5 bg-[#dff7f7] text-[#006767] hover:bg-[#dff7f7]">
              Nos Services
            </Badge>

            <h2 className="font-serif text-4xl tracking-tight text-[#0b1c30] md:text-5xl">
              Une expertise médicale pensée pour chaque patient
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#5f6b7a]">
              Des disciplines médicales avancées réunies dans un environnement
              moderne, humain et technologique.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.title}
                className="group border-[#E2E8F0] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(26,54,93,0.08)]"
              >
                <CardContent className="space-y-8 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dff7f7]">
                    <HugeiconsIcon
                      icon={service.icon}
                      className="size-7 text-[#006767]"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-serif text-3xl tracking-tight text-[#0b1c30]">
                      {service.title}
                    </h3>

                    <p className="leading-7 text-[#5f6b7a]">
                      {service.description}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    className="px-0 text-[#006767] hover:bg-transparent hover:text-[#005555]"
                  >
                    En savoir plus
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="bg-white py-24">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-16 px-6 md:px-10 lg:grid-cols-2">
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] shadow-[0_20px_50px_rgba(26,54,93,0.08)]">
              <Image
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop"
                alt="Hospital"
                width={1200}
                height={1200}
                className="h-[620px] w-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-8">
            <Badge className="bg-[#dff7f7] text-[#006767] hover:bg-[#dff7f7]">
              Notre Mission
            </Badge>

            <h2 className="font-serif text-4xl leading-tight tracking-tight text-[#0b1c30] md:text-5xl">
              Une médecine d’excellence centrée sur l’humain
            </h2>

            <p className="text-lg leading-8 text-[#5f6b7a]">
              Chez ProSanté, nous croyons qu’une grande médecine repose autant
              sur la précision clinique que sur la qualité de l’accompagnement
              humain.
            </p>

            <p className="text-lg leading-8 text-[#5f6b7a]">
              Notre institution associe innovation médicale, recherche
              scientifique et attention personnalisée pour offrir une expérience
              de soin moderne, rassurante et durable.
            </p>

            <Button
              variant="outline"
              className="h-12 border-[#c7d2fe] bg-white px-6 hover:bg-[#eff4ff]"
            >
              Lire notre histoire
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#006767] py-20 text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-6 text-center md:px-10 lg:flex-row lg:text-left">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
              Votre santé mérite une expertise d’exception
            </h2>

            <p className="mt-5 text-lg leading-8 text-white/80">
              Prenez rendez-vous avec nos spécialistes et bénéficiez d’un
              accompagnement médical personnalisé.
            </p>
          </div>

          <Button
            size="lg"
            className="h-12 bg-white px-6 text-[#006767] hover:bg-white/90"
          >
            Réserver une consultation
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E8F0] bg-[#f8f9ff]">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 py-16 md:grid-cols-4 md:px-10">
          <div className="space-y-5">
            <h3 className="font-serif text-3xl text-[#0b1c30]">ProSanté</h3>

            <p className="leading-7 text-[#5f6b7a]">
              Une institution médicale moderne dédiée à l’excellence clinique et
              à l’innovation humaine.
            </p>
          </div>

          <div className="space-y-5">
            <h4 className="font-semibold text-[#0b1c30]">Navigation</h4>

            <div className="flex flex-col gap-3 text-[#5f6b7a]">
              {navigation.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="transition-colors hover:text-[#006767]"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="font-semibold text-[#0b1c30]">Centres</h4>

            <div className="space-y-3 text-[#5f6b7a]">
              <p>Lomé, Togo</p>
              <p>Paris, France</p>
              <p>Londres, Royaume-Uni</p>
              <p>New York, USA</p>
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="font-semibold text-[#0b1c30]">Contact</h4>

            <a
              href="mailto:contact@prosante.com"
              className="block text-[#5f6b7a] transition-colors hover:text-[#006767]"
            >
              contact@prosante.com
            </a>

            <div className="flex items-center gap-4 pt-2">
              <HugeiconsIcon
                icon={Globe02Icon}
                className="size-5 text-[#5f6b7a]"
              />

              <HugeiconsIcon
                icon={Share08Icon}
                className="size-5 text-[#5f6b7a]"
              />

              <HugeiconsIcon
                icon={Calendar03Icon}
                className="size-5 text-[#5f6b7a]"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-[#E2E8F0]" />

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 text-sm text-[#7a8797] md:px-10">
          <p>© 2026 ProSanté. Tous droits réservés.</p>

          <p>Human-Centric Clinical Excellence</p>
        </div>
      </footer>
    </main>
  );
}
