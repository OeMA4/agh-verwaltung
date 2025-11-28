import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
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

  return NextResponse.json(event);
}
