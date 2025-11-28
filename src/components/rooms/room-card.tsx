"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, UserMinus } from "lucide-react";
import type { RoomWithParticipants } from "@/types";
import { assignRoom } from "@/lib/actions/participants";
import { toast } from "sonner";

interface RoomCardProps {
  room: RoomWithParticipants;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const roleLabels = {
  REGULAR: { label: "T", variant: "secondary" as const },
  HELPER: { label: "H", variant: "default" as const },
  ABI: { label: "A", variant: "outline" as const },
};

export function RoomCard({ room, onEdit, onDelete, onRefresh }: RoomCardProps) {
  const occupancy = room.participants.length;
  const percentage = (occupancy / room.capacity) * 100;
  const isFull = occupancy >= room.capacity;

  const handleRemoveFromRoom = async (participantId: string) => {
    try {
      await assignRoom(participantId, null);
      toast.success("Teilnehmer aus Zimmer entfernt");
      onRefresh();
    } catch {
      toast.error("Fehler beim Entfernen");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{room.name}</CardTitle>
            {room.floor !== null && (
              <Badge variant="outline" className="text-xs">
                Etage {room.floor}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Belegung</span>
            <span className="font-medium">
              {occupancy}/{room.capacity}
            </span>
          </div>
          <Progress
            value={percentage}
            className={isFull ? "[&>div]:bg-orange-500" : ""}
          />
        </div>

        {room.participants.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Teilnehmer
            </p>
            <div className="space-y-1">
              {room.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={roleLabels[participant.role].variant}
                      className="h-5 w-5 p-0 justify-center text-xs"
                    >
                      {roleLabels[participant.role].label}
                    </Badge>
                    <span className="text-sm">
                      {participant.firstName} {participant.lastName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveFromRoom(participant.id)}
                  >
                    <UserMinus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Teilnehmer zugewiesen
          </p>
        )}

        {room.description && (
          <p className="text-xs text-muted-foreground">{room.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
