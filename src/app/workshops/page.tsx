import { MainLayout } from "@/components/layout";
import { WorkshopsContent } from "./workshops-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { getWorkshops } from "@/lib/actions/workshops";
import { getParticipants } from "@/lib/actions/participants";
import { getWorkshopRooms } from "@/lib/actions/workshop-rooms";
import { redirect } from "next/navigation";

// Dynamisch rendern für sofortige Updates
export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const event = await getCurrentOrLatestEventLight();

  if (!event) {
    redirect("/veranstaltung");
  }

  const [workshops, participants, workshopRooms] = await Promise.all([
    getWorkshops(event.id),
    getParticipants(event.id),
    getWorkshopRooms(event.id),
  ]);

  // Filter ABIs for leader selection
  const abis = participants.filter((p) => p.role === "ABI");

  return (
    <MainLayout>
      <WorkshopsContent
        event={event}
        workshops={workshops}
        allParticipants={participants}
        abis={abis}
        workshopRooms={workshopRooms}
      />
    </MainLayout>
  );
}
