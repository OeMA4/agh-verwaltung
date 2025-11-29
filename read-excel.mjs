import XLSX from 'xlsx';

const workbook = XLSX.readFile('./teilnehmerliste.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Normalize Turkish characters for comparison
const normalizeTurkish = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD") // Decompose characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/ı/g, "i") // Turkish dotless i
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\r?\n/g, "")
    .trim();
};

console.log('=== HEADER ANALYSE MIT NORMALISIERUNG ===');
const mapping = {};
data[0].forEach((header, index) => {
  const original = (header || "").toString();
  const h = normalizeTurkish(original);
  console.log(`Index ${index}: "${original}" -> normalized: "${h}"`);

  // WICHTIG: soyisminiz VOR isminiz prüfen!
  if (h.includes("soyisminiz") || h === "soyisim" || h === "soyad") {
    console.log(`  -> NACHNAME erkannt!`);
    mapping.lastName = index;
  } else if (h.includes("isminiz") || h === "isim" || h === "ad") {
    console.log(`  -> VORNAME erkannt!`);
    mapping.firstName = index;
  }
});

console.log('\n=== MAPPING ERGEBNIS ===');
console.log(mapping);

console.log('\n=== ERSTE DATENZEILE ===');
const row = data[1];
console.log('Raw row:', row);
console.log(`firstName (index ${mapping.firstName}):`, row[mapping.firstName]);
console.log(`lastName (index ${mapping.lastName}):`, row[mapping.lastName]);
