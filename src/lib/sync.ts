// Artwork data synchronization utilities
import { Artwork } from './airtable';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const ARTWORKS_FILE = path.join(DATA_DIR, 'artworks.json');
const SYNC_META_FILE = path.join(DATA_DIR, 'sync-meta.json');

export interface SyncMeta {
  lastSync: string;
  artworkCount: number;
  version: number;
}

/**
 * Save artworks to local JSON file
 */
export async function saveArtworks(artworks: Artwork[]): Promise<void> {
  // Ensure data directory exists
  await fs.mkdir(DATA_DIR, { recursive: true });

  // Save artworks
  await fs.writeFile(
    ARTWORKS_FILE,
    JSON.stringify(artworks, null, 2),
    'utf-8'
  );

  // Save sync metadata
  const meta: SyncMeta = {
    lastSync: new Date().toISOString(),
    artworkCount: artworks.length,
    version: Date.now()
  };

  await fs.writeFile(
    SYNC_META_FILE,
    JSON.stringify(meta, null, 2),
    'utf-8'
  );

  console.log(`✅ Saved ${artworks.length} artworks to ${ARTWORKS_FILE}`);
}

/**
 * Load artworks from local JSON file
 */
export async function loadArtworks(): Promise<Artwork[]> {
  try {
    const data = await fs.readFile(ARTWORKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading artworks:', error);
    return [];
  }
}

/**
 * Get sync metadata
 */
export async function getSyncMeta(): Promise<SyncMeta | null> {
  try {
    const data = await fs.readFile(SYNC_META_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Check if artworks file exists
 */
export async function artworksFileExists(): Promise<boolean> {
  try {
    await fs.access(ARTWORKS_FILE);
    return true;
  } catch {
    return false;
  }
}
