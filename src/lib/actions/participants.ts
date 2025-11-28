"use server";

import prisma from "@/lib/db";
import type { Participant, ParticipantRole } from "@/types";

export async function getParticipants(eventId: string) {
  return prisma.participant.findMany({
    where: { eventId },
    include: { room: true },
    orderBy: { lastName: "asc" },
  });
}

export async function getParticipantById(id: string) {
  return prisma.participant.findUnique({
    where: { id },
    include: { room: true, event: true },
  });
}

export async function createParticipant(data: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  notes?: string;
  role?: ParticipantRole;
  hasPaid?: boolean;
  paidAmount?: number;
  birthDate?: Date;
  arrivalDate?: Date;
  departureDate?: Date;
  eventId: string;
  roomId?: string;
}): Promise<Participant> {
  return prisma.participant.create({ data });
}

export async function updateParticipant(
  id: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    street: string | null;
    houseNumber: string | null;
    postalCode: string | null;
    city: string | null;
    notes: string | null;
    role: ParticipantRole;
    hasPaid: boolean;
    paidAmount: number | null;
    paidAt: Date | null;
    checkedIn: boolean;
    checkedInAt: Date | null;
    birthDate: Date | null;
    arrivalDate: Date | null;
    departureDate: Date | null;
    roomId: string | null;
  }>
): Promise<Participant> {
  return prisma.participant.update({
    where: { id },
    data,
  });
}

export async function deleteParticipant(id: string): Promise<void> {
  await prisma.participant.delete({ where: { id } });
}

export async function markAsPaid(
  id: string,
  amount?: number
): Promise<Participant> {
  return prisma.participant.update({
    where: { id },
    data: {
      hasPaid: true,
      paidAmount: amount,
      paidAt: new Date(),
    },
  });
}

export async function markAsUnpaid(id: string): Promise<Participant> {
  return prisma.participant.update({
    where: { id },
    data: {
      hasPaid: false,
      paidAmount: null,
      paidAt: null,
    },
  });
}

export async function checkIn(id: string): Promise<Participant> {
  return prisma.participant.update({
    where: { id },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
    },
  });
}

export async function checkOut(id: string): Promise<Participant> {
  return prisma.participant.update({
    where: { id },
    data: {
      checkedIn: false,
      checkedInAt: null,
    },
  });
}

export async function assignRoom(
  participantId: string,
  roomId: string | null
): Promise<Participant> {
  return prisma.participant.update({
    where: { id: participantId },
    data: { roomId },
  });
}

export async function moveToRoom(
  participantId: string,
  newRoomId: string
): Promise<Participant> {
  return prisma.participant.update({
    where: { id: participantId },
    data: { roomId: newRoomId },
  });
}

export async function getParticipantsByCity(eventId: string) {
  const participants = await prisma.participant.groupBy({
    by: ["city"],
    where: { eventId },
    _count: { city: true },
    orderBy: { _count: { city: "desc" } },
  });

  const total = await prisma.participant.count({ where: { eventId } });

  return participants.map((p) => ({
    city: p.city || "Unbekannt",
    count: p._count.city,
    percentage: total > 0 ? (p._count.city / total) * 100 : 0,
  }));
}

export async function getPaymentStats(eventId: string) {
  const [paid, unpaid, totalAmount] = await Promise.all([
    prisma.participant.count({ where: { eventId, hasPaid: true } }),
    prisma.participant.count({ where: { eventId, hasPaid: false } }),
    prisma.participant.aggregate({
      where: { eventId, hasPaid: true },
      _sum: { paidAmount: true },
    }),
  ]);

  return {
    paid,
    unpaid,
    totalAmount: totalAmount._sum.paidAmount || 0,
  };
}

export async function getRoleStats(eventId: string) {
  const [regular, helper, abi] = await Promise.all([
    prisma.participant.count({ where: { eventId, role: "REGULAR" } }),
    prisma.participant.count({ where: { eventId, role: "HELPER" } }),
    prisma.participant.count({ where: { eventId, role: "ABI" } }),
  ]);

  return { regular, helper, abi };
}

// Hilfsfunktion: Land aus PLZ und Stadt ableiten
function getCountryFromPostalCode(postalCode: string | null, city: string | null): string {
  if (!postalCode) return "Unbekannt";

  // Deutsche PLZ: 5-stellig, nur Zahlen
  if (/^\d{5}$/.test(postalCode)) {
    // Türkische Städte haben auch 5-stellige PLZ
    if (city === "Istanbul" || city === "Ankara" || city === "Izmir") return "Türkei";
    return "Deutschland";
  }
  // Niederländische PLZ: 4 Zahlen + optional 2 Buchstaben
  if (/^\d{4}[A-Z]{0,2}$/.test(postalCode)) return "Niederlande";
  // Belgische PLZ: 4 Zahlen
  if (/^\d{4}$/.test(postalCode)) {
    if (city?.includes("Hasselt")) return "Belgien";
    if (city === "Wien") return "Österreich";
    if (city === "Zürich") return "Schweiz";
    return "Unbekannt";
  }

  return "Unbekannt";
}

export async function getParticipantsByCountry(eventId: string) {
  const participants = await prisma.participant.findMany({
    where: { eventId },
    select: { postalCode: true, city: true },
  });

  const countryMap = new Map<string, number>();

  participants.forEach((p) => {
    const country = getCountryFromPostalCode(p.postalCode, p.city);
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  });

  const total = participants.length;

  return Array.from(countryMap.entries())
    .map(([country, count]) => ({
      country,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
