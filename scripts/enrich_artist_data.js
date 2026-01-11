const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Fetch artist info from Wikidata
async function fetchArtistInfo(artistName) {
  try {
    // Clean name for search
    const searchName = artistName
      .replace(/\s*\(.*?\)\s*/g, '')
      .replace(/,.*$/, '')
      .trim();

    // Search Wikidata for the artist
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(searchName)}&language=en&format=json&origin=*`;

    const searchResp = await fetch(searchUrl);
    const searchData = await searchResp.json();

    if (!searchData.search?.length) {
      return null;
    }

    // Find result that's likely an artist/painter
    let entityId = null;
    for (const result of searchData.search.slice(0, 3)) {
      const desc = (result.description || '').toLowerCase();
      if (desc.includes('artist') || desc.includes('painter') || desc.includes('sculptor') || desc.includes('photographer')) {
        entityId = result.id;
        break;
      }
    }

    if (!entityId) {
      entityId = searchData.search[0].id;
    }

    // Fetch entity details
    const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&props=claims|descriptions&languages=en&format=json&origin=*`;

    const entityResp = await fetch(entityUrl);
    const entityData = await entityResp.json();

    const entity = entityData.entities?.[entityId];
    if (!entity) return null;

    const claims = entity.claims || {};

    // Extract birth date (P569)
    let birthYear = null;
    if (claims.P569?.[0]?.mainsnak?.datavalue?.value?.time) {
      const time = claims.P569[0].mainsnak.datavalue.value.time;
      const match = time.match(/(\d{4})/);
      if (match) birthYear = parseInt(match[1]);
    }

    // Extract death date (P570)
    let deathYear = null;
    if (claims.P570?.[0]?.mainsnak?.datavalue?.value?.time) {
      const time = claims.P570[0].mainsnak.datavalue.value.time;
      const match = time.match(/(\d{4})/);
      if (match) deathYear = parseInt(match[1]);
    }

    // Extract nationality/citizenship (P27)
    let nationality = null;
    if (claims.P27?.[0]?.mainsnak?.datavalue?.value?.id) {
      const countryId = claims.P27[0].mainsnak.datavalue.value.id;
      const countries = {
        'Q30': 'American',
        'Q145': 'British',
        'Q183': 'German',
        'Q142': 'French',
        'Q96': 'Mexican',
        'Q38': 'Italian',
        'Q55': 'Dutch',
        'Q29': 'Spanish',
        'Q16': 'Canadian',
        'Q408': 'Australian'
      };
      nationality = countries[countryId] || null;
    }

    // Get short description
    const description = entity.descriptions?.en?.value || null;

    return {
      birthYear,
      deathYear,
      nationality,
      description
    };
  } catch (error) {
    return null;
  }
}

async function enrichArtistData() {
  console.log('Fetching artworks to enrich...');

  const { data: artworks, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)", "Birth Date", "Death Date", Nationality');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${artworks.length} artworks\n`);

  // Get unique artists that need data
  const artistMap = new Map();

  artworks.forEach(artwork => {
    const name = artwork['Artist (Display)'];
    if (!name) return;

    // Check if this artwork needs any data
    const needsBirth = !artwork['Birth Date'];
    const needsDeath = !artwork['Death Date'];
    const needsNationality = !artwork.Nationality;

    if (!needsBirth && !needsDeath && !needsNationality) return;

    if (!artistMap.has(name)) {
      artistMap.set(name, {
        artworkIds: [],
        needsBirth,
        needsDeath,
        needsNationality
      });
    }

    artistMap.get(name).artworkIds.push(artwork.ID);
  });

  console.log(`Found ${artistMap.size} artists needing data enrichment\n`);
  console.log('Fetching Wikidata info...\n');

  let enrichedCount = 0;
  let index = 0;

  for (const [artistName, data] of artistMap) {
    index++;
    const shortName = artistName.substring(0, 38).padEnd(40);
    process.stdout.write(`[${String(index).padStart(3)}/${artistMap.size}] ${shortName} `);

    const info = await fetchArtistInfo(artistName);

    if (info && (info.birthYear || info.deathYear || info.nationality)) {
      data.info = info;
      const parts = [];
      if (info.birthYear) parts.push(info.birthYear);
      if (info.deathYear) parts.push(`-${info.deathYear}`);
      if (info.nationality) parts.push(info.nationality);
      console.log(`✓ ${parts.join(' ')}`);
      enrichedCount++;
    } else {
      console.log('✗');
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nFetched data for ${enrichedCount} artists\n`);

  // Now update artworks
  console.log('Updating Artworks table...\n');

  let updatedCount = 0;

  for (const [artistName, data] of artistMap) {
    if (!data.info) continue;

    const { birthYear, deathYear, nationality } = data.info;

    const updates = {};
    if (birthYear && data.needsBirth) updates['Birth Date'] = birthYear;
    if (deathYear && data.needsDeath) updates['Death Date'] = deathYear;
    if (nationality && data.needsNationality) updates['Nationality'] = nationality;

    if (Object.keys(updates).length === 0) continue;

    // Update all artworks for this artist
    for (const artworkId of data.artworkIds) {
      const { error: updateError } = await supabase
        .from('Artworks')
        .update(updates)
        .eq('ID', artworkId);

      if (!updateError) {
        updatedCount++;
      } else {
        console.log(`Error updating ID ${artworkId}: ${updateError.message}`);
      }
    }

    const updateDesc = Object.entries(updates).map(([k,v]) => `${k}=${v}`).join(', ');
    console.log(`Updated ${data.artworkIds.length} artwork(s) by ${artistName}: ${updateDesc}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Done! Updated ${updatedCount} artwork records.`);

  // Final count
  const { data: final } = await supabase
    .from('Artworks')
    .select('ID, "Birth Date", "Death Date", Nationality');

  const stillMissingBirth = final.filter(a => !a['Birth Date']).length;
  const stillMissingDeath = final.filter(a => !a['Death Date']).length;
  const stillMissingNat = final.filter(a => !a.Nationality).length;

  console.log('\nRemaining missing data:');
  console.log(`  Birth Date: ${stillMissingBirth}`);
  console.log(`  Death Date: ${stillMissingDeath}`);
  console.log(`  Nationality: ${stillMissingNat}`);
}

enrichArtistData();
