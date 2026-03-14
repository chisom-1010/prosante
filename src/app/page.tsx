import Link from "next/link";
import { Button } from "@/components/ui/button";
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
} from "@hugeicons/core-free-icons";

const services = [
  {
    index: "TYPE // 001",
    title: "CONSULTATION",
    description:
      "Analyse structurelle de la santé individuelle par des experts reconnus.",
    icon: FirstAidKitIcon,
  },
  {
    index: "TYPE // 002",
    title: "CHIRURGIE",
    description:
      "Interventions de précision monumentale assistées par robotique de pointe.",
    icon: Doctor01Icon,
  },
  {
    index: "TYPE // 003",
    title: "RECHERCHE",
    description:
      "Laboratoire d'innovation fondamentale sur la longévité et la médecine cellulaire.",
    icon: LibraryIcon,
  },
];

const stats = [
  { value: "12k+", label: "VIES TRANSFORMÉES" },
  { value: "99%", label: "PRÉCISION CLINIQUE" },
  { value: "04", label: "CENTRES MONDIAUX" },
];

const navigation = ["Philosophie", "Services", "Recherche", "Contact"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#081b12] text-white">
      <div className="border-t-4 border-[#33f28b]" />

      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-2xl font-semibold tracking-tight text-white"
            >
              ProSanté
            </Link>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[14px] uppercase tracking-[0.35em] text-white/75 transition-colors hover:text-[#33f28b]"
              >
                {item}
              </a>
            ))}
            <Button
              asChild
              size="lg"
              className="mt-2 ml-4 h-12 border border-[#33f28b] bg-[#33f28b] px-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#081b12] hover:bg-[#68f7a8]"
            >
              <Link href="/auth/login">
                Connexion
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-6 py-12 md:px-10 md:py-20">
        <div className="space-y-10">
          <div className="space-y-5">
            <div className="max-w-5xl">
              <h1 className="font-serif text-[4.5rem] leading-[0.9] tracking-[-0.06em] text-[#f1f3f2] sm:text-[5.75rem] lg:text-[8.5rem]">
                L&apos;ESSENCE
                <br />
                DE LA SANTÉ
              </h1>
            </div>

            <div className="max-w-xl border-l border-[#33f28b] pl-5">
              <p className="font-serif text-xl leading-relaxed text-white/80 italic">
                Une approche monumentale et rigoureuse de la gestion médicale.
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="mt-2 h-12 border border-[#33f28b] bg-[#33f28b] px-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#081b12] hover:bg-[#68f7a8]"
            >
              <Link href="/auth/signin">
                Prendre rendez-vous
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="mt-2 ml-4 h-12 border border-[#33f28b] bg-[#33f28b] px-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#081b12] hover:bg-[#68f7a8]"
            >
              <Link href="/auth/login">
                Connexion
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Link>
            </Button>
          </div>

          <Separator className="bg-[#1d5c40]" />
        </div>

        <div
          id="philosophie"
          className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#33f28b]" />
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/55">
                01. Philosophie
              </p>
            </div>

            <p className="max-w-2xl text-lg leading-9 text-white/78 md:text-[1.65rem] md:leading-[1.8]">
              <span className="mr-2 inline-flex h-14 w-14 items-center justify-center border border-white/30 bg-white/5 font-serif text-4xl text-white">
                L
              </span>
              a précision est l&apos;âme de notre pratique. Chez ProSanté, nous
              redéfinissons les standards de la gestion médicale avec une
              rigueur absolue et une clarté monumentale. Notre héritage repose
              sur l&apos;équilibre entre la haute technologie et
              l&apos;humanisme le plus profond, créant une structure de soins
              indestructible et pérenne pour chaque patient.
            </p>
          </div>

          <Card className="overflow-hidden border border-white/10 bg-white/[0.03] p-0 ring-0">
            <CardContent className="relative p-0">
              <div className="aspect-[4/5] w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_30%),linear-gradient(180deg,_#5f5f5f_0%,_#2f2f2f_42%,_#151515_100%)]">
                <div className="relative h-full w-full overflow-hidden bg-black/10">
                  <div className="absolute inset-x-[18%] bottom-[10%] h-[52%] rounded-t-[44%] rounded-b-[12%] bg-[linear-gradient(180deg,_rgba(240,240,240,0.7),_rgba(120,120,120,0.28))]" />
                  <div className="absolute inset-x-[8%] bottom-[10%] h-[40%] skew-x-[-16deg] rounded-[8%] bg-[repeating-linear-gradient(180deg,_rgba(255,255,255,0.35),_rgba(255,255,255,0.35)_1px,_rgba(0,0,0,0.06)_1px,_rgba(0,0,0,0.06)_5px)] opacity-90" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.35))]" />
                </div>
              </div>

              <div className="absolute bottom-4 right-4 border border-[#33f28b]/40 bg-[#33f28b] px-4 py-2 text-[9px] font-medium uppercase tracking-[0.3em] text-[#081b12]">
                Fragment // Structure & Clarté
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="services" className="border-y-4 border-[#33f28b]">
        <div className="mx-auto grid w-full max-w-7xl gap-0 md:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.title}
              className="min-h-[340px] border-0 border-r border-white/10 bg-transparent py-0 text-white ring-0 last:border-r-0"
            >
              <CardContent className="flex h-full flex-col justify-between px-6 py-10 md:px-8">
                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
                    {service.index}
                  </p>
                  <div className="space-y-4">
                    <h2 className="font-serif text-4xl tracking-[-0.04em] text-[#eef1ef]">
                      {service.title}
                    </h2>
                    <p className="max-w-sm text-sm leading-7 text-white/65">
                      {service.description}
                    </p>
                  </div>
                </div>

                <HugeiconsIcon
                  icon={service.icon}
                  strokeWidth={1.8}
                  className="size-6 text-white"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[#33f28b] text-[#081b12]">
        <div className="mx-auto grid w-full max-w-7xl gap-0 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-6 py-12 md:px-8 md:py-14 ${
                index !== stats.length - 1
                  ? "border-b border-[#081b12]/10 md:border-r md:border-b-0"
                  : ""
              }`}
            >
              <div className="space-y-4">
                <p className="text-6xl font-semibold tracking-[-0.08em] md:text-7xl">
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.45em] text-[#081b12]/70">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04),_transparent_45%),linear-gradient(180deg,_#0a1f15_0%,_#081b12_100%)]">
        <div className="mx-auto flex min-h-[360px] w-full max-w-7xl flex-col items-center justify-center px-6 py-16 text-center md:px-10">
          <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-serif text-[5rem] leading-none tracking-[-0.08em] text-white/[0.08] sm:text-[7rem] lg:text-[10rem]">
            ProSanté
          </p>

          <div className="relative z-10 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/75">
              Établi en 2026 — Lomé, Togo
            </p>
            <div className="mx-auto h-px w-24 bg-[#6aeaa2]/60" />
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t-4 border-[#33f28b]">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-12 md:grid-cols-4 md:px-10">
          <div className="space-y-6">
            <h3 className="font-serif text-3xl tracking-[-0.04em] text-[#eef1ef]">
              ProSanté
            </h3>
            <p className="max-w-xs text-[10px] uppercase tracking-[0.32em] text-white/55">
              Santé. Rigueur. Héritage.
              <br />
              © 2026 ProSanté Group.
              <br />
              Tous droits réservés.
            </p>
          </div>

          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#33f28b]">
              Navigation
            </p>
            <div className="flex flex-col gap-3 font-serif text-2xl text-white/85">
              {["Philosophie", "Expertise", "Recherche", "Carrières"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="transition-colors hover:text-[#33f28b]"
                  >
                    {item}
                  </a>
                ),
              )}
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#33f28b]">
              Localisation
            </p>
            <div className="space-y-3 text-xs uppercase tracking-[0.28em] text-white/75">
              <p>12 Avenue Montaigne, Paris</p>
              <p>Harvard, Londres</p>
              <p>Upper East Side, NYC</p>
              <p>The Bund, Shanghai</p>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#33f28b]">
              Contact
            </p>
            <div className="space-y-6">
              <a
                href="mailto:contact@ProSanté.com"
                className="font-serif text-2xl text-white/85 transition-colors hover:text-[#33f28b]"
              >
                contact@ProSanté.com
              </a>
              <div className="flex items-center gap-4 text-white/70">
                <HugeiconsIcon
                  icon={Globe02Icon}
                  strokeWidth={1.8}
                  className="size-5"
                />
                <HugeiconsIcon
                  icon={Share08Icon}
                  strokeWidth={1.8}
                  className="size-5"
                />
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  strokeWidth={1.8}
                  className="size-5"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
