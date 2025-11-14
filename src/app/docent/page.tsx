'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Artwork } from '@/lib/airtable';

export default function DocentBrowser() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'date'>('title-asc');
  const [showOnDisplay, setShowOnDisplay] = useState(true);
  const [showNotOnDisplay, setShowNotOnDisplay] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load artworks from local data
  useEffect(() => {
    loadArtworks();
  }, []);

  // Filter and sort artworks
  useEffect(() => {
    let filtered = artworks;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(artwork =>
        artwork.Title?.toLowerCase().includes(query) ||
        artwork['Artist (Display)']?.toLowerCase().includes(query) ||
        artwork['Accession Number']?.toLowerCase().includes(query) ||
        artwork['Artwork Description']?.toLowerCase().includes(query)
      );
    }

    // Apply display status filter
    filtered = filtered.filter(artwork => {
      if (!showOnDisplay && artwork['On Display']) return false;
      if (!showNotOnDisplay && !artwork['On Display']) return false;
      return true;
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return (a.Title || '').localeCompare(b.Title || '');
        case 'title-desc':
          return (b.Title || '').localeCompare(a.Title || '');
        case 'date':
          return (a.Date || '').localeCompare(b.Date || '');
        default:
          return 0;
      }
    });

    setFilteredArtworks(sorted);
  }, [searchQuery, artworks, sortBy, showOnDisplay, showNotOnDisplay]);

  async function loadArtworks() {
    try {
      const response = await fetch('/api/artworks');
      const data = await response.json();

      setArtworks(data.artworks || []);
      setLastSync(data.meta?.lastSync || null);
    } catch (error) {
      console.error('Error loading artworks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        await loadArtworks();
        alert(`Synced ${data.count} artworks successfully!`);
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (error: any) {
      alert('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading artworks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <img 
          src="/american-core-logo.png" 
          alt="American Core Logo" 
          className="h-20 w-auto"
        />
        <h1 className="text-[42px] leading-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          AMERICAN CORE DOCENT REFERENCE
        </h1>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="search"
              placeholder="Search artworks, artists, or accession numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
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

          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="secondary"
          >
            {syncing ? 'Syncing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex gap-4 flex-wrap items-center">
          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="date">Date</option>
            </select>
          </div>

          {/* Display filters */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showOnDisplay}
                onChange={(e) => setShowOnDisplay(e.target.checked)}
                className="w-4 h-4"
              />
              <span>On Display</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showNotOnDisplay}
                onChange={(e) => setShowNotOnDisplay(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Not On Display</span>
            </label>
          </div>
        </div>

        {/* Sync info */}
        {lastSync && (
          <div className="text-sm text-muted-foreground">
            Last synced: {new Date(lastSync).toLocaleString()} • {filteredArtworks.length} artworks
          </div>
        )}
      </div>

      {/* Artwork Grid/List */}
      {filteredArtworks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No artworks found matching your search.' : 'No artworks available. Click "Refresh Data" to sync from Airtable.'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtworks.map((artwork) => (
            <Link key={artwork.id} href={`/docent/artwork/${artwork.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {artwork.thumbnail && (
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                    <img
                      src={artwork.thumbnail}
                      alt={artwork.Title}
                      className="w-full h-full object-cover"
                    />
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
                    <p className="text-sm text-muted-foreground">
                      {artwork.Date}
                    </p>
                  )}
                  {artwork['Accession Number'] && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {artwork['Accession Number']}
                    </p>
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
                    {artwork.thumbnail && (
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={artwork.thumbnail}
                          alt={artwork.Title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{artwork.Title}</h3>
                      {artwork['Artist (Display)'] && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {artwork['Artist (Display)']}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {artwork.Date && <span>{artwork.Date}</span>}
                        {artwork['Accession Number'] && <span>{artwork['Accession Number']}</span>}
                      </div>
                      {artwork['Micro Summary'] && (
                        <p className="text-sm mt-2 line-clamp-2">
                          {artwork['Micro Summary']}
                        </p>
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
