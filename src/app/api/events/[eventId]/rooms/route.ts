import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const rooms = await prisma.room.findMany({
    where: { eventId },
    include: { participants: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(rooms);
}
