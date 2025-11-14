// API route to get artworks data
import { NextResponse } from 'next/server';
import { loadArtworks, getSyncMeta } from '@/lib/sync';

export async function GET() {
  try {
    const artworks = await loadArtworks();
    const meta = await getSyncMeta();

    return NextResponse.json({
      artworks,
      meta
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
