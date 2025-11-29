"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RoomCard } from "./room-card";
import { RoomDialog } from "./room-dialog";
import { deleteRoom } from "@/lib/actions/rooms";
import { toast } from "sonner";
import type { RoomWithParticipants, Room } from "@/types";
import { ChevronDown, ChevronRight, BedDouble, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomGridProps {
  rooms: RoomWithParticipants[];
  eventId: string;
  onRefresh: () => void;
}

interface RoomGroup {
  prefix: string;
  label: string;
  rooms: RoomWithParticipants[];
  occupancy: number;
  capacity: number;
}

function extractPrefix(roomName: string): string {
  // Extrahiere den Buchstaben-Präfix (z.B. "N" aus "N1", "S" aus "S12", etc.)
  const match = roomName.match(/^([A-Za-z]+)/);
  return match ? match[1].toUpperCase() : "Sonstige";
}

function getGroupLabel(prefix: string): string {
  const labels: Record<string, string> = {
    "N": "N-Zimmer (Nord)",
    "S": "S-Zimmer (Süd)",
    "O": "O-Zimmer (Ost)",
    "W": "W-Zimmer (West)",
    "EG": "Erdgeschoss",
    "OG": "Obergeschoss",
    "UG": "Untergeschoss",
  };
  return labels[prefix] || `${prefix}-Zimmer`;
}

export function RoomGrid({ rooms, eventId, onRefresh }: RoomGridProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string> | null>(null);

  // Gruppiere Zimmer nach Präfix
  const roomGroups = useMemo(() => {
    const groups: Record<string, RoomGroup> = {};

    rooms.forEach((room) => {
      const prefix = extractPrefix(room.name);

      if (!groups[prefix]) {
        groups[prefix] = {
          prefix,
          label: getGroupLabel(prefix),
          rooms: [],
          occupancy: 0,
          capacity: 0,
        };
      }

      groups[prefix].rooms.push(room);
      groups[prefix].occupancy += room.participants.length;
      groups[prefix].capacity += room.capacity;
    });

    // Sortiere Zimmer innerhalb jeder Gruppe
    Object.values(groups).forEach((group) => {
      group.rooms.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    });

    // Sortiere Gruppen alphabetisch
    return Object.values(groups).sort((a, b) => a.prefix.localeCompare(b.prefix));
  }, [rooms]);

  // Initialisiere alle Gruppen als ausgeklappt beim ersten Render (nur einmal)
  const actualExpandedGroups = useMemo(() => {
    if (expandedGroups === null) {
      return new Set(roomGroups.map((g) => g.prefix));
    }
    return expandedGroups;
  }, [expandedGroups, roomGroups]);

  const toggleGroup = (prefix: string) => {
    const current = actualExpandedGroups;
    const next = new Set(current);
    if (next.has(prefix)) {
      next.delete(prefix);
    } else {
      next.add(prefix);
    }
    setExpandedGroups(next);
  };

  const expandAll = () => {
    setExpandedGroups(new Set(roomGroups.map((g) => g.prefix)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Zimmer wirklich löschen? Alle Teilnehmer werden entfernt.")) {
      return;
    }

    try {
      await deleteRoom(id);
      toast.success("Zimmer gelöscht");
      onRefresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  };

  const totalOccupancy = rooms.reduce((sum, r) => sum + r.participants.length, 0);
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Zimmerübersicht</h2>
          <p className="text-sm text-muted-foreground">
            {rooms.length} Zimmer, {totalOccupancy}/{totalCapacity} Betten
          </p>
        </div>
        <div className="flex items-center gap-2">
          {roomGroups.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Alle aufklappen
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Alle zuklappen
              </Button>
            </div>
          )}
          <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
            <BedDouble className="mr-2 h-4 w-4 sm:hidden" />
            <span className="sm:hidden">Hinzufügen</span>
            <span className="hidden sm:inline">Zimmer hinzufügen</span>
          </Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <BedDouble className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground mb-4">Noch keine Zimmer angelegt.</p>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(true)}
            >
              Erstes Zimmer erstellen
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {roomGroups.map((group) => {
            const isExpanded = actualExpandedGroups.has(group.prefix);
            const isFull = group.occupancy >= group.capacity;

            return (
              <div key={group.prefix} className="rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.prefix)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 transition-colors",
                    "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
                    "hover:from-primary/15 hover:via-primary/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      isFull ? "bg-amber-500/15" : "bg-primary/15"
                    )}>
                      <BedDouble className={cn(
                        "h-5 w-5",
                        isFull ? "text-amber-600" : "text-primary"
                      )} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{group.label}</h3>
                      <p className="text-xs text-muted-foreground">
                        {group.rooms.length} Zimmer
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className={cn(
                        "font-medium",
                        isFull ? "text-amber-600" : "text-foreground"
                      )}>
                        {group.occupancy}/{group.capacity}
                      </span>
                    </div>
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isExpanded ? "bg-primary/10" : "bg-muted"
                    )}>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Group Content */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 bg-muted/20">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {group.rooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          onEdit={() => setEditingRoom(room)}
                          onDelete={() => handleDelete(room.id)}
                          onRefresh={onRefresh}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RoomDialog
        open={dialogOpen || !!editingRoom}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setEditingRoom(null);
          }
        }}
        room={editingRoom}
        eventId={eventId}
        onSuccess={() => {
          setDialogOpen(false);
          setEditingRoom(null);
          onRefresh();
        }}
      />
    </div>
  );
}
