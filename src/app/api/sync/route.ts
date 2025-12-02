// API route to sync artworks from Supabase
import { NextResponse } from 'next/server';
import { fetchArtworks } from '@/lib/supabase';
import { saveArtworks } from '@/lib/sync';

export async function POST() {
  try {
    console.log('🔄 Starting Airtable sync...');

    const artworks = await fetchArtworks();
    await saveArtworks(artworks);

    return NextResponse.json({
      success: true,
      count: artworks.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Sync failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger sync'
  });
}
