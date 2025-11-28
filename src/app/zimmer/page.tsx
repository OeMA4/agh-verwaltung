import { MainLayout } from "@/components/layout";
import { ZimmerContent } from "./zimmer-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { redirect } from "next/navigation";

// Seite wird gecacht, Daten werden clientseitig geladen
export const revalidate = 60;

export default async function ZimmerPage() {
  const event = await getCurrentOrLatestEventLight();

  if (!event) {
    redirect("/veranstaltung");
  }

  return (
    <MainLayout>
      <ZimmerContent eventId={event.id} />
    </MainLayout>
  );
}
