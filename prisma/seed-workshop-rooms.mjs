import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Hole das aktuelle Event
  const event = await prisma.event.findFirst({
    orderBy: { year: "desc" },
  });

  if (!event) {
    console.log("Kein Event gefunden!");
    return;
  }

  console.log(`Erstelle Workshop-Räume für Event: ${event.name} (${event.year})`);

  // Workshop-Räume WS1 bis WS9
  const workshopRooms = [];
  for (let i = 1; i <= 9; i++) {
    workshopRooms.push({
      name: `WS${i}`,
      description: `Workshop-Raum ${i}`,
      eventId: event.id,
    });
  }

  let created = 0;
  let skipped = 0;

  for (const room of workshopRooms) {
    try {
      await prisma.workshopRoom.create({ data: room });
      console.log(`✓ ${room.name} erstellt`);
      created++;
    } catch (error) {
      if (error.code === "P2002") {
        console.log(`- ${room.name} existiert bereits`);
        skipped++;
      } else {
        throw error;
      }
    }
  }

  console.log(`\nFertig: ${created} erstellt, ${skipped} übersprungen`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
