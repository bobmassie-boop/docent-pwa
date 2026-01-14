'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Docent {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  cores_certified: string[] | null;
  roles: string[] | null;
  core_group: string | null;
  join_date: string | null;
  bio: string | null;
  notes: string | null;
  active: boolean;
}

export default function DocentRoster() {
  const router = useRouter();
  const [docents, setDocents] = useState<Docent[]>([]);
  const [filteredDocents, setFilteredDocents] = useState<Docent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'lastName' | 'firstName'>('lastName');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [coreGroupFilter, setCoreGroupFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadDocents();
  }, []);

  useEffect(() => {
    let filtered = docents;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(docent =>
        docent.display_name?.toLowerCase().includes(query) ||
        docent.first_name?.toLowerCase().includes(query) ||
        docent.last_name?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(docent => {
        const roles = docent.roles || [];
        if (roleFilter === 'chairs') {
          return roles.includes('Core Group Chair') || roles.includes('Core Group Chair Assistant');
        } else if (roleFilter === 'coordinators') {
          return roles.some(r => r.toLowerCase().includes('coordinator'));
        }
        return true;
      });
    }

    // Apply core group filter
    if (coreGroupFilter !== 'all') {
      filtered = filtered.filter(docent => docent.core_group === coreGroupFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'lastName') {
        return (a.last_name || '').localeCompare(b.last_name || '');
      } else {
        return (a.first_name || '').localeCompare(b.first_name || '');
      }
    });

    setFilteredDocents(sorted);
  }, [searchQuery, docents, sortBy, roleFilter, coreGroupFilter]);

  async function loadDocents() {
    try {
      const response = await fetch('/api/docents');
      const data = await response.json();
      setDocents(data.docents || []);
    } catch (error) {
      console.error('Error loading docents:', error);
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
            <p className="text-muted-foreground">Loading docent roster...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
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
            src="/docent-logo.png"
            alt="Newfields/IMA Docents Logo"
            className="h-16 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
              DOCENT ROSTER
            </h1>
            <p className="text-muted-foreground text-sm">
              {docents.length} active docents
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <Input
          type="search"
          placeholder="Search docents by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        <div className="flex gap-4 flex-wrap items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'lastName' | 'firstName')}
                className="px-3 py-2 border rounded-md text-sm h-9"
              >
                <option value="lastName">Last Name A-Z</option>
                <option value="firstName">First Name A-Z</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Roles:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm h-9"
              >
                <option value="all">All Docents</option>
                <option value="chairs">Core Group Chairs & Assistants</option>
                <option value="coordinators">Coordinators</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Core Group:</label>
              <select
                value={coreGroupFilter}
                onChange={(e) => setCoreGroupFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm h-9"
              >
                <option value="all">All Cores</option>
                <option value="American">American Art</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredDocents.length} of {docents.length} docents
        </div>
      </div>

      {/* Docent Display */}
      {filteredDocents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No docents found matching your search.' : 'No docents available.'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredDocents.map((docent) => (
            <Link key={docent.id} href={`/docent/roster/${docent.id}`}>
              <Card className="hover:shadow-lg hover:scale-[1.02] transition-all overflow-hidden cursor-pointer">
                <div className="aspect-[3/4] relative bg-muted">
                  {docent.photo_url ? (
                    <img
                      src={docent.photo_url}
                      alt={docent.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                      👤
                    </div>
                  )}
                </div>
                <CardContent className="p-3 text-center">
                  <h3 className="font-medium text-sm leading-tight">
                    {docent.display_name}
                  </h3>
                  {docent.roles && docent.roles.length > 0 && docent.roles[0] !== 'Docent' && (
                    <>
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        {docent.roles[0]}
                      </p>
                      {docent.roles[1] && (
                        <p className="text-xs text-purple-500">
                          {docent.roles[1]}
                        </p>
                      )}
                    </>
                  )}
                  {docent.email && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {docent.email}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredDocents.map((docent) => (
            <Link key={docent.id} href={`/docent/roster/${docent.id}`}>
              <Card className="hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer">
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-muted">
                    {docent.photo_url ? (
                      <img
                        src={docent.photo_url}
                        alt={docent.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-muted-foreground">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">
                      {docent.display_name}
                    </h3>
                    {docent.roles && docent.roles.length > 0 && docent.roles[0] !== 'Docent' && (
                      <>
                        <p className="text-sm text-purple-600 font-medium">
                          {docent.roles[0]}
                        </p>
                        {docent.roles[1] && (
                          <p className="text-sm text-purple-500">
                            {docent.roles[1]}
                          </p>
                        )}
                      </>
                    )}
                    {docent.email && (
                      <p className="text-sm text-muted-foreground truncate">
                        {docent.email}
                      </p>
                    )}
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
