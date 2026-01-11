const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

// Use service role key for uploads (need to add this to .env.local)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DOWNLOADS_DIR = 'C:/Users/rmmas/Downloads';

// Images downloaded today that appear to be artwork images
const artworkImages = [
  'Aouvenir of the Columbian Exposition.png',
  'Chinese fishing village.png',
  'Cross at the entrance to Hereford.png',
  'Dorothy.png',
  'Frosty Morning.png',
  'Harlem at night.png',
  'Herman and Verman.png',
  'New Year\'s shooter.png',
  'Portrait of a boy.png',
  'Study of a Young Woman.png',
  'The Bacidae.png',
  'The Boat Builders.JPEG',
  'The Poetry Reading.png',
  'Untitled (The Birth).png',
  'Bacchante and Infant Faun.jpg',
  'Margaret Mckittrick.jpg'
];

async function findArtworkByTitle(searchTitle) {
  // Normalize the search title
  const normalized = searchTitle
    .replace(/\.png$|\.jpg$|\.jpeg$/i, '')
    .toLowerCase()
    .trim();

  const { data, error } = await supabase
    .from('Artworks')
    .select('*');

  if (error) {
    console.error('Error fetching artworks:', error.message);
    return null;
  }

  // Try to find a matching artwork
  for (const artwork of data) {
    const artTitle = (artwork.Title || '').toLowerCase().trim();

    // Exact match
    if (artTitle === normalized) {
      return artwork;
    }

    // Partial match (title contains search or search contains title)
    if (artTitle.includes(normalized) || normalized.includes(artTitle)) {
      return artwork;
    }

    // Handle special cases
    const specialMappings = {
      'aouvenir of the columbian exposition': 'souvenir of the columbian exposition',
      'chinese fishing village': 'chinese fishing village',
      'cross at the entrance to hereford': 'cross at the entrance to hereford',
      'harlem at night': 'harlem at night',
      'herman and verman': 'herman and verman',
      'new year\'s shooter': 'new year\'s shooter',
      'portrait of a boy': 'portrait of a boy',
      'study of a young woman': 'study of a young woman',
      'the bacidae': 'the bacidae',
      'the boat builders': 'the boat builders',
      'the poetry reading': 'the poetry reading',
      'untitled (the birth)': 'untitled (the birth)',
      'margaret mckittrick': 'portrait of margaret mckittrick'
    };

    const mappedTitle = specialMappings[normalized];
    if (mappedTitle && artTitle.includes(mappedTitle)) {
      return artwork;
    }
  }

  return null;
}

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
    console.error(`  Upload error for ${fileName}:`, error.message);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('artworks')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

async function updateArtworkImage(artworkId, imageUrl) {
  const { error } = await supabase
    .from('Artworks')
    .update({ 'Image Upload': imageUrl })
    .eq('ID', artworkId);

  if (error) {
    console.error(`  Database update error:`, error.message);
    return false;
  }
  return true;
}

async function main() {
  console.log('Scanning for artwork images to upload...\n');

  // First, get all artworks to see what's missing
  const { data: allArtworks, error } = await supabase
    .from('Artworks')
    .select('*')
    .order('Title');

  if (error) {
    console.error('Error fetching artworks:', error.message);
    return;
  }

  // Find artworks missing images
  const missingImages = allArtworks.filter(a =>
    !a['Image Upload'] && !a['Image URL'] && !a.Image
  );

  console.log(`Found ${missingImages.length} artworks missing images:\n`);
  missingImages.forEach(a => {
    console.log(`  ID ${a.ID}: ${a.Title}`);
  });

  console.log('\n--- Checking downloaded images ---\n');

  // Check each downloaded image
  for (const imageName of artworkImages) {
    const filePath = path.join(DOWNLOADS_DIR, imageName);

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${imageName}`);
      continue;
    }

    const artwork = await findArtworkByTitle(imageName);

    if (artwork) {
      const hasImage = artwork['Image Upload'] || artwork['Image URL'] || artwork.Image;
      console.log(`${imageName}`);
      console.log(`  -> Matched to: "${artwork.Title}" (ID: ${artwork.ID})`);
      console.log(`  -> Has existing image: ${hasImage ? 'Yes' : 'No'}`);

      if (!hasImage) {
        console.log(`  -> Uploading...`);
        const imageUrl = await uploadImage(filePath, artwork.ID, artwork['Accession Number']);
        if (imageUrl) {
          console.log(`  -> Uploaded to: ${imageUrl}`);
          const updated = await updateArtworkImage(artwork.ID, imageUrl);
          if (updated) {
            console.log(`  -> Database updated successfully`);
          }
        }
      }
    } else {
      console.log(`${imageName}`);
      console.log(`  -> No matching artwork found`);
    }
    console.log('');
  }
}

main().catch(console.error);
