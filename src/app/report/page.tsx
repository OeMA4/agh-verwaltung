import { MainLayout } from "@/components/layout";
import { ReportContent } from "./report-content";
import { getCurrentOrLatestEvent } from "@/lib/actions/events";
import { getDailyReport } from "@/lib/actions/reports";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const event = await getCurrentOrLatestEvent();

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
