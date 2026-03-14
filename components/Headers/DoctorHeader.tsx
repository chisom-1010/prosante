import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export function DoctorHeader() {
  return (
     <header className="border-b border-border py-6 px-6 md:px-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-widest">
            <Link href="/doctors">
             TABLEAU MÉDECIN
            </Link>
           </h1>
          <nav className="hidden md:flex gap-8">
            <Button variant="ghost" size="sm" className="text-xs font-semibold tracking-widest">
              RENDEZ-VOUS
            </Button>
            <Button variant="ghost" size="sm" className="text-xs font-semibold tracking-widest text-muted-foreground">
              PATIENTS
            </Button>
            <Button variant="ghost" size="sm" className="text-xs font-semibold tracking-widest text-muted-foreground">
              PARAMÈTRES
            </Button>
          </nav>
        </div>
        <Separator className="bg-border" />
      </header>
  )
}
