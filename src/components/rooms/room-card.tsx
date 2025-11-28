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
import { MoreHorizontal, Pencil, Trash2, UserMinus, BedDouble, User, MapPin } from "lucide-react";
import type { RoomWithParticipants } from "@/types";
import { assignRoom } from "@/lib/actions/participants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoomCardProps {
  room: RoomWithParticipants;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const roleConfig = {
  REGULAR: {
    label: "T",
    fullLabel: "Teilnehmer",
    variant: "secondary" as const,
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  HELPER: {
    label: "H",
    fullLabel: "Helfer",
    variant: "default" as const,
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-600",
  },
  ABI: {
    label: "A",
    fullLabel: "Abi",
    variant: "outline" as const,
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-600",
  },
};

export function RoomCard({ room, onEdit, onDelete, onRefresh }: RoomCardProps) {
  const occupancy = room.participants.length;
  const percentage = (occupancy / room.capacity) * 100;
  const isFull = occupancy >= room.capacity;
  const isEmpty = occupancy === 0;

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
    <Card className={cn(
      "relative overflow-hidden",
      isFull && "ring-2 ring-amber-500/50"
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-60",
        isFull ? "from-amber-500/20 via-amber-500/10 to-transparent" :
        isEmpty ? "from-gray-400/10 via-gray-400/5 to-transparent" :
        "from-primary/15 via-primary/5 to-transparent"
      )} />
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              isFull ? "bg-amber-500/15" : "bg-primary/10"
            )}>
              <BedDouble className={cn(
                "h-5 w-5",
                isFull ? "text-amber-600" : "text-primary"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">{room.name}</CardTitle>
              {room.floor !== null && (
                <span className="text-xs text-muted-foreground">
                  Etage {room.floor}
                </span>
              )}
            </div>
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
      <CardContent className="space-y-4 relative">
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Teilnehmer ({room.participants.length})
              </p>
            </div>
            <div className="space-y-2">
              {room.participants.map((participant) => {
                const role = roleConfig[participant.role as keyof typeof roleConfig] || roleConfig.REGULAR;
                return (
                  <div
                    key={participant.id}
                    className="group flex items-center gap-3 rounded-xl bg-white/60 dark:bg-gray-800/40 border border-border/50 px-3 py-2.5 transition-all hover:shadow-md hover:border-primary/20"
                  >
                    {/* Avatar mit Initialen */}
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      role.bgColor,
                      role.textColor
                    )}>
                      {participant.firstName[0]}{participant.lastName[0]}
                    </div>

                    {/* Name und Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {participant.firstName} {participant.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={role.variant}
                          className="text-xs h-5 px-1.5"
                        >
                          {role.fullLabel}
                        </Badge>
                        {participant.city && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {participant.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Entfernen Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveFromRoom(participant.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-3 rounded-full bg-muted/50 mb-2">
              <User className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              Keine Teilnehmer zugewiesen
            </p>
          </div>
        )}

        {room.description && (
          <p className="text-xs text-muted-foreground">{room.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
