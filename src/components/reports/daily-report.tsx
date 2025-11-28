"use client";

import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, BedDouble } from "lucide-react";
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

  // Gruppiere Zimmer nach Präfix (z.B. "1", "2", "3" für 101, 102, 201, etc.)
  const groupedRooms = report.rooms.reduce((acc, room) => {
    // Extrahiere den Präfix (erste Ziffer oder Buchstaben bis zur Zahl)
    const prefix = room.name.match(/^(\d)/)?.[1] || room.name.charAt(0);
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(room);
    return acc;
  }, {} as Record<string, typeof report.rooms>);

  const sortedGroups = Object.entries(groupedRooms).sort(([a], [b]) =>
    a.localeCompare(b, "de", { numeric: true })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold">
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

      {/* Kompakte Zimmerübersicht */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 print:text-base">
          <BedDouble className="h-5 w-5 text-primary print:h-4 print:w-4" />
          Zimmerbelegung
        </h3>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-2 px-3 font-medium w-24">Zimmer</th>
                <th className="text-left py-2 px-3 font-medium">Teilnehmer</th>
                <th className="text-center py-2 px-3 font-medium w-16">Belegt</th>
              </tr>
            </thead>
            <tbody>
              {sortedGroups.map(([prefix, rooms]) => (
                <Fragment key={prefix}>
                  {rooms.map((room) => (
                    <tr
                      key={room.id}
                      className={`border-t ${room.participants.length === 0 ? "text-muted-foreground" : ""}`}
                    >
                      <td className="py-1.5 px-3 font-medium">
                        {room.name}
                      </td>
                      <td className="py-1.5 px-3">
                        {room.participants.length === 0 ? (
                          <span className="text-muted-foreground italic">leer</span>
                        ) : (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                            {room.participants.map((p, i) => (
                              <span key={p.id} className="inline-flex items-center gap-1">
                                <span className={`text-xs font-medium px-1 rounded ${
                                  p.role === "HELPER" ? "bg-primary/20 text-primary" :
                                  p.role === "ABI" ? "bg-amber-100 text-amber-700" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {roleLabels[p.role as keyof typeof roleLabels]?.label || "T"}
                                </span>
                                <span>{p.firstName} {p.lastName}</span>
                                {i < room.participants.length - 1 && <span className="text-muted-foreground">,</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            room.participants.length >= room.capacity
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : room.participants.length === 0
                              ? "bg-muted text-muted-foreground"
                              : ""
                          }`}
                        >
                          {room.participants.length}/{room.capacity}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Zusammenfassung */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{report.rooms.filter(r => r.participants.length > 0).length}</span> belegte Zimmer
          </span>
          <span>
            <span className="font-medium text-foreground">{report.rooms.filter(r => r.participants.length === 0).length}</span> leere Zimmer
          </span>
          <span>
            <span className="font-medium text-foreground">{report.rooms.filter(r => r.participants.length >= r.capacity).length}</span> volle Zimmer
          </span>
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
          table {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
