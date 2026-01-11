const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findMissingImages() {
  const missingIds = [19, 32, 86, 125, 129, 131, 159, 160, 175];

  const { data, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Accession Number", "Corrected URL", URL')
    .in('ID', missingIds);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('Artworks missing images with their URLs:\n');
  data.forEach(a => {
    console.log(`ID ${a.ID}: ${a.Title}`);
    console.log(`  Accession Number: ${a['Accession Number'] || 'N/A'}`);
    console.log(`  Corrected URL: ${a['Corrected URL'] || 'N/A'}`);
    console.log(`  URL: ${a.URL || 'N/A'}`);
    console.log('');
  });
}

findMissingImages();
