"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RoomCard } from "./room-card";
import { RoomDialog } from "./room-dialog";
import { deleteRoom } from "@/lib/actions/rooms";
import { toast } from "sonner";
import type { RoomWithParticipants, Room } from "@/types";

interface RoomGridProps {
  rooms: RoomWithParticipants[];
  eventId: string;
  onRefresh: () => void;
}

export function RoomGrid({ rooms, eventId, onRefresh }: RoomGridProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Zimmerübersicht</h2>
          <p className="text-sm text-muted-foreground">
            {rooms.length} Zimmer,{" "}
            {rooms.reduce((sum, r) => sum + r.participants.length, 0)}/
            {rooms.reduce((sum, r) => sum + r.capacity, 0)} Betten belegt
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Zimmer hinzufügen</Button>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Noch keine Zimmer angelegt.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setDialogOpen(true)}
          >
            Erstes Zimmer erstellen
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={() => setEditingRoom(room)}
              onDelete={() => handleDelete(room.id)}
              onRefresh={onRefresh}
            />
          ))}
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
