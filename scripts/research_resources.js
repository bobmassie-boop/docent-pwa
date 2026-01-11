const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'A:/docent-pwa/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Search Smithsonian American Art Museum
async function searchSAAM(artistName, title) {
  try {
    const query = encodeURIComponent(`${artistName}`);
    const url = `https://api.si.edu/openaccess/api/v1.0/search?q=${query}&rows=5&api_key=JtOdOKzBmTzFN9RjGEu0xYf7skCYqpCo7KrDGa4I`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.response?.rows?.length > 0) {
      // Find American Art Museum results
      for (const row of data.response.rows) {
        if (row.content?.descriptiveNonRepeating?.data_source === 'Smithsonian American Art Museum' ||
            row.content?.descriptiveNonRepeating?.unit_code === 'SAAM') {
          const id = row.id;
          return {
            type: 'saam',
            title: `Smithsonian American Art: ${artistName}`,
            url: `https://americanart.si.edu/search?query=${encodeURIComponent(artistName)}`,
            description: 'Smithsonian American Art Museum collection and research'
          };
        }
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Search Metropolitan Museum of Art
async function searchMet(artistName, title) {
  try {
    const query = encodeURIComponent(artistName);
    const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}&hasImages=true`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.objectIDs?.length > 0) {
      // Get first object details
      const objUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${data.objectIDs[0]}`;
      const objResponse = await fetch(objUrl);
      const obj = await objResponse.json();

      if (obj.artistDisplayName?.toLowerCase().includes(artistName.split(' ').pop().toLowerCase())) {
        return {
          type: 'met',
          title: `Metropolitan Museum: ${artistName}`,
          url: `https://www.metmuseum.org/search-results?q=${encodeURIComponent(artistName)}&searchField=ArtistCulture`,
          description: 'The Met collection - explore works and artist information'
        };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Search National Gallery of Art
async function searchNGA(artistName) {
  try {
    // NGA doesn't have a public API, but we can construct search URLs
    const lastName = artistName.split(' ').pop();
    return {
      type: 'nga',
      title: `National Gallery of Art: ${artistName}`,
      url: `https://www.nga.gov/collection/artist-info.${encodeURIComponent(lastName.toLowerCase())}.html`,
      description: 'National Gallery of Art collection and scholarly resources'
    };
  } catch (error) {
    return null;
  }
}

// Search Getty Research
async function searchGetty(artistName) {
  try {
    const query = encodeURIComponent(artistName);
    return {
      type: 'getty',
      title: `Getty Research: ${artistName}`,
      url: `https://www.getty.edu/art/collection/search?q=${query}`,
      description: 'Getty Research Institute - art historical research and collections'
    };
  } catch (error) {
    return null;
  }
}

// Search Art Institute of Chicago
async function searchAIC(artistName) {
  try {
    const query = encodeURIComponent(artistName);
    const url = `https://api.artic.edu/api/v1/artists/search?q=${query}&limit=1`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.data?.length > 0) {
      const artist = data.data[0];
      return {
        type: 'aic',
        title: `Art Institute of Chicago: ${artistName}`,
        url: `https://www.artic.edu/artists/${artist.id}`,
        description: 'Art Institute of Chicago artist page and collection'
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Search Tate (for British artists)
async function searchTate(artistName) {
  try {
    return {
      type: 'tate',
      title: `Tate: ${artistName}`,
      url: `https://www.tate.org.uk/search?q=${encodeURIComponent(artistName)}`,
      description: 'Tate collection - British and international modern art'
    };
  } catch (error) {
    return null;
  }
}

// Get Google Arts & Culture link
async function getGoogleArts(artistName, title) {
  return {
    type: 'other',
    title: `Google Arts & Culture: ${title || artistName}`,
    url: `https://artsandculture.google.com/search?q=${encodeURIComponent(artistName)}`,
    description: 'High-resolution images and virtual museum tours'
  };
}

// Get Archive.org link for historical context
async function getArchiveOrg(artistName, title) {
  return {
    type: 'archive',
    title: `Archive.org: Historical Resources`,
    url: `https://archive.org/search?query=${encodeURIComponent(artistName + ' art')}`,
    description: 'Historical books, catalogs, and documents'
  };
}

// Artist-specific authoritative sources
const ARTIST_SPECIFIC_SOURCES = {
  'Joseph Mallord William Turner': [
    { type: 'tate', title: 'Tate: J.M.W. Turner Collection', url: 'https://www.tate.org.uk/art/artists/joseph-mallord-william-turner-558', description: "World's largest Turner collection - over 300 oil paintings and 30,000 works on paper" },
    { type: 'nga', title: 'National Gallery: Turner', url: 'https://www.nga.gov/collection/artist-info.1947.html', description: 'National Gallery of Art Turner holdings and analysis' },
    { type: 'met', title: 'Met Museum: Turner', url: 'https://www.metmuseum.org/art/collection/search?q=turner&artistOrCulture=true', description: 'Metropolitan Museum Turner collection' }
  ],
  'William Merritt Chase': [
    { type: 'saam', title: 'SAAM: William Merritt Chase', url: 'https://americanart.si.edu/artist/william-merritt-chase-848', description: 'Smithsonian American Art Museum - major Chase collection' },
    { type: 'met', title: 'Met Museum: Chase', url: 'https://www.metmuseum.org/art/collection/search?q=william+merritt+chase', description: 'Metropolitan Museum Chase paintings' },
    { type: 'aic', title: 'Art Institute: Chase', url: 'https://www.artic.edu/artists/4317/william-merritt-chase', description: 'Art Institute of Chicago Chase collection' }
  ],
  'Childe Hassam': [
    { type: 'saam', title: 'SAAM: Childe Hassam', url: 'https://americanart.si.edu/artist/childe-hassam-2109', description: 'Smithsonian American Art - leading American Impressionist' },
    { type: 'met', title: 'Met Museum: Hassam', url: 'https://www.metmuseum.org/art/collection/search?q=childe+hassam', description: 'Metropolitan Museum Hassam collection' }
  ],
  'Thomas Eakins': [
    { type: 'other', title: 'Philadelphia Museum: Eakins', url: 'https://philamuseum.org/collection/results.html?searchTxt=thomas+eakins', description: 'Philadelphia Museum of Art - major Eakins collection' },
    { type: 'met', title: 'Met Museum: Eakins', url: 'https://www.metmuseum.org/art/collection/search?q=thomas+eakins', description: 'Metropolitan Museum Eakins paintings' }
  ],
  'Frederic Remington': [
    { type: 'other', title: 'Frederic Remington Art Museum', url: 'https://www.fredericremington.org/', description: 'Dedicated museum with largest Remington collection' },
    { type: 'saam', title: 'SAAM: Remington', url: 'https://americanart.si.edu/artist/frederic-remington-4008', description: 'Smithsonian American Art Remington bronzes and paintings' }
  ],
  'George Bellows': [
    { type: 'saam', title: 'SAAM: George Bellows', url: 'https://americanart.si.edu/artist/george-bellows-379', description: 'Smithsonian American Art - Ashcan School master' },
    { type: 'nga', title: 'NGA: Bellows', url: 'https://www.nga.gov/collection/artist-info.1033.html', description: 'National Gallery Bellows collection' }
  ],
  'Winslow Homer': [
    { type: 'met', title: 'Met Museum: Homer', url: 'https://www.metmuseum.org/art/collection/search?q=winslow+homer', description: 'Metropolitan Museum - extensive Homer collection' },
    { type: 'saam', title: 'SAAM: Homer', url: 'https://americanart.si.edu/artist/winslow-homer-2300', description: 'Smithsonian American Art Homer works' }
  ],
  'John Singer Sargent': [
    { type: 'met', title: 'Met Museum: Sargent', url: 'https://www.metmuseum.org/art/collection/search?q=john+singer+sargent', description: 'Metropolitan Museum - major Sargent portraits' },
    { type: 'tate', title: 'Tate: Sargent', url: 'https://www.tate.org.uk/art/artists/john-singer-sargent-1915', description: 'Tate collection Sargent works' }
  ],
  'Henry Ossawa Tanner': [
    { type: 'saam', title: 'SAAM: Henry Ossawa Tanner', url: 'https://americanart.si.edu/artist/henry-ossawa-tanner-4759', description: 'Smithsonian - pioneering African American artist' },
    { type: 'other', title: 'Philadelphia Museum: Tanner', url: 'https://philamuseum.org/collection/results.html?searchTxt=henry+ossawa+tanner', description: 'Philadelphia Museum Tanner collection' }
  ],
  'Thomas Hart Benton': [
    { type: 'saam', title: 'SAAM: Thomas Hart Benton', url: 'https://americanart.si.edu/artist/thomas-hart-benton-433', description: 'Smithsonian - American Regionalist murals and paintings' },
    { type: 'other', title: 'Nelson-Atkins Museum: Benton', url: 'https://art.nelson-atkins.org/people/2285', description: 'Nelson-Atkins Museum - Benton hometown collection' }
  ],
  'Georgia O\'Keeffe': [
    { type: 'other', title: 'Georgia O\'Keeffe Museum', url: 'https://www.okeeffemuseum.org/', description: 'Dedicated museum in Santa Fe with largest collection' },
    { type: 'aic', title: 'Art Institute: O\'Keeffe', url: 'https://www.artic.edu/artists/36062/georgia-o-keeffe', description: 'Art Institute of Chicago O\'Keeffe works' }
  ],
  'J. Ottis Adams': [
    { type: 'ima', title: 'IMA: J. Ottis Adams', url: 'https://discovernewfields.org/search?query=j+ottis+adams', description: 'Indianapolis Museum of Art - Hoosier Group founder' },
    { type: 'saam', title: 'SAAM: J. Ottis Adams', url: 'https://americanart.si.edu/artist/john-ottis-adams-19', description: 'Smithsonian American Art Adams paintings' }
  ],
  'T. C. Steele': [
    { type: 'ima', title: 'IMA: T.C. Steele', url: 'https://discovernewfields.org/search?query=t+c+steele', description: 'Indianapolis Museum of Art - Indiana Impressionist' },
    { type: 'other', title: 'T.C. Steele State Historic Site', url: 'https://www.indianamuseum.org/t-c-steele-state-historic-site/', description: 'Indiana State Museum - Steele home and studio' }
  ]
};

// Research resources for a single artwork
async function researchArtwork(artwork) {
  const resources = [];
  const artistName = artwork['Artist (Display)'] || '';
  const title = artwork.Title || '';
  const nationality = artwork.Nationality || 'American';

  // 1. Check for artist-specific curated sources first
  if (ARTIST_SPECIFIC_SOURCES[artistName]) {
    resources.push(...ARTIST_SPECIFIC_SOURCES[artistName]);
  }

  // 2. Search museum APIs
  if (resources.length < 5) {
    const saam = await searchSAAM(artistName, title);
    if (saam && !resources.some(r => r.type === 'saam')) resources.push(saam);
  }

  if (resources.length < 5) {
    const met = await searchMet(artistName, title);
    if (met && !resources.some(r => r.type === 'met')) resources.push(met);
  }

  if (resources.length < 5) {
    const aic = await searchAIC(artistName);
    if (aic && !resources.some(r => r.type === 'aic')) resources.push(aic);
  }

  // 3. Add Tate for British artists
  if (nationality === 'British' && resources.length < 5) {
    const tate = await searchTate(artistName);
    if (tate && !resources.some(r => r.type === 'tate')) resources.push(tate);
  }

  // 4. Add Getty Research
  if (resources.length < 5) {
    const getty = await searchGetty(artistName);
    if (getty && !resources.some(r => r.type === 'getty')) resources.push(getty);
  }

  // 5. Add Google Arts & Culture
  if (resources.length < 5) {
    const gac = await getGoogleArts(artistName, title);
    if (gac) resources.push(gac);
  }

  // 6. Add Archive.org for historical resources
  if (resources.length < 5) {
    const archive = await getArchiveOrg(artistName, title);
    if (archive) resources.push(archive);
  }

  return resources.slice(0, 5);
}

// Main function to research all artworks
async function researchAllArtworks() {
  console.log('Fetching artworks...\n');

  const { data: artworks, error } = await supabase
    .from('Artworks')
    .select('ID, Title, "Artist (Display)", Nationality, "Online Resources"')
    .order('ID');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`Found ${artworks.length} artworks. Researching resources...\n`);

  let processed = 0;
  let totalResources = 0;

  for (const artwork of artworks) {
    processed++;
    const title = (artwork.Title || 'Untitled').substring(0, 40).padEnd(42);
    process.stdout.write(`[${String(processed).padStart(3)}/${artworks.length}] ${title} `);

    try {
      const resources = await researchArtwork(artwork);

      if (resources.length > 0) {
        const { error: updateError } = await supabase
          .from('Artworks')
          .update({ 'Online Resources': resources })
          .eq('ID', artwork.ID);

        if (updateError) {
          console.log(`ERROR: ${updateError.message}`);
        } else {
          totalResources += resources.length;
          console.log(`✓ ${resources.length} resources`);
        }
      } else {
        console.log('✗ no resources found');
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Done! Added ${totalResources} resources across ${processed} artworks.`);
  console.log(`Average: ${(totalResources / processed).toFixed(1)} resources per artwork`);
}

// Run
researchAllArtworks();
