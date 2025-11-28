"use server";

import prisma from "@/lib/db";
import type { Event } from "@/types";

export async function getEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    orderBy: { year: "desc" },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      participants: {
        include: { room: true },
        orderBy: { lastName: "asc" },
      },
      rooms: {
        include: { participants: true },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function getEventByYear(year: number) {
  return prisma.event.findUnique({
    where: { year },
    include: {
      participants: {
        include: { room: true },
        orderBy: { lastName: "asc" },
      },
      rooms: {
        include: { participants: true },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function createEvent(data: {
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  location: string;
}): Promise<Event> {
  return prisma.event.create({ data });
}

export async function updateEvent(
  id: string,
  data: Partial<{
    name: string;
    year: number;
    startDate: Date;
    endDate: Date;
    location: string;
  }>
): Promise<Event> {
  return prisma.event.update({
    where: { id },
    data,
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await prisma.event.delete({ where: { id } });
}

// Light version - nur Event-Basisdaten ohne Relationen (schnell)
export async function getCurrentOrLatestEventLight() {
  const now = new Date();
  const currentYear = now.getFullYear();

  let event = await prisma.event.findUnique({
    where: { year: currentYear },
  });

  if (!event) {
    event = await prisma.event.findFirst({
      orderBy: { year: "desc" },
    });
  }

  return event;
}

// Full version - mit allen Relationen (nur wenn nötig)
export async function getCurrentOrLatestEvent() {
  const now = new Date();
  const currentYear = now.getFullYear();

  let event = await prisma.event.findUnique({
    where: { year: currentYear },
    include: {
      participants: {
        include: { room: true },
        orderBy: { lastName: "asc" },
      },
      rooms: {
        include: { participants: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!event) {
    event = await prisma.event.findFirst({
      orderBy: { year: "desc" },
      include: {
        participants: {
          include: { room: true },
          orderBy: { lastName: "asc" },
        },
        rooms: {
          include: { participants: true },
          orderBy: { name: "asc" },
        },
      },
    });
  }

  return event;
}

// Teilnehmer für ein Event laden
export async function getParticipantsForEvent(eventId: string) {
  return prisma.participant.findMany({
    where: { eventId },
    include: { room: true },
    orderBy: { lastName: "asc" },
  });
}

// Zimmer für ein Event laden
export async function getRoomsForEvent(eventId: string) {
  return prisma.room.findMany({
    where: { eventId },
    include: { participants: true },
    orderBy: { name: "asc" },
  });
}
