'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StaffMember {
  name: string;
  email: string;
  role: string;
}

// Staff data from docent_contacts.csv
const staffMembers: StaffMember[] = [
  {
    name: 'Tiffany Leason',
    email: 'TLeason@discovernewfields.org',
    role: 'Director of Evaluation & Analysis'
  },
  {
    name: 'Sherri Williams',
    email: 'swilliams@discovernewfields.org',
    role: 'Director of Learning Innovation'
  }
];

export default function StaffPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
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
              NEWFIELDS STAFF
            </h1>
            <p className="text-muted-foreground text-sm">
              Key museum staff contacts for docents
            </p>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {staffMembers.map((staff) => (
          <Card key={staff.email} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden bg-rose-100 flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{staff.name}</h3>
                  <p className="text-rose-600 font-medium text-sm mb-2">{staff.role}</p>
                  <a
                    href={`mailto:${staff.email}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {staff.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          This list includes Newfields staff members who work directly with the docent program.
          Contact information is sourced from museum communications.
        </p>
      </div>
    </div>
  );
}
