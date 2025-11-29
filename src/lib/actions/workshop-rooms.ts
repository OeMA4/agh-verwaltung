"use server";

import prisma from "@/lib/db";
import type { WorkshopRoom } from "@/types";

// Alle Workshop-Räume für ein Event abrufen
export async function getWorkshopRooms(eventId: string): Promise<WorkshopRoom[]> {
  return prisma.workshopRoom.findMany({
    where: { eventId },
    orderBy: { name: "asc" },
  });
}

// Verfügbare Workshop-Räume (nicht bereits einem Workshop zugewiesen)
export async function getAvailableWorkshopRooms(
  eventId: string,
  excludeWorkshopId?: string
): Promise<WorkshopRoom[]> {
  return prisma.workshopRoom.findMany({
    where: {
      eventId,
      OR: [
        { workshop: null },
        // Wenn wir einen Workshop bearbeiten, schließe seinen aktuellen Raum nicht aus
        excludeWorkshopId ? { workshop: { id: excludeWorkshopId } } : {},
      ],
    },
    orderBy: { name: "asc" },
  });
}

// Workshop-Raum erstellen
export async function createWorkshopRoom(data: {
  name: string;
  description?: string;
  capacity?: number;
  eventId: string;
}): Promise<WorkshopRoom> {
  return prisma.workshopRoom.create({
    data: {
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      eventId: data.eventId,
    },
  });
}

// Workshop-Raum aktualisieren
export async function updateWorkshopRoom(
  id: string,
  data: {
    name?: string;
    description?: string;
    capacity?: number;
  }
): Promise<WorkshopRoom> {
  return prisma.workshopRoom.update({
    where: { id },
    data,
  });
}

// Workshop-Raum löschen
export async function deleteWorkshopRoom(id: string): Promise<void> {
  await prisma.workshopRoom.delete({ where: { id } });
}

// Seed Workshop-Räume WS1-WS9
export async function seedWorkshopRooms(eventId: string): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= 9; i++) {
    const name = `WS${i}`;
    try {
      await prisma.workshopRoom.create({
        data: {
          name,
          description: `Workshop-Raum ${i}`,
          eventId,
        },
      });
      created++;
    } catch {
      // Already exists
      skipped++;
    }
  }

  return { created, skipped };
}
