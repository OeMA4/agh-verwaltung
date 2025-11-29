import { MainLayout } from "@/components/layout";
import { StatistikenContent } from "./statistiken-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { getParticipantsByCity, getParticipantsByCountry, getRoleStats } from "@/lib/actions/participants";
import { redirect } from "next/navigation";

// Revalidiere alle 60 Sekunden
export const revalidate = 60;

export default async function StatistikenPage() {
  const event = await getCurrentOrLatestEventLight();

  if (!event) {
    redirect("/veranstaltung");
  }

  const [cityStats, countryStats, roleStats] = await Promise.all([
    getParticipantsByCity(event.id),
    getParticipantsByCountry(event.id),
    getRoleStats(event.id),
  ]);

  return (
    <MainLayout>
      <StatistikenContent
        event={event}
        cityStats={cityStats}
        countryStats={countryStats}
        roleStats={roleStats}
      />
    </MainLayout>
  );
}
