import { MainLayout } from "@/components/layout";
import { VeranstaltungContent } from "./veranstaltung-content";
import { getEvents, getCurrentOrLatestEventLight } from "@/lib/actions/events";

// Revalidiere alle 60 Sekunden
export const revalidate = 60;

export default async function VeranstaltungPage() {
  const [events, currentEvent] = await Promise.all([
    getEvents(),
    getCurrentOrLatestEventLight(),
  ]);

  return (
    <MainLayout>
      <VeranstaltungContent events={events} currentEvent={currentEvent} />
    </MainLayout>
  );
}
