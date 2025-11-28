import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Türkische männliche Vornamen
const firstNames = [
  "Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "Ibrahim", "Ömer", "Osman", "Yusuf",
  "Fatih", "Emre", "Burak", "Murat", "Serkan", "Kemal", "Recep", "Süleyman", "Ismail", "Halil",
  "Cemal", "Kadir", "Selim", "Turgut", "Erkan", "Bülent", "Cengiz", "Volkan", "Onur", "Cem",
  "Tolga", "Deniz", "Kaan", "Enes", "Furkan", "Yasin", "Eren", "Berkay", "Taha", "Yiğit",
  "Alparslan", "Batuhan", "Barış", "Can", "Efe", "Ferhat", "Gökhan", "Hamza", "Ilhan", "Kerem",
  "Levent", "Mesut", "Necati", "Orhan", "Polat", "Ramazan", "Sami", "Tarık", "Ufuk", "Vedat",
  "Yakup", "Zafer", "Abdullah", "Bilal", "Cihan", "Doğan", "Emir", "Fikret", "Güven", "Haydar",
  "Irfan", "Kasım", "Mahmut", "Nuri", "Özkan", "Rıza", "Sefa", "Tahir", "Umut", "Veli",
  "Yavuz", "Zeki", "Adem", "Bekir", "Celal", "Davut", "Ekrem", "Fevzi", "Gürkan", "Hikmet",
  "Koray", "Lokman", "Mikail", "Necmettin", "Oktay", "Remzi", "Sedat", "Turan", "Uğur", "Volkan"
];

// Türkische Nachnamen
const lastNames = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
  "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek",
  "Polat", "Korkmaz", "Çakır", "Erdoğan", "Güneş", "Ak", "Yalçın", "Tekin", "Güler", "Karaca",
  "Bozkurt", "Aktaş", "Bulut", "Taş", "Aksoy", "Başaran", "Keskin", "Ünal", "Acar", "Kaplan",
  "Sarı", "Gül", "Ateş", "Tunç", "Sönmez", "Erdem", "Karakaş", "Bayrak", "Avcı", "Duman",
  "Işık", "Balcı", "Güneş", "Ceylan", "Türk", "Karagöz", "Pala", "Gündüz", "Ergün", "Toprak",
  "Sever", "Tanrıverdi", "Coşkun", "Akın", "Sezer", "Altın", "Durmuş", "Ekinci", "Çınar", "Kahraman",
  "Bilgin", "Çiftçi", "Dinç", "Ergin", "Fırat", "Güngör", "Hacı", "Keleş", "Mutlu", "Parlak"
];

// Städte in Deutschland
const germanCities = [
  { city: "Düsseldorf", postalCode: "40210", country: "Deutschland" },
  { city: "Köln", postalCode: "50667", country: "Deutschland" },
  { city: "Duisburg", postalCode: "47051", country: "Deutschland" },
  { city: "Essen", postalCode: "45127", country: "Deutschland" },
  { city: "Dortmund", postalCode: "44135", country: "Deutschland" },
  { city: "Frankfurt", postalCode: "60311", country: "Deutschland" },
  { city: "Offenbach", postalCode: "63065", country: "Deutschland" },
  { city: "Mainz", postalCode: "55116", country: "Deutschland" },
  { city: "Mannheim", postalCode: "68159", country: "Deutschland" },
  { city: "Kaiserslautern", postalCode: "67655", country: "Deutschland" },
  { city: "Aachen", postalCode: "52062", country: "Deutschland" },
  { city: "Bielefeld", postalCode: "33602", country: "Deutschland" },
  { city: "Krefeld", postalCode: "47798", country: "Deutschland" },
  { city: "Neuss", postalCode: "41460", country: "Deutschland" },
  { city: "Wuppertal", postalCode: "42103", country: "Deutschland" },
  { city: "Hagen", postalCode: "58095", country: "Deutschland" },
  { city: "Nürnberg", postalCode: "90402", country: "Deutschland" },
  { city: "Karlsruhe", postalCode: "76133", country: "Deutschland" },
  { city: "Hanau", postalCode: "63450", country: "Deutschland" },
  { city: "Aschaffenburg", postalCode: "63739", country: "Deutschland" },
  { city: "Berlin", postalCode: "10115", country: "Deutschland" },
  { city: "Hamburg", postalCode: "20095", country: "Deutschland" },
  { city: "München", postalCode: "80331", country: "Deutschland" },
  { city: "Stuttgart", postalCode: "70173", country: "Deutschland" },
  { city: "Bremen", postalCode: "28195", country: "Deutschland" },
];

// Städte in anderen Ländern
const internationalCities = [
  { city: "Eindhoven", postalCode: "5611", country: "Niederlande" },
  { city: "Roermond", postalCode: "6041", country: "Niederlande" },
  { city: "Hasselt", postalCode: "3500", country: "Belgien" },
  { city: "Istanbul", postalCode: "34110", country: "Türkei" },
  { city: "Ankara", postalCode: "06100", country: "Türkei" },
  { city: "Izmir", postalCode: "35210", country: "Türkei" },
  { city: "Wien", postalCode: "1010", country: "Österreich" },
  { city: "Zürich", postalCode: "8001", country: "Schweiz" },
];

// Straßennamen
const streets = [
  "Hauptstraße", "Bahnhofstraße", "Schulstraße", "Gartenstraße", "Berliner Straße",
  "Frankfurter Straße", "Mühlenweg", "Lindenstraße", "Kirchstraße", "Poststraße",
  "Waldstraße", "Bergstraße", "Parkstraße", "Industriestraße", "Feldstraße",
  "Ringstraße", "Rosenweg", "Tulpenweg", "Ahornweg", "Birkenweg",
  "Eichenstraße", "Kastanienallee", "Sonnenstraße", "Mondweg", "Sternstraße"
];

// Rollen
const roles = ["REGULAR", "REGULAR", "REGULAR", "REGULAR", "HELPER", "ABI"]; // Gewichtung: 66% Regular, 17% Helper, 17% Abi

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone() {
  const prefix = randomElement(["0151", "0152", "0157", "0160", "0170", "0171", "0172", "0173", "0174", "0175", "0176", "0177", "0178", "0179"]);
  const number = randomNumber(1000000, 9999999);
  return `${prefix}${number}`;
}

function generateEmail(firstName, lastName) {
  const domain = randomElement(["gmail.com", "web.de", "gmx.de", "outlook.com", "hotmail.com", "yahoo.de"]);
  const normalized = `${firstName.toLowerCase().replace(/[üöäğşç]/g, c => ({ü:'u',ö:'o',ä:'a',ğ:'g',ş:'s',ç:'c'}[c] || c))}.${lastName.toLowerCase().replace(/[üöäğşç]/g, c => ({ü:'u',ö:'o',ä:'a',ğ:'g',ş:'s',ç:'c'}[c] || c))}`;
  return `${normalized}${randomNumber(1, 99)}@${domain}`;
}

async function main() {
  console.log('Seeding participants...');

  // Event 2025 finden
  const event = await prisma.event.findUnique({
    where: { year: 2025 },
    include: { rooms: true }
  });

  if (!event) {
    console.error('Event 2025 nicht gefunden! Bitte zuerst seed.mjs ausführen.');
    process.exit(1);
  }

  console.log(`Event gefunden: ${event.name}`);
  console.log(`${event.rooms.length} Zimmer verfügbar`);

  // Alle Städte zusammenfügen (80% Deutschland, 20% International)
  const allCities = [
    ...germanCities, ...germanCities, ...germanCities, ...germanCities, // 4x für Gewichtung
    ...internationalCities
  ];

  // Zimmer mit Kapazitäten tracken
  const roomOccupancy = new Map();
  for (const room of event.rooms) {
    roomOccupancy.set(room.id, { room, current: 0, max: room.capacity });
  }

  // 200 Teilnehmer erstellen
  const participants = [];
  for (let i = 0; i < 200; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const cityInfo = randomElement(allCities);
    const role = randomElement(roles);

    // Zufälliges Zimmer mit freier Kapazität finden
    const availableRooms = Array.from(roomOccupancy.values())
      .filter(r => r.current < r.max);

    let roomId = null;
    if (availableRooms.length > 0) {
      const selectedRoom = randomElement(availableRooms);
      roomId = selectedRoom.room.id;
      selectedRoom.current++;
    }

    // Zufällige Ankunfts- und Abreisedaten
    const arrivalOptions = [
      new Date("2025-12-24"),
      new Date("2025-12-24"),
      new Date("2025-12-24"),
      new Date("2025-12-25"), // Manche kommen später
    ];
    const departureOptions = [
      new Date("2025-12-26"),
      new Date("2025-12-27"),
      new Date("2025-12-27"),
      new Date("2025-12-27"),
    ];

    participants.push({
      firstName,
      lastName,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      street: randomElement(streets),
      houseNumber: String(randomNumber(1, 150)),
      postalCode: cityInfo.postalCode,
      city: cityInfo.city,
      role,
      hasPaid: Math.random() > 0.3, // 70% haben bezahlt
      paidAmount: role === "HELPER" ? 0 : (role === "ABI" ? 50 : 80),
      checkedIn: false,
      arrivalDate: randomElement(arrivalOptions),
      departureDate: randomElement(departureOptions),
      eventId: event.id,
      roomId,
    });
  }

  // Teilnehmer in Datenbank einfügen
  let created = 0;
  for (const p of participants) {
    await prisma.participant.create({ data: p });
    created++;
    if (created % 50 === 0) {
      console.log(`${created} Teilnehmer erstellt...`);
    }
  }

  console.log(`\n✅ ${created} Teilnehmer erfolgreich erstellt!`);

  // Statistiken
  const stats = await prisma.participant.groupBy({
    by: ['role'],
    where: { eventId: event.id },
    _count: true
  });

  console.log('\nStatistiken:');
  for (const s of stats) {
    console.log(`  ${s.role}: ${s._count} Teilnehmer`);
  }

  const withRoom = await prisma.participant.count({
    where: { eventId: event.id, roomId: { not: null } }
  });
  console.log(`\n  Mit Zimmer: ${withRoom}`);
  console.log(`  Ohne Zimmer: ${200 - withRoom}`);

  const paid = await prisma.participant.count({
    where: { eventId: event.id, hasPaid: true }
  });
  console.log(`  Bezahlt: ${paid}`);
  console.log(`  Nicht bezahlt: ${200 - paid}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
