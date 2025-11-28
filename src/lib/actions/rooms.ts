"use server";

import prisma from "@/lib/db";
import type { Room } from "@/types";

export async function getRooms(eventId: string) {
  return prisma.room.findMany({
    where: { eventId },
    include: {
      participants: {
        orderBy: { lastName: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getRoomById(id: string) {
  return prisma.room.findUnique({
    where: { id },
    include: {
      participants: {
        orderBy: { lastName: "asc" },
      },
    },
  });
}

export async function createRoom(data: {
  name: string;
  floor?: number;
  capacity: number;
  description?: string;
  eventId: string;
}): Promise<Room> {
  return prisma.room.create({ data });
}

export async function updateRoom(
  id: string,
  data: Partial<{
    name: string;
    floor: number | null;
    capacity: number;
    description: string | null;
  }>
): Promise<Room> {
  return prisma.room.update({
    where: { id },
    data,
  });
}

export async function deleteRoom(id: string): Promise<void> {
  // Zuerst alle Teilnehmer aus dem Zimmer entfernen
  await prisma.participant.updateMany({
    where: { roomId: id },
    data: { roomId: null },
  });
  // Dann das Zimmer löschen
  await prisma.room.delete({ where: { id } });
}

export async function getRoomOccupancy(eventId: string) {
  const rooms = await prisma.room.findMany({
    where: { eventId },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  });

  return rooms.map((room) => ({
    id: room.id,
    name: room.name,
    floor: room.floor,
    capacity: room.capacity,
    occupied: room._count.participants,
    available: room.capacity - room._count.participants,
    isFull: room._count.participants >= room.capacity,
  }));
}

export async function getAvailableRooms(eventId: string) {
  const rooms = await prisma.room.findMany({
    where: { eventId },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  });

  return rooms
    .filter((room) => room._count.participants < room.capacity)
    .map((room) => ({
      id: room.id,
      name: room.name,
      floor: room.floor,
      capacity: room.capacity,
      occupied: room._count.participants,
      available: room.capacity - room._count.participants,
    }));
}
