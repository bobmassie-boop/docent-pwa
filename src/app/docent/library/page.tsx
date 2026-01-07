'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LibraryBook } from '@/lib/library';

export default function LibraryBrowser() {
  const router = useRouter();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<LibraryBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'callNumber'>('author');
  const [filterPhysical, setFilterPhysical] = useState<'all' | 'have' | 'need'>('all');
  const [subjectCategory, setSubjectCategory] = useState('');
  const [artMovement, setArtMovement] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    let filtered = books;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.contentSummary?.toLowerCase().includes(query) ||
        book.subjectTags?.toLowerCase().includes(query) ||
        book.artists?.toLowerCase().includes(query)
      );
    }

    // Apply physical copy filter
    if (filterPhysical === 'have') {
      filtered = filtered.filter(book => book.physicalCopy === 'Have');
    } else if (filterPhysical === 'need') {
      filtered = filtered.filter(book => book.physicalCopy !== 'Have');
    }

    // Apply subject category filter
    if (subjectCategory) {
      filtered = filtered.filter(book => {
        const tags = (book.subjectTags || '').toLowerCase();
        switch (subjectCategory) {
          case 'european': return tags.includes('european');
          case 'american': return tags.includes('american');
          case 'contemporary': return tags.includes('contemporary');
          case 'reference': return tags.includes('reference');
          case 'african': return tags.includes('african');
          case 'asian': return tags.includes('asian');
          case 'painting': return tags.includes('painting');
          default: return true;
        }
      });
    }

    // Apply art movement filter
    if (artMovement) {
      filtered = filtered.filter(book => {
        const movements = (book.artMovements || '').toLowerCase();
        switch (artMovement) {
          case 'impressionism': return movements.includes('impressionism');
          case 'contemporary': return movements.includes('contemporary');
          case 'renaissance': return movements.includes('renaissance');
          case 'modern': return movements.includes('modern');
          case 'realism': return movements.includes('realism');
          case 'baroque': return movements.includes('baroque');
          case 'romanticism': return movements.includes('romantic');
          default: return true;
        }
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'author':
          return (a.author || '').localeCompare(b.author || '');
        case 'callNumber':
          return (a.callNumber || '').localeCompare(b.callNumber || '');
        default:
          return 0;
      }
    });

    setFilteredBooks(sorted);
  }, [searchQuery, books, sortBy, filterPhysical, subjectCategory, artMovement]);

  async function loadBooks() {
    try {
      const response = await fetch('/api/library');
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading library...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/docent')}
          className="mb-4"
        >
          ← Back to Artworks
        </Button>
        <div className="flex items-center gap-4">
          <img
            src="/american-core-logo.png"
            alt="American Core Logo"
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              DOCENT LIBRARY
            </h1>
            <p className="text-muted-foreground text-sm">
              {books.length} books available for research
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <Input
          type="search"
          placeholder="Search books, authors, subjects, or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="title">Title A-Z</option>
              <option value="author">Author A-Z</option>
              <option value="callNumber">Call Number</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Physical Copy:</label>
            <select
              value={filterPhysical}
              onChange={(e) => setFilterPhysical(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="all">All Books</option>
              <option value="have">Available</option>
              <option value="need">Not Available</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Subject:</label>
            <select
              value={subjectCategory}
              onChange={(e) => setSubjectCategory(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="">All Subjects</option>
              <option value="european">European Art</option>
              <option value="american">American Art</option>
              <option value="contemporary">Contemporary Art</option>
              <option value="reference">General Reference</option>
              <option value="painting">Painting</option>
              <option value="african">African Art</option>
              <option value="asian">Asian Art</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Movement:</label>
            <select
              value={artMovement}
              onChange={(e) => setArtMovement(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="">All Movements</option>
              <option value="impressionism">Impressionism</option>
              <option value="contemporary">Contemporary</option>
              <option value="renaissance">Renaissance</option>
              <option value="modern">Modern Art</option>
              <option value="realism">Realism</option>
              <option value="baroque">Baroque</option>
              <option value="romanticism">Romanticism</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredBooks.length} of {books.length} books
        </div>
      </div>

      {/* Book List */}
      {filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No books found matching your search.' : 'No books available.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <Card
              key={book.book_id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setExpandedBook(expandedBook === book.book_id ? null : book.book_id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Book Icon */}
                  <div className="w-12 h-16 flex-shrink-0 bg-gradient-to-b from-amber-700 to-amber-900 rounded flex items-center justify-center text-white text-2xl">
                    📕
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title and Author */}
                    <h3 className="font-semibold text-lg leading-tight mb-1">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-sm text-muted-foreground mb-2">
                        by {book.author}
                      </p>
                    )}

                    {/* Summary (truncated unless expanded) */}
                    {book.contentSummary && (
                      <p className={`text-sm mb-3 ${expandedBook === book.book_id ? '' : 'line-clamp-2'}`}>
                        {book.contentSummary}
                      </p>
                    )}

                    {/* Meta info row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {book.callNumber && (
                        <span className="text-muted-foreground">
                          📍 Call#: <span className="font-medium">{book.callNumber}</span>
                        </span>
                      )}
                      {book.physicalCopy === 'Have' && (
                        <span className="text-green-600">
                          ✓ Physical Copy Available
                        </span>
                      )}
                      {book.year && (
                        <span className="text-muted-foreground">
                          {book.year}
                        </span>
                      )}
                      {book.publisher && (
                        <span className="text-muted-foreground">
                          {book.publisher}
                        </span>
                      )}
                    </div>

                    {/* Expanded details */}
                    {expandedBook === book.book_id && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        {book.subjectTags && (
                          <div className="text-sm">
                            <span className="font-medium">Subjects:</span>{' '}
                            <span className="text-muted-foreground">{book.subjectTags}</span>
                          </div>
                        )}
                        {book.artists && (
                          <div className="text-sm">
                            <span className="font-medium">Artists Covered:</span>{' '}
                            <span className="text-muted-foreground">{book.artists}</span>
                          </div>
                        )}
                        {book.artMovements && (
                          <div className="text-sm">
                            <span className="font-medium">Art Movements:</span>{' '}
                            <span className="text-muted-foreground">{book.artMovements}</span>
                          </div>
                        )}
                        {book.linkedArtworks && (
                          <div className="text-sm">
                            <span className="font-medium">Related Artworks:</span>{' '}
                            <span className="text-muted-foreground">{book.linkedArtworks}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
