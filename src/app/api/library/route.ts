// API route to get library books data - fetch directly from Supabase
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side API routes (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Docent_library_catalog')
      .select('*');

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    const books = (data || []).map(record => ({
      book_id: String(record.book_id),
      title: record.title || 'Untitled',
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
