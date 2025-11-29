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

export async function updateNotes(
  id: string,
  notes: string | null
): Promise<Participant> {
  return prisma.participant.update({
    where: { id },
    data: { notes },
  });
}

interface CSVImportResult {
  added: number;
  skipped: number;
  errors: string[];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === "," || char === ";") && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

function parseDate(dateStr: string, year: number): Date | null {
  if (!dateStr) return null;

  // Format: "22.12" or "22.12."
  const match = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.?$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    return new Date(year, month, day);
  }

  return null;
}

function parseStayPeriod(stayStr: string, year: number): { arrival: Date | null; departure: Date | null } {
  if (!stayStr || stayStr.trim() === "") {
    return { arrival: null, departure: null };
  }

  // Format: "22.12-26.12" or "22.12 - 26.12"
  const parts = stayStr.split(/\s*[-–]\s*/);
  if (parts.length === 2) {
    return {
      arrival: parseDate(parts[0], year),
      departure: parseDate(parts[1], year),
    };
  }

  return { arrival: null, departure: null };
}

function mapRole(roleStr: string): ParticipantRole {
  const role = roleStr.toUpperCase().trim();
  if (role === "HELPER" || role === "HELFER") return "HELPER";
  if (role === "ABI") return "ABI";
  return "REGULAR";
}

function calculateBirthDateFromAge(age: number): Date {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return new Date(birthYear, 0, 1); // 1. Januar des Geburtsjahres
}

export async function importParticipantsFromCSV(
  eventId: string,
  csvContent: string,
  mode: "add" | "replace"
): Promise<CSVImportResult> {
  const result: CSVImportResult = {
    added: 0,
    skipped: 0,
    errors: [],
  };

  // Get event to determine year
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    result.errors.push("Veranstaltung nicht gefunden");
    return result;
  }

  const eventYear = new Date(event.startDate).getFullYear();

  // If replace mode, delete all existing participants
  if (mode === "replace") {
    await prisma.participant.deleteMany({ where: { eventId } });
  }

  // Get existing participants for duplicate check (only in add mode)
  const existingParticipants = mode === "add"
    ? await prisma.participant.findMany({
        where: { eventId },
        select: { firstName: true, lastName: true, city: true },
      })
    : [];

  const existingSet = new Set(
    existingParticipants.map(
      (p) => `${p.firstName.toLowerCase()}|${p.lastName.toLowerCase()}|${(p.city || "").toLowerCase()}`
    )
  );

  // Parse CSV
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());

  // Skip header row if it looks like a header
  const firstLine = lines[0]?.toLowerCase() || "";
  const startIndex = firstLine.includes("vorname") || firstLine.includes("nachname") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    try {
      const values = parseCSVLine(line);

      // Expected: Vorname, Nachname, Alter, Stadt, Aufenthalt, Rolle
      if (values.length < 2) {
        result.errors.push(`Zeile ${lineNum}: Zu wenige Spalten`);
        continue;
      }

      const firstName = values[0]?.trim();
      const lastName = values[1]?.trim();
      const ageStr = values[2]?.trim();
      const city = values[3]?.trim() || null;
      const stayStr = values[4]?.trim() || "";
      const roleStr = values[5]?.trim() || "REGULAR";

      if (!firstName || !lastName) {
        result.errors.push(`Zeile ${lineNum}: Vor- oder Nachname fehlt`);
        continue;
      }

      // Check for duplicates
      const key = `${firstName.toLowerCase()}|${lastName.toLowerCase()}|${(city || "").toLowerCase()}`;
      if (existingSet.has(key)) {
        result.skipped++;
        continue;
      }

      // Parse age to birthDate
      let birthDate: Date | null = null;
      if (ageStr) {
        const age = parseInt(ageStr, 10);
        if (!isNaN(age) && age > 0 && age < 120) {
          birthDate = calculateBirthDateFromAge(age);
        }
      }

      // Parse stay period
      const { arrival, departure } = parseStayPeriod(stayStr, eventYear);

      // Map role
      const role = mapRole(roleStr);

      // Create participant
      await prisma.participant.create({
        data: {
          firstName,
          lastName,
          city,
          birthDate,
          arrivalDate: arrival,
          departureDate: departure,
          role,
          eventId,
        },
      });

      result.added++;
      existingSet.add(key); // Prevent duplicates within the same import
    } catch (error) {
      result.errors.push(`Zeile ${lineNum}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`);
    }
  }

  return result;
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
