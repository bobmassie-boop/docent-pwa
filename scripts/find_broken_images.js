const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findBrokenImages() {
  const { data, error } = await supabase
    .from('Artworks')
    .select('*');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('Artworks with broken/Airtable URLs:\n');
  const broken = [];

  data.forEach(a => {
    const img = a.Image || '';
    const imgUpload = a['Image Upload'] || '';
    const imgUrl = a['Image URL'] || '';

    // Check if any field contains airtable URL
    const hasAirtable = img.includes('airtable') || imgUpload.includes('airtable') || imgUrl.includes('airtable');

    // Check if has valid Supabase URL
    const hasValidSupabase = imgUpload.includes('supabase.co') ||
                             imgUrl.includes('supabase.co') ||
                             (img.includes('supabase.co') && img.startsWith('http'));

    if (hasAirtable || (!hasValidSupabase && !img && !imgUpload && !imgUrl)) {
      broken.push({
        id: a.ID,
        title: a.Title,
        image: img ? img.substring(0, 60) : '(empty)',
        hasAirtable
      });
    }
  });

  broken.forEach(b => {
    console.log(`ID ${b.id}: ${b.title}`);
    console.log(`  Image: ${b.image}...`);
    console.log('');
  });

  console.log('Total needing fix:', broken.length);

  // Return titles for matching
  console.log('\n--- Titles for matching ---');
  broken.filter(b => b.hasAirtable).forEach(b => console.log(b.title));
}

findBrokenImages();
