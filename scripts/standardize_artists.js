const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Manual mapping of names to standardize to canonical form
// Format: "old name" => "canonical name"
const NAME_MAPPINGS = {
  // Chase - standardize to full name
  "William Chase (1849–1916)": "William Merritt Chase",

  // Blakelock - use shorter common name
  "Ralph Albert Blakelock": "Ralph Blakelock",

  // Ritman - First Last format
  "Ritman, Louis": "Louis P. Ritman",

  // Steele - use formal full name
  "T.C. Steele": "Theodore Clement Steele",

  // Whistler - use full name
  "James A. Whistler": "James Abbott McNeill Whistler",

  // Paxton - fix spelling
  "William McGregor Paxton": "William MacGregor Paxton",

  // Whittredge - clean up
  "Worthington Whittredge, American, 1820-1910": "Worthington Whittredge",
  "(Thomas) Worthington Whittredge": "Worthington Whittredge",
  "Worthington Whittredge, American": "Worthington Whittredge",

  // Henry - these are actually different people, DON'T merge
  // "Edridge, Henry" is Henry Edridge (British artist)
  // "Robert Henry " is Robert Henri (American, Ashcan School)
  "Edridge, Henry": "Henry Edridge",
  "Robert Henry ": "Robert Henri",

  // Stuart - standardize
  "Gilbert Stuart, American - 1755-1828": "Gilbert Stuart",
  "Gilbert Stuart, American, 1755-1828": "Gilbert Stuart",

  // Brown - these are different artists, DON'T merge
  // "Brown, Bolton Coit" is Bolton Brown
  "Brown, Bolton Coit": "Bolton Coit Brown",

  // Cox - clean up
  "Jacob Cox, American | 1810-1892": "Jacob Cox",

  // Saint-Gaudens - First Last format
  "Saint-Gaudens, Augustus": "Augustus Saint-Gaudens",

  // Blumenschein - these are different people (Mary and Ernest), keep separate

  // Frieseke
  "Frieseke, Frederick Carl": "Frederick Carl Frieseke",
  "Frederick C. Frieseke": "Frederick Carl Frieseke",

  // Inness
  "George Inness, American, 1825-1894": "George Inness",
  "Inness, George": "George Inness",

  // Adams
  "Adams, John Ottis": "John Ottis Adams",
  "J. Ottis Adams": "John Ottis Adams",
};

async function standardizeArtists() {
  console.log('Fetching artworks...');

  const { data: artworks, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)"');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${artworks.length} artworks\n`);

  let updatedCount = 0;

  for (const artwork of artworks) {
    const currentName = artwork['Artist (Display)'];

    if (currentName && NAME_MAPPINGS[currentName]) {
      const newName = NAME_MAPPINGS[currentName];

      console.log(`Updating ID ${artwork.ID}:`);
      console.log(`  "${currentName}" → "${newName}"`);
      console.log(`  Artwork: ${artwork.Title}`);

      const { error: updateError } = await supabase
        .from('Artworks')
        .update({ 'Artist (Display)': newName })
        .eq('ID', artwork.ID);

      if (updateError) {
        console.log(`  ✗ Error: ${updateError.message}`);
      } else {
        console.log(`  ✓ Updated`);
        updatedCount++;
      }
      console.log('');
    }
  }

  console.log('='.repeat(50));
  console.log(`Done! Updated ${updatedCount} artist names.`);
}

standardizeArtists();
