"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, BedDouble, Euro, HardHat, GraduationCap } from "lucide-react";
import type { DashboardStats } from "@/types";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Teilnehmer",
      value: stats.totalParticipants,
      icon: Users,
      description: `${stats.checkedIn} eingecheckt`,
      accent: "bg-primary/10 text-primary",
    },
    {
      title: "Bezahlt",
      value: `${stats.paid}/${stats.totalParticipants}`,
      icon: Euro,
      description: `${stats.unpaid} ausstehend`,
      accent: stats.unpaid > 0 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Zimmer",
      value: stats.rooms,
      icon: BedDouble,
      description: `${stats.occupiedBeds}/${stats.totalBeds} Betten belegt`,
      accent: "bg-sky-500/10 text-sky-600",
    },
    {
      title: "Helfer",
      value: stats.helpers,
      icon: HardHat,
      description: "Aktive Helfer",
      accent: "bg-violet-500/10 text-violet-600",
    },
    {
      title: "Abi-Gäste",
      value: stats.abiGuests,
      icon: GraduationCap,
      description: "Abi-Teilnehmer",
      accent: "bg-slate-500/10 text-slate-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2.5", card.accent)}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <p className="text-xl font-bold tracking-tight">{card.value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
