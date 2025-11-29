import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kapazität aus Kategorie extrahieren (z.B. "4BN" -> 4, "3+1BNB" -> 4)
function parseCapacity(category) {
  if (!category || category === 'offline') return 0;

  // Entferne Leerzeichen
  category = category.trim();

  // Handle "3+1BNB" -> 4
  if (category.includes('+')) {
    const parts = category.match(/(\d+)\+(\d+)/);
    if (parts) {
      return parseInt(parts[1]) + parseInt(parts[2]);
    }
  }

  // Handle "4BN", "6BN", etc.
  const match = category.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }

  return 0;
}

// Stockwerk aus Raumnamen ableiten (S314 -> 3, W200 -> 2, N108 -> 1)
function parseFloor(roomName) {
  const match = roomName.match(/[A-Z](\d)/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

// Gebäudeflügel aus Raumnamen (S314 -> "S", W300 -> "W")
function parseBuilding(roomName) {
  const match = roomName.match(/^([A-Z])/);
  return match ? match[1] : null;
}

// Zimmer aus der Excel-Datei
const rooms = [
  // Obergeschoss Süden
  { name: "S314", category: "6BN", location: "ST" },
  { name: "S315", category: "4BN", location: "RH" },
  { name: "S316", category: "4BN", location: "ST" },
  { name: "S317", category: "4BN", location: "RH" },
  { name: "S318", category: "4BN", location: "ST" },
  { name: "S319", category: "4BN", location: "RH" },
  { name: "S320", category: "4BN", location: "ST" },
  { name: "S321", category: "4BN", location: "RH" },
  { name: "S322", category: "4BN", location: "RH" },
  { name: "S323", category: "4BN", location: "RH" },
  { name: "S324", category: "4BN", location: "ST" },
  { name: "S325", category: "4BN", location: "RH" },
  { name: "S326", category: "4BN", location: "ST" },
  { name: "S327", category: "4BN", location: "RH" },
  { name: "S328", category: "4BN", location: "ST" },
  { name: "S329", category: "4BN", location: "RH" },
  { name: "S330", category: "4BN", location: "ST" },
  { name: "S331", category: "4BN", location: "RH" },

  // Erdgeschoss Süden
  { name: "S205", category: "3BNB", location: "RH" },
  { name: "S206", category: "3BNB", location: "ST" },
  { name: "S207", category: "3BNB", location: "RH" },
  { name: "S208", category: "3+1BNB", location: "ST" },
  { name: "S209", category: "3+1BNB", location: "RH" },
  { name: "S210", category: "3BNB", location: "ST" },
  { name: "S211", category: "3BNB", location: "RH" },
  { name: "S212", category: "3BNB", location: "ST" },
  { name: "S213", category: "3+1BNB", location: "RH" },
  { name: "S214", category: "3BNB", location: "ST" },
  { name: "S215", category: "3BNB", location: "RH" },

  // Untergeschoss Süden
  { name: "S114", category: "4BN", location: "RH" },
  { name: "S115", category: "4BN", location: "RH" },
  { name: "S116", category: "4BN", location: "RH" },
  { name: "S117", category: "4BN", location: "RH" },
  { name: "S118", category: "4BN", location: "RH" },
  { name: "S119", category: "4BN", location: "RH" },
  { name: "S120", category: "4BN", location: "RH" },
  { name: "S121", category: "4BN", location: "RH" },
  { name: "S122", category: "4BN", location: "RH" },
  { name: "S123", category: "4BN", location: "RH" },

  // Obergeschoss Westen
  { name: "W300", category: "1BN", location: "SCH" },
  { name: "W301", category: "1BN + 1", location: "SCH" },
  // W302 ist offline - nicht verfügbar
  { name: "W303", category: "6BN", location: "SCH" },
  { name: "W304", category: "4BN", location: "H" },
  { name: "W305", category: "4BN", location: "SCH" },
  { name: "W306", category: "4BN", location: "H" },
  { name: "W307", category: "4BN", location: "SCH" },
  { name: "W308", category: "4BN", location: "H" },
  { name: "W309", category: "4BN", location: "H" },
  { name: "W310", category: "4BN", location: "SCH" },
  { name: "W311", category: "4BN", location: "H" },
  { name: "W312", category: "4BN", location: "SCH" },
  { name: "W313", category: "4BN", location: "H" },
  { name: "W314", category: "4BN", location: "SCH" },
  { name: "W315", category: "4BN", location: "H" },
  { name: "W316", category: "4BN", location: "H" },

  // Erdgeschoss Westen
  { name: "W200", category: "4BN", location: "H" },
  { name: "W201", category: "3+1BNB", location: "H" },
  { name: "W202", category: "3+1BNB", location: "H" },
  { name: "W203", category: "3+1BNB", location: "SCH" },
  { name: "W204", category: "3+1BNB", location: "SCH" },

  // Untergeschoss Westen
  { name: "W100", category: "2BN", location: "SCH" },
  { name: "W101", category: "4BN", location: "SCH" },
  { name: "W102", category: "4BN", location: "SCH" },
  { name: "W103", category: "4BN", location: "SCH" },
  { name: "W104", category: "2BN", location: "SCH" },
  { name: "W105", category: "4BN", location: "SCH" },
  { name: "W106", category: "4BN", location: "SCH" },
  { name: "W107", category: "4BN", location: "SCH" },

  // Untergeschoss Norden
  { name: "N108", category: "3BN", location: "P" },
  { name: "N109", category: "4BN", location: "P" },
  { name: "N110", category: "3BN", location: "P" },
  { name: "N111", category: "2BN", location: "RH" },
  { name: "N112", category: "2BN", location: "RH" },
  { name: "N113", category: "2BN", location: "RH" },
  { name: "N114", category: "2BN", location: "RH" },
];

async function main() {
  console.log('Seeding database...');

  // Event 2025 erstellen
  const event = await prisma.event.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      name: "AGH 2025",
      year: 2025,
      startDate: new Date("2025-12-21"),
      endDate: new Date("2025-12-27"),
      location: "Oberwesel",
    },
  });

  console.log(`Event created: ${event.name} (ID: ${event.id})`);

  // Zimmer erstellen
  let createdCount = 0;
  for (const room of rooms) {
    const capacity = parseCapacity(room.category);

    // Überspringe Zimmer ohne Kapazität
    if (capacity === 0) {
      console.log(`Skipping ${room.name} (no capacity)`);
      continue;
    }

    await prisma.room.upsert({
      where: {
        eventId_name: {
          eventId: event.id,
          name: room.name,
        },
      },
      update: {
        capacity,
        category: room.category,
        location: room.location,
        building: parseBuilding(room.name),
        floor: parseFloor(room.name),
      },
      create: {
        name: room.name,
        capacity,
        category: room.category,
        location: room.location,
        building: parseBuilding(room.name),
        floor: parseFloor(room.name),
        eventId: event.id,
      },
    });

    createdCount++;
  }

  console.log(`Created/Updated ${createdCount} rooms`);

  // Zusammenfassung
  const totalCapacity = rooms.reduce((sum, r) => sum + parseCapacity(r.category), 0);
  console.log(`Total capacity: ${totalCapacity} beds in ${createdCount} rooms`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
