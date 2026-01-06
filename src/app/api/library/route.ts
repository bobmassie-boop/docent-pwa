// API route to get library books data - fetch directly from Supabase
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('Docent_library_catalog')
      .select('*');

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    const books = (data || []).map(record => ({
      book_id: String(record.book_id),
      title: record.title || '',
      author: record['Author(s)'] || '',
      publisher: record.Publisher,
      year: record.Year,
      callNumber: record['Call Number'],
      physicalCopy: record['Physical Copy'],
      digitalAvailable: record['Digital Available'],
      contentSummary: record['Content Summary'],
      subjectTags: record['Subject Tags'],
      artists: record.Artists,
      artMovements: record['Art Movements'],
      linkedArtworks: record['Linked Artworks'],
      coverUrl: record['Cover URL']
    }));

    // Sort books: real titles first (alphabetically), placeholder/unknown titles at the bottom
    const isPlaceholderTitle = (title: string) => {
      if (!title || !title.trim()) return true;
      const t = title.trim().toLowerCase();
      // Treat bracketed titles like [Unknown], [Book], [Partial], [...] as placeholders
      return t.startsWith('[') || t === 'unknown' || t === 'untitled';
    };

    books.sort((a, b) => {
      const aIsPlaceholder = isPlaceholderTitle(a.title);
      const bIsPlaceholder = isPlaceholderTitle(b.title);

      if (!aIsPlaceholder && bIsPlaceholder) return -1;
      if (aIsPlaceholder && !bIsPlaceholder) return 1;

      // Both have real titles or both are placeholders - sort alphabetically
      return (a.title || '').localeCompare(b.title || '');
    });

    return NextResponse.json({
      books,
      meta: {
        lastSync: new Date().toISOString(),
        count: books.length
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
