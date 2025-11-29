"use client";

import { CityChart, CountryChart, RoleDistribution } from "@/components/statistics";
import type { Event, CityStatistic, CountryStatistic, RoleStatistic } from "@/types";

interface StatistikenContentProps {
  event: Event;
  cityStats: CityStatistic[];
  countryStats: CountryStatistic[];
  roleStats: RoleStatistic;
}

export function StatistikenContent({
  event,
  cityStats,
  countryStats,
  roleStats,
}: StatistikenContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiken</h1>
        <p className="text-muted-foreground">
          Auswertungen für {event.name}
        </p>
      </div>

      <RoleDistribution data={roleStats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CityChart data={cityStats} />
        <CountryChart data={countryStats} />
      </div>
    </div>
  );
}
