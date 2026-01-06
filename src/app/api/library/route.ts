// API route to get library books data - fetch directly from Supabase
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      }, { status: 500 });
    }

    // Create client inside function to ensure env vars are available at runtime
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

    // Sort books: titled books first (alphabetically), untitled/empty at the bottom
    books.sort((a, b) => {
      const aHasTitle = a.title && a.title.trim().length > 0;
      const bHasTitle = b.title && b.title.trim().length > 0;

      if (aHasTitle && !bHasTitle) return -1;
      if (!aHasTitle && bHasTitle) return 1;

      // Both have titles or both don't - sort alphabetically
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
