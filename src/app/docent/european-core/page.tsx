'use client';

import { useState, useEffect } from 'react';
import CorePage from '@/components/CorePage';
import { Artwork, fetchArtworks } from '@/lib/supabase';
import { cores } from '@/lib/cores';

export default function EuropeanCorePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArtworks() {
      try {
        const data = await fetchArtworks();
        setArtworks(data);
      } catch (error) {
        console.error('Error loading artworks:', error);
      } finally {
        setLoading(false);
      }
    }

    loadArtworks();
  }, []);

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

  return <CorePage core={cores.european} allArtworks={artworks} />;
}
