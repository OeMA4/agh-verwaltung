import XLSX from 'xlsx';

const workbook = XLSX.readFile('zimmerbelegung.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Als JSON ausgeben
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log(JSON.stringify(data, null, 2));
