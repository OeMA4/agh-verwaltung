"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DailyReportView } from "@/components/reports";
import { getDailyReport } from "@/lib/actions/reports";
import type { Event, DailyReport } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface ReportContentProps {
  event: Event;
  initialReport: DailyReport;
}

export function ReportContent({ event, initialReport }: ReportContentProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    setLoading(true);
    try {
      const newReport = await getDailyReport(event.id, date);
      setReport(newReport);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    handleDateChange(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    handleDateChange(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tagesreport</h1>
          <p className="text-muted-foreground">{event.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="w-auto"
            />
          </div>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      ) : (
        <DailyReportView report={report} />
      )}
    </div>
  );
}
