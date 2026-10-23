import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Card, CardContent } from "@/components/ui/card";

/** Stat tile in the admin dashboard style. */
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-emerald-50",
  iconColor = "text-emerald-700",
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: IconSvgElement;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-none">
      <CardContent className="flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase leading-5 tracking-wide text-slate-500">{title}</p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900">{value}</h2>
          </div>
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
            <HugeiconsIcon icon={icon} strokeWidth={2} className={`h-7 w-7 ${iconColor}`} />
          </div>
        </div>
        {subtitle && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="text-base text-slate-700">{subtitle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
