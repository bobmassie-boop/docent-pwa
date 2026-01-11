#!/usr/bin/env node
/**
 * Copy Contemporary images from research folder to public folder
 * and rename them to match accession numbers
 */

const fs = require('fs');
const path = require('path');

// Mapping from image filename to accession number
const imageMapping = {
  'Acconci.jpg': '1989.35.jpg',
  'Arp.png': '2004.60.png',
  'Barbie loves Ken.jpg': '2004.74A.jpg',
  'Bishop.jpg': '2002.85.jpg',
  'Casabere.jpg': '2003.78.jpg',
  'Dubuffet.jpg': '1992.394.jpg',
  'Ferrara.jpg': '80.237.jpg',
  'Floor.jpg': '2004.152.jpg',
  'Hofmann.jpg': '1996.247.jpg',
  'Indiana_Love.jpg': '67.8.jpg',
  'Irwin.jpg': '1988.220.jpg',
  'Judd.jpg': '1992.362.jpg',
  'Krasner.jpg': '69.36.7.jpg',
  'LeWitt.jpg': '1990.40.jpg',
  'Lichenstein.jpg': '2013.443A-E.jpg',
  'Lipski.jpg': '1993.67.jpg',
  'Mitchell.jpg': '1998.184.jpg',
  'Noland.jpg': '2004.62.jpg',
  'Paik.jpg': '1996.321.jpg',
  'Ritchie.jpg': '1998.38.jpg',
  'Rosen I_Never.jpg': '2004.76.jpg',
  'Rosen,Kay_Untitled.jpg': '2000.157A-P.jpg',
  'Sandback.jpg': '2004.153.jpg',
  'Smith.jpg': '60.279.jpg',
  'Turrell.jpg': '1989.111.jpg',
};

const sourceDir = 'A:/docent_IMA_research_db/Contemporary/Images';
const destDir = path.join(process.cwd(), 'public', 'images', 'contemporary');

console.log('='.repeat(80));
console.log('COPYING CONTEMPORARY IMAGES');
console.log('='.repeat(80));

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`\n✓ Created directory: ${destDir}`);
}

let copied = 0;
let skipped = 0;
let errors = 0;

console.log(`\nSource: ${sourceDir}`);
console.log(`Destination: ${destDir}\n`);

for (const [sourceFile, destFile] of Object.entries(imageMapping)) {
  const sourcePath = path.join(sourceDir, sourceFile);
  const destPath = path.join(destDir, destFile);

  try {
    if (!fs.existsSync(sourcePath)) {
      console.log(`✗ Source not found: ${sourceFile}`);
      errors++;
      continue;
    }

    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied: ${sourceFile} → ${destFile}`);
    copied++;
  } catch (error) {
    console.log(`✗ Error copying ${sourceFile}: ${error.message}`);
    errors++;
  }
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`✓ Copied: ${copied} images`);
console.log(`✗ Errors: ${errors}`);
console.log(`\nImages are now in: ${destDir}`);
console.log('\nNext step: Run `node scripts/update-contemporary-images.js` to update the database');
