"use server";

import prisma from "@/lib/db";

export async function getDailyReport(eventId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Alle Räume mit ihren Teilnehmern
  const rooms = await prisma.room.findMany({
    where: { eventId },
    include: {
      participants: {
        where: {
          OR: [
            // Entweder kein Ankunfts-/Abreisedatum gesetzt
            {
              AND: [{ arrivalDate: null }, { departureDate: null }],
            },
            // Oder Ankunft vor/am Tag und Abreise nach/am Tag
            {
              AND: [
                {
                  OR: [{ arrivalDate: null }, { arrivalDate: { lte: endOfDay } }],
                },
                {
                  OR: [
                    { departureDate: null },
                    { departureDate: { gte: startOfDay } },
                  ],
                },
              ],
            },
          ],
        },
        orderBy: { lastName: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Ankünfte an diesem Tag
  const arrivals = await prisma.participant.findMany({
    where: {
      eventId,
      arrivalDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { room: true },
    orderBy: { lastName: "asc" },
  });

  // Abreisen an diesem Tag
  const departures = await prisma.participant.findMany({
    where: {
      eventId,
      departureDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: { room: true },
    orderBy: { lastName: "asc" },
  });

  // Alle anwesenden Teilnehmer (mit Zimmer)
  const presentParticipants = await prisma.participant.findMany({
    where: {
      eventId,
      roomId: { not: null },
      OR: [
        {
          AND: [{ arrivalDate: null }, { departureDate: null }],
        },
        {
          AND: [
            {
              OR: [{ arrivalDate: null }, { arrivalDate: { lte: endOfDay } }],
            },
            {
              OR: [
                { departureDate: null },
                { departureDate: { gte: startOfDay } },
              ],
            },
          ],
        },
      ],
    },
    include: { room: true },
    orderBy: { lastName: "asc" },
  });

  return {
    date,
    rooms,
    presentParticipants,
    arrivals,
    departures,
  };
}

export async function getEventStatistics(eventId: string) {
  const [
    totalParticipants,
    checkedIn,
    paid,
    unpaid,
    helpers,
    abiGuests,
    rooms,
    participantsWithRooms,
  ] = await Promise.all([
    prisma.participant.count({ where: { eventId } }),
    prisma.participant.count({ where: { eventId, checkedIn: true } }),
    prisma.participant.count({ where: { eventId, hasPaid: true } }),
    prisma.participant.count({ where: { eventId, hasPaid: false } }),
    prisma.participant.count({ where: { eventId, role: "HELPER" } }),
    prisma.participant.count({ where: { eventId, role: "ABI" } }),
    prisma.room.findMany({
      where: { eventId },
      select: { capacity: true },
    }),
    prisma.participant.count({ where: { eventId, roomId: { not: null } } }),
  ]);

  const totalBeds = rooms.reduce((sum, room) => sum + room.capacity, 0);

  return {
    totalParticipants,
    checkedIn,
    paid,
    unpaid,
    rooms: rooms.length,
    occupiedBeds: participantsWithRooms,
    totalBeds,
    helpers,
    abiGuests,
  };
}
