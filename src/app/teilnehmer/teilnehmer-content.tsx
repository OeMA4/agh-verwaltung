"use client";

import { useState, useCallback } from "react";
import { ParticipantTable } from "@/components/participants";
import type { EventWithDetails } from "@/types";
import { getEventById } from "@/lib/actions/events";

interface TeilnehmerContentProps {
  event: EventWithDetails;
}

export function TeilnehmerContent({ event: initialEvent }: TeilnehmerContentProps) {
  const [event, setEvent] = useState(initialEvent);

  const handleRefresh = useCallback(async () => {
    const updated = await getEventById(event.id);
    if (updated) {
      setEvent(updated);
    }
  }, [event.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teilnehmer</h1>
        <p className="text-muted-foreground">
          {event.participants.length} Teilnehmer für {event.name}
        </p>
      </div>

      <ParticipantTable
        participants={event.participants}
        rooms={event.rooms}
        eventId={event.id}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
