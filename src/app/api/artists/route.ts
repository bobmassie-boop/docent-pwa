// API route to get artists derived from Artworks table
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Artist {
  name: string;
  lastName: string;
  birthYear: number | null;
  deathYear: number | null;
  nationality: string;
  biography: string | null;
  artworkCount: number;
  artworkIds: string[];
  thumbnails: string[];
  portraitUrl: string | null;
}

export async function GET() {
  try {
    const { data: artworks, error } = await supabase
      .from('Artworks')
      .select(`
        ID,
        Title,
        "Artist (Display)",
        "Artist Last Name",
        "Artist Biography",
        "Birth Date",
        "Death Date",
        Nationality,
        "Image Upload",
        "Image URL",
        Image
      `);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Group by artist
    const artistMap = new Map<string, Artist>();

    (artworks || []).forEach(artwork => {
      const name = artwork['Artist (Display)'];
      if (!name) return;

      if (!artistMap.has(name)) {
        artistMap.set(name, {
          name,
          lastName: artwork['Artist Last Name'] || '',
          birthYear: artwork['Birth Date'] || null,
          deathYear: artwork['Death Date'] || null,
          nationality: artwork['Nationality'] || 'American',
          biography: null,
          artworkCount: 0,
          artworkIds: [],
          thumbnails: [],
          portraitUrl: null
        });
      }

      const artist = artistMap.get(name)!;
      artist.artworkCount++;
      artist.artworkIds.push(String(artwork.ID));

      // Keep longest biography
      const bio = artwork['Artist Biography'];
      if (bio && (!artist.biography || bio.length > artist.biography.length)) {
        artist.biography = bio;
      }

      // Collect thumbnails (up to 4)
      const thumb = artwork['Image Upload'] || artwork['Image URL'] || artwork['Image'];
      if (thumb && artist.thumbnails.length < 4) {
        artist.thumbnails.push(thumb);
      }
    });

    // Convert to array and sort by artwork count
    const artists = Array.from(artistMap.values())
      .sort((a, b) => b.artworkCount - a.artworkCount);

    return NextResponse.json({
      artists,
      meta: {
        count: artists.length,
        lastSync: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
