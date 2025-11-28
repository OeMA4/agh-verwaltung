import { MainLayout } from "@/components/layout";
import { StatistikenContent } from "./statistiken-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { getParticipantsByCity, getParticipantsByCountry, getPaymentStats, getRoleStats } from "@/lib/actions/participants";
import { redirect } from "next/navigation";

// Revalidiere alle 60 Sekunden
export const revalidate = 60;

export default async function StatistikenPage() {
  const event = await getCurrentOrLatestEventLight();

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
