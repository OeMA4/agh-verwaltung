"use client";

import { useState, useCallback, useEffect } from "react";
import { ParticipantTable } from "@/components/participants";
import type { ParticipantWithRoom, RoomWithParticipants } from "@/types";
import { getParticipantsForEvent, getRoomsForEvent } from "@/lib/actions/events";
import { Loader2 } from "lucide-react";

interface TeilnehmerContentProps {
  eventId: string;
  eventName: string;
}

export function TeilnehmerContent({ eventId, eventName }: TeilnehmerContentProps) {
  const [participants, setParticipants] = useState<ParticipantWithRoom[]>([]);
  const [rooms, setRooms] = useState<RoomWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [p, r] = await Promise.all([
      getParticipantsForEvent(eventId),
      getRoomsForEvent(eventId),
    ]);
    setParticipants(p);
    setRooms(r);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  if (loading) {
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
