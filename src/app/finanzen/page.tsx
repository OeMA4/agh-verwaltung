import { MainLayout } from "@/components/layout";
import { FinanzenContent } from "./finanzen-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { getFinanceStats } from "@/lib/actions/participants";
import { redirect } from "next/navigation";

// Revalidiere alle 60 Sekunden
export const dynamic = "force-dynamic";

export default async function FinanzenPage() {
  const event = await getCurrentOrLatestEventLight();

  if (!event) {
    redirect("/veranstaltung");
  }

  const financeStats = await getFinanceStats(event.id);

  return (
    <MainLayout>
      <FinanzenContent event={event} stats={financeStats} />
    </MainLayout>
  );
}
