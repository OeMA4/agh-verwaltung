import { MainLayout } from "@/components/layout";
import { StatistikenContent } from "./statistiken-content";
import { getCurrentOrLatestEvent } from "@/lib/actions/events";
import { getParticipantsByCity, getParticipantsByCountry, getPaymentStats, getRoleStats } from "@/lib/actions/participants";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StatistikenPage() {
  const event = await getCurrentOrLatestEvent();

  if (!event) {
    redirect("/veranstaltung");
  }

  const [cityStats, countryStats, paymentStats, roleStats] = await Promise.all([
    getParticipantsByCity(event.id),
    getParticipantsByCountry(event.id),
    getPaymentStats(event.id),
    getRoleStats(event.id),
  ]);

  return (
    <MainLayout>
      <StatistikenContent
        event={event}
        cityStats={cityStats}
        countryStats={countryStats}
        paymentStats={paymentStats}
        roleStats={roleStats}
      />
    </MainLayout>
  );
}
