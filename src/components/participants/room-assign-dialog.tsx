"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { assignRoom } from "@/lib/actions/participants";
import { toast } from "sonner";
import type { ParticipantWithRoom, RoomWithParticipants } from "@/types";
import { Search, BedDouble, Users, ChevronDown, ChevronUp, X, Calendar, AlertTriangle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Participant } from "@prisma/client";

interface RoomAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ParticipantWithRoom | null;
  rooms: RoomWithParticipants[];
  onSuccess: () => void;
}

const roleLabels = {
  REGULAR: { label: "T", variant: "secondary" as const },
  HELPER: { label: "H", variant: "default" as const },
  ABI: { label: "A", variant: "outline" as const },
};

// Prüft ob sich zwei Zeiträume überschneiden
function periodsOverlap(
  start1: Date | null | undefined,
  end1: Date | null | undefined,
  start2: Date | null | undefined,
  end2: Date | null | undefined
): boolean {
  // Wenn keine Daten angegeben sind, gilt der gesamte Zeitraum (= immer Überschneidung)
  const s1 = start1 ? new Date(start1).getTime() : -Infinity;
  const e1 = end1 ? new Date(end1).getTime() : Infinity;
  const s2 = start2 ? new Date(start2).getTime() : -Infinity;
  const e2 = end2 ? new Date(end2).getTime() : Infinity;

  // Zwei Zeiträume überschneiden sich, wenn: start1 <= end2 AND start2 <= end1
  return s1 <= e2 && s2 <= e1;
}

// Berechnet die maximale gleichzeitige Belegung für einen bestimmten Zeitraum
function calculateMaxOccupancyDuringPeriod(
  roomParticipants: Participant[],
  newParticipantArrival: Date | null | undefined,
  newParticipantDeparture: Date | null | undefined
): number {
  // Filtere nur Teilnehmer, deren Aufenthalt sich mit dem neuen Teilnehmer überschneidet
  const overlappingParticipants = roomParticipants.filter((p) =>
    periodsOverlap(
      p.arrivalDate,
      p.departureDate,
      newParticipantArrival,
      newParticipantDeparture
    )
  );

  return overlappingParticipants.length;
}

// Formatiert das Datum im deutschen Format
function formatDateShort(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

export function RoomAssignDialog({
  open,
  onOpenChange,
  participant,
  rooms,
  onSuccess,
}: RoomAssignDialogProps) {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  // Berechne für jedes Zimmer, ob Teilnehmer aus derselben Stadt vorhanden sind
  const roomsWithCityMatch = useMemo(() => {
    const participantCity = participant?.city?.toLowerCase();

    return rooms.map((room) => {
      // Finde Teilnehmer aus derselben Stadt (exkl. der aktuelle Teilnehmer)
      const sameCityParticipants = participantCity
        ? room.participants.filter(
            (p) => p.id !== participant?.id && p.city?.toLowerCase() === participantCity
          )
        : [];

      return {
        ...room,
        hasCityMatch: sameCityParticipants.length > 0,
        sameCityCount: sameCityParticipants.length,
        sameCityNames: sameCityParticipants.map(p => `${p.firstName} ${p.lastName}`),
      };
    });
  }, [rooms, participant]);

  const filteredRooms = useMemo(() => {
    let filtered = roomsWithCityMatch;

    // Textsuche
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((room) =>
        room.name.toLowerCase().includes(searchLower) ||
        room.floor?.toString().includes(searchLower) ||
        room.participants.some(p =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchLower)
        )
      );
    }

    // Sortiere: Stadt-Match zuerst, dann nach Name
    return filtered.sort((a, b) => {
      // Zuerst nach Stadt-Match sortieren (Match = vorne)
      if (a.hasCityMatch && !b.hasCityMatch) return -1;
      if (!a.hasCityMatch && b.hasCityMatch) return 1;
      // Bei gleichem Stadt-Status nach Anzahl der Matches
      if (a.hasCityMatch && b.hasCityMatch) {
        if (a.sameCityCount !== b.sameCityCount) {
          return b.sameCityCount - a.sameCityCount;
        }
      }
      // Dann alphabetisch nach Name
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  }, [roomsWithCityMatch, search]);

  const handleAssign = async (roomId: string | null) => {
    if (!participant) return;
    setLoading(true);

    try {
      await assignRoom(participant.id, roomId);
      toast.success(
        roomId ? "Zimmer zugewiesen" : "Aus Zimmer entfernt"
      );
      onSuccess();
    } catch {
      toast.error("Fehler beim Zuweisen");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearch("");
      setExpandedRoom(null);
    }
    onOpenChange(open);
  };

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <TooltipProvider delayDuration={300}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <BedDouble className="h-5 w-5 text-primary" />
            </div>
            Zimmer zuweisen
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            für {participant.firstName} {participant.lastName}
          </p>
          {/* Aufenthaltszeitraum-Hinweis */}
          {(participant.arrivalDate || participant.departureDate) && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                Aufenthalt: {formatDateShort(participant.arrivalDate) || "Beginn"} - {formatDateShort(participant.departureDate) || "Ende"}
              </span>
            </div>
          )}
        </DialogHeader>

        {/* Suchfeld */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Zimmer oder Teilnehmer suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {/* Kein Zimmer Option */}
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between h-auto py-3",
              !participant.roomId && "ring-2 ring-primary bg-primary/5"
            )}
            onClick={() => handleAssign(null)}
            disabled={loading || !participant.roomId}
          >
            <span className="flex items-center gap-2">
              <X className="h-4 w-4 text-muted-foreground" />
              Kein Zimmer
            </span>
            {!participant.roomId && (
              <Badge variant="default" className="bg-primary">Aktuell</Badge>
            )}
          </Button>

          {/* Zimmer Liste */}
          {filteredRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Zimmer gefunden
            </p>
          ) : (
            filteredRooms.map((room) => {
              const totalOccupancy = room.participants.length;

              // Berechne die Belegung während des Aufenthalts des neuen Teilnehmers
              // Filtere den aktuellen Teilnehmer aus der Liste (falls er bereits in diesem Zimmer ist)
              const otherParticipants = room.participants.filter(p => p.id !== participant.id);
              const overlappingOccupancy = calculateMaxOccupancyDuringPeriod(
                otherParticipants,
                participant.arrivalDate,
                participant.departureDate
              );

              // Zimmer ist voll, wenn die überschneidende Belegung + 1 (neuer Teilnehmer) > Kapazität
              const wouldExceedCapacity = overlappingOccupancy + 1 > room.capacity;
              const isCurrentRoom = participant.roomId === room.id;
              const isExpanded = expandedRoom === room.id;
              const hasParticipants = room.participants.length > 0;

              // Zeige freie Plätze während des Aufenthalts
              const availableDuringStay = room.capacity - overlappingOccupancy;

              return (
                <div key={room.id} className="space-y-1">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-3 transition-all",
                      isCurrentRoom && "ring-2 ring-primary bg-primary/5 border-primary/20",
                      room.hasCityMatch && !isCurrentRoom && !wouldExceedCapacity && "border-blue-300 bg-blue-50/50",
                      wouldExceedCapacity && !isCurrentRoom && "opacity-60",
                      !wouldExceedCapacity && !isCurrentRoom && "hover:bg-muted/50 cursor-pointer"
                    )}
                  >
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start h-auto p-0 hover:bg-transparent"
                      onClick={() => handleAssign(room.id)}
                      disabled={loading || (wouldExceedCapacity && !isCurrentRoom)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          wouldExceedCapacity ? "bg-amber-500/15" : "bg-primary/10"
                        )}>
                          <BedDouble className={cn(
                            "h-4 w-4",
                            wouldExceedCapacity ? "text-amber-600" : "text-primary"
                          )} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{room.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {totalOccupancy}/{room.capacity} gesamt
                            {room.floor !== null && ` · Etage ${room.floor}`}
                          </p>
                          {/* Zeige verfügbare Plätze während des Aufenthalts */}
                          {(participant.arrivalDate || participant.departureDate) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className={cn(
                                  "text-xs flex items-center gap-1 mt-0.5 cursor-help",
                                  availableDuringStay > 0 ? "text-green-600" : "text-amber-600"
                                )}>
                                  <Calendar className="h-3 w-3" />
                                  {availableDuringStay > 0
                                    ? `${availableDuringStay} frei im Zeitraum`
                                    : "Keine Plätze im Zeitraum"}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[280px]">
                                <p>
                                  {availableDuringStay > 0
                                    ? `Während des Aufenthalts (${formatDateShort(participant.arrivalDate) || "Beginn"} - ${formatDateShort(participant.departureDate) || "Ende"}) sind ${availableDuringStay} von ${room.capacity} Plätzen verfügbar.`
                                    : `Alle ${room.capacity} Plätze sind während des Aufenthalts (${formatDateShort(participant.arrivalDate) || "Beginn"} - ${formatDateShort(participant.departureDate) || "Ende"}) bereits belegt.`}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {/* Stadt-Match Anzeige */}
                          {room.hasCityMatch && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs flex items-center gap-1 mt-0.5 text-blue-600 cursor-help">
                                  <MapPin className="h-3 w-3" />
                                  {room.sameCityCount} aus {participant.city}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-[280px]">
                                <p className="font-medium mb-1">Teilnehmer aus derselben Stadt:</p>
                                <ul className="text-xs space-y-0.5">
                                  {room.sameCityNames.map((name, i) => (
                                    <li key={i}>• {name}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </Button>

                    <div className="flex items-center gap-2">
                      {room.hasCityMatch && !wouldExceedCapacity && !isCurrentRoom && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 flex items-center gap-1 cursor-help">
                              <MapPin className="h-3 w-3" />
                              Empfohlen
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[250px]">
                            <p>In diesem Zimmer sind bereits {room.sameCityCount} Teilnehmer aus {participant.city}.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {wouldExceedCapacity && !isCurrentRoom && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 flex items-center gap-1 cursor-help">
                              <AlertTriangle className="h-3 w-3" />
                              Belegt
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[250px]">
                            <p>Dieses Zimmer hat keine freien Plätze während des Aufenthaltszeitraums dieses Teilnehmers.</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {isCurrentRoom && (
                        <Badge variant="default" className="bg-primary">Aktuell</Badge>
                      )}

                      {hasParticipants && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => toggleExpand(room.id, e)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Teilnehmer im Zimmer */}
                  {isExpanded && hasParticipants && (
                    <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-1 py-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Aktuelle Belegung:
                      </p>
                      {room.participants.map((p) => {
                        const stayOverlaps = periodsOverlap(
                          p.arrivalDate,
                          p.departureDate,
                          participant.arrivalDate,
                          participant.departureDate
                        );
                        const arrStr = formatDateShort(p.arrivalDate);
                        const depStr = formatDateShort(p.departureDate);
                        const stayStr = arrStr && depStr ? `${arrStr} - ${depStr}` :
                          arrStr ? `ab ${arrStr}` :
                          depStr ? `bis ${depStr}` : null;

                        return (
                          <div
                            key={p.id}
                            className={cn(
                              "flex items-center gap-2 text-sm rounded-lg px-3 py-2",
                              stayOverlaps ? "bg-amber-50 border border-amber-200" : "bg-muted/50"
                            )}
                          >
                            <Badge
                              variant={roleLabels[p.role as keyof typeof roleLabels].variant}
                              className="h-5 w-5 p-0 justify-center text-xs"
                            >
                              {roleLabels[p.role as keyof typeof roleLabels].label}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium">
                                {p.firstName} {p.lastName}
                              </span>
                              {stayStr && (
                                <span className={cn(
                                  "text-xs ml-2",
                                  stayOverlaps ? "text-amber-700" : "text-muted-foreground"
                                )}>
                                  · {stayStr}
                                </span>
                              )}
                            </div>
                            {stayOverlaps && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  <p>Aufenthalt überschneidet sich mit dem neuen Teilnehmer</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
