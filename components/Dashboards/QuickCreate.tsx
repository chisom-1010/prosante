import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  PlusSignIcon,
  Doctor01Icon,
  FirstAidKitIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const QUICK_CREATE_OPTIONS = [
  {
    title: "SERVICE MEDICAL",
    description: "Ajouter un nouveau service médical",
    icon: FirstAidKitIcon,
    url: "/admin/quick_create/service_medical",
  },
  {
    title: "RECEPTIONISTE",
    description: "Ajouter un nouveau réceptioniste",
    icon: PlusSignIcon,
    url: "/admin/quick_create/receptionist",
  },
  {
    title: "MEDECIN",
    description: "Ajouter un nouveau docteur",
    icon: Doctor01Icon,
    url: "/admin/quick_create/doctors",
  },
];

export default function QuickCreate() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="p-6 md:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold tracking-widest">
            CRÉATION RAPIDE
          </h1>
          <Separator className="mt-4 bg-border" />
        </div>

        {/* Quick Create Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {QUICK_CREATE_OPTIONS.map((option, index) => (
            <Card
              key={index}
              className="border-border hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full border-2 border-border group-hover:border-primary transition-colors flex items-center justify-center mb-6">
                  <HugeiconsIcon
                    icon={option.icon}
                    className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
                <h3 className="text-lg font-bold tracking-wider mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {option.description}
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="tracking-widest"
                  asChild
                >
                  <a href={option.url}>AJOUTER</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
