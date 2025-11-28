import { MainLayout } from "@/components/layout";
import { TeilnehmerContent } from "./teilnehmer-content";
import { getCurrentOrLatestEvent } from "@/lib/actions/events";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeilnehmerPage() {
  const event = await getCurrentOrLatestEvent();

  if (!event) {
    redirect("/veranstaltung");
  }

  return (
    <MainLayout>
      <TeilnehmerContent event={event} />
    </MainLayout>
  );
}
