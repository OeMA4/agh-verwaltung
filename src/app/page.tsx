import { MainLayout } from "@/components/layout";
import { DashboardContent } from "./dashboard-content";
import { getCurrentOrLatestEvent } from "@/lib/actions/events";
import { getEventStatistics } from "@/lib/actions/reports";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const event = await getCurrentOrLatestEvent();

  if (!event) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h1 className="text-2xl font-bold mb-2">Willkommen!</h1>
          <p className="text-muted-foreground mb-4">
            Erstellen Sie eine Veranstaltung, um zu beginnen.
          </p>
          <a
            href="/veranstaltung"
            className="text-primary underline underline-offset-4"
          >
            Zur Veranstaltungsverwaltung
          </a>
        </div>
      </MainLayout>
    );
  }

  const stats = await getEventStatistics(event.id);

  return (
    <MainLayout>
      <DashboardContent event={event} stats={stats} />
    </MainLayout>
  );
}
