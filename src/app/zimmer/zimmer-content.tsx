"use client";

import { useState, useCallback } from "react";
import { RoomGrid } from "@/components/rooms";
import type { EventWithDetails } from "@/types";
import { getEventById } from "@/lib/actions/events";

interface ZimmerContentProps {
  event: EventWithDetails;
}

export function ZimmerContent({ event: initialEvent }: ZimmerContentProps) {
  const [event, setEvent] = useState(initialEvent);

  const handleRefresh = useCallback(async () => {
    const updated = await getEventById(event.id);
    if (updated) {
      setEvent(updated);
    }
  }, [event.id]);

  return (
    <div className="space-y-6">
      <RoomGrid
        rooms={event.rooms}
        eventId={event.id}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
