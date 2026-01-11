const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to normalize artist names for grouping
function normalizeArtistName(name) {
  if (!name) return '';

  // Remove dates and country info
  let normalized = name
    .replace(/,?\s*(American|German|Mexican|British|French|Italian|Dutch)\s*,?/gi, '')
    .replace(/\d{4}\s*[-–]\s*\d{4}/g, '')
    .replace(/\(\d{4}[-–]\d{4}\)/g, '')
    .replace(/[|,]\s*\d{4}[-–]?\d{0,4}/g, '')
    .trim();

  // Handle "Last, First" format
  if (normalized.includes(',')) {
    const parts = normalized.split(',').map(p => p.trim());
    if (parts.length === 2 && !parts[1].includes(' ')) {
      normalized = `${parts[1]} ${parts[0]}`;
    }
  }

  // Remove parenthetical prefixes like "(Thomas)"
  normalized = normalized.replace(/^\([^)]+\)\s*/, '');

  return normalized.trim();
}

// Extract canonical name (for display)
function getCanonicalName(name) {
  if (!name) return '';

  // Remove dates
  let canonical = name
    .replace(/,?\s*\d{4}\s*[-–]\s*\d{4}/g, '')
    .replace(/\(\d{4}[-–]\d{4}\)/g, '')
    .replace(/[|,]\s*\d{4}[-–]?\d{0,4}/g, '')
    .trim();

  // Remove nationality suffixes
  canonical = canonical
    .replace(/,?\s*(American|German|Mexican|British|French|Italian|Dutch)\s*$/gi, '')
    .replace(/,?\s*(American|German|Mexican|British|French|Italian|Dutch)\s*,/gi, ',')
    .trim();

  // Handle "Last, First" format
  if (canonical.includes(',')) {
    const parts = canonical.split(',').map(p => p.trim());
    if (parts.length === 2) {
      canonical = `${parts[1]} ${parts[0]}`;
    }
  }

  // Remove parenthetical prefixes
  canonical = canonical.replace(/^\([^)]+\)\s*/, '');

  // Clean up extra spaces and trailing punctuation
  canonical = canonical.replace(/\s+/g, ' ').replace(/[,\-–]+$/, '').trim();

  return canonical;
}

// Extract birth/death years
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

// Extract nationality
function extractNationality(name) {
  const match = name.match(/(American|German|Mexican|British|French|Italian|Dutch)/i);
  return match ? match[1] : null;
}

async function createArtistsTable() {
  console.log('Fetching artworks...');

  const { data: artworks, error } = await supabase
    .from('Artworks')
    .select('"Artist (Display)", "Artist Last Name", "Artist Biography", "ID", "Title"');

  if (error) {
    console.error('Error fetching artworks:', error);
    return;
  }

  console.log(`Found ${artworks.length} artworks\n`);

  // Group by normalized name to deduplicate
  const artistGroups = new Map();

  artworks.forEach(artwork => {
    const displayName = artwork['Artist (Display)'];
    if (!displayName) return;

    const normalized = normalizeArtistName(displayName).toLowerCase();
    if (!normalized) return;

    if (!artistGroups.has(normalized)) {
      artistGroups.set(normalized, {
        displayNames: new Set(),
        lastName: artwork['Artist Last Name'],
        biography: null,
        artworkIds: [],
        artworkCount: 0
      });
    }

    const group = artistGroups.get(normalized);
    group.displayNames.add(displayName);
    group.artworkIds.push(artwork.ID);
    group.artworkCount++;

    // Keep the longest biography
    const bio = artwork['Artist Biography'];
    if (bio && (!group.biography || bio.length > group.biography.length)) {
      group.biography = bio;
    }
  });

  console.log(`Found ${artistGroups.size} unique artists\n`);

  // Build artist records
  const artistRecords = [];

  artistGroups.forEach((group, normalizedName) => {
    // Pick the best display name (prefer ones with dates/nationality info)
    const displayNames = Array.from(group.displayNames);
    let bestName = displayNames[0];
    for (const name of displayNames) {
      // Prefer names that don't have the weird formatting
      if (!name.includes('|') && name.length > bestName.length) {
        bestName = name;
      }
    }

    const canonicalName = getCanonicalName(bestName);
    const { birthYear, deathYear } = extractYears(bestName);
    const nationality = extractNationality(bestName);

    artistRecords.push({
      canonical_name: canonicalName,
      display_name: bestName,
      last_name: group.lastName,
      birth_year: birthYear,
      death_year: deathYear,
      nationality: nationality,
      biography: group.biography,
      artwork_count: group.artworkCount,
      artwork_ids: group.artworkIds,
      portrait_url: null,
      wikipedia_url: null
    });
  });

  // Sort by artwork count descending
  artistRecords.sort((a, b) => b.artwork_count - a.artwork_count);

  console.log('Top 20 artists by artwork count:');
  artistRecords.slice(0, 20).forEach((a, i) => {
    console.log(`  ${i+1}. ${a.canonical_name} (${a.artwork_count} works)`);
  });

  console.log('\n\nCreating/updating Artists table...');

  // First, let's check if the table exists
  const { data: existingTable, error: tableError } = await supabase
    .from('Artists')
    .select('artist_id')
    .limit(1);

  if (tableError && tableError.code === '42P01') {
    console.log('Artists table does not exist. Please create it in Supabase with these columns:');
    console.log(`
CREATE TABLE "Artists" (
  artist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,
  display_name TEXT,
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
    `);

    // Save to JSON for manual import
    const fs = require('fs');
    fs.writeFileSync('A:/docent-pwa/scripts/artists_data.json', JSON.stringify(artistRecords, null, 2));
    console.log('\nSaved artist data to artists_data.json');
    return artistRecords;
  }

  // If table exists, upsert the data
  console.log('Table exists, inserting records...');

  // Clear existing data first
  const { error: deleteError } = await supabase
    .from('Artists')
    .delete()
    .neq('artist_id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.log('Note: Could not clear existing data:', deleteError.message);
  }

  // Insert in batches
  const batchSize = 50;
  for (let i = 0; i < artistRecords.length; i += batchSize) {
    const batch = artistRecords.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from('Artists')
      .insert(batch);

    if (insertError) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${batch.length} records)`);
    }
  }

  console.log(`\nDone! Created ${artistRecords.length} artist records.`);
  return artistRecords;
}

createArtistsTable();
