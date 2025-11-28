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
      gradient: "from-primary/20 via-primary/10 to-transparent",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
    },
    {
      title: "Bezahlt",
      value: `${stats.paid}/${stats.totalParticipants}`,
      icon: Euro,
      description: `${stats.unpaid} ausstehend`,
      gradient: stats.unpaid > 0 ? "from-amber-500/20 via-amber-500/10 to-transparent" : "from-emerald-500/20 via-emerald-500/10 to-transparent",
      iconBg: stats.unpaid > 0 ? "bg-amber-500/15" : "bg-emerald-500/15",
      iconColor: stats.unpaid > 0 ? "text-amber-600" : "text-emerald-600",
    },
    {
      title: "Zimmer",
      value: stats.rooms,
      icon: BedDouble,
      description: `${stats.occupiedBeds}/${stats.totalBeds} Betten belegt`,
      gradient: "from-gray-400/20 via-gray-400/10 to-transparent",
      iconBg: "bg-gray-400/15",
      iconColor: "text-gray-600",
    },
    {
      title: "Helfer",
      value: stats.helpers,
      icon: HardHat,
      description: "Aktive Helfer",
      gradient: "from-primary/15 via-primary/5 to-transparent",
      iconBg: "bg-primary/10",
      iconColor: "text-primary/80",
    },
    {
      title: "Abi-Gäste",
      value: stats.abiGuests,
      icon: GraduationCap,
      description: "Abi-Teilnehmer",
      gradient: "from-gray-500/20 via-gray-500/10 to-transparent",
      iconBg: "bg-gray-500/15",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden relative group">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-100 transition-opacity", card.gradient)} />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{card.title}</p>
                <p className="text-3xl font-bold tracking-tight">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
              <div className={cn("rounded-xl p-3 backdrop-blur-sm", card.iconBg)}>
                <card.icon className={cn("h-5 w-5", card.iconColor)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
