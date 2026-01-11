const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Resource types - authoritative sources only
const RESOURCE_TYPES = {
  ima: 'IMA Collection',
  saam: 'Smithsonian American Art',
  met: 'Metropolitan Museum',
  nga: 'National Gallery of Art',
  getty: 'Getty Research',
  tate: 'Tate Gallery',
  moma: 'MoMA',
  aic: 'Art Institute Chicago',
  academic: 'Academic/JSTOR',
  khan: 'Khan Academy',
  archive: 'Archive.org',
  other: 'Other Museum'
};

// Add a resource to an artwork
async function addResource(artworkId, resource) {
  const { data: artwork, error: fetchError } = await supabase
    .from('Artworks')
    .select('ID, Title, "Online Resources"')
    .eq('ID', artworkId)
    .single();

  if (fetchError) {
    console.error('Error fetching artwork:', fetchError.message);
    return false;
  }

  const currentResources = artwork['Online Resources'] || [];

  // Check for duplicate URL
  if (currentResources.some(r => r.url === resource.url)) {
    console.log('Resource already exists for this artwork');
    return false;
  }

  const updatedResources = [...currentResources, resource];

  const { error: updateError } = await supabase
    .from('Artworks')
    .update({ 'Online Resources': updatedResources })
    .eq('ID', artworkId);

  if (updateError) {
    console.error('Error updating artwork:', updateError.message);
    return false;
  }

  console.log(`Added resource to "${artwork.Title}": ${resource.title}`);
  return true;
}

// Remove a resource by index
async function removeResource(artworkId, index) {
  const { data: artwork, error: fetchError } = await supabase
    .from('Artworks')
    .select('ID, Title, "Online Resources"')
    .eq('ID', artworkId)
    .single();

  if (fetchError) {
    console.error('Error:', fetchError.message);
    return false;
  }

  const resources = artwork['Online Resources'] || [];
  if (index < 0 || index >= resources.length) {
    console.error('Invalid index');
    return false;
  }

  const removed = resources.splice(index, 1)[0];

  const { error: updateError } = await supabase
    .from('Artworks')
    .update({ 'Online Resources': resources })
    .eq('ID', artworkId);

  if (updateError) {
    console.error('Error:', updateError.message);
    return false;
  }

  console.log(`Removed: ${removed.title}`);
  return true;
}

// List all artworks with their resource counts
async function listArtworks() {
  const { data, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)", "Online Resources"')
    .order('Title');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('\nArtworks and Online Resources:\n');
  console.log('ID'.padEnd(6) + 'Res'.padEnd(5) + 'Title'.padEnd(45) + 'Artist');
  console.log('-'.repeat(100));

  data.forEach(artwork => {
    const resourceCount = (artwork['Online Resources'] || []).length;
    const title = (artwork.Title || 'Untitled').substring(0, 43);
    const artist = (artwork['Artist (Display)'] || '').substring(0, 30);
    console.log(
      String(artwork.ID).padEnd(6) +
      String(resourceCount).padEnd(5) +
      title.padEnd(45) +
      artist
    );
  });

  const withResources = data.filter(a => (a['Online Resources'] || []).length > 0).length;
  console.log(`\nTotal: ${data.length} artworks, ${withResources} with online resources`);
}

// View resources for a specific artwork
async function viewResources(artworkId) {
  const { data, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)", "Online Resources"')
    .eq('ID', artworkId)
    .single();

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`\n${data.Title}`);
  console.log(`by ${data['Artist (Display)']}`);
  console.log('-'.repeat(60));

  const resources = data['Online Resources'] || [];
  if (resources.length === 0) {
    console.log('No online resources yet.');
    console.log('\nAdd resources with:');
    console.log(`  node manage_online_resources.js add ${artworkId} <type> "<title>" "<url>" "[description]"`);
  } else {
    resources.forEach((r, i) => {
      console.log(`\n[${i}] ${RESOURCE_TYPES[r.type] || r.type}: ${r.title}`);
      console.log(`    ${r.url}`);
      if (r.description) console.log(`    ${r.description}`);
    });
  }
}

// Search artworks by title or artist
async function searchArtworks(query) {
  const { data, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)", "Online Resources"');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const q = query.toLowerCase();
  const matches = data.filter(a =>
    (a.Title || '').toLowerCase().includes(q) ||
    (a['Artist (Display)'] || '').toLowerCase().includes(q)
  );

  console.log(`\nSearch results for "${query}":\n`);
  console.log('ID'.padEnd(6) + 'Res'.padEnd(5) + 'Title'.padEnd(45) + 'Artist');
  console.log('-'.repeat(100));

  matches.forEach(artwork => {
    const resourceCount = (artwork['Online Resources'] || []).length;
    console.log(
      String(artwork.ID).padEnd(6) +
      String(resourceCount).padEnd(5) +
      (artwork.Title || '').substring(0, 43).padEnd(45) +
      (artwork['Artist (Display)'] || '').substring(0, 30)
    );
  });

  console.log(`\nFound ${matches.length} matches`);
}

// Bulk add from JSON file
async function bulkAdd(jsonFile) {
  const fs = require('fs');
  try {
    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    for (const item of data) {
      if (item.artworkId && item.resources) {
        for (const resource of item.resources) {
          await addResource(item.artworkId, resource);
        }
      }
    }
    console.log('Bulk import complete');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Export current resources to JSON
async function exportResources() {
  const { data, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)", "Online Resources"')
    .order('Title');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const withResources = data.filter(a => (a['Online Resources'] || []).length > 0);

  const output = withResources.map(a => ({
    artworkId: a.ID,
    title: a.Title,
    artist: a['Artist (Display)'],
    resources: a['Online Resources']
  }));

  console.log(JSON.stringify(output, null, 2));
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'list':
    listArtworks();
    break;

  case 'view':
    if (!args[1]) {
      console.log('Usage: node manage_online_resources.js view <artwork_id>');
    } else {
      viewResources(parseInt(args[1]));
    }
    break;

  case 'search':
    if (!args[1]) {
      console.log('Usage: node manage_online_resources.js search <query>');
    } else {
      searchArtworks(args.slice(1).join(' '));
    }
    break;

  case 'add':
    if (args.length < 5) {
      console.log('Usage: node manage_online_resources.js add <artwork_id> <type> "<title>" "<url>" "[description]"');
      console.log('\nTypes:', Object.keys(RESOURCE_TYPES).join(', '));
      console.log('\nExamples:');
      console.log('  node manage_online_resources.js add 42 saam "SAAM Collection" "https://americanart.si.edu/..."');
      console.log('  node manage_online_resources.js add 42 ima "IMA Page" "https://discovernewfields.org/..." "Official IMA page"');
    } else {
      addResource(parseInt(args[1]), {
        type: args[2],
        title: args[3],
        url: args[4],
        description: args[5] || null
      });
    }
    break;

  case 'remove':
    if (args.length < 3) {
      console.log('Usage: node manage_online_resources.js remove <artwork_id> <resource_index>');
    } else {
      removeResource(parseInt(args[1]), parseInt(args[2]));
    }
    break;

  case 'bulk':
    if (!args[1]) {
      console.log('Usage: node manage_online_resources.js bulk <json_file>');
      console.log('\nJSON format:');
      console.log('[');
      console.log('  {');
      console.log('    "artworkId": 42,');
      console.log('    "resources": [');
      console.log('      { "type": "saam", "title": "...", "url": "...", "description": "..." }');
      console.log('    ]');
      console.log('  }');
      console.log(']');
    } else {
      bulkAdd(args[1]);
    }
    break;

  case 'export':
    exportResources();
    break;

  default:
    console.log(`
Online Resources Manager - Authoritative Sources

Commands:
  list                      List all artworks with resource counts
  search <query>            Search artworks by title or artist
  view <id>                 View resources for an artwork
  add <id> <type> <title> <url> [desc]   Add a resource
  remove <id> <index>       Remove a resource by index
  bulk <json_file>          Bulk import from JSON
  export                    Export all resources as JSON

Resource Types:
  ima      - IMA Collection page
  saam     - Smithsonian American Art Museum
  met      - Metropolitan Museum of Art
  nga      - National Gallery of Art
  getty    - Getty Research Institute
  tate     - Tate Gallery
  moma     - Museum of Modern Art
  aic      - Art Institute of Chicago
  academic - Academic papers (JSTOR, etc.)
  khan     - Khan Academy
  archive  - Archive.org
  other    - Other museum/institution

Examples:
  node manage_online_resources.js search Turner
  node manage_online_resources.js view 13
  node manage_online_resources.js add 13 tate "Tate Turner Collection" "https://www.tate.org.uk/art/artists/joseph-mallord-william-turner-558"
    `);
}
