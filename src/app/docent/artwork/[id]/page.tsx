'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Artwork } from '@/lib/supabase';

export default function ArtworkDetail() {
  const params = useParams();
  const router = useRouter();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtwork();
  }, [params.id]);

  async function loadArtwork() {
    try {
      const response = await fetch('/api/artworks');
      const data = await response.json();
      const found = data.artworks.find((a: Artwork) => a.id === params.id);
      setArtwork(found || null);
    } catch (error) {
      console.error('Error loading artwork:', error);
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
            <p className="text-muted-foreground">Loading artwork...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-lg mb-4">Artwork not found</p>
            <Button onClick={() => router.push('/docent')}>Back to Collection</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageUrl = artwork.imageUrl || artwork.thumbnail;

  const typeLabels: Record<string, string> = {
    tate: 'Tate Gallery',
    saam: 'Smithsonian American Art',
    met: 'Metropolitan Museum',
    nga: 'National Gallery',
    getty: 'Getty Research',
    aic: 'Art Institute Chicago',
    ima: 'IMA Collection',
    moma: 'MoMA',
    academic: 'Academic',
    khan: 'Khan Academy',
    archive: 'Archive.org',
    other: 'Museum Resource'
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Button variant="ghost" onClick={() => router.push('/docent')} className="mb-4">
        ← Back to Collection
      </Button>

      <Card>
        {imageUrl && (
          <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
            <img src={imageUrl} alt={artwork.Title} className="w-full h-full object-contain" />
          </div>
        )}

        <CardHeader>
          <CardTitle className="text-3xl">{artwork.Title}</CardTitle>
          {artwork['Artist (Display)'] && (
            <p className="text-xl text-muted-foreground">{artwork['Artist (Display)']}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {artwork['Accession Number'] && <div><span className="font-semibold">Accession Number:</span> {artwork['Accession Number']}</div>}
            {artwork.Collection && <div><span className="font-semibold">Collection:</span> {artwork.Collection}</div>}
            {artwork.Date && <div><span className="font-semibold">Date:</span> {artwork.Date}</div>}
            {artwork.Medium && <div><span className="font-semibold">Medium:</span> {artwork.Medium}</div>}
            {artwork.Dimensions && <div><span className="font-semibold">Dimensions:</span> {artwork.Dimensions}</div>}
            {artwork['Gallery Location'] && <div><span className="font-semibold">Gallery:</span> {artwork['Gallery Location']}</div>}
          </div>

          {artwork['Micro Summary'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Micro Summary</h3>
              <p className="text-muted-foreground">{artwork['Micro Summary']}</p>
            </div>
          )}

          {artwork['Artwork Description'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{artwork['Artwork Description']}</p>
            </div>
          )}

          {artwork['Artist Biography'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">About the Artist</h3>
              <p className="whitespace-pre-wrap">{artwork['Artist Biography']}</p>
            </div>
          )}

          {artwork['Tour Guidance'] && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Tour Guidance</h3>
              <p className="whitespace-pre-wrap">{artwork['Tour Guidance']}</p>
            </div>
          )}

          {artwork.Connections && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Connections</h3>
              <p className="whitespace-pre-wrap">{artwork.Connections}</p>
            </div>
          )}

          {artwork['Historical Context'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Historical Context</h3>
              <p className="whitespace-pre-wrap">{artwork['Historical Context']}</p>
            </div>
          )}

          {artwork['Online Resources'] && artwork['Online Resources'].length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Online Resources</h3>
              <div className="space-y-3">
                {artwork['Online Resources'].map((resource, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex-shrink-0 mt-0.5">
                      {typeLabels[resource.type] || resource.type}
                    </span>
                    <div className="min-w-0">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium block">
                        {resource.title}
                      </a>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{resource.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {artwork.URL && (
            <div>
              <h3 className="font-semibold text-sm mb-2">More Information</h3>
              <a href={artwork.URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all">
                {artwork.URL}
              </a>
            </div>
          )}

          {artwork['Sources/Bibliography'] && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-2">Sources & Bibliography</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{artwork['Sources/Bibliography']}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
