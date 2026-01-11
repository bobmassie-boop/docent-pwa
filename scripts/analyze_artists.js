const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeArtists() {
  const { data: artworks } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)", "Artist Last Name"');

  console.log('Total artworks:', artworks.length);

  // Group by last name to find duplicates
  const byLastName = {};
  artworks.forEach(a => {
    const lastName = (a['Artist Last Name'] || 'Unknown').toLowerCase();
    if (!byLastName[lastName]) byLastName[lastName] = [];
    byLastName[lastName].push({
      id: a.ID,
      title: a.Title,
      display: a['Artist (Display)']
    });
  });

  // Find last names with different display formats
  console.log('\n=== Artists with inconsistent naming ===');
  let inconsistentCount = 0;
  const toFix = [];

  Object.entries(byLastName).forEach(([lastName, works]) => {
    const uniqueDisplays = [...new Set(works.map(w => w.display))];
    if (uniqueDisplays.length > 1) {
      inconsistentCount++;
      console.log('\n' + lastName.toUpperCase() + ':');

      // Find the best name (prefer full name without dates/nationality suffixes)
      let bestName = uniqueDisplays[0];
      for (const name of uniqueDisplays) {
        // Prefer names that are in "First Last" format (not "Last, First")
        // And prefer names without extra metadata
        const hasComma = name.includes(',');
        const hasYears = /\d{4}/.test(name);
        const hasNationality = /(American|German|Mexican|British)/i.test(name);

        const currentBest = bestName;
        const currentHasComma = currentBest.includes(',');
        const currentHasYears = /\d{4}/.test(currentBest);

        // Prefer "First Last" over "Last, First"
        if (currentHasComma && !hasComma && !hasYears) {
          bestName = name;
        }
        // If both are "First Last", prefer shorter (without extra metadata)
        else if (!currentHasComma && !hasComma) {
          if (name.length < currentBest.length && !hasYears && !hasNationality) {
            bestName = name;
          }
        }
      }

      uniqueDisplays.forEach(d => {
        const count = works.filter(w => w.display === d).length;
        const marker = d === bestName ? ' ✓ BEST' : '';
        console.log(`  - "${d}" (${count} works)${marker}`);

        if (d !== bestName) {
          works.filter(w => w.display === d).forEach(w => {
            toFix.push({
              id: w.id,
              oldName: d,
              newName: bestName,
              title: w.title
            });
          });
        }
      });
    }
  });

  console.log('\n=== Summary ===');
  console.log('Total artworks:', artworks.length);
  console.log('Unique last names:', Object.keys(byLastName).length);
  console.log('Artists with inconsistent naming:', inconsistentCount);
  console.log('Records to fix:', toFix.length);

  if (toFix.length > 0) {
    console.log('\n=== Records to fix ===');
    toFix.forEach(f => {
      console.log(`ID ${f.id}: "${f.oldName}" → "${f.newName}"`);
    });
  }

  return toFix;
}

analyzeArtists();
