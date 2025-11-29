import { MainLayout } from "@/components/layout";
import { WorkshopsContent } from "./workshops-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { getWorkshops } from "@/lib/actions/workshops";
import { getParticipants } from "@/lib/actions/participants";
import { getRooms } from "@/lib/actions/rooms";
import { redirect } from "next/navigation";

// Revalidiere alle 60 Sekunden
export const revalidate = 60;

export default async function WorkshopsPage() {
  const event = await getCurrentOrLatestEventLight();

  if (!event) {
    redirect("/veranstaltung");
  }

  const [workshops, participants, rooms] = await Promise.all([
    getWorkshops(event.id),
    getParticipants(event.id),
    getRooms(event.id),
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
        rooms={rooms}
      />
    </MainLayout>
  );
}
