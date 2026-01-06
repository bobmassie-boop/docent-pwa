'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Artist {
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

export default function ArtistGallery() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'works' | 'year'>('works');
  const [filterNationality, setFilterNationality] = useState<'all' | 'American' | 'British'>('all');
  const [loading, setLoading] = useState(true);
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);

  useEffect(() => {
    loadArtists();
  }, []);

  useEffect(() => {
    let filtered = artists;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(artist =>
        artist.name?.toLowerCase().includes(query) ||
        artist.biography?.toLowerCase().includes(query)
      );
    }

    // Apply nationality filter
    if (filterNationality !== 'all') {
      filtered = filtered.filter(artist => artist.nationality === filterNationality);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.lastName || a.name).localeCompare(b.lastName || b.name);
        case 'works':
          return b.artworkCount - a.artworkCount;
        case 'year':
          return (a.birthYear || 9999) - (b.birthYear || 9999);
        default:
          return 0;
      }
    });

    setFilteredArtists(sorted);
  }, [searchQuery, artists, sortBy, filterNationality]);

  async function loadArtists() {
    try {
      const response = await fetch('/api/artists');
      const data = await response.json();
      setArtists(data.artists || []);
    } catch (error) {
      console.error('Error loading artists:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatLifespan(artist: Artist) {
    if (artist.birthYear && artist.deathYear) {
      return `${artist.birthYear}–${artist.deathYear}`;
    } else if (artist.birthYear) {
      return `b. ${artist.birthYear}`;
    }
    return '';
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading artists...</p>
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
              ARTIST GALLERY
            </h1>
            <p className="text-muted-foreground text-sm">
              {artists.length} artists in the collection
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <Input
          type="search"
          placeholder="Search artists by name..."
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
              <option value="works">Most Works</option>
              <option value="name">Name A-Z</option>
              <option value="year">Birth Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Nationality:</label>
            <select
              value={filterNationality}
              onChange={(e) => setFilterNationality(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="all">All</option>
              <option value="American">American</option>
              <option value="British">British</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredArtists.length} of {artists.length} artists
        </div>
      </div>

      {/* Artist List */}
      {filteredArtists.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No artists found matching your search.' : 'No artists available.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredArtists.map((artist) => (
            <Card
              key={artist.name}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setExpandedArtist(expandedArtist === artist.name ? null : artist.name)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Artist thumbnails grid */}
                  <div className="w-24 h-24 flex-shrink-0 grid grid-cols-2 gap-0.5 bg-muted rounded overflow-hidden">
                    {artist.thumbnails.slice(0, 4).map((thumb, i) => (
                      <div key={i} className="aspect-square overflow-hidden">
                        <img
                          src={thumb}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {artist.thumbnails.length === 0 && (
                      <div className="col-span-2 row-span-2 flex items-center justify-center text-3xl text-muted-foreground">
                        🎨
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name and dates */}
                    <h3 className="font-semibold text-lg leading-tight">
                      {artist.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mb-2">
                      {formatLifespan(artist) && (
                        <span>{formatLifespan(artist)}</span>
                      )}
                      <span>{artist.nationality}</span>
                      <span className="font-medium text-primary">
                        {artist.artworkCount} {artist.artworkCount === 1 ? 'work' : 'works'}
                      </span>
                    </div>

                    {/* Biography preview */}
                    {artist.biography && (
                      <p className={`text-sm ${expandedArtist === artist.name ? '' : 'line-clamp-2'}`}>
                        {artist.biography}
                      </p>
                    )}

                    {/* Expanded content */}
                    {expandedArtist === artist.name && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Works in Collection:</h4>
                        <div className="flex flex-wrap gap-2">
                          {artist.artworkIds.map((id) => (
                            <Link
                              key={id}
                              href={`/docent/artwork/${id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View artwork →
                            </Link>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                          {artist.artworkIds.slice(0, 6).map((id, i) => (
                            <Link
                              key={id}
                              href={`/docent/artwork/${id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block"
                            >
                              {artist.thumbnails[i] && (
                                <img
                                  src={artist.thumbnails[i]}
                                  alt=""
                                  className="w-16 h-16 object-cover rounded hover:ring-2 ring-primary"
                                />
                              )}
                            </Link>
                          ))}
                        </div>
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
