const XLSX = require('xlsx');
const path = 'C:/Users/rmmas/Downloads/IMA images.xlsx';
const workbook = XLSX.readFile(path);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Find rows without image URLs
const missingImages = [];
data.forEach((row, i) => {
  const title = row[0];
  const imageRef = row[2];
  if (title && (imageRef === undefined || imageRef === null || !imageRef.includes('http'))) {
    missingImages.push({ row: i + 1, title });
  }
});

console.log('Artworks in Excel without image URLs:');
missingImages.forEach(m => console.log('  Row ' + m.row + ': ' + m.title));
console.log('\nTotal missing in Excel:', missingImages.length);
