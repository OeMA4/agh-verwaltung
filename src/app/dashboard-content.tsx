"use client";

import { StatsCards, RecentActivity, RoomOverview } from "@/components/dashboard";
import type { EventWithDetails, DashboardStats } from "@/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";

interface DashboardContentProps {
  event: EventWithDetails;
  stats: DashboardStats;
}

export function DashboardContent({ event, stats }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {format(new Date(event.startDate), "d. MMMM", { locale: de })} -{" "}
            {format(new Date(event.endDate), "d. MMMM yyyy", { locale: de })}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.location}
          </span>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity participants={event.participants} />
        <RoomOverview rooms={event.rooms} />
      </div>
    </div>
  );
}
