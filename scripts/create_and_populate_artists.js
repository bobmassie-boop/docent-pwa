const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to extract years from name string
function extractYears(name) {
  const match = name.match(/(\d{4})\s*[-–]\s*(\d{4})?/);
  if (match) {
    return {
      birthYear: parseInt(match[1]),
      deathYear: match[2] ? parseInt(match[2]) : null
    };
  }
  return { birthYear: null, deathYear: null };
}

// Fetch artist image from Wikipedia
async function fetchWikipediaImage(artistName) {
  try {
    // Clean the name for Wikipedia search
    const searchName = artistName
      .replace(/\s*\(.*?\)\s*/g, '')  // Remove parenthetical info
      .replace(/,.*$/, '')             // Remove everything after comma
      .trim();

    // First, search for the Wikipedia page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchName + ' artist painter')}&format=json&origin=*`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query?.search?.length) {
      return null;
    }

    const pageTitle = searchData.query.search[0].title;

    // Get page images
    const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=300&format=json&origin=*`;

    const imageResponse = await fetch(imageUrl);
    const imageData = await imageResponse.json();

    const pages = imageData.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    const thumbnail = pages[pageId]?.thumbnail?.source;

    // Also get Wikipedia URL
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;

    return {
      portrait_url: thumbnail || null,
      wikipedia_url: wikiUrl
    };
  } catch (error) {
    console.error(`  Error fetching Wikipedia for ${artistName}:`, error.message);
    return null;
  }
}

async function createAndPopulateArtists() {
  console.log('Fetching artworks to build artist list...');

  const { data: artworks, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)", "Artist Last Name", "Artist Biography"');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${artworks.length} artworks\n`);

  // Group by artist display name
  const artistMap = new Map();

  artworks.forEach(artwork => {
    const name = artwork['Artist (Display)'];
    if (!name) return;

    if (!artistMap.has(name)) {
      artistMap.set(name, {
        canonical_name: name,
        last_name: artwork['Artist Last Name'] || '',
        biography: null,
        artwork_ids: [],
        artwork_count: 0
      });
    }

    const artist = artistMap.get(name);
    artist.artwork_ids.push(artwork.ID);
    artist.artwork_count++;

    // Keep longest biography
    const bio = artwork['Artist Biography'];
    if (bio && (!artist.biography || bio.length > artist.biography.length)) {
      artist.biography = bio;
    }
  });

  console.log(`Found ${artistMap.size} unique artists\n`);

  // Convert to array and add metadata
  const artists = [];

  for (const [name, data] of artistMap) {
    const { birthYear, deathYear } = extractYears(name);

    artists.push({
      canonical_name: data.canonical_name,
      last_name: data.last_name,
      birth_year: birthYear,
      death_year: deathYear,
      nationality: 'American', // Default, most are American
      biography: data.biography,
      artwork_count: data.artwork_count,
      artwork_ids: data.artwork_ids,
      portrait_url: null,
      wikipedia_url: null
    });
  }

  // Sort by artwork count
  artists.sort((a, b) => b.artwork_count - a.artwork_count);

  console.log('Top 20 artists by artwork count:');
  artists.slice(0, 20).forEach((a, i) => {
    console.log(`  ${i+1}. ${a.canonical_name} (${a.artwork_count} works)`);
  });

  // Fetch Wikipedia images for top artists (those with 2+ works first)
  console.log('\n\nFetching Wikipedia portraits...\n');

  let fetchedCount = 0;
  const priorityArtists = artists.filter(a => a.artwork_count >= 2);

  for (const artist of priorityArtists) {
    console.log(`Fetching: ${artist.canonical_name}...`);
    const wikiData = await fetchWikipediaImage(artist.canonical_name);

    if (wikiData) {
      artist.portrait_url = wikiData.portrait_url;
      artist.wikipedia_url = wikiData.wikipedia_url;
      if (wikiData.portrait_url) {
        console.log(`  ✓ Found portrait`);
        fetchedCount++;
      } else {
        console.log(`  - No portrait, but found wiki page`);
      }
    } else {
      console.log(`  ✗ Not found`);
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nFetched ${fetchedCount} portraits for ${priorityArtists.length} priority artists`);

  // Now fetch for remaining artists (1 work each)
  const singleArtists = artists.filter(a => a.artwork_count === 1);
  console.log(`\nFetching portraits for ${singleArtists.length} single-work artists...`);

  for (const artist of singleArtists) {
    const wikiData = await fetchWikipediaImage(artist.canonical_name);
    if (wikiData) {
      artist.portrait_url = wikiData.portrait_url;
      artist.wikipedia_url = wikiData.wikipedia_url;
      if (wikiData.portrait_url) fetchedCount++;
    }
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nTotal portraits found: ${fetchedCount}`);

  // Check if Artists table exists
  console.log('\n\nChecking Artists table...');
  const { error: tableError } = await supabase
    .from('Artists')
    .select('artist_id')
    .limit(1);

  if (tableError && tableError.code === '42P01') {
    console.log('Artists table does not exist!');
    console.log('Please create it in Supabase with this SQL:\n');
    console.log(`
CREATE TABLE "Artists" (
  artist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL UNIQUE,
  last_name TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  nationality TEXT,
  biography TEXT,
  artwork_count INTEGER DEFAULT 0,
  artwork_ids TEXT[],
  portrait_url TEXT,
  wikipedia_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS with public read
ALTER TABLE "Artists" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON "Artists" FOR SELECT TO anon USING (true);
    `);

    // Save to JSON for manual import
    const fs = require('fs');
    fs.writeFileSync('A:/docent-pwa/scripts/artists_data.json', JSON.stringify(artists, null, 2));
    console.log('\nSaved artist data to artists_data.json for manual import');
    return;
  }

  // Table exists - insert data
  console.log('Artists table exists, inserting data...\n');

  // Clear existing data
  await supabase.from('Artists').delete().neq('artist_id', '00000000-0000-0000-0000-000000000000');

  // Insert in batches
  const batchSize = 25;
  let insertedCount = 0;

  for (let i = 0; i < artists.length; i += batchSize) {
    const batch = artists.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from('Artists')
      .insert(batch);

    if (insertError) {
      console.error(`Batch ${Math.floor(i/batchSize) + 1} error:`, insertError.message);
    } else {
      insertedCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} artists)`);
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Done! Inserted ${insertedCount} artists.`);
  console.log(`Portraits found: ${artists.filter(a => a.portrait_url).length}`);
}

createAndPopulateArtists();
