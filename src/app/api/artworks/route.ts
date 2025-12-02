// API route to get artworks data - fetch directly from Supabase
import { NextResponse } from 'next/server';
import { fetchArtworks } from '@/lib/supabase';

export async function GET() {
  try {
    const artworks = await fetchArtworks();

    return NextResponse.json({
      artworks,
      meta: {
        lastSync: new Date().toISOString(),
        count: artworks.length
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
