#!/usr/bin/env ts-node
// Manual sync script to fetch artworks from Airtable
import { config } from 'dotenv';
import { fetchArtworks } from '../src/lib/airtable';
import { saveArtworks } from '../src/lib/sync';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  console.log('🎨 Museum Docent - Airtable Sync');
  console.log('================================\n');

  try {
    console.log('🔄 Fetching artworks from Airtable...');
    const artworks = await fetchArtworks();

    console.log(`✅ Fetched ${artworks.length} artworks`);
    console.log('💾 Saving to local file...');

    await saveArtworks(artworks);

    console.log('\n✨ Sync complete!');
    console.log(`📊 Total artworks: ${artworks.length}`);
  } catch (error: any) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();
