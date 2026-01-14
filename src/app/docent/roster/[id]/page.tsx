'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function DocentDetail() {
  const router = useRouter();
  const params = useParams();
  const [docent, setDocent] = useState<Docent | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    loadDocent();
  }, [params.id]);

  async function loadDocent() {
    try {
      const response = await fetch('/api/docents');
      const data = await response.json();
      const found = data.docents?.find((d: Docent) => d.id === Number(params.id));
      setDocent(found || null);
    } catch (error) {
      console.error('Error loading docent:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!docent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Docent not found</p>
          <Button onClick={() => router.push('/docent/roster')} variant="outline">
            Back to Roster
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back button - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <Button
          variant="ghost"
          onClick={() => router.push('/docent/roster')}
          className="text-white hover:bg-white/20"
        >
          ← Back to Roster
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-16">
        {/* Large photo */}
        <div className="relative w-full max-w-md aspect-[3/4] mb-6">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="animate-pulse text-6xl">👤</div>
            </div>
          )}
          {docent.photo_url && (
            <img
              src={docent.photo_url}
              alt={docent.display_name}
              className={`w-full h-full object-cover rounded-lg shadow-2xl transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          )}
        </div>

        {/* Name */}
        <h1 className="text-3xl font-bold text-center mb-2">
          {docent.display_name}
        </h1>

        {/* Status badge */}
        <div className={`px-3 py-1 rounded-full text-sm ${
          docent.active ? 'bg-green-600' : 'bg-gray-600'
        }`}>
          {docent.active ? 'Active Docent' : 'Inactive'}
        </div>

        {/* Role badge */}
        {docent.roles && docent.roles.length > 0 && docent.roles[0] !== 'Docent' && (
          <div className="text-center mt-2 mb-4">
            <div className="px-3 py-1 rounded-full text-sm bg-purple-600 inline-block">
              {docent.roles[0]}
            </div>
            {docent.roles[1] && (
              <div className="text-purple-300 text-sm mt-1">
                {docent.roles[1]}
              </div>
            )}
          </div>
        )}

        {(!docent.roles || docent.roles.length === 0 || docent.roles[0] === 'Docent') && (
          <div className="mb-4"></div>
        )}

        {/* Info section */}
        <div className="w-full max-w-md space-y-4">
          {/* Cores certified */}
          {docent.cores_certified && docent.cores_certified.length > 0 && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-2">
                Cores Certified
              </h3>
              <div className="flex flex-wrap gap-2">
                {docent.cores_certified.map((core, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-600/50 rounded-full text-sm capitalize"
                  >
                    {core}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact info */}
          {(docent.email || docent.phone) && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-2">
                Contact
              </h3>
              {docent.email && (
                <p className="text-white/90 mb-1">
                  <span className="text-white/50">Email:</span>{' '}
                  <a
                    href={`mailto:${docent.email}`}
                    className="text-blue-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {docent.email}
                  </a>
                </p>
              )}
              {docent.phone && (
                <p className="text-white/90">
                  <span className="text-white/50">Phone:</span> {docent.phone}
                </p>
              )}
            </div>
          )}

          {/* Join date */}
          {docent.join_date && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-2">
                Member Since
              </h3>
              <p className="text-white/90">
                {new Date(docent.join_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          )}

          {/* Bio */}
          {docent.bio && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-2">
                Biography
              </h3>
              <p className="text-white/90 leading-relaxed">{docent.bio}</p>
            </div>
          )}

          {/* Notes */}
          {docent.notes && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-2">
                Notes
              </h3>
              <p className="text-white/90 leading-relaxed">{docent.notes}</p>
            </div>
          )}
        </div>

        {/* Bottom padding for scroll */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
