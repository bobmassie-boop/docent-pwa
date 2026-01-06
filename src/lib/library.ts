import { supabase } from './supabase';

// Library Book interface
export interface LibraryBook {
  book_id: string;
  title: string;
  author: string;
  publisher?: string;
  year?: string;
  callNumber?: string;
  physicalCopy?: string;
  digitalAvailable?: string;
  contentSummary?: string;
  subjectTags?: string;
  artists?: string;
  artMovements?: string;
  linkedArtworks?: string;
  coverUrl?: string;
}

/**
 * Fetch all books from Docent Library Catalog
 */
export async function fetchLibraryBooks(): Promise<LibraryBook[]> {
  try {
    const { data, error } = await supabase
      .from('Docent_library_catalog')
      .select('*');

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return (data || []).map(record => ({
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
  } catch (error) {
    console.error('Error fetching library books from Supabase:', error);
    throw error;
  }
}
