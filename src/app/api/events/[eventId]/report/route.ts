import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");

  const date = dateStr ? new Date(dateStr) : new Date();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rooms = await prisma.room.findMany({
    where: { eventId },
    include: {
      participants: {
        where: {
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
        orderBy: { lastName: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

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

  return NextResponse.json({
    date: date.toISOString(),
    rooms,
    presentParticipants,
  });
}
