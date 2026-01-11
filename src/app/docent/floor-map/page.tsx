'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function FloorMapPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-lg font-semibold">IMA Gallery Floor Map</h1>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            src="/ima-floor-map.pdf"
            className="w-full"
            style={{ height: 'calc(100vh - 120px)' }}
            title="IMA Gallery Floor Map"
          />
        </div>
      </div>
    </div>
  );
}
