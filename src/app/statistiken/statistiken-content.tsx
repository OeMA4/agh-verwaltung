"use client";

import { CityChart, CountryChart, PaymentOverview, RoleDistribution } from "@/components/statistics";
import type { EventWithDetails, CityStatistic, CountryStatistic, PaymentStatistic, RoleStatistic } from "@/types";

interface StatistikenContentProps {
  event: EventWithDetails;
  cityStats: CityStatistic[];
  countryStats: CountryStatistic[];
  paymentStats: PaymentStatistic;
  roleStats: RoleStatistic;
}

export function StatistikenContent({
  event,
  cityStats,
  countryStats,
  paymentStats,
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

      <div className="grid gap-6 lg:grid-cols-2">
        <PaymentOverview data={paymentStats} />
        <RoleDistribution data={roleStats} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CityChart data={cityStats} />
        <CountryChart data={countryStats} />
      </div>
    </div>
  );
}
