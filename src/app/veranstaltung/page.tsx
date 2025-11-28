import { MainLayout } from "@/components/layout";
import { VeranstaltungContent } from "./veranstaltung-content";
import { getEvents, getCurrentOrLatestEvent } from "@/lib/actions/events";

export const dynamic = "force-dynamic";

export default async function VeranstaltungPage() {
  const [events, currentEvent] = await Promise.all([
    getEvents(),
    getCurrentOrLatestEvent(),
  ]);

  return (
    <MainLayout>
      <VeranstaltungContent events={events} currentEvent={currentEvent} />
    </MainLayout>
  );
}
