"use client";

import { useCallback } from "react";
import { ParticipantTable } from "@/components/participants";
import { useParticipants, useRooms, useInvalidateEventData } from "@/lib/hooks/use-event-data";
import { Loader2 } from "lucide-react";

interface TeilnehmerContentProps {
  eventId: string;
  eventName: string;
}

export function TeilnehmerContent({ eventId, eventName }: TeilnehmerContentProps) {
  const { data: participants = [], isLoading: loadingParticipants } = useParticipants(eventId);
  const { data: rooms = [], isLoading: loadingRooms } = useRooms(eventId);
  const { invalidateAll } = useInvalidateEventData(eventId);

  const handleRefresh = useCallback(() => {
    invalidateAll();
  }, [invalidateAll]);

  if (loadingParticipants || loadingRooms) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teilnehmer</h1>
        <p className="text-muted-foreground">
          {participants.length} Teilnehmer für {eventName}
        </p>
      </div>

      <ParticipantTable
        participants={participants}
        rooms={rooms}
        eventId={eventId}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
