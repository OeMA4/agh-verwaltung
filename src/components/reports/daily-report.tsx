"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import type { DailyReport } from "@/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DailyReportViewProps {
  report: DailyReport;
}

const roleLabels = {
  REGULAR: { label: "T", variant: "secondary" as const },
  HELPER: { label: "H", variant: "default" as const },
  ABI: { label: "A", variant: "outline" as const },
};

export function DailyReportView({ report }: DailyReportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold">
            Tagesreport{" "}
            {format(report.date, "EEEE, d. MMMM yyyy", { locale: de })}
          </h2>
          <p className="text-muted-foreground">
            {report.presentParticipants.length} Teilnehmer anwesend
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Drucken
        </Button>
      </div>

      {/* Ankünfte und Abreisen */}
      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-600">
              Ankünfte ({report.arrivals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.arrivals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Ankünfte heute
              </p>
            ) : (
              <div className="space-y-2">
                {report.arrivals.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {p.firstName} {p.lastName}
                    </span>
                    <Badge variant={roleLabels[p.role].variant}>
                      {roleLabels[p.role].label}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-600">
              Abreisen ({report.departures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.departures.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Abreisen heute
              </p>
            ) : (
              <div className="space-y-2">
                {report.departures.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {p.firstName} {p.lastName}
                    </span>
                    <Badge variant={roleLabels[p.role].variant}>
                      {roleLabels[p.role].label}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Zimmerübersicht */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Zimmerbelegung</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
          {report.rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{room.name}</CardTitle>
                  <Badge variant="outline">
                    {room.participants.length}/{room.capacity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {room.participants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Leer</p>
                ) : (
                  <div className="space-y-1">
                    {room.participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Badge
                          variant={roleLabels[p.role].variant}
                          className="h-5 w-5 p-0 justify-center text-xs"
                        >
                          {roleLabels[p.role].label}
                        </Badge>
                        <span>
                          {p.firstName} {p.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Druckstyles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .space-y-6,
          .space-y-6 * {
            visibility: visible;
          }
          .space-y-6 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
