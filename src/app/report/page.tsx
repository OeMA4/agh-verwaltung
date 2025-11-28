import { MainLayout } from "@/components/layout";
import { ReportContent } from "./report-content";
import { getCurrentOrLatestEventLight } from "@/lib/actions/events";
import { getDailyReport } from "@/lib/actions/reports";
import { redirect } from "next/navigation";

// Revalidiere alle 60 Sekunden
export const revalidate = 60;

export default async function ReportPage() {
  const event = await getCurrentOrLatestEventLight();

  if (!event) {
    redirect("/veranstaltung");
  }

  const today = new Date();
  const report = await getDailyReport(event.id, today);

  return (
    <MainLayout>
      <ReportContent event={event} initialReport={report} />
    </MainLayout>
  );
}
