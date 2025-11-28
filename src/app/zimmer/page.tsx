import { MainLayout } from "@/components/layout";
import { ZimmerContent } from "./zimmer-content";
import { getCurrentOrLatestEvent } from "@/lib/actions/events";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ZimmerPage() {
  const event = await getCurrentOrLatestEvent();

  if (!event) {
    redirect("/veranstaltung");
  }

  return (
    <MainLayout>
      <ZimmerContent event={event} />
    </MainLayout>
  );
}
