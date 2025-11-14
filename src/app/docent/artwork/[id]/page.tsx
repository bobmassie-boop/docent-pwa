'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Artwork } from '@/lib/airtable';

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
            <Button onClick={() => router.push('/docent')}>
              Back to Collection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageUrl = artwork.imageUrl || artwork.thumbnail;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/docent')}
        className="mb-4"
      >
        ← Back to Collection
      </Button>

      {/* Main Card */}
      <Card>
        {/* Image */}
        {imageUrl && (
          <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
            <img
              src={imageUrl}
              alt={artwork.Title}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <CardHeader>
          <CardTitle className="text-3xl">
            {artwork.Title}
          </CardTitle>
          {artwork['Artist (Display)'] && (
            <p className="text-xl text-muted-foreground">
              {artwork['Artist (Display)']}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {artwork['Accession Number'] && (
              <div>
                <span className="font-semibold">Accession Number:</span> {artwork['Accession Number']}
              </div>
            )}
            {artwork.Collection && (
              <div>
                <span className="font-semibold">Collection:</span> {artwork.Collection}
              </div>
            )}
            {artwork.Date && (
              <div>
                <span className="font-semibold">Date:</span> {artwork.Date}
              </div>
            )}
            {artwork.Medium && (
              <div>
                <span className="font-semibold">Medium:</span> {artwork.Medium}
              </div>
            )}
            {artwork.Dimensions && (
              <div>
                <span className="font-semibold">Dimensions:</span> {artwork.Dimensions}
              </div>
            )}
            {artwork['Gallery Location'] && (
              <div>
                <span className="font-semibold">Gallery Location:</span> {artwork['Gallery Location']}
              </div>
            )}
            {artwork['On Display'] !== undefined && (
              <div className="col-span-2">
                <span className="font-semibold">Status:</span>{' '}
                <span className={artwork['On Display'] ? 'text-green-600' : 'text-muted-foreground'}>
                  {artwork['On Display'] ? '✓ On Display' : 'Not Currently Displayed'}
                </span>
              </div>
            )}
          </div>

          {/* Micro Summary */}
          {artwork['Micro Summary'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Micro Summary</h3>
              <p className="text-muted-foreground">{artwork['Micro Summary']}</p>
            </div>
          )}

          {/* Artwork Description */}
          {artwork['Artwork Description'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{artwork['Artwork Description']}</p>
            </div>
          )}

          {/* Artist Biography */}
          {artwork['Artist Biography'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">About the Artist</h3>
              <p className="whitespace-pre-wrap">{artwork['Artist Biography']}</p>
            </div>
          )}

          {/* Tour Guidance */}
          {artwork['Tour Guidance'] && (
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Tour Guidance</h3>
              <p className="whitespace-pre-wrap">{artwork['Tour Guidance']}</p>
            </div>
          )}

          {/* Connections */}
          {artwork.Connections && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Connections</h3>
              <p className="whitespace-pre-wrap">{artwork.Connections}</p>
            </div>
          )}

          {/* Contemporary Context */}
          {artwork['Contemporary Context'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Contemporary Context</h3>
              <p className="whitespace-pre-wrap">{artwork['Contemporary Context']}</p>
            </div>
          )}

          {/* Historical Context */}
          {artwork['Historical Context'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Historical Context</h3>
              <p className="whitespace-pre-wrap">{artwork['Historical Context']}</p>
            </div>
          )}

          {/* Cultural Context */}
          {artwork['Cultural Context'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Cultural Context</h3>
              <p className="whitespace-pre-wrap">{artwork['Cultural Context']}</p>
            </div>
          )}

          {/* Cultural/Philosophical Context */}
          {artwork['Cultural/Philosophical Context'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Cultural/Philosophical Context</h3>
              <p className="whitespace-pre-wrap">{artwork['Cultural/Philosophical Context']}</p>
            </div>
          )}

          {/* Philosophical Context */}
          {artwork['Philosophical Context'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Philosophical Context</h3>
              <p className="whitespace-pre-wrap">{artwork['Philosophical Context']}</p>
            </div>
          )}

          {/* Related Poems */}
          {artwork['Related Poems'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Related Poems</h3>
              <p className="whitespace-pre-wrap">{artwork['Related Poems']}</p>
            </div>
          )}

          {/* Period Music Links */}
          {artwork['Period Music Links'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Period Music Links</h3>
              <p className="whitespace-pre-wrap">{artwork['Period Music Links']}</p>
            </div>
          )}

          {/* Supplemental Information */}
          {artwork['Supplemental Information'] && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Supplemental Information</h3>
              <p className="whitespace-pre-wrap">{artwork['Supplemental Information']}</p>
            </div>
          )}

          {/* URL */}
          {artwork.URL && (
            <div>
              <h3 className="font-semibold text-sm mb-2">More Information</h3>
              <a 
                href={artwork.URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {artwork.URL}
              </a>
            </div>
          )}

          {/* Sources/Bibliography */}
          {artwork['Sources/Bibliography'] && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-2">Sources & Bibliography</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {artwork['Sources/Bibliography']}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
