import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating event...');

  const event = await prisma.event.update({
    where: { year: 2025 },
    data: {
      startDate: new Date("2025-12-21"),
      location: "Oberwesel",
    },
  });

  console.log(`Event "${event.name}" updated:`);
  console.log(`  Start: ${event.startDate.toISOString().split('T')[0]}`);
  console.log(`  End: ${event.endDate.toISOString().split('T')[0]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
