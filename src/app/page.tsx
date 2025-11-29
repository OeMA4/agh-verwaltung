import { MainLayout } from "@/components/layout";
import { DashboardContent } from "./dashboard-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { getEventStatistics } from "@/lib/actions/reports";

// Revalidiere alle 60 Sekunden statt bei jedem Request
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const event = await getCurrentOrLatestEventLight();

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
