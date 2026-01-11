const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkImages() {
  const { data, error } = await supabase
    .from('Artworks')
    .select('ID, Title, Image, "Image URL"')
    .order('Title');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const missing = [];
  const hasImage = [];

  data.forEach(a => {
    const hasImg = a.Image || a['Image URL'];
    if (hasImg) {
      hasImage.push(a);
    } else {
      missing.push(a);
    }
  });

  console.log('Image Status:');
  console.log('  With images:', hasImage.length);
  console.log('  Missing images:', missing.length);

  if (missing.length > 0) {
    console.log('\nArtworks missing images:');
    missing.forEach(a => {
      console.log('  ID ' + a.ID + ': ' + a.Title);
    });
  }
}

checkImages();
