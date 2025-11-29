"use server";

import prisma from "@/lib/db";
import type { Workshop, WorkshopWithDetails } from "@/types";

// Alle Workshops für ein Event abrufen
export async function getWorkshops(eventId: string): Promise<WorkshopWithDetails[]> {
  return prisma.workshop.findMany({
    where: { eventId },
    include: {
      workshopRoom: true,
      leaders: {
        include: { participant: true },
      },
      participants: {
        include: { participant: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

// Einzelnen Workshop abrufen
export async function getWorkshopById(id: string): Promise<WorkshopWithDetails | null> {
  return prisma.workshop.findUnique({
    where: { id },
    include: {
      workshopRoom: true,
      leaders: {
        include: { participant: true },
      },
      participants: {
        include: { participant: true },
      },
    },
  });
}

// Workshop erstellen
export async function createWorkshop(data: {
  name: string;
  description?: string;
  maxParticipants?: number;
  workshopRoomId?: string;
  eventId: string;
}): Promise<Workshop> {
  return prisma.workshop.create({
    data: {
      name: data.name,
      description: data.description,
      maxParticipants: data.maxParticipants || 30,
      workshopRoomId: data.workshopRoomId || null,
      eventId: data.eventId,
    },
  });
}

// Workshop aktualisieren
export async function updateWorkshop(
  id: string,
  data: {
    name?: string;
    description?: string;
    maxParticipants?: number;
    workshopRoomId?: string | null;
  }
): Promise<Workshop> {
  return prisma.workshop.update({
    where: { id },
    data,
  });
}

// Workshop löschen
export async function deleteWorkshop(id: string): Promise<void> {
  await prisma.workshop.delete({ where: { id } });
}

// Betreuer (ABI) zum Workshop hinzufügen
export async function addWorkshopLeader(
  workshopId: string,
  participantId: string
) {
  return prisma.workshopLeader.create({
    data: {
      workshopId,
      participantId,
    },
  });
}

// Betreuer vom Workshop entfernen
export async function removeWorkshopLeader(
  workshopId: string,
  participantId: string
): Promise<void> {
  await prisma.workshopLeader.deleteMany({
    where: {
      workshopId,
      participantId,
    },
  });
}

// Teilnehmer zum Workshop hinzufügen
export async function addWorkshopParticipant(
  workshopId: string,
  participantId: string
) {
  return prisma.workshopParticipant.create({
    data: {
      workshopId,
      participantId,
    },
  });
}

// Teilnehmer vom Workshop entfernen
export async function removeWorkshopParticipant(
  workshopId: string,
  participantId: string
): Promise<void> {
  await prisma.workshopParticipant.deleteMany({
    where: {
      workshopId,
      participantId,
    },
  });
}

// Teilnehmer als Betreuer des ABIs markieren/entmarkieren
export async function toggleWorkshopParticipantHelper(
  workshopId: string,
  participantId: string,
  isHelper: boolean
) {
  return prisma.workshopParticipant.updateMany({
    where: {
      workshopId,
      participantId,
    },
    data: {
      isHelper,
    },
  });
}

// Mehrere Teilnehmer gleichzeitig hinzufügen
export async function addMultipleWorkshopParticipants(
  workshopId: string,
  participantIds: string[]
): Promise<{ added: number; skipped: number }> {
  let added = 0;
  let skipped = 0;

  for (const participantId of participantIds) {
    try {
      await prisma.workshopParticipant.create({
        data: {
          workshopId,
          participantId,
        },
      });
      added++;
    } catch {
      // Already exists or other error
      skipped++;
    }
  }

  return { added, skipped };
}

// Alle verfügbaren ABIs für einen Workshop abrufen (die noch nicht Betreuer sind)
export async function getAvailableLeaders(eventId: string, workshopId: string) {
  const existingLeaders = await prisma.workshopLeader.findMany({
    where: { workshopId },
    select: { participantId: true },
  });

  const existingLeaderIds = existingLeaders.map((l) => l.participantId);

  return prisma.participant.findMany({
    where: {
      eventId,
      role: "ABI",
      id: { notIn: existingLeaderIds },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

// Alle verfügbaren Teilnehmer für einen Workshop abrufen (die noch nicht teilnehmen)
export async function getAvailableParticipants(eventId: string, workshopId: string) {
  const existingParticipants = await prisma.workshopParticipant.findMany({
    where: { workshopId },
    select: { participantId: true },
  });

  const existingIds = existingParticipants.map((p) => p.participantId);

  return prisma.participant.findMany({
    where: {
      eventId,
      id: { notIn: existingIds },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

// Workshop-Statistiken
export async function getWorkshopStats(eventId: string) {
  const workshops = await prisma.workshop.findMany({
    where: { eventId },
    include: {
      _count: {
        select: {
          leaders: true,
          participants: true,
        },
      },
    },
  });

  const totalWorkshops = workshops.length;
  const totalParticipants = workshops.reduce((sum, w) => sum + w._count.participants, 0);
  const totalLeaders = workshops.reduce((sum, w) => sum + w._count.leaders, 0);

  return {
    totalWorkshops,
    totalParticipants,
    totalLeaders,
    workshops: workshops.map((w) => ({
      id: w.id,
      name: w.name,
      leaderCount: w._count.leaders,
      participantCount: w._count.participants,
      maxParticipants: w.maxParticipants,
      isFull: w._count.participants >= w.maxParticipants,
    })),
  };
}
