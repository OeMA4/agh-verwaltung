import { MainLayout } from "@/components/layout";
import { TeilnehmerContent } from "./teilnehmer-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { redirect } from "next/navigation";

// Dynamisch rendern für sofortige Updates
export const dynamic = "force-dynamic";

export default async function TeilnehmerPage() {
  const event = await getCurrentOrLatestEventLight();

  if (!event) {
    redirect("/veranstaltung");
  }

  return (
    <MainLayout>
      <TeilnehmerContent eventId={event.id} eventName={event.name} />
    </MainLayout>
  );
}
