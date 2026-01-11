const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DOWNLOADS_DIR = 'C:/Users/rmmas/Downloads';

// New batch of images to upload
const imageToArtwork = {
  'A Summer Day.png': 'A Summer Day',
  'Calypso.png': 'Calypso',
  'Cliff Rock - Appledore.png': 'Cliff Rock—Appledore',
  'November Morning.png': 'November Morning',
  'Portrait of a German Tragedian.png': 'Portrait of a German Tragedian',
  'Portrait of James Whitcomb Riley.png': 'Portrait of James Whitcomb Riley',
  'Portrait of Reginald Marsh.png': 'Portrait of Reginald Marsh',
  'Portrait of Booth Tarkington.png': 'Portrait of Booth Tarkington',
  'Rainy Nigthts, Etaples.png': 'Rainy Night, Etaples',
  'Rondout, New York.png': 'Rondout, New York',
  'Scene on the Wabash.png': 'Scene on the Wabash (Winter)',
  'Sunrise.png': 'Sunrise',
  'The Flight of Europa.png': 'The Flight of Europa'
};

async function uploadImage(filePath, artworkId, accessionNumber) {
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const fileName = accessionNumber
    ? `${accessionNumber.replace(/\//g, '_')}${ext}`
    : `artwork_${artworkId}${ext}`;

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
  console.log('Uploading batch 2 images...\n');

  const { data: allArtworks } = await supabase.from('Artworks').select('*');

  let uploaded = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [fileName, artworkTitle] of Object.entries(imageToArtwork)) {
    const filePath = path.join(DOWNLOADS_DIR, fileName);

    console.log(`Processing: ${fileName}`);

    if (!fs.existsSync(filePath)) {
      console.log(`  File not found, skipping`);
      notFound++;
      continue;
    }

    const artwork = allArtworks.find(a =>
      a.Title && a.Title.toLowerCase() === artworkTitle.toLowerCase()
    );

    if (!artwork) {
      console.log(`  No matching artwork for: ${artworkTitle}`);
      notFound++;
      continue;
    }

    console.log(`  Matched: ${artwork.Title} (ID: ${artwork.ID})`);

    // Check if already has valid Supabase URL
    const currentImg = artwork.Image || '';
    if (currentImg.includes('supabase.co') && currentImg.startsWith('http')) {
      console.log(`  Already has valid URL, skipping`);
      skipped++;
      continue;
    }

    const imageUrl = await uploadImage(filePath, artwork.ID, artwork['Accession Number']);
    if (imageUrl) {
      console.log(`  Uploaded: ${imageUrl}`);
      await updateArtworkImage(artwork.ID, imageUrl);
      uploaded++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Not found: ${notFound}`);
}

main().catch(console.error);
