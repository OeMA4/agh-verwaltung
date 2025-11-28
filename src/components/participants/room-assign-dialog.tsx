"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assignRoom } from "@/lib/actions/participants";
import { toast } from "sonner";
import type { ParticipantWithRoom, RoomWithParticipants } from "@/types";

interface RoomAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ParticipantWithRoom | null;
  rooms: RoomWithParticipants[];
  onSuccess: () => void;
}

export function RoomAssignDialog({
  open,
  onOpenChange,
  participant,
  rooms,
  onSuccess,
}: RoomAssignDialogProps) {
  const [loading, setLoading] = useState(false);

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

  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Zimmer zuweisen für {participant.firstName} {participant.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => handleAssign(null)}
            disabled={loading || !participant.roomId}
          >
            <span>Kein Zimmer</span>
            {!participant.roomId && (
              <Badge variant="secondary">Aktuell</Badge>
            )}
          </Button>
          {rooms.map((room) => {
            const occupancy = room.participants.length;
            const isFull = occupancy >= room.capacity;
            const isCurrentRoom = participant.roomId === room.id;

            return (
              <Button
                key={room.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleAssign(room.id)}
                disabled={loading || (isFull && !isCurrentRoom)}
              >
                <span className="flex items-center gap-2">
                  {room.name}
                  <span className="text-xs text-muted-foreground">
                    ({occupancy}/{room.capacity})
                  </span>
                </span>
                <div className="flex gap-1">
                  {isFull && !isCurrentRoom && (
                    <Badge variant="secondary">Voll</Badge>
                  )}
                  {isCurrentRoom && (
                    <Badge variant="default">Aktuell</Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
