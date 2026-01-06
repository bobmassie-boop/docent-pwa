// API route to get library books data - fetch directly from Supabase
import { NextResponse } from 'next/server';
import { fetchLibraryBooks } from '@/lib/library';

export async function GET() {
  try {
    const books = await fetchLibraryBooks();

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
