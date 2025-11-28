"use client";

import { useState, useCallback, Fragment } from "react";
import { RoomGrid } from "@/components/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRooms, useReport, useInvalidateEventData } from "@/lib/hooks/use-event-data";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Printer, CalendarIcon, ChevronLeft, ChevronRight, BedDouble, Loader2 } from "lucide-react";

interface ZimmerContentProps {
  eventId: string;
}

export function ZimmerContent({ eventId }: ZimmerContentProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPrintView, setShowPrintView] = useState(false);

  const { data: rooms = [], isLoading: loading } = useRooms(eventId);
  const { data: report, isLoading: loadingReport } = useReport(eventId, selectedDate);
  const { invalidateRooms } = useInvalidateEventData(eventId);

  const handleRefresh = useCallback(() => {
    invalidateRooms();
  }, [invalidateRooms]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowPrintView(true);
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
    setShowPrintView(true);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
    setShowPrintView(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // Gruppiere Zimmer nach Präfix
  const groupedRooms = report?.rooms.reduce((acc, room) => {
    const prefix = room.name.match(/^(\d)/)?.[1] || room.name.charAt(0);
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(room);
    return acc;
  }, {} as Record<string, typeof report.rooms>) || {};

  const sortedGroups = Object.entries(groupedRooms).sort(([a], [b]) =>
    a.localeCompare(b, "de", { numeric: true })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Datum-Auswahl für Druck */}
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold">Zimmerübersicht</h1>

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
          <Button onClick={handlePrint} disabled={!report || loadingReport}>
            <Printer className="mr-2 h-4 w-4" />
            Tagesbelegung drucken
          </Button>
        </div>
      </div>

      {/* Normale Zimmer-Grid Ansicht (nur auf Screen) */}
      <div className="print:hidden">
        <RoomGrid
          rooms={rooms}
          eventId={eventId}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Druck-Ansicht (nur beim Drucken sichtbar) */}
      {report && (
        <div id="print-content" className="hidden print:block">
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Zimmerbelegung - {format(report.date, "EEEE, d. MMMM yyyy", { locale: de })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {report.presentParticipants.length} Teilnehmer anwesend
            </p>
          </div>

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
                {sortedGroups.map(([groupKey, rooms]) => (
                  <Fragment key={groupKey}>
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
                            <span>
                              {room.participants.map((p, i) => (
                                <span key={p.id}>
                                  {p.firstName} {p.lastName}
                                  {i < room.participants.length - 1 && ", "}
                                </span>
                              ))}
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          {room.participants.length}/{room.capacity}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-4 text-sm">
            <span>{report.rooms.filter(r => r.participants.length > 0).length} belegte Zimmer</span>
            <span>{report.rooms.filter(r => r.participants.length === 0).length} leere Zimmer</span>
            <span>{report.rooms.filter(r => r.participants.length >= r.capacity).length} volle Zimmer</span>
          </div>
        </div>
      )}

      {/* Vorschau-Bereich auf dem Bildschirm */}
      {showPrintView && report && (
        <div className="print:hidden border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" />
              Druckvorschau: {format(report.date, "EEEE, d. MMMM yyyy", { locale: de })}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPrintView(false)}>
              Ausblenden
            </Button>
          </div>

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
                {sortedGroups.map(([groupKey, rooms]) => (
                  <Fragment key={groupKey}>
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
                            <span>
                              {room.participants.map((p, i) => (
                                <span key={p.id}>
                                  {p.firstName} {p.lastName}
                                  {i < room.participants.length - 1 && ", "}
                                </span>
                              ))}
                            </span>
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

          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
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
      )}

      {/* Druckstyles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content {
            display: block !important;
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          #print-content * {
            visibility: visible !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            font-size: 11px;
          }
          /* Tailwind hidden überschreiben für Print */
          .hidden.print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
