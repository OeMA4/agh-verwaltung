import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const participants = await prisma.participant.findMany({
    where: { eventId },
    include: { room: true },
    orderBy: { lastName: "asc" },
  });

  return NextResponse.json(participants);
}
