"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ParticipantWithRoom, RoomWithParticipants, DailyReport } from "@/types";

// Participants für ein Event
export function useParticipants(eventId: string) {
  return useQuery<ParticipantWithRoom[]>({
    queryKey: ["participants", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/participants`);
      if (!res.ok) throw new Error("Failed to fetch participants");
      return res.json();
    },
    staleTime: 30 * 1000, // 30 Sekunden
  });
}

// Rooms für ein Event
export function useRooms(eventId: string) {
  return useQuery<RoomWithParticipants[]>({
    queryKey: ["rooms", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/rooms`);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

// Report für ein Datum
export function useReport(eventId: string, date: Date) {
  const dateStr = date.toISOString().split("T")[0];

  return useQuery<DailyReport>({
    queryKey: ["report", eventId, dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/report?date=${dateStr}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      return {
        ...data,
        date: new Date(data.date),
      };
    },
    staleTime: 60 * 1000, // 1 Minute
  });
}

// Hook zum Invalidieren der Caches nach Änderungen
export function useInvalidateEventData(eventId: string) {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["rooms", eventId] });
      queryClient.invalidateQueries({ queryKey: ["report", eventId] });
    },
    invalidateParticipants: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] });
    },
    invalidateRooms: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", eventId] });
    },
  };
}
