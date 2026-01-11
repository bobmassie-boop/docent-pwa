'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Artwork } from '@/lib/supabase';
import { Core } from '@/lib/cores';

interface CorePageProps {
  core: Core;
  allArtworks: Artwork[];
}

/**
 * CorePage Component
 * Displays artworks filtered to a specific core with all the same filtering/search capabilities
 * as the main page, but scoped to only the collections belonging to this core.
 */
export default function CorePage({ core, allArtworks }: CorePageProps) {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Artwork[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'date'>('title-asc');
  const [showOnDisplay, setShowOnDisplay] = useState(true);
  const [showNotOnDisplay, setShowNotOnDisplay] = useState(false);
  const [galleryLocation, setGalleryLocation] = useState('');
  const [collection, setCollection] = useState('');
  const [medium, setMedium] = useState('');
  const [subject, setSubject] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchRef = useRef<HTMLDivElement>(null);

  // Helper function to categorize artwork by medium
  function getMediumCategory(mediumStr: string | undefined): string {
    if (!mediumStr) return 'other';
    const m = mediumStr.toLowerCase();
    if (m.includes('oil')) return 'oil';
    if (m.includes('watercolor')) return 'watercolor';
    if (m.includes('bronze') || m.includes('marble') || m.includes('sculpture') || m.includes('plaster') || m.includes('terra')) return 'sculpture';
    if (m.includes('pastel')) return 'pastel';
    if (m.includes('charcoal') || m.includes('pencil') || m.includes('drawing') || m.includes('graphite') || m.includes('chalk')) return 'drawing';
    if (m.includes('print') || m.includes('etching') || m.includes('lithograph') || m.includes('engraving')) return 'print';
    return 'other';
  }

  // Helper function to categorize artwork by subject (simplified for core pages)
  function getSubjectCategory(title: string | undefined, mediumStr: string | undefined): string {
    if (!title) return 'other';
    const t = title.toLowerCase().replace(/[\u2018\u2019]/g, "'");
    const m = (mediumStr || '').toLowerCase();

    if (t.includes('portrait') || t.includes('figure') || t.includes('woman') || t.includes('man') || t.includes('lady') || t.includes('gentleman')) return 'figures';
    if (t.includes('landscape') || t.includes('river') || t.includes('mountain') || t.includes('sea') || t.includes('coast') || t.includes('view')) return 'landscape';
    if (t.includes('interior') || t.includes('room') || t.includes('home') || t.includes('house')) return 'domestic';
    if (m.includes('sculpture')) return 'sculpture';

    return 'other';
  }

  // Filter artworks to only those in this core's collections
  useEffect(() => {
    const coreArtworks = allArtworks.filter(artwork =>
      core.collections.includes(artwork.Collection || '')
    );
    setArtworks(coreArtworks);
  }, [allArtworks, core.collections]);

  // Apply all filters
  useEffect(() => {
    let filtered = [...artworks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(artwork =>
        artwork.Title?.toLowerCase().includes(query) ||
        artwork['Artist (Display)']?.toLowerCase().includes(query) ||
        artwork['Accession Number']?.toLowerCase().includes(query)
      );

      // Update search suggestions
      const suggestions = filtered.slice(0, 10);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }

    // Collection filter
    if (collection) {
      filtered = filtered.filter(artwork => artwork.Collection === collection);
    }

    // Medium filter
    if (medium) {
      filtered = filtered.filter(artwork => getMediumCategory(artwork.Medium) === medium);
    }

    // Subject filter
    if (subject) {
      filtered = filtered.filter(artwork => getSubjectCategory(artwork.Title, artwork.Medium) === subject);
    }

    // Gallery location filter
    if (galleryLocation) {
      filtered = filtered.filter(artwork =>
        artwork['Gallery Location']?.toLowerCase().includes(galleryLocation.toLowerCase())
      );
    }

    // On Display filter
    if (showOnDisplay && !showNotOnDisplay) {
      filtered = filtered.filter(artwork => artwork['On Display'] === true);
    } else if (!showOnDisplay && showNotOnDisplay) {
      filtered = filtered.filter(artwork => artwork['On Display'] !== true);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'title-asc') {
        return (a.Title || '').localeCompare(b.Title || '');
      } else if (sortBy === 'title-desc') {
        return (b.Title || '').localeCompare(a.Title || '');
      } else if (sortBy === 'date') {
        return (a.Date || '').localeCompare(b.Date || '');
      }
      return 0;
    });

    setFilteredArtworks(filtered);
  }, [artworks, searchQuery, collection, medium, subject, galleryLocation, showOnDisplay, showNotOnDisplay, sortBy]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSuggestionClick(artwork: Artwork) {
    setShowSuggestions(false);
    router.push(`/docent/artwork/${artwork.id}`);
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header with Core Badge */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={core.badge}
            alt={`${core.displayName} Badge`}
            className="h-20 w-auto"
          />
          <h1 className="text-[22px] leading-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {core.displayName.toUpperCase()} DOCENT REFERENCE
          </h1>
        </div>

        {/* Back to All Cores */}
        <Link href="/docent">
          <Button variant="outline" className="mb-4">
            ← Back to All Cores
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative" ref={searchRef}>
            <Input
              type="search"
              placeholder="Search artworks, artists, or accession numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
              className="w-full"
            />

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchSuggestions.map((artwork) => (
                  <button
                    key={artwork.id}
                    onClick={() => handleSuggestionClick(artwork)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-b-0 flex gap-3 items-start"
                  >
                    {artwork.thumbnail && (
                      <img
                        src={artwork.thumbnail}
                        alt={artwork.Title}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{artwork.Title}</div>
                      {artwork['Artist (Display)'] && (
                        <div className="text-xs text-gray-600 truncate">{artwork['Artist (Display)']}</div>
                      )}
                      {artwork['Accession Number'] && (
                        <div className="text-xs text-gray-500">{artwork['Accession Number']}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex gap-4 flex-wrap items-center">
          {/* Collection filter - only show collections belonging to this core */}
          {core.collections.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Collection:</label>
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm h-9"
              >
                <option value="">All Collections</option>
                {core.collections.map((coll) => (
                  <option key={coll} value={coll}>
                    {coll.replace('American Painting & Sculpture ', '').replace('Turner Exhibition - Golden Gallery', 'Turner')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Medium filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Medium:</label>
            <select
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="">All Mediums</option>
              <option value="oil">Oil Paintings</option>
              <option value="watercolor">Watercolors</option>
              <option value="sculpture">Sculpture</option>
              <option value="drawing">Drawings</option>
              <option value="pastel">Pastels</option>
              <option value="print">Prints</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Subject filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Subject:</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="">All Subjects</option>
              <option value="landscape">Landscapes</option>
              <option value="figures">Figures & Portraits</option>
              <option value="domestic">Domestic Interiors</option>
              <option value="sculpture">Sculpture</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="date">By Date</option>
            </select>
          </div>

          {/* On Display checkboxes */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnDisplay}
                onChange={(e) => setShowOnDisplay(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">On Display</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showNotOnDisplay}
                onChange={(e) => setShowNotOnDisplay(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Not On Display</span>
            </label>
          </div>
        </div>

        {/* Gallery Location */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Gallery Location:</label>
          <Input
            type="text"
            placeholder="Filter by location..."
            value={galleryLocation}
            onChange={(e) => setGalleryLocation(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <Link href="/docent/library">
          <Button
            variant="outline"
            className="w-full md:w-auto flex items-center gap-2 bg-purple-50 border-purple-200 hover:bg-purple-100"
          >
            <span className="text-xl">📚</span>
            <div className="text-left">
              <div className="font-semibold">Browse Docent Library</div>
              <div className="text-xs text-muted-foreground">Find books & references</div>
            </div>
          </Button>
        </Link>
        <Link href="/docent/artists">
          <Button
            variant="outline"
            className="w-full md:w-auto flex items-center gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
          >
            <span className="text-xl">🎨</span>
            <div className="text-left">
              <div className="font-semibold">Artist Gallery</div>
              <div className="text-xs text-muted-foreground">Explore artist biographies</div>
            </div>
          </Button>
        </Link>
        <Link href="/docent/floor-map">
          <Button
            variant="outline"
            className="w-full md:w-auto flex items-center gap-2 bg-green-50 border-green-200 hover:bg-green-100"
          >
            <span className="text-xl">🗺️</span>
            <div className="text-left">
              <div className="font-semibold">Gallery Floor Map</div>
              <div className="text-xs text-muted-foreground">View museum layout</div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Data info */}
      <div className="text-sm text-muted-foreground mb-4">
        Showing {filteredArtworks.length} artworks from {core.displayName}
      </div>

      {/* Artworks Display */}
      {filteredArtworks.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No artworks found matching your filters.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork) => (
            <Link key={artwork.id} href={`/docent/artwork/${artwork.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {artwork.thumbnail ? (
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                    <img
                      src={artwork.thumbnail}
                      alt={artwork.Title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm text-gray-500">No Image Available</p>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {artwork.Title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {artwork['Artist (Display)'] && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {artwork['Artist (Display)']}
                    </p>
                  )}
                  {artwork.Date && (
                    <p className="text-xs text-muted-foreground">{artwork.Date}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArtworks.map((artwork) => (
            <Link key={artwork.id} href={`/docent/artwork/${artwork.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {artwork.thumbnail ? (
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={artwork.thumbnail}
                          alt={artwork.Title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl">🖼️</div>
                          <p className="text-xs text-gray-500 mt-1">No Image</p>
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{artwork.Title}</h3>
                      {artwork['Artist (Display)'] && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {artwork['Artist (Display)']}
                        </p>
                      )}
                      {artwork.Date && (
                        <p className="text-xs text-muted-foreground">{artwork.Date}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
