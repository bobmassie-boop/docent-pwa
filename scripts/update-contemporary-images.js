#!/usr/bin/env node
/**
 * Update Contemporary artworks with image URLs
 *
 * Usage:
 * 1. Add your images to public/images/contemporary/
 * 2. Name them using accession numbers (e.g., 2013.443A-E.jpg, 1989.35.png)
 * 3. Run: node scripts/update-contemporary-images.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateContemporaryImages() {
  console.log('='.repeat(80));
  console.log('UPDATING CONTEMPORARY ARTWORK IMAGES');
  console.log('='.repeat(80));

  // Get all Contemporary artworks
  const { data: artworks, error } = await supabase
    .table('Artworks')
    .select('ID, "Accession Number", Title, "Image URL"')
    .eq('Collection', 'Contemporary')
    .order('ID');

  if (error) {
    console.error('Error fetching artworks:', error);
    return;
  }

  console.log(`\nFound ${artworks.length} Contemporary artworks`);

  // Check what images exist in the folder
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'contemporary');

  if (!fs.existsSync(imagesDir)) {
    console.error(`\nError: Images directory does not exist: ${imagesDir}`);
    console.log('Please create it first: mkdir -p public/images/contemporary');
    return;
  }

  const imageFiles = fs.readdirSync(imagesDir)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

  console.log(`\nFound ${imageFiles.length} image files in public/images/contemporary/`);

  if (imageFiles.length === 0) {
    console.log('\nNo images found. Add your images to public/images/contemporary/');
    console.log('Name them using accession numbers, e.g.:');
    console.log('  - 2013.443A-E.jpg');
    console.log('  - 1989.35.png');
    console.log('  - 69.36.7.jpg');
    return;
  }

  console.log('\nImages found:');
  imageFiles.forEach(f => console.log(`  - ${f}`));

  // Create a map of accession number to image file
  const imageMap = {};
  imageFiles.forEach(filename => {
    // Extract accession number from filename (before the extension)
    const basename = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    // Try to normalize accession format
    const normalized = basename.toUpperCase();
    imageMap[normalized] = filename;
    // Also store original case
    imageMap[basename] = filename;
  });

  console.log('\n' + '='.repeat(80));
  console.log('MATCHING ARTWORKS TO IMAGES');
  console.log('='.repeat(80));

  let updated = 0;
  let skipped = 0;
  let alreadyHasImage = 0;

  for (const artwork of artworks) {
    const accession = artwork['Accession Number'];

    // Skip if already has an image URL
    if (artwork['Image URL']) {
      alreadyHasImage++;
      continue;
    }

    // Try to find matching image
    const imageFile = imageMap[accession] ||
                      imageMap[accession.toUpperCase()] ||
                      imageMap[accession.toLowerCase()];

    if (imageFile) {
      const imageUrl = `/images/contemporary/${imageFile}`;

      // Update database
      const { error: updateError } = await supabase
        .table('Artworks')
        .update({ 'Image URL': imageUrl })
        .eq('ID', artwork.ID);

      if (updateError) {
        console.log(`✗ Failed ${artwork.ID} (${accession}): ${updateError.message}`);
        skipped++;
      } else {
        console.log(`✓ Updated ${artwork.ID} (${accession}): ${artwork.Title} → ${imageUrl}`);
        updated++;
      }
    } else {
      console.log(`  Skipped ${artwork.ID} (${accession}): No matching image file`);
      skipped++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✓ Updated: ${updated} artworks`);
  console.log(`  Already had images: ${alreadyHasImage} artworks`);
  console.log(`  Skipped (no match): ${skipped} artworks`);
  console.log(`  Total Contemporary: ${artworks.length} artworks`);

  if (skipped > 0) {
    console.log('\nArtworks without images:');
    for (const artwork of artworks) {
      const accession = artwork['Accession Number'];
      const imageFile = imageMap[accession] || imageMap[accession.toUpperCase()];
      if (!imageFile && !artwork['Image URL']) {
        console.log(`  - ${accession}: ${artwork.Title}`);
        console.log(`    Expected filename: ${accession}.jpg or ${accession}.png`);
      }
    }
  }
}

updateContemporaryImages().catch(console.error);
