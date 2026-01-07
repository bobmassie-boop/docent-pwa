'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Artwork } from '@/lib/supabase';

export default function DocentBrowser() {
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
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Helper function to categorize artwork by subject
  function getSubjectCategory(title: string | undefined, mediumStr: string | undefined): string {
    if (!title) return 'other';
    const t = title.toLowerCase();
    const m = (mediumStr || '').toLowerCase();

    // Specific artwork overrides - Genre Scenes (narrative/interior scenes)
    const genreScenes = [
      'the poetry reading', 'hotel lobby', "new year's shooter", 'tidying up',
      'two disciples at the tomb (the kneeling disciple)', 'preparing for the matinee', 'hauptmann must die',
      'glow of gold, gleam of pearl', 'herman and verman', 'promenade', 'reclining nude',
      'sunlight', 'dolly & rach', 'girl at the piano', 'girl at the piano: recording sound',
      'he is risen', 'reflections', "the artist's party", 'the bacidae', 'the blue tiger',
      'the boat builders', 'the love song', 'untitled (the birth)', "judith, or cowper's oak",
      'our flag', 'concretion', 'henry looked unhitching', 'new york, new haven and hartford',
      'street light', 'the statuette', 'the seiner (the net)'
    ];
    if (genreScenes.some(name => t === name)) return 'genre';

    // Specific artwork overrides - Sculptures
    const sculptures = [
      'the mountain man', 'gamin', 'framed mirror', 'bacchante and infant faun', 'diana'
    ];
    if (sculptures.some(name => t === name)) return 'sculpture';

    // Specific artwork overrides - Cityscapes
    const cityscapes = [
      'harlem at night', 'paris: hôtel de ville', 'rainy night, etaples',
      'venice: santa maria della salute from the grand canal', 'venice: the rialto',
      'washington street, indianapolis at dusk', 'dunstaffnage', 'kenilworth castle',
      'monday morning', 'san giorgio, verona', 'the canal, morning effect',
      'west front, bath abbey', 'worcester from the river severn',
      'cross at the entrance to hereford', 'fontainebleau: the departure of napoleon',
      "king edgar's gate, worcester", 'oberwesel on the rhine',
      'philae: a view of the temples from the south', 'west window, worcester cathedral'
    ];
    if (cityscapes.some(name => t === name)) return 'cityscape';

    // Specific artwork overrides - Landscapes
    const landscapes = [
      'bellinzona', 'cliff rock—appledore', 'cliff rock - appledore',
      'fountains abbey, yorkshire', 'glacier du rhone and the galenstock, from the furka pass road',
      'hurricane', 'lock, long', 'loch long', 'martinswand, near innsbruck',
      'matlock', 'pool in the adirondacks', 'quarry at byram', 'remagen, erpel and linz',
      'thames nocturne', 'the marxburg', 'the olive grove', 'the pioneers', 'the rainbow',
      'scene in indianapolis', 'fall of the trees, yorkshire', 'fall of the tees, yorkshire',
      'rosslyn castle'
    ];
    if (landscapes.some(name => t === name)) return 'landscape';

    // Specific artwork overrides - Portraits
    const portraits = [
      'dorothy', 'indian girl', 'little brown girl', 'margaret mckittrick',
      'marianne ashley walker', 'j. m. w. turner at a drawing table (recto), mrs. monro asleep (verso)',
      'the pianist (stanley addicks)', 'study of a young woman',
      'george washington at princeton'
    ];
    if (portraits.some(name => t === name)) return 'portrait';

    // Specific artwork overrides - Still Life
    if (t === 'jimson weed') return 'stilllife';

    // General pattern matching - Portraits
    if (t.includes('portrait') || t.includes('self-portrait') || /^(mrs|mr|miss|dr|colonel|madame|mme)\b/.test(t)) return 'portrait';

    // General pattern matching - Seascapes
    if (t.includes('sea') || t.includes('coast') || t.includes('harbor') || t.includes('ship') ||
        t.includes('marine') || t.includes('beach') || t.includes('ocean') || t.includes('bay') ||
        t.includes('fishing') || t.includes('whaler') || t.includes('sail') || t.includes('vessel')) return 'seascape';

    // General pattern matching - Landscapes
    if (t.includes('landscape') || t.includes('mountain') || t.includes('valley') || t.includes('river') ||
        t.includes('lake') || t.includes('forest') || t.includes('sunrise') || t.includes('sunset') ||
        t.includes('morning') || t.includes('evening') || t.includes('autumn') || t.includes('winter') ||
        t.includes('spring') || t.includes('summer') || t.includes('cloud') || t.includes('storm') ||
        t.includes('snow') || t.includes('meadow') || t.includes('hill') || t.includes('creek') ||
        t.includes('ruins') || t.includes('grove') || t.includes('pool') || t.includes('quarry')) return 'landscape';

    // General pattern matching - Still Life
    if (t.includes('still life') || t.includes('flower') || t.includes('fruit') ||
        t.includes('melon') || t.includes('vase') || t.includes('bouquet')) return 'stilllife';

    // General pattern matching - Religious & Mythological (but not sculptures)
    if (t.includes('angel') || t.includes('christ') || t.includes('madonna') || t.includes('resurrection') ||
        t.includes('venus') || t.includes('bacch') || t.includes('europa') || t.includes('calypso') ||
        t.includes('nymph') || t.includes('apollo')) return 'mythological';

    // Medium-based categorization - Sculpture
    if (m.includes('bronze') || m.includes('marble') || m.includes('sculpture')) return 'sculpture';

    return 'other';
  }


  // Load artworks from local data
  useEffect(() => {
    loadArtworks();
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate search suggestions with prioritized ranking
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const scored = artworks.map(artwork => {
      let score = 0;
      const title = (artwork.Title || '').toLowerCase();
      const artist = (artwork['Artist (Display)'] || '').toLowerCase();
      const accession = (artwork['Accession Number'] || '').toLowerCase();
      const description = (artwork['Artwork Description'] || '').toLowerCase();

      // Exact title match - highest priority
      if (title === query) score += 1000;
      // Title starts with query
      else if (title.startsWith(query)) score += 500;
      // Title contains query
      else if (title.includes(query)) score += 100;

      // Artist matches
      if (artist === query) score += 400;
      else if (artist.startsWith(query)) score += 200;
      else if (artist.includes(query)) score += 50;

      // Accession number matches
      if (accession.includes(query)) score += 150;

      // Description matches (lowest priority)
      if (description.includes(query)) score += 10;

      return { artwork, score };
    });

    // Filter out zero scores and sort by score
    const suggestions = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Limit to 10 suggestions
      .map(item => item.artwork);

    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  }, [searchQuery, artworks]);

  // Filter and sort artworks for main display
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

    // Apply gallery location filter - using FIND logic (case-insensitive partial match)
    if (galleryLocation.trim()) {
      filtered = filtered.filter(artwork => {
        const location = artwork['Gallery Location'] || '';
        return location.toLowerCase().includes(galleryLocation.toLowerCase());
      });
    }

    // Apply collection filter
    if (collection) {
      filtered = filtered.filter(artwork => artwork.Collection === collection);
    }

    // Apply medium filter
    if (medium) {
      filtered = filtered.filter(artwork => getMediumCategory(artwork.Medium) === medium);
    }

    // Apply subject filter
    if (subject) {
      filtered = filtered.filter(artwork => getSubjectCategory(artwork.Title, artwork.Medium) === subject);
    }

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
  }, [searchQuery, artworks, sortBy, showOnDisplay, showNotOnDisplay, galleryLocation, collection, medium, subject]);

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

  function handleSuggestionClick(artwork: Artwork) {
    setSearchQuery('');
    setShowSuggestions(false);
    router.push(`/docent/artwork/${artwork.id}`);
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
        <h1 className="text-[22px] leading-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
          AMERICAN CORE DOCENT REFERENCE
        </h1>
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
          {/* Collection filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Collection:</label>
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm h-9"
            >
              <option value="">All Collections</option>
              <option value="American Painting & Sculpture 1800–1945">American 1800–1945</option>
              <option value="American Painting & Sculpture Before 1800">American Before 1800</option>
              <option value="Turner Exhibition - Golden Gallery">Turner Exhibition</option>
            </select>
          </div>

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
              <option value="portrait">Portraits</option>
              <option value="landscape">Landscapes</option>
              <option value="cityscape">Cityscapes</option>
              <option value="seascape">Seascapes & Marine</option>
              <option value="stilllife">Still Life</option>
              <option value="genre">Genre Scenes</option>
              <option value="mythological">Religious & Mythological</option>
              <option value="sculpture">Sculpture</option>
              <option value="other">Other</option>
            </select>
          </div>

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

          {/* Gallery Location filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Gallery Location:</label>
            <Input
              type="text"
              placeholder="Filter by location..."
              value={galleryLocation}
              onChange={(e) => setGalleryLocation(e.target.value)}
              className="w-48 h-9"
            />
          </div>
        </div>

        {/* Resource Buttons - Library and Artists */}
        <div className="flex flex-col md:flex-row gap-3">
          <Link href="/docent/library">
            <Button
              variant="outline"
              className="w-full md:w-auto flex items-center gap-2 bg-amber-50 border-amber-200 hover:bg-amber-100"
            >
              <span className="text-xl">📚</span>
              <div className="text-left">
                <div className="font-semibold">Browse Docent Library</div>
                <div className="text-xs text-muted-foreground">Find books &amp; references</div>
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
        </div>


        {/* Data info */}
        {lastSync && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredArtworks.length} artworks • Data loads fresh from Supabase
          </div>
        )}
      </div>

      {/* Artwork Grid/List */}
      {filteredArtworks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No artworks found matching your search.' : 'No artworks available.'}
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
