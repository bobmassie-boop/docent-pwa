const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DOWNLOADS_DIR = 'C:/Users/rmmas/Downloads';

// Mapping of downloaded file names to artwork titles in database
const imageToArtwork = {
  'Aouvenir of the Columbian Exposition.png': 'Souvenir of the Columbian Exposition',
  'Chinese fishing village.png': 'Chinese Fishing Village, Monterey Bay, California',
  'Cross at the entrance to Hereford.png': 'Cross at the Entrance to Hereford',
  'Dorothy.png': 'Dorothy',
  'Frosty Morning.png': 'Frosty Morning',
  'Harlem at night.png': 'Harlem at Night',
  'Herman and Verman.png': 'Herman and Verman',
  'New Year\'s shooter.png': 'New Year\'s Shooter',
  'Portrait of a boy.png': 'Portrait of a Boy',
  'Study of a Young Woman.png': 'Study of a Young Woman',
  'The Bacidae.png': 'The Bacidae',
  'The Boat Builders.JPEG': 'The Boat Builders',
  'The Poetry Reading.png': 'The Poetry Reading',
  'Untitled (The Birth).png': 'Untitled (The Birth)',
  'Bacchante and Infant Faun.jpg': 'Bacchante and Infant Faun',
  'Margaret Mckittrick.jpg': 'Margaret McKittrick'
};

async function uploadImage(filePath, artworkId, accessionNumber) {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const fileName = accessionNumber
    ? `${accessionNumber.replace(/\//g, '_')}${ext}`
    : `artwork_${artworkId}${ext}`;

  console.log(`    Uploading as: ${fileName}`);

  const { data, error } = await supabase.storage
    .from('artworks')
    .upload(fileName, fileBuffer, {
      contentType: ext === '.png' ? 'image/png' : 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error(`    Upload error:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('artworks')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

async function updateArtworkImage(artworkId, imageUrl) {
  // Update the Image field directly (since Image Upload is empty for most)
  const { error } = await supabase
    .from('Artworks')
    .update({ 'Image': imageUrl })
    .eq('ID', artworkId);

  if (error) {
    console.error(`    Database update error:`, error.message);
    return false;
  }
  return true;
}

async function main() {
  console.log('Fixing broken Airtable image URLs...\n');

  // Get all artworks
  const { data: allArtworks, error } = await supabase
    .from('Artworks')
    .select('*');

  if (error) {
    console.error('Error fetching artworks:', error.message);
    return;
  }

  let fixed = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [fileName, artworkTitle] of Object.entries(imageToArtwork)) {
    const filePath = path.join(DOWNLOADS_DIR, fileName);

    console.log(`\nProcessing: ${fileName}`);

    if (!fs.existsSync(filePath)) {
      console.log(`  File not found, skipping`);
      notFound++;
      continue;
    }

    // Find matching artwork
    const artwork = allArtworks.find(a =>
      a.Title && a.Title.toLowerCase() === artworkTitle.toLowerCase()
    );

    if (!artwork) {
      console.log(`  No matching artwork found for: ${artworkTitle}`);
      notFound++;
      continue;
    }

    console.log(`  Matched to: ${artwork.Title} (ID: ${artwork.ID})`);

    // Check if already has valid Supabase URL
    const currentImg = artwork.Image || '';
    const hasValidUrl = currentImg.includes('supabase.co') && currentImg.startsWith('http');

    if (hasValidUrl) {
      console.log(`  Already has valid Supabase URL, skipping`);
      skipped++;
      continue;
    }

    // Upload image
    console.log(`  Uploading to Supabase Storage...`);
    const imageUrl = await uploadImage(filePath, artwork.ID, artwork['Accession Number']);

    if (!imageUrl) {
      console.log(`  Failed to upload`);
      continue;
    }

    console.log(`  Uploaded: ${imageUrl}`);

    // Update database
    const updated = await updateArtworkImage(artwork.ID, imageUrl);
    if (updated) {
      console.log(`  Database updated successfully`);
      fixed++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Fixed: ${fixed}`);
  console.log(`Skipped (already valid): ${skipped}`);
  console.log(`Not found: ${notFound}`);
}

main().catch(console.error);
